# DevProfile AI v2.0

An AI-powered developer career platform that analyzes GitHub repositories, GitHub profiles, LinkedIn profiles, and resumes — with an integrated Razorpay payment gateway.

## Features

| Analyzer | What it scores | Price |
|---|---|---|
| 🐙 GitHub Repo | Code quality, tests, CI, docs, security | ₹299 |
| 👤 GitHub Profile | Activity, impact, hirability, tech diversity | ₹299 |
| 💼 LinkedIn | ATS score, keyword density, recruiter readability | ₹299 |
| 📄 Resume | ATS optimization, impact language, section scoring | ₹299 |
| ✨ Full Combo | All 4 analyzers | ₹799 |

- AI chat assistant per analyzer (full context)
- Radar charts, keyword analysis, section breakdowns
- GitHub OAuth for private repo access
- Razorpay INR payment gating (dev mode works without keys)

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create your `.env` file
```bash
cp .env.example .env
```
Then fill in your keys (see below).

### 3. Run in development
```bash
npm run dev
```
- React frontend: http://localhost:5173
- Express API: http://localhost:3001

---

## Environment Variables

### Required
```env
GROQ_API_KEY=gsk_...          # Free at https://console.groq.com
```

### GitHub OAuth (for private repos + profile analyzer)
```env
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```
Create an OAuth App at https://github.com/settings/developers  
- Callback URL (dev): `http://localhost:5173/auth/github/callback`
- Callback URL (prod): `https://your-domain.com/auth/github/callback`

### Razorpay (payment gateway)
```env
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```
Sign up at https://razorpay.com → Dashboard → Settings → API Keys  
**Without these, the app runs in dev mode** — payments are simulated automatically.

### Optional
```env
GITHUB_TOKEN=...    # Fallback GitHub token (for public repo rate limits)
SESSION_SECRET=...  # Long random string for session security
```

---

## Pricing Logic

| Env vars set? | Behavior |
|---|---|
| No Razorpay keys | Dev mode: button says "Analyze (dev mode)", payment simulated |
| Razorpay keys set | Real Razorpay checkout opens, verifies server-side |

Payment gating works per-session. For production, add a database to persist paid status per user.

---

## Project Structure

```
github-evaluator/
├── server.js              # Express API (GitHub proxy, Groq AI, Razorpay)
├── src/
│   ├── App.jsx            # All 4 analyzer panels + payment gate
│   ├── main.jsx           # React entry point
│   └── index.css          # Global styles
├── .env.example           # Template for environment variables
├── vite.config.js         # Vite + proxy config
├── Dockerfile             # Docker production build
└── package.json
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/auth/status` | Check OAuth + Razorpay availability |
| GET | `/auth/github` | GitHub OAuth redirect |
| GET | `/auth/github/callback` | OAuth callback |
| GET | `/auth/me` | Current logged-in user |
| POST | `/auth/logout` | Clear session |
| GET | `/api/github/*` | GitHub API proxy (with auth) |
| POST | `/api/analyze` | GitHub Repo analysis (Groq) |
| POST | `/api/analyze-profile` | GitHub Profile analysis |
| POST | `/api/analyze-linkedin` | LinkedIn text analysis |
| POST | `/api/analyze-resume` | Resume text analysis |
| POST | `/api/chat` | AI chat (context-aware) |
| POST | `/api/payment/create-order` | Razorpay order creation |
| POST | `/api/payment/verify` | Razorpay signature verification |

## Scoring Calibration (v2.0)

Scores are now calibrated to be realistic and fair:
- Working repos with README: **55–75**
- Active GitHub profile with bio: **60–80**
- Decent LinkedIn with work history: **55–75**
- Resume with quantified achievements: **65–85**

Scores below 40 are reserved for truly empty or broken profiles.

## Deploy to Render / Railway

1. Set all environment variables in your hosting dashboard
2. Build command: `npm run build`
3. Start command: `node server.js`
4. The built React app is served from `dist/` by Express

Or use Docker:
```bash
docker build -t devprofile-ai .
docker run -p 3001:3001 --env-file .env devprofile-ai
```