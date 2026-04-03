import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Middleware
app.use(cors())
app.use(express.json())

const GROQ_API_KEY = process.env.GROQ_API_KEY

// -------------------- API ROUTES -------------------- //

app.post('/api/analyze', async (req, res) => {
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'Server not configured. Add GROQ_API_KEY' })
  }

  try {
    const { prompt } = req.body

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2000
      })
    })

    const data = await response.json()

    if (data.error) {
      return res.status(400).json({ error: data.error.message })
    }

    const text = data.choices?.[0]?.message?.content || ''
    res.json({ text })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/chat', async (req, res) => {
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'Server not configured.' })
  }

  try {
    const { messages } = req.body

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.5,
        max_tokens: 500
      })
    })

    const data = await response.json()

    if (data.error) {
      return res.status(400).json({ error: data.error.message })
    }

    const text = data.choices?.[0]?.message?.content || ''
    res.json({ text })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
app.post('/api/github', async (req, res) => {
  try {
    const { repo } = req.body

    const headers = {
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json'
    }

    const repoRes = await fetch(`https://api.github.com/repos/${repo}`, { headers })
    const repoData = await repoRes.json()

    if (repoData.message === "Not Found") {
      return res.status(404).json({ error: "Repo not found" })
    }

    const readmeRes = await fetch(`https://api.github.com/repos/${repo}/readme`, { headers })
    const readmeData = await readmeRes.json()

    const treeRes = await fetch(`https://api.github.com/repos/${repo}/git/trees/HEAD?recursive=1`, { headers })
    const treeData = await treeRes.json()

    res.json({
      repo: repoData,
      readme: readmeData,
      tree: treeData
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// -------------------- SERVE FRONTEND -------------------- //

// Serve static files from Vite build
app.use(express.static(path.join(__dirname, 'dist')))

// React fallback (for SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// -------------------- START SERVER -------------------- //

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`)
})