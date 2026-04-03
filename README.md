<<<<<<< HEAD
# GitHub Repo Evaluator

AI-powered GitHub repository quality scorer built with React + Vite + Express.

## Setup & Run

### 1. Install dependencies
```bash
npm install
```

### 2. Start the app
```bash
npm run dev
```

This starts:
- React frontend at http://localhost:5173
- Express proxy at http://localhost:3001

### 3. Open the app
Go to **http://localhost:5173** in your browser.

Enter your Anthropic API key (get one free at https://console.anthropic.com) and paste any public GitHub repo URL.

## How it works
1. Fetches repo metadata, README, and file tree from GitHub API (no key needed)
2. Sends data to Claude via a local Express proxy (avoids CORS issues)
3. Claude returns a JSON score + suggestions
4. React renders the results

## Project structure
```
github-evaluator/
├── server.js          # Express proxy server
├── vite.config.js     # Vite config with proxy
├── src/
│   ├── App.jsx        # Main React component
│   ├── main.jsx       # Entry point
│   └── index.css      # Global styles
```
=======
# GITHUB-evaluator
>>>>>>> fb769d299b39bee5fe2a2b98ae841cce07c65424
