export function buildProfilePrompt({ user, totalStars, totalForks, topLangs, commitEvents, prEvents, repos }) {
  return `You are a senior engineering hiring manager evaluating a GitHub profile. Be fair and calibrated. A student or junior dev with some projects should score 45-65. A mid-level with good repos should score 65-80.

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
}

export function buildLinkedinPrompt({ targetRole, profileText }) {
  return `You are an expert LinkedIn profile coach and ATS specialist. Be fair — a decent profile with work history and skills should score 55-75.

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
}

export function buildResumePrompt({ targetRole, targetCompany, resumeText }) {
  return `You are a senior technical recruiter and resume expert. Be fair — a student with 3 solid ML projects and good formatting should score 70-85.

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
}
