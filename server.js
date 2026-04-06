import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import session from 'express-session'
import cookieParser from 'cookie-parser'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()

app.set('trust proxy', 1)
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '4mb' }))
app.use(cookieParser())
app.use(session({
  secret: process.env.SESSION_SECRET || 'devprofile-secret-change-in-prod',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}))

const GROQ_API_KEY   = process.env.GROQ_API_KEY
const GH_CLIENT_ID   = process.env.GITHUB_CLIENT_ID
const GH_CLIENT_SEC  = process.env.GITHUB_CLIENT_SECRET
const GH_TOKEN       = process.env.GITHUB_TOKEN
const RZP_KEY_ID     = process.env.RAZORPAY_KEY_ID
const RZP_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET
const PORT           = process.env.PORT || 3001

// ── Auth status ────────────────────────────────────────────────────────────
app.get('/auth/status', (req, res) => {
  res.json({
    oauthAvailable:    !!(GH_CLIENT_ID && GH_CLIENT_SEC),
    razorpayAvailable: !!(RZP_KEY_ID && RZP_KEY_SECRET),
    razorpayKeyId:     RZP_KEY_ID || null
  })
})

// ── GitHub OAuth ───────────────────────────────────────────────────────────
app.get('/auth/github', (req, res) => {
  if (!GH_CLIENT_ID) return res.redirect('/?error=oauth_not_configured')
  const params = new URLSearchParams({
    client_id: GH_CLIENT_ID,
    scope: 'repo read:user',
    state: Math.random().toString(36).slice(2)
  })
  res.redirect(`https://github.com/login/oauth/authorize?${params}`)
})

app.get('/auth/github/callback', async (req, res) => {
  const { code } = req.query
  if (!code) return res.redirect('/?error=oauth_denied')
  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: GH_CLIENT_ID, client_secret: GH_CLIENT_SEC, code })
    })
    const tokenData = await tokenRes.json()
    if (tokenData.error) throw new Error(tokenData.error_description || tokenData.error)
    const accessToken = tokenData.access_token
    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'DevProfileAI' }
    })
    const user = await userRes.json()
    req.session.githubToken = accessToken
    req.session.githubUser  = { login: user.login, name: user.name, avatar: user.avatar_url }
    req.session.save(err => {
      if (err) console.error('Session save error:', err)
      res.redirect('/')
    })
  } catch (err) {
    console.error('OAuth error:', err.message)
    res.redirect(`/?error=${encodeURIComponent(err.message)}`)
  }
})

app.get('/auth/me', (req, res) => {
  if (req.session.githubUser) res.json({ user: req.session.githubUser, connected: true })
  else res.json({ user: null, connected: false })
})

app.post('/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }))
})

// ── GitHub proxy ───────────────────────────────────────────────────────────
app.get('/api/github/*', async (req, res) => {
  const ghPath = req.params[0]
  const query  = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''
  const url    = `https://api.github.com/${ghPath}${query}`
  const headers = { 'User-Agent': 'DevProfileAI', Accept: 'application/vnd.github+json' }
  const token = req.session.githubToken || GH_TOKEN
  if (token) headers['Authorization'] = `Bearer ${token}`
  try {
    const ghRes = await fetch(url, { headers })
    const body  = await ghRes.json()
    res.status(ghRes.status).json(body)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── LinkedIn URL scraper proxy ─────────────────────────────────────────────
// LinkedIn blocks most server-side fetches (status 999). We try multiple
// strategies and if all fail, return blocked=true so UI guides user to paste.
app.post('/api/fetch-linkedin', async (req, res) => {
  const { url } = req.body
  if (!url || !url.includes('linkedin.com')) {
    return res.status(400).json({ error: 'Invalid LinkedIn URL' })
  }

  // Normalize URL — ensure it's a profile URL
  const profileUrl = url.trim().replace(/\/$/, '')

  // Try multiple user agents
  const userAgents = [
    'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient/4.5 +http://www.linkedin.com)',
    'Googlebot/2.1 (+http://www.google.com/bot.html)',
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
  ]

  for (const ua of userAgents) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)

      const response = await fetch(profileUrl, {
        headers: {
          'User-Agent': ua,
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
        },
        redirect: 'follow',
        signal: controller.signal
      })
      clearTimeout(timeout)

      // LinkedIn returns 999 for blocked requests
      if (response.status === 999 || response.status === 429 || response.status === 403) continue

      const html = await response.text()

      // Extract all possible meta tags and structured data
      const extract = (pattern) => html.match(pattern)?.[1]?.trim() || ''

      const ogTitle       = extract(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/)
                         || extract(/<meta[^>]+content="([^"]+)"[^>]+property="og:title"/)
      const ogDesc        = extract(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/)
                         || extract(/<meta[^>]+content="([^"]+)"[^>]+property="og:description"/)
      const twitterTitle  = extract(/<meta[^>]+name="twitter:title"[^>]+content="([^"]+)"/)
      const twitterDesc   = extract(/<meta[^>]+name="twitter:description"[^>]+content="([^"]+)"/)
      const metaDesc      = extract(/<meta[^>]+name="description"[^>]+content="([^"]+)"/)

      // Try JSON-LD structured data (sometimes has name, jobTitle, description)
      const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i)
      let jsonLdText = ''
      if (jsonLdMatch) {
        try {
          const ld = JSON.parse(jsonLdMatch[1])
          jsonLdText = [ld.name, ld.jobTitle, ld.description, ld.headline].filter(Boolean).join('\n')
        } catch {}
      }

      // Strip HTML for body text
      const bodyText = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .replace(/\s{2,}/g, ' ')
        .slice(0, 5000)

      const combined = [ogTitle, twitterTitle, ogDesc, twitterDesc, metaDesc, jsonLdText, bodyText]
        .filter(Boolean).join('\n').trim()

      if (combined.length < 80) continue

      return res.json({ blocked: false, text: combined })
    } catch (err) {
      // Try next user agent
      continue
    }
  }

  // All strategies failed — return blocked with helpful instruction
  res.json({
    blocked: true,
    text: '',
    hint: 'LinkedIn blocks automated access. To analyze your profile: open LinkedIn → click "More" on your profile → "Save to PDF", then copy the text and paste it here. Or simply copy your About, Experience, and Skills sections manually.'
  })
})

// ── Razorpay: create order ─────────────────────────────────────────────────
app.post('/api/payment/create-order', async (req, res) => {
  if (!RZP_KEY_ID || !RZP_KEY_SECRET) {
    return res.json({ id: 'dev_order_' + Date.now(), amount: req.body.amount, currency: 'INR', dev: true })
  }
  try {
    const { amount, receipt } = req.body
    const auth = Buffer.from(`${RZP_KEY_ID}:${RZP_KEY_SECRET}`).toString('base64')
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
      body: JSON.stringify({ amount, currency: 'INR', receipt: receipt || 'rcpt_' + Date.now() })
    })
    const order = await rzpRes.json()
    if (order.error) throw new Error(order.error.description)
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Razorpay: verify & unlock in session ──────────────────────────────────
app.post('/api/payment/verify', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dev, plan } = req.body

  const unlock = (plans) => {
    req.session.paidFor = req.session.paidFor || {}
    plans.forEach(p => { req.session.paidFor[p] = true })
  }

  // Determine which plans to unlock
  const plansToUnlock = plan === 'combo'
    ? ['repo', 'profile', 'linkedin', 'resume', 'combo']
    : [plan, ...(plan === 'combo' ? ['repo','profile','linkedin','resume'] : [])]

  if (dev) {
    unlock(plansToUnlock)
    return req.session.save(() => res.json({ verified: true, paidFor: req.session.paidFor }))
  }

  try {
    const crypto = await import('crypto')
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSig = crypto.createHmac('sha256', RZP_KEY_SECRET).update(body).digest('hex')
    if (expectedSig === razorpay_signature) {
      unlock(plansToUnlock)
      req.session.save(() => res.json({ verified: true, paidFor: req.session.paidFor }))
    } else {
      res.status(400).json({ error: 'Invalid signature' })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get current paid status
app.get('/api/payment/status', (req, res) => {
  res.json({ paidFor: req.session.paidFor || {} })
})

// Reset payment status (for testing only)
app.post('/api/payment/reset', (req, res) => {
  req.session.paidFor = {}
  req.session.save(() => res.json({ ok: true }))
})

// ── Groq helper ────────────────────────────────────────────────────────────
async function callGroq(messages, maxTokens = 2500, temperature = 0.25) {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not set in .env')
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages, temperature, max_tokens: maxTokens })
  })
  const data = await response.json()
  if (data.error) throw new Error(data.error.message)
  return data.choices?.[0]?.message?.content || ''
}

// ── Analyze: GitHub Repo ───────────────────────────────────────────────────
app.post('/api/analyze', async (req, res) => {
  try {
    const { prompt } = req.body
    const text = await callGroq([{ role: 'user', content: prompt }])
    res.json({ text })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Analyze: GitHub Profile ────────────────────────────────────────────────
app.post('/api/analyze-profile', async (req, res) => {
  try {
    const { username } = req.body
    if (!username) return res.status(400).json({ error: 'Username required' })

    const headers = { 'User-Agent': 'DevProfileAI', Accept: 'application/vnd.github+json' }
    const token = req.session.githubToken || GH_TOKEN
    if (token) headers['Authorization'] = `Bearer ${token}`

    const [userRes, reposRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers }),
      fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`, { headers }),
      fetch(`https://api.github.com/users/${username}/events/public?per_page=100`, { headers })
    ])

    if (!userRes.ok) {
      const err = await userRes.json()
      return res.status(userRes.status).json({ error: err.message || 'User not found' })
    }

    const [user, repos, events] = await Promise.all([userRes.json(), reposRes.json(), eventsRes.json()])

    const totalStars   = Array.isArray(repos) ? repos.reduce((s, r) => s + (r.stargazers_count || 0), 0) : 0
    const totalForks   = Array.isArray(repos) ? repos.reduce((s, r) => s + (r.forks_count || 0), 0) : 0
    const languages    = {}
    if (Array.isArray(repos)) repos.forEach(r => { if (r.language) languages[r.language] = (languages[r.language] || 0) + 1 })
    const topLangs     = Object.entries(languages).sort((a,b) => b[1]-a[1]).slice(0,5).map(([l]) => l)
    const eventsArr    = Array.isArray(events) ? events : []
    const commitEvents = eventsArr.filter(e => e.type === 'PushEvent').length
    const prEvents     = eventsArr.filter(e => e.type === 'PullRequestEvent').length
    const hasProfileBio = !!(user.bio && user.bio.length > 20)

    const prompt = `You are a senior engineering hiring manager evaluating a GitHub profile. Be fair and calibrated. A student or junior dev with some projects should score 45-65. A mid-level with good repos should score 65-80.

Return ONLY valid JSON (no markdown, no backticks):
{
  "score": number (0-100),
  "grade": "A+"|"A"|"B+"|"B"|"C+"|"C"|"D",
  "headline": "2-sentence honest assessment",
  "strengths": ["strength1","strength2","strength3"],
  "gaps": ["gap1","gap2","gap3"],
  "tags": ["tag1","tag2","tag3","tag4"],
  "radarData": [
    {"label":"Activity","value":number},
    {"label":"Impact","value":number},
    {"label":"Diversity","value":number},
    {"label":"Visibility","value":number},
    {"label":"Quality","value":number}
  ],
  "categories": [
    {"name":"Repository Quality","score":number,"detail":"short detail"},
    {"name":"Community Impact","score":number,"detail":"short detail"},
    {"name":"Profile Completeness","score":number,"detail":"short detail"},
    {"name":"Tech Diversity","score":number,"detail":"short detail"}
  ],
  "improvements": [
    {"title":"specific action","why":"reason","priority":"high|medium|low"}
  ],
  "hirability": number,
  "openSourceScore": number,
  "consistencyScore": number
}

SCORING:
- Base: 50 for any developer with repos
- Has bio (>20 chars): +10
- Has website/blog: +5
- Has Twitter/social: +3
- Public repos > 5: +8
- Public repos > 15: +5 more
- Total stars > 10: +5
- Total stars > 100: +8
- Recent commits (>10 events): +8
- Recent commits (>30): +5 more
- Multiple languages (>2): +5
- Has profile README repo: +5
- No bio: -10
- Zero stars AND <5 repos: -8
- No recent activity (<5 events): -10

Profile:
Username: ${user.login}
Name: ${user.name || 'Not set'}
Bio: ${user.bio || 'None'}
Location: ${user.location || 'Not set'}
Website: ${user.blog || 'None'}
Twitter: ${user.twitter_username || 'None'}
Company: ${user.company || 'None'}
Followers: ${user.followers} | Following: ${user.following}
Public repos: ${user.public_repos} | Gists: ${user.public_gists}
Created: ${user.created_at?.split('T')[0]}
Total stars: ${totalStars} | Forks: ${totalForks}
Top languages: ${topLangs.join(', ')}
Recent push events: ${commitEvents} | PR events: ${prEvents}
Sample repos: ${Array.isArray(repos) ? repos.slice(0,8).map(r=>`${r.name}(★${r.stargazers_count},${r.language||'?'})`).join(', ') : 'none'}`

    const text = await callGroq([{ role: 'user', content: prompt }])
    res.json({ text, user, repos: Array.isArray(repos) ? repos.slice(0,10) : [], signals: { totalStars, totalForks, topLangs, commitEvents, prEvents } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Analyze: LinkedIn ──────────────────────────────────────────────────────
app.post('/api/analyze-linkedin', async (req, res) => {
  try {
    const { profileText, targetRole } = req.body
    if (!profileText || profileText.length < 50) {
      return res.status(400).json({ error: 'Profile content too short' })
    }

    const prompt = `You are an expert LinkedIn profile coach and ATS specialist. Be fair — a decent profile with work history and skills should score 55-75.

Return ONLY valid JSON (no markdown, no backticks):
{
  "score": number (0-100),
  "grade": "A+"|"A"|"B+"|"B"|"C+"|"C"|"D",
  "atsScore": number (0-100),
  "headline": "2-sentence honest assessment",
  "strengths": ["s1","s2","s3"],
  "gaps": ["g1","g2","g3"],
  "tags": ["tag1","tag2","tag3"],
  "radarData": [
    {"label":"Completeness","value":number},
    {"label":"ATS Score","value":number},
    {"label":"Keywords","value":number},
    {"label":"Impact","value":number},
    {"label":"Storytelling","value":number}
  ],
  "sections": [
    {"name":"Headline & Summary","score":number,"feedback":"specific feedback"},
    {"name":"Experience","score":number,"feedback":"specific feedback"},
    {"name":"Skills & Endorsements","score":number,"feedback":"specific feedback"},
    {"name":"Education & Certs","score":number,"feedback":"specific feedback"}
  ],
  "improvements": [
    {"title":"specific action","why":"why it matters","priority":"high|medium|low"}
  ],
  "keywordsFound": ["kw1","kw2","kw3","kw4","kw5"],
  "keywordsMissing": ["kw1","kw2","kw3","kw4"],
  "estimatedRecruiterScore": number,
  "profileCompleteness": number
}

SCORING:
- Base: 55
- Has quantified achievements: +12
- Rich skills section: +8
- Good headline with role keywords: +7
- Strong summary with impact: +8
- Has certifications: +5
- Has projects/portfolio: +5
- Missing quantification: -10
- Vague descriptions: -8
- Weak/generic headline: -10
- Missing skills section: -12

Target role: ${targetRole || 'General professional'}
Profile text:
${profileText.slice(0, 4000)}`

    const text = await callGroq([{ role: 'user', content: prompt }])
    res.json({ text })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Analyze: Resume ────────────────────────────────────────────────────────
app.post('/api/analyze-resume', async (req, res) => {
  try {
    const { resumeText, targetRole, targetCompany } = req.body
    if (!resumeText || resumeText.length < 80) {
      return res.status(400).json({ error: 'Resume content too short' })
    }

    const prompt = `You are a senior technical recruiter and resume expert. Be fair — a student with 3 solid ML projects and good formatting should score 70-85.

Return ONLY valid JSON (no markdown, no backticks):
{
  "score": number (0-100),
  "grade": "A+"|"A"|"B+"|"B"|"C+"|"C"|"D",
  "atsScore": number (0-100),
  "headline": "2-sentence honest assessment",
  "strengths": ["s1","s2","s3"],
  "gaps": ["g1","g2","g3"],
  "tags": ["tag1","tag2","tag3"],
  "radarData": [
    {"label":"Format","value":number},
    {"label":"ATS Score","value":number},
    {"label":"Impact","value":number},
    {"label":"Keywords","value":number},
    {"label":"Clarity","value":number}
  ],
  "sections": [
    {"name":"Contact & Header","score":number,"feedback":"specific feedback"},
    {"name":"Work Experience","score":number,"feedback":"specific feedback"},
    {"name":"Skills","score":number,"feedback":"specific feedback"},
    {"name":"Education","score":number,"feedback":"specific feedback"},
    {"name":"Projects/Extras","score":number,"feedback":"specific feedback"}
  ],
  "improvements": [
    {"title":"specific action","why":"impact on hiring","where":"which section","priority":"high|medium|low"}
  ],
  "missingElements": ["e1","e2"],
  "estimatedJobMatchScore": number,
  "readabilityScore": number,
  "keywordsFound": ["kw1","kw2","kw3","kw4","kw5"],
  "keywordsMissing": ["kw1","kw2","kw3"]
}

SCORING (calibrated for student/early career):
- Base: 60
- Quantified achievements (%, $, metrics): +15
- Live deployed projects: +10
- Strong technical skills section: +8
- Clean format signals: +5
- Relevant certifications: +5
- Contact info complete: +3
- No work experience but has projects: neutral (not penalized for students)
- No quantification at all: -10
- Generic/vague descriptions: -8
- Missing contact: -10
- Very thin content: -15

Target role: ${targetRole || 'Not specified'}
Target company: ${targetCompany || 'Not specified'}

Resume:
${resumeText.slice(0, 5000)}`

    const text = await callGroq([{ role: 'user', content: prompt }])
    res.json({ text })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Chat ───────────────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body
    const text = await callGroq(messages, 700, 0.5)
    res.json({ text })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Serve React build ──────────────────────────────────────────────────────
const distPath = join(__dirname, 'dist')
app.use(express.static(distPath))
app.get('*', (req, res) => res.sendFile(join(distPath, 'index.html')))

app.listen(PORT, () => console.log(`✅ Server on http://localhost:${PORT}`))