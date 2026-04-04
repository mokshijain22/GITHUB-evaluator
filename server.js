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

// Trust Render's proxy so secure cookies work over HTTPS
app.set('trust proxy', 1)

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(cookieParser())
app.use(session({
  secret: process.env.SESSION_SECRET || 'reposcan-secret-change-in-prod',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}))

const GROQ_API_KEY  = process.env.GROQ_API_KEY
const GH_CLIENT_ID  = process.env.GITHUB_CLIENT_ID
const GH_CLIENT_SEC = process.env.GITHUB_CLIENT_SECRET
const GH_TOKEN      = process.env.GITHUB_TOKEN
const PORT          = process.env.PORT || 3001

// ── Auth capability check ─────────────────────────────────────────────────────
app.get('/auth/status', (req, res) => {
  res.json({ oauthAvailable: !!(GH_CLIENT_ID && GH_CLIENT_SEC) })
})

// ── GitHub OAuth ──────────────────────────────────────────────────────────────
app.get('/auth/github', (req, res) => {
  if (!GH_CLIENT_ID) {
    return res.redirect('/?error=oauth_not_configured')
  }
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
      headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'RepoScan' }
    })
    const user = await userRes.json()

    req.session.githubToken = accessToken
    req.session.githubUser  = { login: user.login, name: user.name, avatar: user.avatar_url }

    // Force session save before redirecting
    req.session.save((err) => {
      if (err) console.error('Session save error:', err)
      res.redirect('/')
    })
  } catch (err) {
    console.error('OAuth callback error:', err.message)
    res.redirect(`/?error=${encodeURIComponent(err.message)}`)
  }
})

app.get('/auth/me', (req, res) => {
  if (req.session.githubUser) {
    res.json({ user: req.session.githubUser, connected: true })
  } else {
    res.json({ user: null, connected: false })
  }
})

app.post('/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }))
})

// ── GitHub proxy ──────────────────────────────────────────────────────────────
app.get('/api/github/*', async (req, res) => {
  const ghPath = req.params[0]
  const query  = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''
  const url    = `https://api.github.com/${ghPath}${query}`

  const headers = { 'User-Agent': 'RepoScan', Accept: 'application/vnd.github+json' }
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

// ── Groq: analyze ─────────────────────────────────────────────────────────────
app.post('/api/analyze', async (req, res) => {
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY not set in .env' })
  }
  try {
    const { prompt } = req.body
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2000
      })
    })
    const data = await response.json()
    if (data.error) return res.status(400).json({ error: data.error.message })
    res.json({ text: data.choices?.[0]?.message?.content || '' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Groq: chat ────────────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY not set in .env' })
  }
  try {
    const { messages } = req.body
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages, temperature: 0.5, max_tokens: 500 })
    })
    const data = await response.json()
    if (data.error) return res.status(400).json({ error: data.error.message })
    res.json({ text: data.choices?.[0]?.message?.content || '' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Serve built React frontend ────────────────────────────────────────────────
const distPath = join(__dirname, 'dist')
app.use(express.static(distPath))
app.get('*', (req, res) => res.sendFile(join(distPath, 'index.html')))

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`))