import { useState, useEffect, useRef, useCallback } from "react";

// ── Routing all GitHub calls through /api/github/* proxy so:
// 1. Private repos work (token stays server-side)
// 2. No CORS issues
// 3. Auth session cookie sent automatically
const GH_PROXY = (path) => `/api/github/${path}`;
const API = "/api";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080C18;
    --bg2: #0E1525;
    --bg3: #121929;
    --glass: rgba(255,255,255,0.04);
    --glass2: rgba(255,255,255,0.07);
    --border: rgba(255,255,255,0.08);
    --border2: rgba(255,255,255,0.14);
    --lavender: #B8A9FF;
    --lavender2: #8B78F5;
    --blush: #FFB3C8;
    --mint: #7FFFD4;
    --sky: #93C5FD;
    --peach: #FFCBA4;
    --rose: #FF8FAB;
    --amber: #FCD34D;
    --text: #E8EAF0;
    --text2: #8892A4;
    --text3: #5A6478;
    --success: #6EE7B7;
    --warning: #FCD34D;
    --danger: #FF8FAB;
    --font-display: 'Syne', sans-serif;
    --font-body: 'DM Sans', sans-serif;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    min-height: 100vh;
    overflow-x: hidden;
  }

  .orb {
    position: fixed;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.12;
    pointer-events: none;
    z-index: 0;
  }
  .orb1 { width: 500px; height: 500px; background: var(--lavender2); top: -150px; left: -100px; animation: orbFloat 12s ease-in-out infinite; }
  .orb2 { width: 400px; height: 400px; background: #4F8EFF; bottom: 10%; right: -120px; animation: orbFloat 15s ease-in-out infinite reverse; }
  .orb3 { width: 300px; height: 300px; background: var(--mint); top: 40%; left: 30%; animation: orbFloat 18s ease-in-out infinite 3s; opacity: 0.07; }

  @keyframes orbFloat {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(20px, -30px) scale(1.05); }
    66% { transform: translate(-15px, 20px) scale(0.97); }
  }

  .app { position: relative; z-index: 1; max-width: 900px; margin: 0 auto; padding: 0 24px 80px; }

  /* NAV */
  .nav {
    position: relative; z-index: 1;
    max-width: 900px; margin: 0 auto; padding: 16px 24px;
    display: flex; align-items: center; justify-content: flex-end; gap: 10px;
  }
  .btn-connect {
    display: inline-flex; align-items: center; gap: 7px;
    background: var(--glass2); border: 1px solid var(--border2); border-radius: 100px;
    padding: 7px 16px; font-size: 12px; font-weight: 600; color: var(--lavender);
    cursor: pointer; font-family: var(--font-display); letter-spacing: 0.03em;
    transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
  }
  .btn-connect:hover { background: rgba(184,169,255,0.12); border-color: rgba(184,169,255,0.4); box-shadow: 0 0 20px rgba(184,169,255,0.1); }
  .auth-chip {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--glass2); border: 1px solid var(--border2); border-radius: 100px;
    padding: 5px 14px 5px 5px; font-size: 12px; font-weight: 500; color: var(--text2);
  }
  .auth-avatar { width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--border2); }
  .auth-name { color: var(--text); font-weight: 600; }
  .auth-sub { font-size: 10px; color: var(--mint); }
  .btn-signout {
    background: transparent; border: 1px solid rgba(255,143,171,0.2); border-radius: 100px;
    padding: 4px 10px; font-size: 10px; color: var(--rose); cursor: pointer;
    font-family: var(--font-body); transition: background 0.15s;
  }
  .btn-signout:hover { background: rgba(255,143,171,0.1); }

  /* HERO */
  .hero { padding: 48px 0 56px; text-align: center; }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(184,169,255,0.1); border: 1px solid rgba(184,169,255,0.2);
    border-radius: 100px; padding: 6px 14px; font-size: 12px; font-weight: 500;
    color: var(--lavender); margin-bottom: 28px; letter-spacing: 0.04em;
    font-family: var(--font-display);
  }
  .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--lavender); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }

  .hero h1 {
    font-family: var(--font-display); font-size: clamp(36px, 6vw, 58px);
    font-weight: 800; line-height: 1.08; letter-spacing: -0.03em;
    background: linear-gradient(135deg, #E8EAF0 0%, var(--lavender) 45%, var(--sky) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; margin-bottom: 16px;
  }
  .hero p { font-size: 17px; color: var(--text2); line-height: 1.6; max-width: 480px; margin: 0 auto 40px; font-weight: 300; }

  .input-wrap {
    display: flex; gap: 10px; max-width: 620px; margin: 0 auto;
    background: var(--glass); border: 1px solid var(--border2);
    border-radius: 16px; padding: 6px 6px 6px 18px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .input-wrap:focus-within {
    border-color: rgba(184,169,255,0.5);
    box-shadow: 0 0 0 3px rgba(184,169,255,0.08), 0 0 30px rgba(184,169,255,0.08);
  }
  .input-wrap input {
    flex: 1; background: transparent; border: none; outline: none;
    font-size: 14px; color: var(--text); font-family: var(--font-body); min-width: 0;
  }
  .input-wrap input::placeholder { color: var(--text3); }

  .btn-analyze {
    background: linear-gradient(135deg, var(--lavender2) 0%, #4F8EFF 100%);
    border: none; border-radius: 10px; padding: 10px 22px;
    font-family: var(--font-display); font-size: 13px; font-weight: 600;
    color: white; cursor: pointer; white-space: nowrap;
    transition: transform 0.15s, opacity 0.15s, box-shadow 0.15s;
    letter-spacing: 0.02em;
  }
  .btn-analyze:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(139,120,245,0.4); }
  .btn-analyze:active { transform: translateY(0); }
  .btn-analyze:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .btn-browse {
    background: var(--glass2); border: 1px solid var(--border2); border-radius: 10px;
    padding: 10px 16px; font-family: var(--font-display); font-size: 12px; font-weight: 600;
    color: var(--lavender); cursor: pointer; white-space: nowrap; letter-spacing: 0.03em;
    transition: background 0.15s, border-color 0.15s;
  }
  .btn-browse:hover { background: rgba(184,169,255,0.1); border-color: rgba(184,169,255,0.3); }

  /* private banner */
  .priv-banner {
    max-width: 560px; margin: 14px auto 0;
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 12px;
    background: rgba(147,197,253,0.06); border: 1px solid rgba(147,197,253,0.2);
    font-size: 12px; color: var(--sky);
  }
  .priv-banner strong { color: #BDE4FF; }
  .priv-banner-btn {
    margin-left: auto; flex-shrink: 0;
    padding: 5px 12px; background: rgba(147,197,253,0.15); border: 1px solid rgba(147,197,253,0.3);
    border-radius: 100px; font-size: 11px; font-weight: 600; color: var(--sky);
    cursor: pointer; font-family: var(--font-display); transition: background 0.15s;
  }
  .priv-banner-btn:hover { background: rgba(147,197,253,0.25); }

  /* status log */
  .log-wrap {
    max-width: 560px; margin: 14px auto 0; padding: 12px 16px;
    background: var(--glass); border: 1px solid var(--border2); border-radius: 12px;
    font-size: 12px; font-family: ui-monospace, monospace; color: var(--text3);
  }
  .log-line { padding: 1px 0; animation: fadeUp 0.2s ease; }
  .log-line::before { content: "› "; color: var(--lavender); }

  /* SKELETON */
  .skeleton { background: linear-gradient(90deg, var(--glass) 25%, var(--glass2) 50%, var(--glass) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* RESULTS */
  .results { animation: fadeUp 0.4s ease-out; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

  /* SUMMARY CARD */
  .summary-card {
    background: var(--glass); backdrop-filter: blur(20px);
    border: 1px solid var(--border2); border-radius: 24px;
    padding: 32px; margin-bottom: 16px; position: relative; overflow: hidden;
  }
  .summary-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(184,169,255,0.4), transparent);
  }
  .summary-top { display: flex; gap: 28px; align-items: flex-start; flex-wrap: wrap; }

  .score-ring-wrap { flex-shrink: 0; position: relative; width: 110px; height: 110px; }
  .score-ring-wrap svg { transform: rotate(-90deg); }
  .ring-bg { fill: none; stroke: rgba(255,255,255,0.06); stroke-width: 8; }
  .ring-fill { fill: none; stroke-width: 8; stroke-linecap: round; transition: stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1); }
  .score-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .score-num { font-family: var(--font-display); font-size: 26px; font-weight: 800; line-height: 1; }
  .score-label { font-size: 10px; color: var(--text3); font-weight: 500; letter-spacing: 0.05em; margin-top: 2px; }

  .summary-info { flex: 1; min-width: 200px; }
  .summary-grade-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
  .grade-badge {
    font-family: var(--font-display); font-size: 22px; font-weight: 800;
    padding: 2px 12px; border-radius: 8px;
  }
  .confidence-badge {
    font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 100px;
    background: rgba(127,255,212,0.12); color: var(--mint); border: 1px solid rgba(127,255,212,0.2);
    letter-spacing: 0.03em;
  }

  .repo-meta { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 12px; }
  .meta-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text2); }
  .meta-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--text3); }

  .tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
  .tag {
    font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 100px;
    background: var(--glass2); border: 1px solid var(--border); color: var(--text2);
    letter-spacing: 0.02em;
  }

  .ai-insight {
    background: rgba(184,169,255,0.06); border: 1px solid rgba(184,169,255,0.12);
    border-radius: 12px; padding: 12px 14px; font-size: 13px; line-height: 1.6;
    color: var(--text2); margin-bottom: 14px;
  }
  .ai-insight-label { font-size: 10px; font-weight: 600; color: var(--lavender); letter-spacing: 0.08em; margin-bottom: 5px; font-family: var(--font-display); }

  .sp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px; }
  .sp-box { background: var(--glass2); border: 1px solid var(--border); border-radius: 14px; padding: 14px; }
  .sp-box-title { font-size: 10px; font-weight: 600; letter-spacing: 0.08em; margin-bottom: 8px; font-family: var(--font-display); }
  .sp-item { display: flex; align-items: flex-start; gap: 7px; font-size: 12px; color: var(--text2); margin-bottom: 5px; line-height: 1.4; }
  .sp-icon { font-size: 10px; margin-top: 2px; flex-shrink: 0; }

  /* VISUAL INTELLIGENCE */
  .section-title {
    font-family: var(--font-display); font-size: 13px; font-weight: 600;
    color: var(--text3); letter-spacing: 0.1em; text-transform: uppercase;
    margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
  }
  .section-title::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  .visual-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  @media(max-width:640px){.visual-grid{grid-template-columns:1fr}.sp-row{grid-template-columns:1fr}}

  .glass-card {
    background: var(--glass); border: 1px solid var(--border2); border-radius: 20px;
    padding: 22px; position: relative; overflow: hidden;
    transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  }
  .glass-card:hover { border-color: var(--border2); transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
  .card-title { font-family: var(--font-display); font-size: 13px; font-weight: 600; color: var(--text2); margin-bottom: 16px; letter-spacing: 0.03em; }

  /* RADAR */
  .radar-wrap { display: flex; justify-content: center; }

  /* LANG BAR */
  .lang-row { display: flex; gap: 4px; height: 6px; border-radius: 3px; overflow: hidden; margin-bottom: 10px; }
  .lang-seg { height: 100%; transition: flex 0.5s; }
  .lang-legend { display: flex; flex-wrap: wrap; gap: 8px; }
  .lang-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--text2); }
  .lang-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

  .stat-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .stat-item { background: var(--glass2); border-radius: 10px; padding: 10px 12px; }
  .stat-val { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--text); }
  .stat-lbl { font-size: 10px; color: var(--text3); margin-top: 2px; letter-spacing: 0.03em; }

  /* WHY SECTION */
  .why-card {
    background: var(--glass); border: 1px solid var(--border2); border-radius: 20px;
    padding: 22px; margin-bottom: 16px;
  }
  .why-category { margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid var(--border); }
  .why-category:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
  .why-cat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .why-cat-name { font-family: var(--font-display); font-size: 13px; font-weight: 600; color: var(--text); }
  .why-score-chip { font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 100px; font-family: var(--font-display); }
  .why-reason { display: flex; gap: 8px; font-size: 12px; color: var(--text2); margin-bottom: 6px; line-height: 1.5; align-items: flex-start; }
  .why-icon { font-size: 11px; margin-top: 1px; flex-shrink: 0; }

  /* CATEGORIES */
  .cat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
  @media(max-width:520px){.cat-grid{grid-template-columns:1fr}}
  .cat-card {
    background: var(--glass); border: 1px solid var(--border); border-radius: 16px; padding: 16px;
    cursor: pointer; transition: border-color 0.2s, transform 0.15s;
  }
  .cat-card:hover { border-color: var(--border2); transform: translateY(-1px); }
  .cat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .cat-name { font-size: 13px; font-weight: 500; color: var(--text); }
  .cat-score { font-family: var(--font-display); font-size: 15px; font-weight: 700; }
  .cat-bar-bg { height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; margin-bottom: 8px; overflow: hidden; }
  .cat-bar-fill { height: 100%; border-radius: 2px; transition: width 1s cubic-bezier(0.22,1,0.36,1); }
  .cat-preview { font-size: 11px; color: var(--text3); line-height: 1.4; }
  .cat-expand { font-size: 11px; color: var(--text2); margin-top: 8px; line-height: 1.5; border-top: 1px solid var(--border); padding-top: 8px; }

  /* SUGGESTIONS */
  .suggestion-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
  .suggestion-card {
    background: var(--glass); border: 1px solid var(--border); border-radius: 16px; padding: 16px;
    display: flex; gap: 14px; align-items: flex-start;
    transition: border-color 0.2s, transform 0.15s;
  }
  .suggestion-card:hover { border-color: var(--border2); transform: translateX(2px); }
  .sug-priority { flex-shrink: 0; width: 6px; height: 6px; border-radius: 50%; margin-top: 5px; }
  .sug-content { flex: 1; min-width: 0; }
  .sug-title { font-size: 13px; font-weight: 500; color: var(--text); margin-bottom: 3px; }
  .sug-why { font-size: 11px; color: var(--text2); margin-bottom: 4px; line-height: 1.5; }
  .sug-where { font-size: 10px; color: var(--text3); font-family: monospace; background: var(--glass2); padding: 2px 7px; border-radius: 4px; display: inline-block; }
  .sug-badge { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 100px; flex-shrink: 0; }

  /* PRO TOGGLE */
  .pro-bar {
    background: var(--glass); border: 1px solid var(--border2); border-radius: 16px; padding: 16px 20px;
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;
  }
  .pro-label { font-family: var(--font-display); font-size: 13px; font-weight: 600; color: var(--text); }
  .pro-sub { font-size: 11px; color: var(--text2); margin-top: 2px; }
  .toggle-wrap { display: flex; align-items: center; gap: 8px; cursor: pointer; }
  .toggle { width: 40px; height: 22px; border-radius: 11px; border: 1px solid var(--border2); position: relative; transition: background 0.3s; }
  .toggle.on { background: linear-gradient(135deg, var(--lavender2), #4F8EFF); border-color: transparent; }
  .toggle.off { background: var(--glass2); }
  .toggle-thumb { position: absolute; top: 2px; width: 16px; height: 16px; border-radius: 50%; background: white; transition: left 0.3s cubic-bezier(0.34,1.56,0.64,1); }
  .toggle.on .toggle-thumb { left: 20px; }
  .toggle.off .toggle-thumb { left: 2px; }

  .pro-panel {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px;
    animation: fadeUp 0.3s ease-out;
  }
  @media(max-width:600px){.pro-panel{grid-template-columns:1fr 1fr}}
  .pro-metric {
    background: var(--glass); border: 1px solid var(--border2); border-radius: 14px; padding: 14px;
    text-align: center;
  }
  .pro-metric-val { font-family: var(--font-display); font-size: 20px; font-weight: 700; }
  .pro-metric-lbl { font-size: 10px; color: var(--text3); margin-top: 4px; letter-spacing: 0.04em; }

  /* CHAT */
  .chat-section { background: var(--glass); border: 1px solid var(--border2); border-radius: 24px; overflow: hidden; }
  .chat-header { padding: 18px 22px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
  .chat-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text); }
  .ctx-badge {
    font-size: 10px; font-weight: 600; padding: 4px 10px; border-radius: 100px;
    background: rgba(127,255,212,0.1); border: 1px solid rgba(127,255,212,0.2);
    color: var(--mint); letter-spacing: 0.04em; display: flex; align-items: center; gap: 5px;
  }
  .ctx-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--mint); animation: pulse 1.5s infinite; }

  .chat-msgs { height: 280px; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; scroll-behavior: smooth; }
  .chat-msgs::-webkit-scrollbar { width: 4px; }
  .chat-msgs::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

  .msg { max-width: 80%; animation: msgIn 0.25s ease-out; }
  @keyframes msgIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .msg.user { align-self: flex-end; }
  .msg.ai { align-self: flex-start; }
  .msg-bubble { padding: 10px 14px; border-radius: 14px; font-size: 13px; line-height: 1.6; }
  .msg.user .msg-bubble { background: linear-gradient(135deg, rgba(139,120,245,0.25), rgba(79,142,255,0.25)); border: 1px solid rgba(139,120,245,0.3); color: var(--text); border-bottom-right-radius: 4px; }
  .msg.ai .msg-bubble { background: var(--glass2); border: 1px solid var(--border); color: var(--text2); border-bottom-left-radius: 4px; }

  .typing-indicator { display: flex; gap: 4px; align-items: center; padding: 10px 14px; }
  .typing-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--text3); animation: typingDot 1.2s infinite; }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typingDot { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-4px);opacity:1} }

  .suggested-prompts { display: flex; gap: 6px; flex-wrap: wrap; padding: 10px 20px; border-top: 1px solid var(--border); }
  .sp-btn {
    font-size: 11px; padding: 5px 10px; border-radius: 100px;
    background: var(--glass2); border: 1px solid var(--border); color: var(--text2);
    cursor: pointer; transition: border-color 0.15s, color 0.15s; font-family: var(--font-body);
  }
  .sp-btn:hover { border-color: var(--border2); color: var(--text); }

  .chat-input-row { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--border); }
  .chat-input {
    flex: 1; background: var(--glass2); border: 1px solid var(--border); border-radius: 10px;
    padding: 8px 12px; font-size: 13px; color: var(--text); outline: none;
    font-family: var(--font-body); transition: border-color 0.15s;
  }
  .chat-input:focus { border-color: rgba(184,169,255,0.4); }
  .chat-input::placeholder { color: var(--text3); }
  .chat-send {
    background: linear-gradient(135deg, var(--lavender2), #4F8EFF);
    border: none; border-radius: 10px; padding: 8px 14px;
    font-size: 13px; color: white; cursor: pointer; font-family: var(--font-body);
    transition: opacity 0.15s, transform 0.15s;
  }
  .chat-send:hover { opacity: 0.9; transform: scale(1.02); }
  .chat-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  /* REPO PICKER MODAL */
  .picker-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 1000;
    display: flex; align-items: center; justify-content: center; padding: 16px;
    backdrop-filter: blur(4px);
  }
  .picker-modal {
    background: var(--bg2); border: 1px solid var(--border2); border-radius: 20px;
    width: 100%; max-width: 540px; max-height: 80vh; display: flex; flex-direction: column;
    animation: fadeUp 0.25s ease;
  }
  .picker-hd {
    padding: 16px 20px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .picker-hd-title { font-family: var(--font-display); font-size: 14px; font-weight: 600; color: var(--text); }
  .picker-close { background: none; border: none; color: var(--text3); font-size: 20px; cursor: pointer; line-height: 1; }
  .picker-search-wrap { padding: 10px 20px; border-bottom: 1px solid var(--border); }
  .picker-search {
    width: 100%; padding: 8px 12px; background: var(--glass2); border: 1px solid var(--border2);
    border-radius: 10px; font-size: 13px; color: var(--text); outline: none; font-family: var(--font-body);
  }
  .picker-search::placeholder { color: var(--text3); }
  .picker-search:focus { border-color: rgba(184,169,255,0.4); }
  .picker-list { overflow-y: auto; flex: 1; }
  .picker-list::-webkit-scrollbar { width: 4px; }
  .picker-list::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }
  .picker-item {
    width: 100%; background: none; border: none; border-bottom: 1px solid var(--border);
    padding: 12px 20px; text-align: left; cursor: pointer; transition: background 0.12s; display: block;
  }
  .picker-item:last-child { border-bottom: none; }
  .picker-item:hover { background: var(--glass); }
  .picker-item-top { display: flex; align-items: center; gap: 7px; margin-bottom: 3px; flex-wrap: wrap; }
  .picker-item-name { font-size: 13px; font-weight: 600; color: var(--lavender); }
  .picker-priv { font-size: 10px; padding: 1px 7px; border-radius: 100px; background: rgba(147,197,253,0.1); color: var(--sky); border: 1px solid rgba(147,197,253,0.25); }
  .picker-lang { font-size: 10px; padding: 1px 7px; border-radius: 100px; background: var(--glass2); color: var(--text3); border: 1px solid var(--border); }
  .picker-desc { font-size: 12px; color: var(--text3); line-height: 1.4; margin-bottom: 4px; }
  .picker-meta { display: flex; gap: 10px; font-size: 11px; color: var(--text3); }
  .picker-empty { padding: 24px; text-align: center; font-size: 13px; color: var(--text3); }
  .picker-load-more {
    width: 100%; padding: 12px; background: none; border: none; border-top: 1px solid var(--border);
    color: var(--lavender); font-family: var(--font-display); font-size: 12px; cursor: pointer;
    transition: background 0.12s;
  }
  .picker-load-more:hover { background: var(--glass); }
`;

// ── Helpers ──────────────────────────────────────────────────────────────────

function getScoreColor(score) {
  if (score >= 75) return "#6EE7B7";
  if (score >= 50) return "#FCD34D";
  return "#FF8FAB";
}

function getGrade(score) {
  if (score >= 85) return { grade: "A+", bg: "rgba(110,231,183,0.15)", color: "#6EE7B7" };
  if (score >= 75) return { grade: "A",  bg: "rgba(110,231,183,0.12)", color: "#6EE7B7" };
  if (score >= 65) return { grade: "B+", bg: "rgba(253,211,77,0.12)",  color: "#FCD34D" };
  if (score >= 55) return { grade: "B",  bg: "rgba(253,211,77,0.1)",   color: "#FCD34D" };
  if (score >= 45) return { grade: "C+", bg: "rgba(255,143,171,0.12)", color: "#FF8FAB" };
  return                    { grade: "C",  bg: "rgba(255,143,171,0.1)",  color: "#FF8FAB" };
}

// ── Score Ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, color }) {
  const r = 46, circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  return (
    <div className="score-ring-wrap">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle className="ring-bg" cx="55" cy="55" r={r} />
        <circle className="ring-fill" cx="55" cy="55" r={r}
          stroke={color} strokeDasharray={`${fill} ${circ}`} strokeDashoffset={0}
          style={{ filter: `drop-shadow(0 0 6px ${color}60)` }} />
      </svg>
      <div className="score-center">
        <span className="score-num" style={{ color }}>{score}</span>
        <span className="score-label">SCORE</span>
      </div>
    </div>
  );
}

// ── Radar Chart ───────────────────────────────────────────────────────────────
function RadarChart({ data }) {
  const size = 160, cx = size/2, cy = size/2, r = 60;
  const n = data.length;
  const colors = ["#B8A9FF","#7FFFD4","#93C5FD","#FFB3C8","#FFCBA4"];
  const pt  = (i, val) => { const a=(i/n)*2*Math.PI-Math.PI/2, rv=(val/100)*r; return [cx+rv*Math.cos(a), cy+rv*Math.sin(a)]; };
  const gpt = (i, pct) => { const a=(i/n)*2*Math.PI-Math.PI/2, rv=pct*r;       return [cx+rv*Math.cos(a), cy+rv*Math.sin(a)]; };
  const poly = data.map((a,i) => pt(i,a.value).join(",")).join(" ");
  return (
    <div className="radar-wrap">
      <svg width={size+60} height={size+40} viewBox={`-30 -20 ${size+60} ${size+40}`} style={{ overflow:"visible" }}>
        {[0.25,0.5,0.75,1].map(lvl => (
          <polygon key={lvl} points={Array.from({length:n},(_,i)=>gpt(i,lvl).join(",")).join(" ")}
            fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}
        {data.map((_,i) => { const [x2,y2]=gpt(i,1); return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>; })}
        <polygon points={poly} fill="rgba(184,169,255,0.12)" stroke="#B8A9FF" strokeWidth="1.5"
          style={{ filter:"drop-shadow(0 0 6px rgba(184,169,255,0.3))" }} />
        {data.map((a,i) => { const [x,y]=pt(i,a.value); return <circle key={i} cx={x} cy={y} r="3.5" fill={colors[i%colors.length]} style={{ filter:`drop-shadow(0 0 4px ${colors[i%colors.length]})` }}/>; })}
        {data.map((a,i) => { const [lx,ly]=gpt(i,1.28); return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fill="rgba(136,146,164,0.9)" fontSize="9" fontFamily="'DM Sans',sans-serif">{a.label}</text>; })}
      </svg>
    </div>
  );
}

// ── Category Card (expandable) ─────────────────────────────────────────────
function CategoryCard({ cat }) {
  const [expanded, setExpanded] = useState(false);
  const color = getScoreColor(cat.score);
  return (
    <div className="cat-card" onClick={() => setExpanded(e => !e)}>
      <div className="cat-header">
        <span className="cat-name">{cat.name}</span>
        <span className="cat-score" style={{ color }}>{cat.score}</span>
      </div>
      <div className="cat-bar-bg">
        <div className="cat-bar-fill" style={{ width:`${cat.score}%`, background:`linear-gradient(90deg,${color}60,${color})` }} />
      </div>
      <div className="cat-preview">{cat.preview}</div>
      {expanded && <div className="cat-expand">{cat.detail}</div>}
    </div>
  );
}

// ── Repo Picker (GitHub login browse) ─────────────────────────────────────
function RepoPicker({ onSelect, onClose }) {
  const [repos,   setRepos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [page,    setPage]    = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => { load(1); }, []);

  async function load(p) {
    setLoading(true);
    try {
      const res = await fetch(GH_PROXY(`user/repos?sort=updated&per_page=50&page=${p}&affiliation=owner,collaborator`), { credentials:"include" });
      const data = await res.json();
      if (p === 1) setRepos(data); else setRepos(r => [...r, ...data]);
      setHasMore(data.length === 50);
      setPage(p);
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  const filtered = repos.filter(r =>
    r.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (r.description||"").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="picker-overlay" onClick={onClose}>
      <div className="picker-modal" onClick={e => e.stopPropagation()}>
        <div className="picker-hd">
          <span className="picker-hd-title">Select repository</span>
          <button className="picker-close" onClick={onClose}>×</button>
        </div>
        <div className="picker-search-wrap">
          <input autoFocus className="picker-search" value={search}
            onChange={e => setSearch(e.target.value)} placeholder="Filter repositories…" />
        </div>
        <div className="picker-list">
          {loading && page === 1
            ? <div className="picker-empty">Loading repositories…</div>
            : filtered.length === 0
              ? <div className="picker-empty">No repositories found</div>
              : filtered.map(r => (
                  <button key={r.id} className="picker-item" onClick={() => onSelect(r)}>
                    <div className="picker-item-top">
                      <span className="picker-item-name">{r.full_name}</span>
                      {r.private   && <span className="picker-priv">Private</span>}
                      {r.language  && <span className="picker-lang">{r.language}</span>}
                    </div>
                    {r.description && <div className="picker-desc">{r.description}</div>}
                    <div className="picker-meta">
                      <span>★ {r.stargazers_count}</span>
                      <span>Updated {new Date(r.updated_at).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))
          }
          {hasMore && !loading && (
            <button className="picker-load-more" onClick={() => load(page + 1)}>Load more</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── AI prompt (strict scoring, rich output matching original JSON schema) ──
const SYSTEM_PROMPT = `You are a brutally strict principal engineer conducting a formal repository audit.
Score HARSHLY. Most repos are mediocre. DO NOT round up. DO NOT give benefit of the doubt.

Return ONLY valid JSON with this exact structure (no markdown, no backticks, no explanation):
{
  "score": number (0-100, strictly penalty-based),
  "grade": "A+"|"A"|"B+"|"B"|"C+"|"C",
  "confidence": "High"|"Medium"|"Low",
  "insight": "2-3 sentence honest assessment",
  "tags": ["tag1","tag2","tag3"],
  "problems": ["specific problem 1","specific problem 2","specific problem 3"],
  "strengths": ["strength1","strength2"],
  "radarData": [
    {"label":"Quality","value":number},
    {"label":"Structure","value":number},
    {"label":"Docs","value":number},
    {"label":"Security","value":number},
    {"label":"Maintainability","value":number}
  ],
  "repoStats": {"files":number,"largestFile":"filename","complexity":"Low|Medium|High"},
  "languages": [{"name":"Lang","pct":number,"color":"#hex"}],
  "whyCategories": [
    {"name":"Code Quality","score":number,"reasons":[{"type":"good|warning|critical","text":"specific reason citing actual data"}]},
    {"name":"Documentation","score":number,"reasons":[{"type":"good|warning|critical","text":"specific reason"}]},
    {"name":"Testing","score":number,"reasons":[{"type":"good|warning|critical","text":"specific reason"}]},
    {"name":"Architecture","score":number,"reasons":[{"type":"good|warning|critical","text":"specific reason"}]}
  ],
  "categories": [
    {"name":"name","score":number,"preview":"1 line","detail":"expanded detail"}
  ],
  "suggestions": [
    {"title":"specific actionable title","why":"why it matters","where":"exact file or path","priority":"high|medium|low"}
  ],
  "proMetrics": {"security":number,"vulnerabilities":number,"maintainability":number,"techDebt":"Xh"}
}

HARD SCORING RULES (enforce strictly):
- testFiles === 0 → score cannot exceed 50, Testing whyCategory score must be 0
- hasReadme === false → score cannot exceed 55
- testFiles === 0 AND hasReadme === false → score cannot exceed 38
- hasCI === false → score cannot exceed 72
- monthsSinceLastPush > 12 → score cannot exceed 65
- totalFiles < 5 → score cannot exceed 35
- baseScore is the absolute CEILING — never exceed it
- Problems list must name specific files from fileTreeSample when possible
- Suggestions "where" field must reference actual paths from fileTreeSample`;

// ── fetchRepoData via server proxy (supports private repos) ───────────────
async function fetchRepoData(owner, repo) {
  const base = `repos/${owner}/${repo}`;
  const [repoJson, readmeRes, treeRes] = await Promise.all([
    fetch(GH_PROXY(base), { credentials:"include" }).then(r => { if (!r.ok) throw new Error(`Repo not found (${r.status})`); return r.json(); }),
    fetch(GH_PROXY(`${base}/readme`), { credentials:"include" }).catch(() => ({ ok:false })),
    fetch(GH_PROXY(`${base}/git/trees/HEAD?recursive=1`), { credentials:"include" }).catch(() => ({ ok:false })),
  ]);

  const hasReadme = readmeRes.ok;
  let readme = "";
  if (readmeRes.ok) {
    const rd = await readmeRes.json().catch(() => ({}));
    try { readme = atob((rd.content||"").replace(/\n/g,"")).slice(0,2000); } catch {}
  }

  const treeJson = treeRes.ok ? await treeRes.json() : { tree:[] };
  const files    = (treeJson.tree||[]).filter(f => f.type==="blob");
  const fileTree = files.map(f => f.path).slice(0,60);

  // ── Strict signals (fixed CI regex) ──
  const hasCI = files.some(f =>
    /^\.github\/workflows\//i.test(f.path) ||
    /^\.circleci\//i.test(f.path) ||
    /^\.travis\.yml$/i.test(f.path.split("/").pop()) ||
    /^jenkinsfile$/i.test(f.path.split("/").pop()) ||
    /^\.gitlab-ci\.yml$/i.test(f.path.split("/").pop())
  );
  const hasLicense     = files.some(f => /^(license|licence)(\.md|\.txt)?$/i.test(f.path.split("/").pop()));
  const hasLockFile    = files.some(f => /^(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|poetry\.lock|pipfile\.lock|go\.sum|cargo\.lock)$/i.test(f.path.split("/").pop()));
  const hasDocker      = files.some(f => /^dockerfile(\..*)?$/i.test(f.path.split("/").pop()));
  const hasContributing= files.some(f => /^contributing(\.md)?$/i.test(f.path.split("/").pop()));
  const hasChangelog   = files.some(f => /^changelog(\.md)?$/i.test(f.path.split("/").pop()));
  const hasDotenv      = files.some(f => /\.env\.example$/i.test(f.path));
  const testFiles      = files.filter(f => /\.(test|spec)\.[jt]sx?$|__tests__|\/test\/|\/tests\//i.test(f.path)).length;
  const totalFiles     = files.length;
  const testRatio      = totalFiles > 0 ? testFiles/totalFiles : 0;
  const lastPush       = new Date(repoJson.pushed_at);
  const monthsSincePush= (Date.now()-lastPush)/(1000*60*60*24*30);
  const stars          = repoJson.stargazers_count;

  // ── Penalty-based baseScore (server computes ceiling, AI stays within it) ──
  let baseScore = 100;
  if (!hasReadme)              baseScore -= 20;
  if (!hasLicense)             baseScore -= 10;
  if (testFiles === 0)         baseScore -= 20;
  else if (testRatio < 0.05)   baseScore -= 12;
  else if (testRatio < 0.10)   baseScore -= 6;
  if (!repoJson.description)   baseScore -= 5;
  if (totalFiles === 0)        baseScore -= 25;
  else if (totalFiles < 3)     baseScore -= 15;
  else if (totalFiles < 8)     baseScore -= 8;
  if (!hasCI)                  baseScore -= 8;
  if (!hasLockFile)            baseScore -= 5;
  if (!hasContributing)        baseScore -= 3;
  if (!hasChangelog)           baseScore -= 3;
  if (repoJson.open_issues_count > 200) baseScore -= 8;
  else if (repoJson.open_issues_count > 100) baseScore -= 5;
  else if (repoJson.open_issues_count > 50)  baseScore -= 3;
  if (monthsSincePush > 24)    baseScore -= 10;
  else if (monthsSincePush > 12) baseScore -= 5;
  else if (monthsSincePush > 6)  baseScore -= 2;
  if (hasDocker)  baseScore += 3;
  if (hasDotenv)  baseScore += 2;
  if (stars > 1000) baseScore += 4;
  else if (stars > 100) baseScore += 2;
  if (testFiles === 0 || !hasReadme) baseScore = Math.min(baseScore, 55);
  if (testFiles === 0 && !hasReadme) baseScore = Math.min(baseScore, 40);
  baseScore = Math.max(5, Math.min(baseScore, 88));

  return {
    repoData: repoJson,
    readme,
    fileTree,
    signals: {
      totalFiles, testFiles, testRatio: parseFloat(testRatio.toFixed(3)),
      hasReadme, hasLicense, hasCI, hasLockFile, hasDocker,
      hasContributing, hasChangelog, hasDotenv,
      openIssues: repoJson.open_issues_count,
      monthsSinceLastPush: parseFloat(monthsSincePush.toFixed(1)),
      baseScore,
    },
  };
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [url,          setUrl]         = useState("");
  const [loading,      setLoading]     = useState(false);
  const [result,       setResult]      = useState(null);
  const [error,        setError]       = useState("");
  const [logs,         setLogs]        = useState([]);
  const [proMode,      setProMode]     = useState(false);
  const [chatMessages, setChatMessages]= useState([
    { role:"ai", text:"Ask me anything about this repository. I have full context of the analysis." }
  ]);
  const [chatInput,    setChatInput]   = useState("");
  const [chatLoading,  setChatLoading] = useState(false);
  const [ghUser,         setGhUser]        = useState(null);
  const [showPicker,     setShowPicker]    = useState(false);
  const [oauthAvailable, setOauthAvailable]= useState(false);
  const chatRef   = useRef(null);
  const resultRef = useRef(null);

  // Check GitHub auth and OAuth availability on mount
  useEffect(() => {
    fetch("/auth/me", { credentials:"include" })
      .then(r => r.json()).then(d => { if (d.connected) setGhUser(d.user); }).catch(() => {});
    fetch("/auth/status")
      .then(r => r.json()).then(d => setOauthAvailable(!!d.oauthAvailable)).catch(() => {});
    const p = new URLSearchParams(window.location.search);
    if (p.get("error")) {
      const msg = p.get("error") === "oauth_not_configured"
        ? "GitHub OAuth is not configured on this server. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to your .env file."
        : `GitHub login failed: ${p.get("error")}`;
      setError(msg);
      window.history.replaceState({}, "", "/");
    }
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatMessages, chatLoading]);

  const addLog = (m) => setLogs(l => [...l, m]);

  async function analyze() {
    if (!url.trim()) return;
    // Accept both full URL and owner/repo shorthand
    let match = url.match(/github\.com\/([^/]+)\/([^/?\s]+)/);
    if (!match) {
      const short = url.trim().match(/^([^/\s]+)\/([^/\s]+)$/);
      if (short) match = [null, short[1], short[2]];
    }
    if (!match) { setError("Invalid GitHub URL"); return; }
    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/,"");

    setLoading(true); setError(""); setResult(null); setLogs([]);
    try {
      addLog(`Fetching ${owner}/${cleanRepo}…`);
      const { repoData, readme, fileTree, signals } = await fetchRepoData(owner, cleanRepo);
      addLog(`Found: ${repoData.full_name} · ${signals.totalFiles} files · ${signals.testFiles} test files (${(signals.testRatio*100).toFixed(1)}%)`);
      addLog(`CI=${signals.hasCI} · LockFile=${signals.hasLockFile} · Docker=${signals.hasDocker} · Last push: ${Math.round(signals.monthsSinceLastPush)}mo ago`);
      addLog(`Base score ceiling: ${signals.baseScore}/100`);
      addLog("Sending to LLaMA-3.3-70B via Groq…");

      const prompt = `${SYSTEM_PROMPT}

Repository: ${repoData.full_name}
Description: ${repoData.description || "No description"}
Language: ${repoData.language}
Stars: ${repoData.stargazers_count} | Forks: ${repoData.forks_count} | Issues: ${repoData.open_issues_count}
Topics: ${(repoData.topics||[]).join(", ")}
Created: ${repoData.created_at?.split("T")[0]} | Last pushed: ${repoData.pushed_at?.split("T")[0]}
License: ${repoData.license?.name || "None"}

COMPUTED SIGNALS (use these for scoring — do not invent):
${JSON.stringify(signals, null, 2)}

README excerpt: ${readme.slice(0,1200)}
File tree (first 60): ${fileTree.join(", ")}

CEILING ENFORCEMENT: Final score must not exceed ${signals.baseScore}. Apply all hard rules from system prompt.`;

      const response = await fetch(`${API}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      let parsed;
      try {
        const clean = data.text.replace(/```json|```/g,"").trim();
        parsed = JSON.parse(clean);
      } catch {
        const m = data.text.match(/\{[\s\S]*\}/);
        if (!m) throw new Error("Invalid response from AI");
        parsed = JSON.parse(m[0]);
      }

      // Safety clamp — enforce ceiling even if AI ignored it
      parsed.score = Math.min(parsed.score, signals.baseScore);

      parsed._repoData  = repoData;
      parsed._signals   = signals;
      setResult(parsed);
      addLog(`Done — Score: ${parsed.score}/100 (${parsed.grade})`);
      setChatMessages([{ role:"ai", text:`I've analyzed **${repoData.full_name}**. Score: ${parsed.score}/100 (${parsed.grade}). ${parsed.insight} Ask me anything!` }]);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 100);
    } catch(e) {
      const msg = e.message.includes("404") && !ghUser
        ? "Repository not found. If it's private, connect your GitHub account first."
        : e.message || "Failed to analyze repository";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function sendChat(text) {
    const msg = text || chatInput.trim();
    if (!msg || chatLoading) return;
    setChatInput("");
    setChatMessages(m => [...m, { role:"user", text:msg }]);
    setChatLoading(true);
    try {
      const ctx = result
        ? `Repository: ${result._repoData?.full_name}, Score: ${result.score}, Grade: ${result.grade}. Signals: ${JSON.stringify(result._signals)}. Insight: ${result.insight}. Problems: ${result.problems?.join("; ")}`
        : "No repo analyzed yet.";
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ messages:[{ role:"user", content:`You are a helpful code quality AI. Context: ${ctx}\n\nUser: ${msg}` }] }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setChatMessages(m => [...m, { role:"ai", text:data.text }]);
    } catch(e) {
      setChatMessages(m => [...m, { role:"ai", text:"Sorry, I couldn't process that. " + e.message }]);
    } finally { setChatLoading(false); }
  }

  const gradeInfo  = result ? getGrade(result.score) : null;
  const scoreColor = result ? getScoreColor(result.score) : "#B8A9FF";
  const langColors = ["#B8A9FF","#7FFFD4","#93C5FD","#FFCBA4","#FFB3C8","#FCD34D"];

  return (
    <>
      <style>{STYLES}</style>
      <div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" />

      {/* NAV — GitHub connect button */}
      <nav className="nav">
        {ghUser ? (
          <div className="auth-chip">
            <img src={ghUser.avatar} alt="" className="auth-avatar" />
            <div>
              <div className="auth-name">{ghUser.name || ghUser.login}</div>
              <div className="auth-sub">Private repos unlocked</div>
            </div>
            <button className="btn-signout" onClick={async () => {
              await fetch("/auth/logout", { method:"POST", credentials:"include" });
              setGhUser(null);
            }}>Sign out</button>
          </div>
        ) : (
          <button className="btn-connect" onClick={() => {
              if (!oauthAvailable) {
                setError("GitHub OAuth is not configured. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to your .env file to enable private repo access.");
              } else {
                window.location.href = "/auth/github";
              }
            }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            Connect GitHub
          </button>
        )}
      </nav>

      <div className="app">
        {/* HERO — identical to original */}
        <div className="hero">
          <div className="hero-badge">
            <div className="hero-badge-dot" />
            AI-Powered Analysis
          </div>
          <h1>AI GitHub Repo<br />Evaluator</h1>
          <p>Understand your codebase like a senior engineer. Deep analysis, actionable insights.</p>
          <div className="input-wrap">
            <input type="text" placeholder="https://github.com/owner/repository"
              value={url} onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key==="Enter" && analyze()} />
            {ghUser && (
              <button className="btn-browse" onClick={() => setShowPicker(true)}>Browse →</button>
            )}
            <button className="btn-analyze" onClick={analyze} disabled={loading || !url.trim()}>
              {loading ? "Analyzing…" : "Analyze →"}
            </button>
          </div>
          {error && <p style={{ color:"var(--danger)", fontSize:13, marginTop:12 }}>{error}</p>}
        </div>

        {/* Private repo banner — only when not logged in */}
        {!ghUser && (
          <div className="priv-banner">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M4 5v-.5A3.5 3.5 0 018 1a3.5 3.5 0 013.5 3.5V5h.5A1.5 1.5 0 0113.5 6.5v7A1.5 1.5 0 0112 15H4a1.5 1.5 0 01-1.5-1.5v-7A1.5 1.5 0 014 5zm1 0h6v-.5A2.5 2.5 0 008 2 2.5 2.5 0 005.5 4.5V5zM8 10.5a1 1 0 100-2 1 1 0 000 2z"/></svg>
            <span><strong>Private repo?</strong> Connect GitHub to analyze private repositories.</span>
            <button className="priv-banner-btn" onClick={() => {
              if (!oauthAvailable) {
                setError("GitHub OAuth is not configured. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to your .env file.");
              } else {
                window.location.href="/auth/github";
              }
            }}>Connect →</button>
          </div>
        )}

        {/* Status log */}
        {logs.length > 0 && (
          <div className="log-wrap">
            {logs.map((m,i) => <div key={i} className="log-line">{m}</div>)}
          </div>
        )}

        {/* LOADING SKELETON — identical to original */}
        {loading && (
          <div style={{ marginTop:24 }}>
            <div className="skeleton" style={{ height:180, borderRadius:24, marginBottom:16 }} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
              <div className="skeleton" style={{ height:220, borderRadius:20 }} />
              <div className="skeleton" style={{ height:220, borderRadius:20 }} />
            </div>
            <div className="skeleton" style={{ height:160, borderRadius:20, marginBottom:16 }} />
          </div>
        )}

        {/* RESULTS — identical structure to original */}
        {result && !loading && (
          <div className="results" ref={resultRef}>

            {/* SUMMARY */}
            <div className="summary-card">
              <div className="summary-top">
                <ScoreRing score={result.score} color={scoreColor} />
                <div className="summary-info">
                  <div className="summary-grade-row">
                    <span className="grade-badge" style={{ background:gradeInfo.bg, color:gradeInfo.color }}>{gradeInfo.grade}</span>
                    <span className="confidence-badge">{result.confidence} Confidence</span>
                  </div>
                  <div className="repo-meta">
                    {result._repoData && (<>
                      <span className="meta-item">⭐ {result._repoData.stargazers_count?.toLocaleString()}</span>
                      <div className="meta-dot"/>
                      <span className="meta-item">🔀 {result._repoData.forks_count}</span>
                      <div className="meta-dot"/>
                      <span className="meta-item">⚠ {result._repoData.open_issues_count} issues</span>
                      <div className="meta-dot"/>
                      <span className="meta-item">{result._repoData.language}</span>
                      {result._repoData.private && <><div className="meta-dot"/><span className="meta-item" style={{color:"var(--sky)"}}>🔒 Private</span></>}
                    </>)}
                  </div>
                  <div className="tags">
                    {result.tags?.map((t,i) => <span key={i} className="tag">{t}</span>)}
                  </div>
                  <div className="ai-insight">
                    <div className="ai-insight-label">AI INSIGHT</div>
                    {result.insight}
                  </div>
                </div>
              </div>
              <div className="sp-row">
                <div className="sp-box">
                  <div className="sp-box-title" style={{ color:"var(--danger)" }}>KEY PROBLEMS</div>
                  {result.problems?.map((p,i) => <div key={i} className="sp-item"><span className="sp-icon">✖</span>{p}</div>)}
                </div>
                <div className="sp-box">
                  <div className="sp-box-title" style={{ color:"var(--success)" }}>STRENGTHS</div>
                  {result.strengths?.map((s,i) => <div key={i} className="sp-item"><span className="sp-icon">✔</span>{s}</div>)}
                </div>
              </div>
            </div>

            {/* VISUAL INTELLIGENCE */}
            <div className="section-title">Visual Intelligence</div>
            <div className="visual-grid">
              <div className="glass-card">
                <div className="card-title">Code Health Radar</div>
                {result.radarData && <RadarChart data={result.radarData} />}
              </div>
              <div className="glass-card">
                <div className="card-title">Repo Insights</div>
                {result.languages && (<>
                  <div className="lang-row">
                    {result.languages.map((l,i) => <div key={i} className="lang-seg" style={{ flex:l.pct, background:langColors[i%langColors.length] }}/>)}
                  </div>
                  <div className="lang-legend" style={{ marginBottom:14 }}>
                    {result.languages.map((l,i) => (
                      <span key={i} className="lang-item">
                        <span className="lang-dot" style={{ background:langColors[i%langColors.length] }}/>
                        {l.name} {l.pct}%
                      </span>
                    ))}
                  </div>
                </>)}
                {result.repoStats && (
                  <div className="stat-row">
                    <div className="stat-item"><div className="stat-val">{result.repoStats.files}</div><div className="stat-lbl">Total Files</div></div>
                    <div className="stat-item">
                      <div className="stat-val" style={{ color: result.repoStats.complexity==="High"?"var(--danger)":result.repoStats.complexity==="Medium"?"var(--warning)":"var(--success)" }}>
                        {result.repoStats.complexity}
                      </div>
                      <div className="stat-lbl">Complexity</div>
                    </div>
                    <div className="stat-item" style={{ gridColumn:"span 2" }}>
                      <div className="stat-val" style={{ fontSize:13, fontFamily:"monospace" }}>{result.repoStats.largestFile}</div>
                      <div className="stat-lbl">Largest File</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* WHY THIS SCORE */}
            <div className="section-title">Why This Score?</div>
            <div className="why-card">
              {result.whyCategories?.map((cat,i) => {
                const c = getScoreColor(cat.score);
                return (
                  <div key={i} className="why-category">
                    <div className="why-cat-header">
                      <span className="why-cat-name">{cat.name}</span>
                      <span className="why-score-chip" style={{ background:`${c}18`, color:c }}>{cat.score}</span>
                    </div>
                    {cat.reasons?.map((r,j) => (
                      <div key={j} className="why-reason">
                        <span className="why-icon">{r.type==="good"?"✔":r.type==="warning"?"⚠":"✖"}</span>
                        <span style={{ color:r.type==="good"?"var(--success)":r.type==="warning"?"var(--warning)":"var(--danger)" }}>{r.text}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* CATEGORY BREAKDOWN */}
            <div className="section-title">Category Breakdown</div>
            <div className="cat-grid">
              {result.categories?.map((cat,i) => <CategoryCard key={i} cat={cat} />)}
            </div>

            {/* AI SUGGESTIONS */}
            <div className="section-title">AI Suggestions</div>
            <div className="suggestion-list">
              {result.suggestions?.map((s,i) => {
                const pc = { high:"#FF8FAB", medium:"#FCD34D", low:"#93C5FD" }[s.priority]||"#FCD34D";
                const pb = { high:"rgba(255,143,171,0.12)", medium:"rgba(253,211,77,0.1)", low:"rgba(147,197,253,0.1)" }[s.priority]||"rgba(253,211,77,0.1)";
                return (
                  <div key={i} className="suggestion-card">
                    <div className="sug-priority" style={{ background:pc, boxShadow:`0 0 6px ${pc}` }}/>
                    <div className="sug-content">
                      <div className="sug-title">{s.title}</div>
                      <div className="sug-why">{s.why}</div>
                      {s.where && <span className="sug-where">{s.where}</span>}
                    </div>
                    <span className="sug-badge" style={{ background:pb, color:pc }}>{s.priority}</span>
                  </div>
                );
              })}
            </div>

            {/* PRO MODE */}
            <div className="pro-bar">
              <div>
                <div className="pro-label">Pro Mode</div>
                <div className="pro-sub">Unlock security scores, vulnerabilities &amp; maintainability index</div>
              </div>
              <div className="toggle-wrap" onClick={() => setProMode(p => !p)}>
                <span style={{ fontSize:12, color:"var(--text2)" }}>{proMode?"On":"Off"}</span>
                <div className={`toggle ${proMode?"on":"off"}`}><div className="toggle-thumb"/></div>
              </div>
            </div>
            {proMode && result.proMetrics && (
              <div className="pro-panel">
                <div className="pro-metric">
                  <div className="pro-metric-val" style={{ color:getScoreColor(result.proMetrics.security) }}>{result.proMetrics.security}</div>
                  <div className="pro-metric-lbl">SECURITY</div>
                </div>
                <div className="pro-metric">
                  <div className="pro-metric-val" style={{ color:result.proMetrics.vulnerabilities>5?"var(--danger)":result.proMetrics.vulnerabilities>0?"var(--warning)":"var(--success)" }}>{result.proMetrics.vulnerabilities}</div>
                  <div className="pro-metric-lbl">VULNERABILITIES</div>
                </div>
                <div className="pro-metric">
                  <div className="pro-metric-val" style={{ color:getScoreColor(result.proMetrics.maintainability) }}>{result.proMetrics.maintainability}</div>
                  <div className="pro-metric-lbl">MAINTAINABILITY</div>
                </div>
                <div className="pro-metric">
                  <div className="pro-metric-val" style={{ color:"var(--warning)", fontSize:16 }}>{result.proMetrics.techDebt}</div>
                  <div className="pro-metric-lbl">TECH DEBT</div>
                </div>
              </div>
            )}

            {/* CHAT */}
            <div className="section-title" style={{ marginTop:24 }}>Talk to your Codebase</div>
            <div className="chat-section">
              <div className="chat-header">
                <span className="chat-title">AI Repository Assistant</span>
                <span className="ctx-badge"><span className="ctx-dot"/>Using repo context</span>
              </div>
              <div className="chat-msgs" ref={chatRef}>
                {chatMessages.map((m,i) => (
                  <div key={i} className={`msg ${m.role}`}>
                    <div className="msg-bubble">{m.text}</div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="msg ai">
                    <div className="msg-bubble">
                      <div className="typing-indicator">
                        <div className="typing-dot"/><div className="typing-dot"/><div className="typing-dot"/>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="suggested-prompts">
                {["Explain this repo","Biggest risks?","Improve architecture?","Best practices missing?"].map((p,i) => (
                  <button key={i} className="sp-btn" onClick={() => sendChat(p)}>{p}</button>
                ))}
              </div>
              <div className="chat-input-row">
                <input className="chat-input" placeholder="Ask anything about this repository…"
                  value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key==="Enter" && sendChat()} />
                <button className="chat-send" onClick={() => sendChat()} disabled={!chatInput.trim()||chatLoading}>Send</button>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Repo picker modal */}
      {showPicker && (
        <RepoPicker
          onSelect={r => { setShowPicker(false); setUrl(`https://github.com/${r.full_name}`); }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}