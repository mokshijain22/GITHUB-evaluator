import { useState, useEffect, useRef, useCallback } from "react";

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

  /* HERO */
  .hero { padding: 72px 0 56px; text-align: center; }
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
  .sug-priority {
    flex-shrink: 0; width: 6px; height: 6px; border-radius: 50%; margin-top: 5px;
  }
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
  .msg-bubble {
    padding: 10px 14px; border-radius: 14px; font-size: 13px; line-height: 1.6;
  }
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
    cursor: pointer; transition: border-color 0.15s, color 0.15s;
    font-family: var(--font-body);
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

  .score-green { color: var(--success); }
  .score-yellow { color: var(--warning); }
  .score-red { color: var(--danger); }
`;

function getScoreColor(score) {
  if (score >= 75) return "#6EE7B7";
  if (score >= 50) return "#FCD34D";
  return "#FF8FAB";
}

function getGrade(score) {
  if (score >= 85) return { grade: "A+", bg: "rgba(110,231,183,0.15)", color: "#6EE7B7" };
  if (score >= 75) return { grade: "A", bg: "rgba(110,231,183,0.12)", color: "#6EE7B7" };
  if (score >= 65) return { grade: "B+", bg: "rgba(253,211,77,0.12)", color: "#FCD34D" };
  if (score >= 55) return { grade: "B", bg: "rgba(253,211,77,0.1)", color: "#FCD34D" };
  if (score >= 45) return { grade: "C+", bg: "rgba(255,143,171,0.12)", color: "#FF8FAB" };
  return { grade: "C", bg: "rgba(255,143,171,0.1)", color: "#FF8FAB" };
}

function ScoreRing({ score, color }) {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const fill = ((score / 100) * circ);
  return (
    <div className="score-ring-wrap">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle className="ring-bg" cx="55" cy="55" r={r} />
        <circle
          className="ring-fill"
          cx="55" cy="55" r={r}
          stroke={color}
          strokeDasharray={`${fill} ${circ}`}
          strokeDashoffset={0}
          style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
        />
      </svg>
      <div className="score-center">
        <span className="score-num" style={{ color }}>{score}</span>
        <span className="score-label">SCORE</span>
      </div>
    </div>
  );
}

function RadarChart({ data }) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 60;
  const axes = data;
  const n = axes.length;
  const colors = ["#B8A9FF", "#7FFFD4", "#93C5FD", "#FFB3C8", "#FFCBA4"];

  function pt(i, val) {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    const rv = (val / 100) * r;
    return [cx + rv * Math.cos(angle), cy + rv * Math.sin(angle)];
  }
  function gridPt(i, pct) {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    const rv = pct * r;
    return [cx + rv * Math.cos(angle), cy + rv * Math.sin(angle)];
  }

  const polyPoints = axes.map((a, i) => pt(i, a.value)).map(p => p.join(",")).join(" ");
  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <div className="radar-wrap">
      <svg width={size + 60} height={size + 40} viewBox={`-30 -20 ${size + 60} ${size + 40}`} style={{ overflow: "visible" }}>
        {gridLevels.map(lvl => (
          <polygon key={lvl}
            points={Array.from({ length: n }, (_, i) => gridPt(i, lvl).join(",")).join(" ")}
            fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}
        {axes.map((_, i) => {
          const [x2, y2] = gridPt(i, 1);
          return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
        })}
        <polygon points={polyPoints} fill="rgba(184,169,255,0.12)" stroke="#B8A9FF" strokeWidth="1.5"
          style={{ filter: "drop-shadow(0 0 6px rgba(184,169,255,0.3))" }} />
        {axes.map((a, i) => {
          const [x, y] = pt(i, a.value);
          return <circle key={i} cx={x} cy={y} r="3.5" fill={colors[i % colors.length]}
            style={{ filter: `drop-shadow(0 0 4px ${colors[i % colors.length]})` }} />;
        })}
        {axes.map((a, i) => {
          const [lx, ly] = gridPt(i, 1.28);
          return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="central"
            fill="rgba(136,146,164,0.9)" fontSize="9" fontFamily="'DM Sans',sans-serif">{a.label}</text>;
        })}
      </svg>
    </div>
  );
}

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
        <div className="cat-bar-fill" style={{ width: `${cat.score}%`, background: `linear-gradient(90deg, ${color}60, ${color})` }} />
      </div>
      <div className="cat-preview">{cat.preview}</div>
      {expanded && <div className="cat-expand">{cat.detail}</div>}
    </div>
  );
}

const SYSTEM_PROMPT = `You are an expert code quality analyst AI. Analyze GitHub repositories and return ONLY valid JSON with this exact structure (no markdown, no backticks):
{
  "score": number (0-100),
  "grade": "A+"|"A"|"B+"|"B"|"C+"|"C",
  "confidence": "High"|"Medium"|"Low",
  "insight": "2-3 sentence AI insight about repo quality",
  "tags": ["tag1","tag2","tag3"],
  "problems": ["problem1","problem2","problem3"],
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
    {"name":"Code Quality","score":number,"reasons":[{"type":"good|warning|critical","text":"reason"}]},
    {"name":"Documentation","score":number,"reasons":[{"type":"good|warning|critical","text":"reason"}]},
    {"name":"Testing","score":number,"reasons":[{"type":"good|warning|critical","text":"reason"}]},
    {"name":"Architecture","score":number,"reasons":[{"type":"good|warning|critical","text":"reason"}]}
  ],
  "categories": [
    {"name":"name","score":number,"preview":"1 line","detail":"expanded detail"}
  ],
  "suggestions": [
    {"title":"title","why":"why it matters","where":"file/module","priority":"high|medium|low"}
  ],
  "proMetrics": {"security":number,"vulnerabilities":number,"maintainability":number,"techDebt":"Xh"}
}`;

async function fetchRepoData(repoUrl) {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/?\s]+)/);
  if (!match) throw new Error("Invalid GitHub URL");
  const [, owner, repo] = match;
  const cleanRepo = repo.replace(/\.git$/, "");

  const [repoRes, readmeRes, treeRes] = await Promise.all([
    fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`),
    fetch(`https://api.github.com/repos/${owner}/${cleanRepo}/readme`).catch(() => null),
    fetch(`https://api.github.com/repos/${owner}/${cleanRepo}/git/trees/HEAD?recursive=1`).catch(() => null),
  ]);

  if (!repoRes.ok) throw new Error("Repository not found or private");
  const repoData = await repoRes.json();
  let readme = "";
  if (readmeRes?.ok) {
    const rd = await readmeRes.json();
    try { readme = atob(rd.content.replace(/\n/g, "")).slice(0, 2000); } catch {}
  }
  let fileTree = [];
  if (treeRes?.ok) {
    const td = await treeRes.json();
    fileTree = (td.tree || []).filter(f => f.type === "blob").map(f => f.path).slice(0, 60);
  }
  return { repoData, readme, fileTree };
}

export default function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [proMode, setProMode] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: "ai", text: "Ask me anything about this repository. I have full context of the analysis." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatMessages, chatLoading]);

  async function analyze() {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const { repoData, readme, fileTree } = await fetchRepoData(url);
      const prompt = `Analyze this GitHub repository and return analysis JSON.

Repository: ${repoData.full_name}
Description: ${repoData.description || "No description"}
Language: ${repoData.language}
Stars: ${repoData.stargazers_count} | Forks: ${repoData.forks_count} | Issues: ${repoData.open_issues_count}
Topics: ${(repoData.topics || []).join(", ")}
Created: ${repoData.created_at?.split("T")[0]} | Updated: ${repoData.updated_at?.split("T")[0]}
License: ${repoData.license?.name || "None"}
README excerpt: ${readme.slice(0, 1500)}
File tree (first 60 files): ${fileTree.join(", ")}`;

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `${SYSTEM_PROMPT}\n\nUser request: ${prompt}` }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      let parsed;
      try {
        const clean = data.text.replace(/```json|```/g, "").trim();
        parsed = JSON.parse(clean);
      } catch {
        const jsonMatch = data.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Invalid response from AI");
        parsed = JSON.parse(jsonMatch[0]);
      }

      parsed._repoData = repoData;
      setResult(parsed);
      setChatMessages([{ role: "ai", text: `I've analyzed **${repoData.full_name}**. Score: ${parsed.score}/100 (${parsed.grade}). ${parsed.insight} Ask me anything!` }]);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e) {
      setError(e.message || "Failed to analyze repository");
    } finally {
      setLoading(false);
    }
  }

  async function sendChat(text) {
    const msg = text || chatInput.trim();
    if (!msg || chatLoading) return;
    setChatInput("");
    setChatMessages(m => [...m, { role: "user", text: msg }]);
    setChatLoading(true);
    try {
      const context = result ? `Repository: ${result._repoData?.full_name}, Score: ${result.score}, Grade: ${result.grade}. Tags: ${result.tags?.join(", ")}. Insight: ${result.insight}` : "No repo analyzed yet.";
      const messages = [
        { role: "user", content: `You are a helpful code quality AI assistant. Context: ${context}\n\nUser: ${msg}` }
      ];
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setChatMessages(m => [...m, { role: "ai", text: data.text }]);
    } catch (e) {
      setChatMessages(m => [...m, { role: "ai", text: "Sorry, I couldn't process that request. " + e.message }]);
    } finally {
      setChatLoading(false);
    }
  }

  const gradeInfo = result ? getGrade(result.score) : null;
  const scoreColor = result ? getScoreColor(result.score) : "#B8A9FF";

  const langColors = ["#B8A9FF", "#7FFFD4", "#93C5FD", "#FFCBA4", "#FFB3C8", "#FCD34D"];

  return (
    <>
      <style>{STYLES}</style>
      <div className="orb orb1" />
      <div className="orb orb2" />
      <div className="orb orb3" />

      <div className="app">
        {/* HERO */}
        <div className="hero">
          <div className="hero-badge">
            <div className="hero-badge-dot" />
            AI-Powered Analysis
          </div>
          <h1>AI GitHub Repo<br />Evaluator</h1>
          <p>Understand your codebase like a senior engineer. Deep analysis, actionable insights.</p>
          <div className="input-wrap">
            <input
              type="text"
              placeholder="https://github.com/owner/repository"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && analyze()}
            />
            <button className="btn-analyze" onClick={analyze} disabled={loading || !url.trim()}>
              {loading ? "Analyzing..." : "Analyze →"}
            </button>
          </div>
          {error && <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 12 }}>{error}</p>}
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div>
            <div className="skeleton" style={{ height: 180, borderRadius: 24, marginBottom: 16 }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="skeleton" style={{ height: 220, borderRadius: 20 }} />
              <div className="skeleton" style={{ height: 220, borderRadius: 20 }} />
            </div>
            <div className="skeleton" style={{ height: 160, borderRadius: 20, marginBottom: 16 }} />
          </div>
        )}

        {/* RESULTS */}
        {result && !loading && (
          <div className="results" ref={resultRef}>
            {/* SUMMARY */}
            <div className="summary-card">
              <div className="summary-top">
                <ScoreRing score={result.score} color={scoreColor} />
                <div className="summary-info">
                  <div className="summary-grade-row">
                    <span className="grade-badge" style={{ background: gradeInfo.bg, color: gradeInfo.color }}>
                      {gradeInfo.grade}
                    </span>
                    <span className="confidence-badge">
                      {result.confidence} Confidence
                    </span>
                  </div>
                  <div className="repo-meta">
                    {result._repoData && (
                      <>
                        <span className="meta-item">⭐ {result._repoData.stargazers_count?.toLocaleString()}</span>
                        <div className="meta-dot" />
                        <span className="meta-item">🔀 {result._repoData.forks_count}</span>
                        <div className="meta-dot" />
                        <span className="meta-item">⚠ {result._repoData.open_issues_count} issues</span>
                        <div className="meta-dot" />
                        <span className="meta-item">{result._repoData.language}</span>
                      </>
                    )}
                  </div>
                  <div className="tags">
                    {result.tags?.map((t, i) => <span key={i} className="tag">{t}</span>)}
                  </div>
                  <div className="ai-insight">
                    <div className="ai-insight-label">AI INSIGHT</div>
                    {result.insight}
                  </div>
                </div>
              </div>
              <div className="sp-row">
                <div className="sp-box">
                  <div className="sp-box-title" style={{ color: "var(--danger)" }}>KEY PROBLEMS</div>
                  {result.problems?.map((p, i) => (
                    <div key={i} className="sp-item"><span className="sp-icon">✖</span>{p}</div>
                  ))}
                </div>
                <div className="sp-box">
                  <div className="sp-box-title" style={{ color: "var(--success)" }}>STRENGTHS</div>
                  {result.strengths?.map((s, i) => (
                    <div key={i} className="sp-item"><span className="sp-icon">✔</span>{s}</div>
                  ))}
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
                {result.languages && (
                  <>
                    <div className="lang-row">
                      {result.languages.map((l, i) => (
                        <div key={i} className="lang-seg"
                          style={{ flex: l.pct, background: langColors[i % langColors.length] }} />
                      ))}
                    </div>
                    <div className="lang-legend" style={{ marginBottom: 14 }}>
                      {result.languages.map((l, i) => (
                        <span key={i} className="lang-item">
                          <span className="lang-dot" style={{ background: langColors[i % langColors.length] }} />
                          {l.name} {l.pct}%
                        </span>
                      ))}
                    </div>
                  </>
                )}
                {result.repoStats && (
                  <div className="stat-row">
                    <div className="stat-item">
                      <div className="stat-val">{result.repoStats.files}</div>
                      <div className="stat-lbl">Total Files</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-val" style={{ color: result.repoStats.complexity === "High" ? "var(--danger)" : result.repoStats.complexity === "Medium" ? "var(--warning)" : "var(--success)" }}>
                        {result.repoStats.complexity}
                      </div>
                      <div className="stat-lbl">Complexity</div>
                    </div>
                    <div className="stat-item" style={{ gridColumn: "span 2" }}>
                      <div className="stat-val" style={{ fontSize: 13, fontFamily: "monospace" }}>{result.repoStats.largestFile}</div>
                      <div className="stat-lbl">Largest File</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* WHY THIS SCORE */}
            <div className="section-title">Why This Score?</div>
            <div className="why-card">
              {result.whyCategories?.map((cat, i) => {
                const c = getScoreColor(cat.score);
                return (
                  <div key={i} className="why-category">
                    <div className="why-cat-header">
                      <span className="why-cat-name">{cat.name}</span>
                      <span className="why-score-chip" style={{ background: `${c}18`, color: c }}>{cat.score}</span>
                    </div>
                    {cat.reasons?.map((r, j) => (
                      <div key={j} className="why-reason">
                        <span className="why-icon">
                          {r.type === "good" ? "✔" : r.type === "warning" ? "⚠" : "✖"}
                        </span>
                        <span style={{
                          color: r.type === "good" ? "var(--success)" : r.type === "warning" ? "var(--warning)" : "var(--danger)"
                        }}>{r.text}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* CATEGORIES */}
            <div className="section-title">Category Breakdown</div>
            <div className="cat-grid">
              {result.categories?.map((cat, i) => <CategoryCard key={i} cat={cat} />)}
            </div>

            {/* SUGGESTIONS */}
            <div className="section-title">AI Suggestions</div>
            <div className="suggestion-list">
              {result.suggestions?.map((s, i) => {
                const pColors = { high: "#FF8FAB", medium: "#FCD34D", low: "#93C5FD" };
                const pBg = { high: "rgba(255,143,171,0.12)", medium: "rgba(253,211,77,0.1)", low: "rgba(147,197,253,0.1)" };
                const pc = pColors[s.priority] || pColors.medium;
                return (
                  <div key={i} className="suggestion-card">
                    <div className="sug-priority" style={{ background: pc, boxShadow: `0 0 6px ${pc}` }} />
                    <div className="sug-content">
                      <div className="sug-title">{s.title}</div>
                      <div className="sug-why">{s.why}</div>
                      {s.where && <span className="sug-where">{s.where}</span>}
                    </div>
                    <span className="sug-badge" style={{ background: pBg[s.priority], color: pc }}>
                      {s.priority}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* PRO MODE */}
            <div className="pro-bar">
              <div>
                <div className="pro-label">Pro Mode</div>
                <div className="pro-sub">Unlock security scores, vulnerabilities & maintainability index</div>
              </div>
              <div className="toggle-wrap" onClick={() => setProMode(p => !p)}>
                <span style={{ fontSize: 12, color: "var(--text2)" }}>{proMode ? "On" : "Off"}</span>
                <div className={`toggle ${proMode ? "on" : "off"}`}>
                  <div className="toggle-thumb" />
                </div>
              </div>
            </div>
            {proMode && result.proMetrics && (
              <div className="pro-panel">
                <div className="pro-metric">
                  <div className="pro-metric-val" style={{ color: getScoreColor(result.proMetrics.security) }}>{result.proMetrics.security}</div>
                  <div className="pro-metric-lbl">SECURITY</div>
                </div>
                <div className="pro-metric">
                  <div className="pro-metric-val" style={{ color: result.proMetrics.vulnerabilities > 5 ? "var(--danger)" : result.proMetrics.vulnerabilities > 0 ? "var(--warning)" : "var(--success)" }}>{result.proMetrics.vulnerabilities}</div>
                  <div className="pro-metric-lbl">VULNERABILITIES</div>
                </div>
                <div className="pro-metric">
                  <div className="pro-metric-val" style={{ color: getScoreColor(result.proMetrics.maintainability) }}>{result.proMetrics.maintainability}</div>
                  <div className="pro-metric-lbl">MAINTAINABILITY</div>
                </div>
                <div className="pro-metric">
                  <div className="pro-metric-val" style={{ color: "var(--warning)", fontSize: 16 }}>{result.proMetrics.techDebt}</div>
                  <div className="pro-metric-lbl">TECH DEBT</div>
                </div>
              </div>
            )}

            {/* CHAT */}
            <div className="section-title" style={{ marginTop: 24 }}>Talk to your Codebase</div>
            <div className="chat-section">
              <div className="chat-header">
                <span className="chat-title">AI Repository Assistant</span>
                <span className="ctx-badge">
                  <span className="ctx-dot" />
                  Using repo context
                </span>
              </div>
              <div className="chat-msgs" ref={chatRef}>
                {chatMessages.map((m, i) => (
                  <div key={i} className={`msg ${m.role}`}>
                    <div className="msg-bubble">{m.text}</div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="msg ai">
                    <div className="msg-bubble">
                      <div className="typing-indicator">
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="suggested-prompts">
                {["Explain this repo", "Biggest risks?", "Improve architecture?", "Best practices missing?"].map((p, i) => (
                  <button key={i} className="sp-btn" onClick={() => sendChat(p)}>{p}</button>
                ))}
              </div>
              <div className="chat-input-row">
                <input
                  className="chat-input"
                  placeholder="Ask anything about this repository..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendChat()}
                />
                <button className="chat-send" onClick={() => sendChat()} disabled={!chatInput.trim() || chatLoading}>
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}