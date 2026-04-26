import { useState, useEffect, useRef, useCallback } from "react";

const GH_PROXY = (path) => `/api/github/${path}`;
const API = "/api";

// ── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:#080C18; --bg2:#0E1525; --bg3:#121929;
    --glass:rgba(255,255,255,0.04); --glass2:rgba(255,255,255,0.07);
    --border:rgba(255,255,255,0.08); --border2:rgba(255,255,255,0.15);
    --lav:#B8A9FF; --lav2:#8B78F5;
    --mint:#7FFFD4; --sky:#93C5FD; --rose:#FF8FAB; --amber:#FCD34D; --peach:#FFCBA4;
    --text:#E8EAF0; --text2:#8892A4; --text3:#5A6478;
    --ok:#6EE7B7; --warn:#FCD34D; --err:#FF8FAB;
    --fd:'Syne',sans-serif; --fb:'DM Sans',sans-serif;
  }
  body{background:var(--bg);color:var(--text);font-family:var(--fb);min-height:100vh;overflow-x:hidden;}
  input,button,textarea,select{font-family:inherit;}
  .orb{position:fixed;border-radius:50%;filter:blur(80px);opacity:.11;pointer-events:none;z-index:0;}
  .orb1{width:500px;height:500px;background:var(--lav2);top:-150px;left:-100px;animation:oF 12s ease-in-out infinite;}
  .orb2{width:400px;height:400px;background:#4F8EFF;bottom:10%;right:-120px;animation:oF 15s ease-in-out infinite reverse;}
  .orb3{width:300px;height:300px;background:var(--mint);top:40%;left:30%;animation:oF 18s ease-in-out infinite 3s;opacity:.06;}
  @keyframes oF{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(20px,-30px) scale(1.05)}66%{transform:translate(-15px,20px) scale(.97)}}
  @keyframes fU{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  @keyframes mI{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
  @keyframes tD{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-4px);opacity:1}}

  .app{position:relative;z-index:1;max-width:960px;margin:0 auto;padding:0 20px 80px;}

  /* NAV */
  .nav{position:relative;z-index:1;max-width:960px;margin:0 auto;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;gap:10px;}
  .logo{font-family:var(--fd);font-size:15px;font-weight:800;color:var(--text);letter-spacing:-.02em;display:flex;align-items:center;gap:7px;}
  .logo-dot{width:7px;height:7px;border-radius:50%;background:var(--lav);animation:pulse 2s infinite;}
  .nav-r{display:flex;align-items:center;gap:8px;}
  .btn-gh{display:inline-flex;align-items:center;gap:6px;background:var(--glass2);border:1px solid var(--border2);border-radius:100px;padding:6px 14px;font-size:12px;font-weight:600;color:var(--lav);cursor:pointer;font-family:var(--fd);transition:background .15s;}
  .btn-gh:hover{background:rgba(184,169,255,.12);}
  .auth-chip{display:inline-flex;align-items:center;gap:7px;background:var(--glass2);border:1px solid var(--border2);border-radius:100px;padding:4px 12px 4px 4px;font-size:12px;color:var(--text2);}
  .auth-av{width:22px;height:22px;border-radius:50%;border:1px solid var(--border2);}
  .auth-nm{color:var(--text);font-weight:600;font-size:12px;}
  .auth-sub{font-size:10px;color:var(--mint);}
  .btn-so{background:transparent;border:1px solid rgba(255,143,171,.2);border-radius:100px;padding:3px 9px;font-size:10px;color:var(--rose);cursor:pointer;transition:background .15s;}
  .btn-so:hover{background:rgba(255,143,171,.1);}

  /* TABS */
  .tabs{display:flex;gap:5px;background:var(--glass);border:1px solid var(--border2);border-radius:15px;padding:4px;margin-bottom:36px;flex-wrap:wrap;}
  .tab{flex:1;min-width:110px;display:flex;align-items:center;justify-content:center;gap:6px;padding:9px 12px;border-radius:11px;border:none;cursor:pointer;font-family:var(--fd);font-size:11px;font-weight:600;letter-spacing:.03em;transition:background .15s,color .15s;background:transparent;color:var(--text3);}
  .tab:hover{color:var(--text2);background:var(--glass2);}
  .tab.on{background:linear-gradient(135deg,rgba(139,120,245,.25),rgba(79,142,255,.2));color:var(--lav);border:1px solid rgba(184,169,255,.2);}
  .tab-icon{font-size:13px;}

  /* HERO */
  .hero{padding:36px 0 28px;text-align:center;}
  .badge{display:inline-flex;align-items:center;gap:5px;background:rgba(184,169,255,.1);border:1px solid rgba(184,169,255,.2);border-radius:100px;padding:5px 13px;font-size:11px;font-weight:500;color:var(--lav);margin-bottom:18px;letter-spacing:.04em;font-family:var(--fd);}
  .badge-dot{width:5px;height:5px;border-radius:50%;background:var(--lav);animation:pulse 2s infinite;}
  .hero h1{font-family:var(--fd);font-size:clamp(30px,5vw,50px);font-weight:800;line-height:1.08;letter-spacing:-.03em;background:linear-gradient(135deg,#E8EAF0 0%,var(--lav) 45%,var(--sky) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:10px;}
  .hero p{font-size:14px;color:var(--text2);line-height:1.6;max-width:440px;margin:0 auto 28px;font-weight:300;}

  /* INPUTS */
  .iw{display:flex;gap:8px;max-width:600px;margin:0 auto;background:var(--glass);border:1px solid var(--border2);border-radius:14px;padding:5px 5px 5px 16px;transition:border-color .2s,box-shadow .2s;}
  .iw:focus-within{border-color:rgba(184,169,255,.5);box-shadow:0 0 0 3px rgba(184,169,255,.07);}
  .iw input{flex:1;background:transparent;border:none;outline:none;font-size:13px;color:var(--text);min-width:0;}
  .iw input::placeholder{color:var(--text3);}
  .tw{max-width:600px;margin:0 auto 10px;}
  .tw textarea{width:100%;background:var(--glass);border:1px solid var(--border2);border-radius:14px;padding:12px 16px;font-size:13px;color:var(--text);outline:none;resize:vertical;min-height:110px;transition:border-color .2s;}
  .tw textarea:focus{border-color:rgba(184,169,255,.5);}
  .tw textarea::placeholder{color:var(--text3);}
  .ir{max-width:600px;margin:0 auto 10px;display:grid;grid-template-columns:1fr 1fr;gap:8px;}
  .if{background:var(--glass);border:1px solid var(--border2);border-radius:11px;padding:9px 13px;font-size:13px;color:var(--text);outline:none;width:100%;transition:border-color .2s;}
  .if:focus{border-color:rgba(184,169,255,.5);}
  .if::placeholder{color:var(--text3);}

  /* BUTTONS */
  .btn-a{background:linear-gradient(135deg,var(--lav2),#4F8EFF);border:none;border-radius:9px;padding:9px 20px;font-family:var(--fd);font-size:12px;font-weight:600;color:#fff;cursor:pointer;white-space:nowrap;transition:transform .15s,opacity .15s;letter-spacing:.02em;}
  .btn-a:hover{transform:translateY(-1px);opacity:.9;}
  .btn-a:disabled{opacity:.45;cursor:not-allowed;transform:none;}
  .btn-af{background:linear-gradient(135deg,var(--lav2),#4F8EFF);border:none;border-radius:11px;padding:11px 28px;font-family:var(--fd);font-size:13px;font-weight:700;color:#fff;cursor:pointer;transition:transform .15s,opacity .15s;letter-spacing:.02em;}
  .btn-af:hover{transform:translateY(-1px);opacity:.9;}
  .btn-af:disabled{opacity:.45;cursor:not-allowed;transform:none;}
  .btn-gl{background:var(--glass2);border:1px solid var(--border2);border-radius:9px;padding:9px 14px;font-family:var(--fd);font-size:11px;font-weight:600;color:var(--lav);cursor:pointer;white-space:nowrap;transition:background .15s;}
  .btn-gl:hover{background:rgba(184,169,255,.1);}
  .bc{display:flex;justify-content:center;margin-top:10px;}

  /* UPLOAD AREA */
  .upload-area{max-width:600px;margin:0 auto 10px;border:1.5px dashed var(--border2);border-radius:14px;padding:20px;text-align:center;cursor:pointer;transition:border-color .2s,background .2s;}
  .upload-area:hover,.upload-area.drag{border-color:rgba(184,169,255,.5);background:rgba(184,169,255,.04);}
  .upload-area input{display:none;}
  .upload-icon{font-size:24px;margin-bottom:8px;}
  .upload-title{font-size:13px;font-weight:500;color:var(--text2);margin-bottom:4px;}
  .upload-sub{font-size:11px;color:var(--text3);}
  .upload-done{font-size:12px;color:var(--mint);margin-top:6px;font-weight:500;}
  .tab-switch{display:flex;gap:6px;max-width:600px;margin:0 auto 12px;background:var(--glass);border:1px solid var(--border);border-radius:10px;padding:3px;}
  .ts-btn{flex:1;padding:7px;border:none;border-radius:7px;background:transparent;color:var(--text3);font-size:12px;font-weight:500;cursor:pointer;transition:background .15s,color .15s;font-family:var(--fd);}
  .ts-btn.on{background:var(--glass2);color:var(--lav);border:1px solid rgba(184,169,255,.2);}

  /* PAYMENT GATE */
  .pay-gate{max-width:540px;margin:0 auto 24px;background:rgba(139,120,245,.06);border:1px solid rgba(139,120,245,.2);border-radius:20px;padding:22px;text-align:center;animation:fU .4s ease;}
  .pay-gate h3{font-family:var(--fd);font-size:17px;font-weight:700;color:var(--text);margin-bottom:7px;}
  .pay-gate p{font-size:13px;color:var(--text2);margin-bottom:18px;line-height:1.6;}
  .price-row{display:flex;justify-content:center;gap:10px;margin-bottom:18px;flex-wrap:wrap;}
  .pc{background:var(--glass2);border:1.5px solid var(--border2);border-radius:13px;padding:12px 18px;min-width:130px;cursor:pointer;transition:border-color .15s,transform .15s;}
  .pc:hover{transform:translateY(-2px);}
  .pc.sel{border-color:rgba(184,169,255,.55);background:rgba(184,169,255,.08);}
  .pc-badge{font-size:9px;font-weight:600;color:var(--mint);letter-spacing:.07em;margin-bottom:5px;font-family:var(--fd);}
  .pc-amt{font-family:var(--fd);font-size:21px;font-weight:800;color:var(--text);}
  .pc-desc{font-size:10px;color:var(--text3);margin-top:2px;}
  .btn-pay{background:linear-gradient(135deg,var(--lav2),#4F8EFF);border:none;border-radius:11px;padding:11px 26px;font-family:var(--fd);font-size:13px;font-weight:700;color:#fff;cursor:pointer;transition:transform .15s,opacity .15s;}
  .btn-pay:hover{transform:translateY(-1px);opacity:.9;}
  .btn-pay:disabled{opacity:.5;cursor:not-allowed;transform:none;}
  .dev-note{font-size:10px;color:var(--text3);margin-top:10px;}
  .unlock-banner{max-width:600px;margin:0 auto 16px;background:rgba(110,231,183,.08);border:1px solid rgba(110,231,183,.25);border-radius:12px;padding:10px 14px;font-size:12px;color:var(--mint);display:flex;align-items:center;gap:8px;}

  /* LOG */
  .log{max-width:560px;margin:12px auto 0;padding:10px 14px;background:var(--glass);border:1px solid var(--border2);border-radius:11px;font-size:11px;font-family:ui-monospace,monospace;color:var(--text3);}
  .log-l::before{content:"› ";color:var(--lav);}

  /* RESULTS */
  .results{animation:fU .4s ease-out;}
  .sk{background:linear-gradient(90deg,var(--glass) 25%,var(--glass2) 50%,var(--glass) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px;}

  .sec-title{font-family:var(--fd);font-size:11px;font-weight:600;color:var(--text3);letter-spacing:.1em;text-transform:uppercase;margin-bottom:12px;display:flex;align-items:center;gap:7px;}
  .sec-title::after{content:'';flex:1;height:1px;background:var(--border);}

  /* SUMMARY CARD */
  .sum-card{background:var(--glass);border:1px solid var(--border2);border-radius:22px;padding:24px;margin-bottom:14px;position:relative;overflow:hidden;}
  .sum-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(184,169,255,.4),transparent);}
  .sum-top{display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap;}
  .score-ring-wrap{flex-shrink:0;position:relative;width:96px;height:96px;}
  .score-ring-wrap svg{transform:rotate(-90deg);}
  .ring-bg{fill:none;stroke:rgba(255,255,255,.06);stroke-width:7;}
  .ring-fill{fill:none;stroke-width:7;stroke-linecap:round;}
  .score-ctr{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
  .score-n{font-family:var(--fd);font-size:22px;font-weight:800;line-height:1;}
  .score-l{font-size:9px;color:var(--text3);font-weight:500;letter-spacing:.05em;margin-top:2px;}
  .sum-info{flex:1;min-width:190px;}
  .gr-row{display:flex;align-items:center;gap:7px;margin-bottom:9px;flex-wrap:wrap;}
  .gr-badge{font-family:var(--fd);font-size:19px;font-weight:800;padding:2px 11px;border-radius:7px;}
  .cf-badge{font-size:10px;font-weight:500;padding:3px 9px;border-radius:100px;background:rgba(127,255,212,.12);color:var(--mint);border:1px solid rgba(127,255,212,.2);}
  .tags{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px;}
  .tag{font-size:10px;font-weight:500;padding:3px 9px;border-radius:100px;background:var(--glass2);border:1px solid var(--border);color:var(--text2);}
  .ins-box{background:rgba(184,169,255,.06);border:1px solid rgba(184,169,255,.12);border-radius:11px;padding:10px 13px;font-size:12px;line-height:1.6;color:var(--text2);}
  .ins-lbl{font-size:9px;font-weight:600;color:var(--lav);letter-spacing:.08em;margin-bottom:4px;font-family:var(--fd);}
  .sp-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px;}
  .sp-box{background:var(--glass2);border:1px solid var(--border);border-radius:13px;padding:12px;}
  .sp-ttl{font-size:9px;font-weight:600;letter-spacing:.08em;margin-bottom:7px;font-family:var(--fd);}
  .sp-item{display:flex;align-items:flex-start;gap:6px;font-size:11px;color:var(--text2);margin-bottom:4px;line-height:1.4;}
  .sp-ic{font-size:9px;margin-top:2px;flex-shrink:0;}

  /* PROFILE HERO */
  .ph{display:flex;gap:16px;align-items:center;margin-bottom:18px;}
  .ph-av{width:58px;height:58px;border-radius:50%;border:2px solid var(--border2);flex-shrink:0;}
  .ph-name{font-family:var(--fd);font-size:16px;font-weight:700;color:var(--text);margin-bottom:2px;}
  .ph-user{font-size:12px;color:var(--text3);margin-bottom:5px;}
  .ph-bio{font-size:12px;color:var(--text2);line-height:1.5;}

  /* VISUAL GRID */
  .vg{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;}
  @media(max-width:600px){.vg{grid-template-columns:1fr}}
  .gc{background:var(--glass);border:1px solid var(--border2);border-radius:18px;padding:20px;transition:transform .2s;}
  .gc:hover{transform:translateY(-2px);}
  .gc-title{font-family:var(--fd);font-size:12px;font-weight:600;color:var(--text2);margin-bottom:14px;}
  .radar-wrap{display:flex;justify-content:center;}

  /* METRICS */
  .mg{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px;}
  @media(max-width:500px){.mg{grid-template-columns:1fr 1fr}}
  .mc{background:var(--glass);border:1px solid var(--border2);border-radius:15px;padding:14px;text-align:center;}
  .mc-v{font-family:var(--fd);font-size:20px;font-weight:700;}
  .mc-l{font-size:10px;color:var(--text3);margin-top:3px;letter-spacing:.04em;}

  /* LANG BAR */
  .lang-bar{display:flex;gap:3px;height:5px;border-radius:3px;overflow:hidden;margin-bottom:9px;}
  .lang-seg{height:100%;}
  .lang-leg{display:flex;flex-wrap:wrap;gap:7px;}
  .lang-it{display:flex;align-items:center;gap:4px;font-size:10px;color:var(--text2);}
  .lang-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}

  /* SECTIONS */
  .sec-list{display:flex;flex-direction:column;gap:9px;margin-bottom:14px;}
  .sec-card{background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px;}
  .sc-hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:7px;}
  .sc-nm{font-size:12px;font-weight:500;color:var(--text);}
  .sc-sc{font-family:var(--fd);font-size:14px;font-weight:700;}
  .sc-bar{height:3px;background:rgba(255,255,255,.06);border-radius:2px;margin-bottom:7px;}
  .sc-fill{height:100%;border-radius:2px;}
  .sc-fb{font-size:11px;color:var(--text3);line-height:1.5;}

  /* IMPROVEMENTS */
  .imp-list{display:flex;flex-direction:column;gap:8px;margin-bottom:14px;}
  .imp-card{background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px;display:flex;gap:12px;align-items:flex-start;transition:border-color .2s;}
  .imp-card:hover{border-color:var(--border2);}
  .imp-dot{flex-shrink:0;width:5px;height:5px;border-radius:50%;margin-top:5px;}
  .imp-cnt{flex:1;}
  .imp-ttl{font-size:12px;font-weight:500;color:var(--text);margin-bottom:2px;}
  .imp-why{font-size:11px;color:var(--text2);margin-bottom:3px;line-height:1.5;}
  .imp-wh{font-size:9px;color:var(--text3);font-family:monospace;background:var(--glass2);padding:2px 6px;border-radius:4px;display:inline-block;}
  .imp-badge{font-size:9px;font-weight:600;padding:2px 7px;border-radius:100px;flex-shrink:0;}

  /* KEYWORDS */
  .kw-row{display:flex;gap:6px;flex-wrap:wrap;}
  .kw{font-size:10px;padding:3px 9px;border-radius:100px;background:var(--glass2);border:1px solid var(--border);color:var(--text2);}
  .kw.ok{border-color:rgba(110,231,183,.3);color:var(--ok);background:rgba(110,231,183,.06);}
  .kw.no{border-color:rgba(255,143,171,.3);color:var(--err);background:rgba(255,143,171,.06);}

  /* SAVE REPORT */
  .save-bar{background:var(--glass);border:1px solid var(--border2);border-radius:14px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:10px;}
  .save-bar-l{font-family:var(--fd);font-size:12px;font-weight:600;color:var(--text);}
  .save-bar-sub{font-size:10px;color:var(--text2);margin-top:2px;}
  .save-btns{display:flex;gap:8px;flex-wrap:wrap;}
  .btn-save{background:var(--glass2);border:1px solid var(--border2);border-radius:9px;padding:7px 14px;font-size:11px;font-weight:600;color:var(--lav);cursor:pointer;font-family:var(--fd);transition:background .15s,border-color .15s;display:flex;align-items:center;gap:5px;}
  .btn-save:hover{background:rgba(184,169,255,.1);border-color:rgba(184,169,255,.35);}

  /* CHAT */
  .chat-wrap{background:var(--glass);border:1px solid var(--border2);border-radius:22px;overflow:hidden;}
  .chat-hd{padding:14px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
  .chat-ttl{font-family:var(--fd);font-size:13px;font-weight:700;color:var(--text);}
  .ctx-b{font-size:9px;font-weight:600;padding:3px 9px;border-radius:100px;background:rgba(127,255,212,.1);border:1px solid rgba(127,255,212,.2);color:var(--mint);display:flex;align-items:center;gap:4px;}
  .ctx-dot{width:4px;height:4px;border-radius:50%;background:var(--mint);animation:pulse 1.5s infinite;}
  .chat-msgs{height:220px;overflow-y:auto;padding:12px 16px;display:flex;flex-direction:column;gap:9px;scroll-behavior:smooth;}
  .chat-msgs::-webkit-scrollbar{width:3px;}
  .chat-msgs::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px;}
  .msg{max-width:80%;animation:mI .25s ease-out;}
  .msg.user{align-self:flex-end;}
  .msg.ai{align-self:flex-start;}
  .msg-bbl{padding:9px 13px;border-radius:13px;font-size:12px;line-height:1.6;}
  .msg.user .msg-bbl{background:linear-gradient(135deg,rgba(139,120,245,.25),rgba(79,142,255,.25));border:1px solid rgba(139,120,245,.3);color:var(--text);border-bottom-right-radius:3px;}
  .msg.ai .msg-bbl{background:var(--glass2);border:1px solid var(--border);color:var(--text2);border-bottom-left-radius:3px;}
  .typ{display:flex;gap:3px;align-items:center;padding:9px 13px;}
  .typ-d{width:5px;height:5px;border-radius:50%;background:var(--text3);animation:tD 1.2s infinite;}
  .typ-d:nth-child(2){animation-delay:.2s;}
  .typ-d:nth-child(3){animation-delay:.4s;}
  .sug-p{display:flex;gap:5px;flex-wrap:wrap;padding:8px 14px;border-top:1px solid var(--border);}
  .sug-b{font-size:10px;padding:4px 9px;border-radius:100px;background:var(--glass2);border:1px solid var(--border);color:var(--text2);cursor:pointer;transition:color .15s;}
  .sug-b:hover{color:var(--text);}
  .chat-ir{display:flex;gap:7px;padding:10px 14px;border-top:1px solid var(--border);}
  .chat-in{flex:1;background:var(--glass2);border:1px solid var(--border);border-radius:9px;padding:7px 11px;font-size:12px;color:var(--text);outline:none;transition:border-color .15s;}
  .chat-in:focus{border-color:rgba(184,169,255,.4);}
  .chat-in::placeholder{color:var(--text3);}
  .chat-snd{background:linear-gradient(135deg,var(--lav2),#4F8EFF);border:none;border-radius:9px;padding:7px 13px;font-size:12px;color:#fff;cursor:pointer;transition:opacity .15s;}
  .chat-snd:hover{opacity:.9;}
  .chat-snd:disabled{opacity:.4;cursor:not-allowed;}

  /* REPO PICKER */
  .picker-ov{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(4px);}
  .picker-m{background:var(--bg2);border:1px solid var(--border2);border-radius:18px;width:100%;max-width:520px;max-height:78vh;display:flex;flex-direction:column;animation:fU .25s ease;}
  .picker-hd{padding:14px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
  .picker-ht{font-family:var(--fd);font-size:13px;font-weight:600;color:var(--text);}
  .picker-cl{background:none;border:none;color:var(--text3);font-size:18px;cursor:pointer;}
  .picker-sw{padding:9px 18px;border-bottom:1px solid var(--border);}
  .picker-si{width:100%;padding:7px 11px;background:var(--glass2);border:1px solid var(--border2);border-radius:9px;font-size:12px;color:var(--text);outline:none;}
  .picker-si::placeholder{color:var(--text3);}
  .picker-li{overflow-y:auto;flex:1;}
  .picker-li::-webkit-scrollbar{width:3px;}
  .picker-li::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px;}
  .picker-it{width:100%;background:none;border:none;border-bottom:1px solid var(--border);padding:10px 18px;text-align:left;cursor:pointer;transition:background .12s;display:block;}
  .picker-it:hover{background:var(--glass);}
  .picker-itp{display:flex;align-items:center;gap:6px;margin-bottom:2px;flex-wrap:wrap;}
  .picker-nm{font-size:12px;font-weight:600;color:var(--lav);}
  .picker-prv{font-size:9px;padding:1px 6px;border-radius:100px;background:rgba(147,197,253,.1);color:var(--sky);border:1px solid rgba(147,197,253,.25);}
  .picker-lg{font-size:9px;padding:1px 6px;border-radius:100px;background:var(--glass2);color:var(--text3);border:1px solid var(--border);}
  .picker-ds{font-size:11px;color:var(--text3);margin-bottom:3px;}
  .picker-mt{display:flex;gap:9px;font-size:10px;color:var(--text3);}
  .picker-em{padding:20px;text-align:center;font-size:12px;color:var(--text3);}

  @media(max-width:520px){.sp-row{grid-template-columns:1fr}.ir{grid-template-columns:1fr}.mg{grid-template-columns:1fr 1fr}}
`;

// ── Helpers ──────────────────────────────────────────────────────────────────
const LC = ["#B8A9FF","#7FFFD4","#93C5FD","#FFCBA4","#FFB3C8","#FCD34D"];

function sc(s) { return s >= 75 ? "#6EE7B7" : s >= 55 ? "#FCD34D" : "#FF8FAB"; }
function gi(s) {
  if (s >= 90) return { grade:"A+", bg:"rgba(110,231,183,.15)", color:"#6EE7B7" };
  if (s >= 80) return { grade:"A",  bg:"rgba(110,231,183,.12)", color:"#6EE7B7" };
  if (s >= 70) return { grade:"B+", bg:"rgba(253,211,77,.12)",  color:"#FCD34D" };
  if (s >= 60) return { grade:"B",  bg:"rgba(253,211,77,.1)",   color:"#FCD34D" };
  if (s >= 50) return { grade:"C+", bg:"rgba(255,143,171,.12)", color:"#FF8FAB" };
  return              { grade:"C",  bg:"rgba(255,143,171,.1)",  color:"#FF8FAB" };
}
function pj(text) {
  try { return JSON.parse(text.replace(/```json|```/g,"").trim()); } catch {}
  try { const m = text.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); } catch {}
  return null;
}
function pc(p) {
  const colors = { high:"#FF8FAB", medium:"#FCD34D", low:"#93C5FD" };
  const bgs    = { high:"rgba(255,143,171,.12)", medium:"rgba(253,211,77,.1)", low:"rgba(147,197,253,.1)" };
  return { color: colors[p]||"#FCD34D", bg: bgs[p]||"rgba(253,211,77,.1)" };
}

// ── ScoreRing ────────────────────────────────────────────────────────────────
function ScoreRing({ score, color }) {
  const r = 40, circ = 2 * Math.PI * r, fill = (score / 100) * circ;
  return (
    <div className="score-ring-wrap">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle className="ring-bg" cx="48" cy="48" r={r}/>
        <circle className="ring-fill" cx="48" cy="48" r={r}
          stroke={color} strokeDasharray={`${fill} ${circ}`} strokeDashoffset={0}/>
      </svg>
      <div className="score-ctr">
        <span className="score-n" style={{ color }}>{score}</span>
        <span className="score-l">SCORE</span>
      </div>
    </div>
  );
}

// ── RadarChart ────────────────────────────────────────────────────────────────
function RadarChart({ data }) {
  const size = 140, cx = size/2, cy = size/2, r = 50;
  const n = data.length;
  const colors = ["#B8A9FF","#7FFFD4","#93C5FD","#FFCBA4","#FFB3C8"];
  const pt  = (i, val) => { const a = (i/n)*2*Math.PI-Math.PI/2, rv = (val/100)*r; return [cx+rv*Math.cos(a), cy+rv*Math.sin(a)]; };
  const gpt = (i, pct) => { const a = (i/n)*2*Math.PI-Math.PI/2, rv = pct*r; return [cx+rv*Math.cos(a), cy+rv*Math.sin(a)]; };
  const poly = data.map((d,i) => pt(i,d.value).join(",")).join(" ");
  return (
    <div className="radar-wrap">
      <svg width={size+60} height={size+40} viewBox={`-30 -20 ${size+60} ${size+40}`} style={{ overflow:"visible" }}>
        {[.25,.5,.75,1].map(l => (
          <polygon key={l} points={Array.from({length:n},(_,i)=>gpt(i,l).join(",")).join(" ")} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="1"/>
        ))}
        {data.map((_,i) => { const [x2,y2]=gpt(i,1); return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="rgba(255,255,255,.06)" strokeWidth="1"/>; })}
        <polygon points={poly} fill="rgba(184,169,255,.12)" stroke="#B8A9FF" strokeWidth="1.5"/>
        {data.map((d,i) => { const [x,y]=pt(i,d.value); return <circle key={i} cx={x} cy={y} r="3" fill={colors[i%colors.length]}/>; })}
        {data.map((d,i) => { const [lx,ly]=gpt(i,1.3); return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fill="rgba(136,146,164,.9)" fontSize="8.5" fontFamily="'DM Sans',sans-serif">{d.label}</text>; })}
      </svg>
    </div>
  );
}

// ── Save Report ───────────────────────────────────────────────────────────────
function saveReport(result, mode) {
  const title = { repo:"GitHub Repo", profile:"GitHub Profile", linkedin:"LinkedIn Profile", resume:"Resume" }[mode] || mode;
  const date = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  const gradeData = gi(result.score || 0);
  const scoreColor = sc(result.score || 0);

  const improvements = (result.improvements || result.suggestions || []).map(s =>
    `<li><strong>${s.title}</strong> — ${s.why || ''} ${s.where ? `<code>${s.where}</code>` : ''} <span class="badge-${s.priority}">${s.priority?.toUpperCase()}</span></li>`
  ).join('');

  const strengths = (result.strengths || []).map(s => `<li>✔ ${s}</li>`).join('');
  const gaps      = (result.gaps || result.problems || []).map(g => `<li>⚠ ${g}</li>`).join('');

  const radarRows = (result.radarData || []).map(d =>
    `<tr><td>${d.label}</td><td><div class="bar-wrap"><div class="bar-fill" style="width:${d.value}%;background:${sc(d.value)}"></div></div></td><td><strong>${d.value}</strong></td></tr>`
  ).join('');

  const sectionsHtml = (result.sections || result.categories || []).map(s =>
    `<div class="section-item"><div class="si-hd"><span>${s.name}</span><span style="color:${sc(s.score)};font-weight:700">${s.score}/100</span></div><div class="si-bar"><div style="width:${s.score}%;background:${sc(s.score)}"></div></div><p>${s.feedback || s.detail || s.preview || ''}</p></div>`
  ).join('');

  const kwFound   = (result.keywordsFound || []).map(k => `<span class="kw ok">${k}</span>`).join('');
  const kwMissing = (result.keywordsMissing || []).map(k => `<span class="kw no">${k}</span>`).join('');

  const extraMetrics = mode === 'resume' ? `
    <div class="metrics">
      <div class="metric"><div class="mv" style="color:${sc(result.atsScore||0)}">${result.atsScore||'—'}</div><div class="ml">ATS Score</div></div>
      <div class="metric"><div class="mv" style="color:${sc(result.readabilityScore||0)}">${result.readabilityScore||'—'}</div><div class="ml">Readability</div></div>
      <div class="metric"><div class="mv" style="color:${sc(result.estimatedJobMatchScore||0)}">${result.estimatedJobMatchScore||'—'}</div><div class="ml">Job Match</div></div>
    </div>` : mode === 'linkedin' ? `
    <div class="metrics">
      <div class="metric"><div class="mv" style="color:${sc(result.atsScore||0)}">${result.atsScore||'—'}</div><div class="ml">ATS Score</div></div>
      <div class="metric"><div class="mv" style="color:${sc(result.estimatedRecruiterScore||0)}">${result.estimatedRecruiterScore||'—'}</div><div class="ml">Recruiter Score</div></div>
      <div class="metric"><div class="mv" style="color:${sc(result.profileCompleteness||0)}">${result.profileCompleteness||'—'}</div><div class="ml">Completeness</div></div>
    </div>` : mode === 'profile' ? `
    <div class="metrics">
      <div class="metric"><div class="mv" style="color:${sc(result.hirability||0)}">${result.hirability||'—'}</div><div class="ml">Hirability</div></div>
      <div class="metric"><div class="mv" style="color:${sc(result.openSourceScore||0)}">${result.openSourceScore||'—'}</div><div class="ml">Open Source</div></div>
      <div class="metric"><div class="mv" style="color:${sc(result.consistencyScore||0)}">${result.consistencyScore||'—'}</div><div class="ml">Consistency</div></div>
    </div>` : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title} Analysis Report — DevProfile AI</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8f9fb;color:#1a1d27;line-height:1.6;padding:32px 20px;}
  .page{max-width:800px;margin:0 auto;}
  .header{background:linear-gradient(135deg,#8B78F5,#4F8EFF);border-radius:16px;padding:28px 32px;color:#fff;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;}
  .header h1{font-size:22px;font-weight:800;letter-spacing:-.02em;margin-bottom:4px;}
  .header p{font-size:13px;opacity:.85;}
  .score-block{text-align:center;}
  .score-big{font-size:52px;font-weight:800;line-height:1;}
  .score-grade{font-size:18px;font-weight:700;margin-top:4px;opacity:.9;}
  .card{background:#fff;border-radius:14px;padding:22px 24px;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,.08);}
  .card h2{font-size:14px;font-weight:700;color:#5a6478;letter-spacing:.06em;text-transform:uppercase;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid #eef0f5;}
  .insight{background:#f3f0ff;border-left:3px solid #8B78F5;border-radius:8px;padding:12px 16px;font-size:13px;color:#3d3d5c;line-height:1.7;}
  .sp-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
  .sp-box h3{font-size:11px;font-weight:700;letter-spacing:.06em;margin-bottom:8px;padding:4px 8px;border-radius:6px;}
  .sp-box.str h3{background:#e6f9f2;color:#1a7a52;}
  .sp-box.gp h3{background:#fff5e6;color:#8a5a00;}
  .sp-box ul{list-style:none;font-size:12px;color:#555;}
  .sp-box li{padding:4px 0;border-bottom:1px solid #f0f0f0;}
  .sp-box li:last-child{border-bottom:none;}
  table{width:100%;border-collapse:collapse;}
  td{padding:8px 10px;font-size:12px;border-bottom:1px solid #f0f0f0;}
  td:first-child{color:#666;width:120px;}
  .bar-wrap{height:6px;background:#eef0f5;border-radius:3px;width:100%;}
  .bar-fill{height:100%;border-radius:3px;}
  td:last-child{font-size:13px;width:40px;text-align:right;}
  .metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
  .metric{background:#f8f9fb;border-radius:10px;padding:12px;text-align:center;}
  .mv{font-size:24px;font-weight:800;}
  .ml{font-size:10px;color:#888;margin-top:3px;letter-spacing:.04em;}
  .section-item{margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #f0f0f0;}
  .section-item:last-child{border-bottom:none;margin-bottom:0;}
  .si-hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;font-size:13px;}
  .si-bar{height:4px;background:#eef0f5;border-radius:2px;margin-bottom:6px;}
  .si-bar div{height:100%;border-radius:2px;}
  .section-item p{font-size:12px;color:#666;line-height:1.5;}
  .imp-list{list-style:none;}
  .imp-list li{padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:12px;}
  .imp-list li:last-child{border-bottom:none;}
  .imp-list li strong{display:block;margin-bottom:3px;font-size:13px;color:#1a1d27;}
  .imp-list li code{font-size:10px;background:#f0f0f0;padding:1px 5px;border-radius:3px;}
  .badge-high{background:#fee;color:#c00;font-size:9px;padding:1px 6px;border-radius:100px;font-weight:600;margin-left:6px;}
  .badge-medium{background:#fff8e0;color:#8a6000;font-size:9px;padding:1px 6px;border-radius:100px;font-weight:600;margin-left:6px;}
  .badge-low{background:#e8f4ff;color:#0066aa;font-size:9px;padding:1px 6px;border-radius:100px;font-weight:600;margin-left:6px;}
  .kw-grid{display:flex;flex-wrap:wrap;gap:6px;}
  .kw{font-size:11px;padding:3px 9px;border-radius:100px;}
  .kw.ok{background:#e6f9f2;color:#1a7a52;border:1px solid #b0e6d0;}
  .kw.no{background:#fee;color:#c00;border:1px solid #f5b8c0;}
  .footer{text-align:center;font-size:11px;color:#aaa;margin-top:24px;padding-top:16px;border-top:1px solid #eef0f5;}
  @media print{body{padding:0;background:#fff}.card{box-shadow:none;border:1px solid #e0e0e0;}}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div style="font-size:11px;opacity:.75;margin-bottom:6px;letter-spacing:.05em">DEVPROFILE AI · ${date}</div>
      <h1>${title} Analysis</h1>
      <p>${result.headline || result.insight || ''}</p>
    </div>
    <div class="score-block">
      <div class="score-big">${result.score}</div>
      <div class="score-grade">${gradeData.grade}</div>
      <div style="font-size:11px;opacity:.75;margin-top:4px">out of 100</div>
    </div>
  </div>

  ${extraMetrics ? `<div class="card"><h2>Key Metrics</h2>${extraMetrics}</div>` : ''}

  ${result.headline || result.insight ? `<div class="card"><h2>AI Assessment</h2><div class="insight">${result.headline || result.insight}</div></div>` : ''}

  <div class="card">
    <h2>Strengths & Gaps</h2>
    <div class="sp-grid">
      <div class="sp-box str"><h3>✔ Strengths</h3><ul>${strengths}</ul></div>
      <div class="sp-box gp"><h3>⚠ Areas to Improve</h3><ul>${gaps}</ul></div>
    </div>
  </div>

  ${radarRows ? `<div class="card"><h2>Health Radar Scores</h2><table>${radarRows}</table></div>` : ''}

  ${sectionsHtml ? `<div class="card"><h2>Section Analysis</h2>${sectionsHtml}</div>` : ''}

  ${improvements ? `<div class="card"><h2>Actionable Improvements</h2><ul class="imp-list">${improvements}</ul></div>` : ''}

  ${kwFound || kwMissing ? `<div class="card"><h2>Keywords</h2>${kwFound ? `<p style="font-size:11px;color:#1a7a52;margin-bottom:8px">✔ Found</p><div class="kw-grid" style="margin-bottom:14px">${kwFound}</div>` : ''}${kwMissing ? `<p style="font-size:11px;color:#c00;margin-bottom:8px">✖ Missing</p><div class="kw-grid">${kwMissing}</div>` : ''}</div>` : ''}

  <div class="footer">Generated by DevProfile AI · devprofile.ai · ${date}<br>This report is AI-generated and for guidance purposes only.</div>
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `devprofile-${mode}-report-${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── SaveBar component ─────────────────────────────────────────────────────────
function SaveBar({ result, mode }) {
  return (
    <div className="save-bar">
      <div>
        <div className="save-bar-l">Save Analysis Report</div>
        <div className="save-bar-sub">Download a full report you can share or print</div>
      </div>
      <div className="save-btns">
        <button className="btn-save" onClick={() => saveReport(result, mode)}>
          ↓ Download HTML Report
        </button>
        <button className="btn-save" onClick={() => { window.print(); }}>
          🖨 Print / PDF
        </button>
      </div>
    </div>
  );
}

// ── PaymentGate ───────────────────────────────────────────────────────────────
function PaymentGate({ mode, onPaid, rzpKeyId, rzpAvailable }) {
  const [sel, setSel]         = useState('single');
  const [loading, setLoading] = useState(false);
  const [status, setStatus]   = useState(''); // 'processing' | 'success' | ''

  const plans = {
    single: { label:'SINGLE ANALYSIS', amount:29900, display:'₹299', desc: `${mode} analysis only` },
    combo:  { label:'FULL COMBO — BEST VALUE', amount:79900, display:'₹799', desc:'GitHub Repo + Profile + LinkedIn + Resume' }
  };

  async function pay() {
    setLoading(true);
    setStatus('processing');
    try {
      const plan     = plans[sel];
      const planName = sel === 'combo' ? 'combo' : mode;

      // Step 1: Create order on server
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: plan.amount, receipt: `rcpt_${sel}_${Date.now()}` })
      });
      const order = await orderRes.json();
      if (order.error) throw new Error(order.error);

      console.log('[DevProfile] Order created:', order);
      console.log('[DevProfile] rzpAvailable:', rzpAvailable, '| rzpKeyId:', rzpKeyId, '| order.dev:', order.dev);

      // Step 2: Dev mode ONLY when server has no Razorpay keys (order.dev === true)
      // If rzpAvailable is true, always use real Razorpay even if order looks weird
      if (order.dev === true && !rzpAvailable) {
        console.log('[DevProfile] Using dev mode simulation');
        await new Promise(r => setTimeout(r, 1200));
        const vr = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dev: true, plan: planName })
        });
        const vd = await vr.json();
        setStatus('success');
        await new Promise(r => setTimeout(r, 800));
        onPaid(vd.paidFor || {});
        return;
      }

      // Step 3: Real Razorpay checkout
      console.log('[DevProfile] Opening Razorpay checkout');
      setStatus(''); // clear processing UI while Razorpay modal is open

      // Wait for Razorpay script to be ready (it loads async)
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          let attempts = 0;
          const check = setInterval(() => {
            attempts++;
            if (window.Razorpay) { clearInterval(check); resolve(); }
            else if (attempts > 20) { clearInterval(check); reject(new Error('Razorpay script failed to load. Check your internet connection.')); }
          }, 200);
        });
      }

      const options = {
        key:         rzpKeyId,
        amount:      order.amount,
        currency:    order.currency || 'INR',
        name:        'DevProfile AI',
        description: plan.desc,
        order_id:    order.id,
        prefill: {
          name:  '',
          email: '',
        },
        theme: { color: '#8B78F5' },
        handler: async (response) => {
          console.log('[DevProfile] Payment success:', response);
          setLoading(true);
          setStatus('processing');
          const vr = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, plan: planName })
          });
          const vd = await vr.json();
          if (vd.verified) {
            setStatus('success');
            setTimeout(() => onPaid(vd.paidFor || {}), 800);
          } else {
            alert('Payment verification failed. Please contact support with your payment ID: ' + response.razorpay_payment_id);
            setLoading(false);
            setStatus('');
          }
        },
        modal: {
          ondismiss: () => {
            console.log('[DevProfile] Razorpay modal dismissed');
            setLoading(false);
            setStatus('');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        console.error('[DevProfile] Payment failed:', response.error);
        alert(`Payment failed: ${response.error.description}`);
        setLoading(false);
        setStatus('');
      });
      rzp.open();

    } catch (e) {
      console.error('[DevProfile] Payment error:', e);
      alert('Payment error: ' + e.message);
      setStatus('');
    } finally {
      setLoading(false);
    }
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="pay-gate" style={{textAlign:'center'}}>
        <div style={{fontSize:40,marginBottom:12}}>✅</div>
        <h3 style={{color:'var(--ok)',marginBottom:8}}>Payment Successful!</h3>
        <p style={{fontSize:13,color:'var(--text2)'}}>Unlocking your analyzer…</p>
      </div>
    );
  }

  // Processing state
  if (status === 'processing') {
    return (
      <div className="pay-gate" style={{textAlign:'center'}}>
        <div style={{fontSize:32,marginBottom:12,animation:'pulse 1s infinite'}}>⏳</div>
        <h3 style={{marginBottom:8}}>Processing Payment…</h3>
        <p style={{fontSize:13,color:'var(--text2)'}}>Please wait, verifying your order.</p>
      </div>
    );
  }

  return (
    <div className="pay-gate">
      <h3>Unlock AI Analysis</h3>
      <p>Get deep AI-powered insights. Combo plan unlocks <strong>all 4 analyzers</strong> at once — no re-paying per tab.</p>
      <div className="price-row">
        {Object.entries(plans).map(([k,p]) => (
          <div key={k} className={`pc ${sel===k?'sel':''}`} onClick={() => setSel(k)}>
            <div className="pc-badge">{p.label}</div>
            <div className="pc-amt">{p.display}</div>
            <div className="pc-desc">{p.desc}</div>
          </div>
        ))}
      </div>
      <button className="btn-pay" onClick={pay} disabled={loading}>
        {`Pay ${plans[sel].display} & Unlock`}
      </button>
      {rzpAvailable
        ? <div className="dev-note" style={{color:'var(--mint)'}}>✔ Live Razorpay active — real payment will not be charged</div>
        : <div className="dev-note">⚙ Dev mode — no Razorpay keys set, payment is simulated</div>
      }
    </div>
  );
}

// ── Chat widget ───────────────────────────────────────────────────────────────
function ChatWidget({ result, mode, prompts }) {
  const [msgs, setMsgs]   = useState([{ role:'ai', text:'Analysis complete. Ask me anything about your results.' }]);
  const [inp, setInp]     = useState("");
  const [busy, setBusy]   = useState(false);
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [msgs, busy]);

  useEffect(() => {
    const ctx = buildCtx(result, mode);
    setMsgs([{ role:'ai', text: ctx.opener }]);
  }, [result]);

  function buildCtx(r, m) {
    if (!r) return { opener: 'No analysis yet.', ctx: '' };
    const base = `Score: ${r.score}/100 (${r.grade}). `;
    const extras = {
      repo:    `Problems: ${(r.problems||[]).join('; ')}. Suggestions: ${(r.suggestions||[]).map(s=>s.title).join(', ')}`,
      profile: `Hirability: ${r.hirability}. Strengths: ${(r.strengths||[]).join('; ')}`,
      linkedin:`ATS: ${r.atsScore}. Missing keywords: ${(r.keywordsMissing||[]).join(', ')}`,
      resume:  `ATS: ${r.atsScore}. Job match: ${r.estimatedJobMatchScore}. Missing: ${(r.keywordsMissing||[]).join(', ')}`
    }[m] || '';
    const opener = `${base}${r.headline || r.insight || ''} Ask me anything!`;
    return { opener, ctx: base + extras };
  }

  async function send(text) {
    const msg = text || inp.trim();
    if (!msg || busy) return;
    setInp(""); setMsgs(m => [...m, { role:'user', text:msg }]); setBusy(true);
    try {
      const { ctx } = buildCtx(result, mode);
      const systemMap = { repo:'code quality AI', profile:'career advisor', linkedin:'LinkedIn coach', resume:'resume expert' };
      const r = await fetch(`${API}/chat`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ messages:[{ role:'user', content:`You are a ${systemMap[mode]||'AI assistant'}. Analysis context: ${ctx}\n\nUser question: ${msg}` }] })
      });
      const d = await r.json();
      setMsgs(m => [...m, { role:'ai', text: d.text || d.error }]);
    } catch(e) { setMsgs(m => [...m, { role:'ai', text:'Error: '+e.message }]); }
    finally { setBusy(false); }
  }

  return (
    <div className="chat-wrap">
      <div className="chat-hd">
        <span className="chat-ttl">AI Assistant</span>
        <span className="ctx-b"><span className="ctx-dot"/>Context loaded</span>
      </div>
      <div className="chat-msgs" ref={ref}>
        {msgs.map((m,i) => <div key={i} className={`msg ${m.role}`}><div className="msg-bbl">{m.text}</div></div>)}
        {busy && <div className="msg ai"><div className="msg-bbl"><div className="typ"><div className="typ-d"/><div className="typ-d"/><div className="typ-d"/></div></div></div>}
      </div>
      <div className="sug-p">{(prompts||[]).map((p,i) => <button key={i} className="sug-b" onClick={() => send(p)}>{p}</button>)}</div>
      <div className="chat-ir">
        <input className="chat-in" placeholder="Ask anything…" value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key==='Enter' && send()}/>
        <button className="chat-snd" onClick={() => send()} disabled={!inp.trim()||busy}>Send</button>
      </div>
    </div>
  );
}

// ── Repo Panel ────────────────────────────────────────────────────────────────
const REPO_PROMPT = `You are a senior engineer doing a code repository audit. Be FAIR and CALIBRATED.

IMPORTANT SCORING RULES:
- A repo with README + working code + lock file should score AT LEAST 50-60
- Having a Dockerfile is a significant positive (+8)
- Having package-lock.json means it's maintained (+5)
- Missing tests is a penalty of -12, not -30
- Missing CI is a penalty of -5, not -20
- Missing license is -3, not -10
- A project with 0 stars is normal for personal/student projects — do NOT penalize stars
- The ceiling from signals is a MAXIMUM, not a target — you can score higher if the repo deserves it
- Real scoring range: 40-85 for typical repos. Only completely empty/broken repos score below 35.

Return ONLY valid JSON (no markdown, no backticks):
{
  "score": number,
  "grade": "A+"|"A"|"B+"|"B"|"C+"|"C"|"D",
  "confidence": "High"|"Medium"|"Low",
  "insight": "2-3 sentence honest assessment",
  "tags": ["t1","t2","t3"],
  "problems": ["p1","p2","p3"],
  "strengths": ["s1","s2"],
  "radarData": [
    {"label":"Quality","value":number},
    {"label":"Structure","value":number},
    {"label":"Docs","value":number},
    {"label":"Security","value":number},
    {"label":"Maintainability","value":number}
  ],
  "repoStats": {"files":number,"largestFile":"name","complexity":"Low|Medium|High"},
  "languages": [{"name":"Lang","pct":number}],
  "whyCategories": [
    {"name":"Code Quality","score":number,"reasons":[{"type":"good|warning|critical","text":"reason"}]},
    {"name":"Documentation","score":number,"reasons":[{"type":"good|warning|critical","text":"reason"}]},
    {"name":"Testing","score":number,"reasons":[{"type":"good|warning|critical","text":"reason"}]},
    {"name":"Architecture","score":number,"reasons":[{"type":"good|warning|critical","text":"reason"}]}
  ],
  "categories": [{"name":"name","score":number,"preview":"1 line","detail":"detail"}],
  "suggestions": [{"title":"title","why":"why","where":"path","priority":"high|medium|low"}],
  "proMetrics": {"security":number,"vulnerabilities":number,"maintainability":number,"techDebt":"Xh"}
}`;

async function fetchRepoData(owner, repo) {
  const base = `repos/${owner}/${repo}`;
  const [repoJson, readmeRes, treeRes] = await Promise.all([
    fetch(GH_PROXY(base), { credentials:"include" }).then(r => { if (!r.ok) throw new Error(`Repo not found (${r.status})`); return r.json(); }),
    fetch(GH_PROXY(`${base}/readme`), { credentials:"include" }).catch(() => ({ ok:false })),
    fetch(GH_PROXY(`${base}/git/trees/HEAD?recursive=1`), { credentials:"include" }).catch(() => ({ ok:false })),
  ]);
  const hasReadme = readmeRes.ok !== false && (readmeRes.ok === true || (readmeRes && readmeRes.ok));
  let readme = "";
  if (readmeRes && readmeRes.ok) {
    try { const rd = await readmeRes.json(); readme = atob((rd.content||"").replace(/\n/g,"")).slice(0,1500); } catch {}
  }
  const treeJson   = (treeRes && treeRes.ok) ? await treeRes.json() : { tree:[] };
  const files      = (treeJson.tree||[]).filter(f => f.type==="blob");
  const fileTree   = files.map(f => f.path).slice(0,60);
  const hasCI      = files.some(f => /^\.github\/workflows\//i.test(f.path) || /^\.travis\.yml$/i.test(f.path.split("/").pop()) || /^\.circleci\//i.test(f.path));
  const hasLicense = files.some(f => /^(license|licence)(\.md|\.txt)?$/i.test(f.path.split("/").pop()));
  const hasLock    = files.some(f => /^(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|go\.sum|cargo\.lock)$/i.test(f.path.split("/").pop()));
  const hasDocker  = files.some(f => /^dockerfile(\..*)?$/i.test(f.path.split("/").pop()));
  const testFiles  = files.filter(f => /\.(test|spec)\.[jt]sx?$|__tests__|\/tests?\//i.test(f.path)).length;
  const totalFiles = files.length;
  const monthsSince = (Date.now() - new Date(repoJson.pushed_at)) / (1000*60*60*24*30);

  // FAIR ceiling: start generous, apply specific penalties
  let ceiling = 78;
  if (!hasReadme)       ceiling -= 14;
  if (testFiles === 0)  ceiling -= 12;
  if (!hasCI)           ceiling -= 5;
  if (!hasLicense)      ceiling -= 3;
  if (totalFiles < 3)   ceiling -= 20;
  if (monthsSince > 24) ceiling -= 5;
  // Bonuses
  if (hasDocker)        ceiling += 5;
  if (hasLock)          ceiling += 4;
  if (testFiles > 5)    ceiling += 8;
  if (repoJson.stargazers_count > 50) ceiling += 5;
  ceiling = Math.max(25, Math.min(ceiling, 90));

  return {
    repoData: repoJson, readme, fileTree,
    signals: { totalFiles, testFiles, hasReadme, hasCI, hasLicense, hasLock, hasDocker, openIssues: repoJson.open_issues_count, monthsSinceLastPush: Math.round(monthsSince), ceiling }
  };
}

function RepoPanel({ ghUser, oauthAvailable, paidFor, onPaidUpdate }) {
  const [url, setUrl]         = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState("");
  const [logs, setLogs]       = useState([]);
  const [showPick, setShowPick] = useState(false);
  const [proOn, setProOn]     = useState(false);
  const rRef = useRef(null);
  const addLog = m => setLogs(l => [...l, m]);

  async function analyze() {
    let match = url.match(/github\.com\/([^/]+)\/([^/?\s]+)/);
    if (!match) { const s = url.trim().match(/^([^/\s]+)\/([^/\s]+)$/); if(s) match=[null,s[1],s[2]]; }
    if (!match) { setError("Invalid GitHub URL or owner/repo"); return; }
    const [,owner,repo] = match;
    const clean = repo.replace(/\.git$/,"");
    setLoading(true); setError(""); setResult(null); setLogs([]);
    try {
      addLog(`Fetching ${owner}/${clean}…`);
      const { repoData, readme, fileTree, signals } = await fetchRepoData(owner, clean);
      addLog(`${signals.totalFiles} files · ${signals.testFiles} tests · CI=${signals.hasCI} · Docker=${signals.hasDocker} · LockFile=${signals.hasLock} · Ceiling=${signals.ceiling}`);
      addLog("Calling AI model…");
      const prompt = `${REPO_PROMPT}

Repo: ${repoData.full_name}
Description: ${repoData.description||'None'}
Language: ${repoData.language}
Stars: ${repoData.stargazers_count} | Forks: ${repoData.forks_count}
License: ${repoData.license?.name||'None'}
Created: ${repoData.created_at?.split('T')[0]}

SIGNALS (computed, use these):
${JSON.stringify(signals,null,2)}

README excerpt:
${readme.slice(0,1000)}

File tree:
${fileTree.join(', ')}

SCORE CEILING: ${signals.ceiling}
Note: This appears to be a ${signals.totalFiles < 20 ? 'small personal/student' : 'mid-sized'} project. Judge accordingly.
A repo with README, Dockerfile, lock file, and working code deserves at least 50-60.`;

      const res = await fetch(`${API}/analyze`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ prompt }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const parsed = pj(data.text);
      if (!parsed) throw new Error("Invalid AI response");
      // Allow up to ceiling+5 grace
      parsed.score = Math.min(parsed.score, signals.ceiling + 5);
      parsed._repoData = repoData; parsed._signals = signals;
      setResult(parsed);
      addLog(`Done — ${parsed.score}/100 (${parsed.grade})`);
      setTimeout(() => rRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 100);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }

  const g = result ? gi(result.score) : null;
  const s = result ? sc(result.score) : "#B8A9FF";

  return (
    <div>
      <div className="hero">
        <div className="badge"><div className="badge-dot"/>GitHub Repository AI</div>
        <h1>Repo Quality<br/>Evaluator</h1>
        <p>Deep analysis of code quality, structure, testing, and maintainability.</p>
        <div className="iw">
          <input type="text" placeholder="https://github.com/owner/repo  or  owner/repo"
            value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>e.key==='Enter'&&analyze()}/>
          {ghUser && <button className="btn-gl" onClick={()=>setShowPick(true)}>Browse</button>}
          <button className="btn-a" onClick={analyze} disabled={loading||!url.trim()}>{loading?'Analyzing…':'Analyze →'}</button>
        </div>
        {error && <p style={{color:'var(--err)',fontSize:12,marginTop:10}}>{error}</p>}
      </div>

      {logs.length>0 && <div className="log">{logs.map((m,i)=><div key={i} className="log-l">{m}</div>)}</div>}
      {loading && <div style={{marginTop:20}}><div className="sk" style={{height:160,borderRadius:22,marginBottom:14}}/><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}><div className="sk" style={{height:180,borderRadius:18}}/><div className="sk" style={{height:180,borderRadius:18}}/></div></div>}

      {result && !loading && (
        <div className="results" ref={rRef}>
          <div className="sum-card">
            <div className="sum-top">
              <ScoreRing score={result.score} color={s}/>
              <div className="sum-info">
                <div className="gr-row">
                  <span className="gr-badge" style={{background:g.bg,color:g.color}}>{g.grade}</span>
                  <span className="cf-badge">{result.confidence} Confidence</span>
                  {result._repoData?.private && <span className="cf-badge" style={{color:'var(--sky)',borderColor:'rgba(147,197,253,.2)',background:'rgba(147,197,253,.08)'}}>🔒 Private</span>}
                </div>
                {result._repoData && (
                  <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:9,fontSize:11,color:'var(--text2)'}}>
                    <span>⭐ {result._repoData.stargazers_count?.toLocaleString()}</span>
                    <span>🔀 {result._repoData.forks_count}</span>
                    <span>⚠ {result._repoData.open_issues_count} issues</span>
                    <span>{result._repoData.language}</span>
                  </div>
                )}
                <div className="tags">{result.tags?.map((t,i)=><span key={i} className="tag">{t}</span>)}</div>
                <div className="ins-box"><div className="ins-lbl">AI INSIGHT</div>{result.insight}</div>
              </div>
            </div>
            <div className="sp-row">
              <div className="sp-box"><div className="sp-ttl" style={{color:'var(--err)'}}>PROBLEMS</div>{result.problems?.map((p,i)=><div key={i} className="sp-item"><span className="sp-ic">✖</span>{p}</div>)}</div>
              <div className="sp-box"><div className="sp-ttl" style={{color:'var(--ok)'}}>STRENGTHS</div>{result.strengths?.map((s,i)=><div key={i} className="sp-item"><span className="sp-ic">✔</span>{s}</div>)}</div>
            </div>
          </div>

          <SaveBar result={result} mode="repo"/>

          <div className="sec-title">Visual Intelligence</div>
          <div className="vg">
            <div className="gc"><div className="gc-title">Code Health Radar</div>{result.radarData&&<RadarChart data={result.radarData}/>}</div>
            <div className="gc">
              <div className="gc-title">Languages & Stats</div>
              {result.languages && (<><div className="lang-bar">{result.languages.map((l,i)=><div key={i} className="lang-seg" style={{flex:l.pct,background:LC[i%LC.length]}}/>)}</div><div className="lang-leg" style={{marginBottom:12}}>{result.languages.map((l,i)=><span key={i} className="lang-it"><span className="lang-dot" style={{background:LC[i%LC.length]}}/>{l.name} {l.pct}%</span>)}</div></>)}
              {result.repoStats && <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}><div style={{background:'var(--glass2)',borderRadius:10,padding:'9px 11px'}}><div style={{fontFamily:'var(--fd)',fontSize:17,fontWeight:700}}>{result.repoStats.files}</div><div style={{fontSize:9,color:'var(--text3)',marginTop:2}}>FILES</div></div><div style={{background:'var(--glass2)',borderRadius:10,padding:'9px 11px'}}><div style={{fontFamily:'var(--fd)',fontSize:17,fontWeight:700,color:result.repoStats.complexity==='High'?'var(--err)':result.repoStats.complexity==='Medium'?'var(--warn)':'var(--ok)'}}>{result.repoStats.complexity}</div><div style={{fontSize:9,color:'var(--text3)',marginTop:2}}>COMPLEXITY</div></div></div>}
            </div>
          </div>

          <div className="sec-title">AI Suggestions</div>
          <div className="imp-list">
            {result.suggestions?.map((s,i)=>{
              const p = pc(s.priority);
              return <div key={i} className="imp-card"><div className="imp-dot" style={{background:p.color}}/><div className="imp-cnt"><div className="imp-ttl">{s.title}</div><div className="imp-why">{s.why}</div>{s.where&&<span className="imp-wh">{s.where}</span>}</div><span className="imp-badge" style={{background:p.bg,color:p.color}}>{s.priority}</span></div>;
            })}
          </div>

          {result.proMetrics && (<>
            <div style={{background:'var(--glass)',border:'1px solid var(--border2)',borderRadius:13,padding:'13px 17px',display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:13,flexWrap:'wrap',gap:9}}>
              <div><div style={{fontFamily:'var(--fd)',fontSize:12,fontWeight:600}}>Pro Metrics</div><div style={{fontSize:10,color:'var(--text2)',marginTop:1}}>Security & maintainability deep-dive</div></div>
              <div style={{display:'flex',alignItems:'center',gap:7,cursor:'pointer'}} onClick={()=>setProOn(p=>!p)}>
                <span style={{fontSize:11,color:'var(--text2)'}}>{proOn?'On':'Off'}</span>
                <div style={{width:38,height:20,borderRadius:10,border:'1px solid var(--border2)',position:'relative',background:proOn?'linear-gradient(135deg,var(--lav2),#4F8EFF)':'var(--glass2)',transition:'background .3s'}}>
                  <div style={{position:'absolute',top:2,width:14,height:14,borderRadius:'50%',background:'white',transition:'left .3s',left:proOn?22:2}}/>
                </div>
              </div>
            </div>
            {proOn && <div className="mg" style={{animation:'fU .3s ease'}}>
              <div className="mc"><div className="mc-v" style={{color:sc(result.proMetrics.security)}}>{result.proMetrics.security}</div><div className="mc-l">SECURITY</div></div>
              <div className="mc"><div className="mc-v" style={{color:sc(result.proMetrics.maintainability)}}>{result.proMetrics.maintainability}</div><div className="mc-l">MAINTAINABILITY</div></div>
              <div className="mc"><div className="mc-v" style={{color:'var(--warn)',fontSize:16}}>{result.proMetrics.techDebt}</div><div className="mc-l">TECH DEBT</div></div>
            </div>}
          </>)}

          <div className="sec-title" style={{marginTop:20}}>Ask About This Repo</div>
          <ChatWidget result={result} mode="repo" prompts={["What are the biggest risks?","How to improve score?","Explain the architecture","Best practices missing?"]}/>
        </div>
      )}
      {showPick && <RepoPicker onSelect={r=>{setShowPick(false);setUrl(`https://github.com/${r.full_name}`);}} onClose={()=>setShowPick(false)}/>}
    </div>
  );
}

// ── Profile Panel ─────────────────────────────────────────────────────────────
function ProfilePanel({ paidFor, onPaidUpdate, rzpKeyId, rzpAvailable }) {
  const [username, setUsername] = useState("");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState("");

  async function analyze() {
    const u = username.trim().replace(/^https?:\/\/github\.com\//,'').replace(/\/$/,'');
    if (!u) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${API}/analyze-profile`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ username:u }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const parsed = pj(data.text);
      if (!parsed) throw new Error("Invalid AI response");
      parsed._user = data.user; parsed._repos = data.repos; parsed._signals = data.signals;
      setResult(parsed);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }

  const g = result ? gi(result.score) : null;
  const s = result ? sc(result.score) : "#B8A9FF";

  return (
    <div>
      <div className="hero">
        <div className="badge"><div className="badge-dot"/>GitHub Profile AI</div>
        <h1>Profile<br/>Evaluator</h1>
        <p>Analyze your GitHub presence, activity, and hirability score.</p>
        <div className="iw">
          <input type="text" placeholder="github.com/username or just username"
            value={username} onChange={e=>setUsername(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&(paidFor.profile||paidFor.combo)&&analyze()}
            disabled={!paidFor.profile && !paidFor.combo}/>
          <button className="btn-a" onClick={analyze}
            disabled={loading||!username.trim()||(!paidFor.profile&&!paidFor.combo)}>
            {loading?'Analyzing…':'Analyze →'}
          </button>
        </div>
        {(!paidFor.profile && !paidFor.combo) && (
          <p style={{fontSize:11,color:'var(--text3)',marginTop:8}}>Unlock below to analyze any GitHub profile</p>
        )}
        {error && <p style={{color:'var(--err)',fontSize:12,marginTop:10}}>{error}</p>}
      </div>

      {!paidFor.profile && !paidFor.combo && <PaymentGate mode="profile" onPaid={onPaidUpdate} rzpKeyId={rzpKeyId} rzpAvailable={rzpAvailable}/>}
      {loading && <div className="sk" style={{height:200,borderRadius:22,marginTop:16}}/>}

      {result && !loading && (
        <div className="results">
          <div className="sum-card">
            {result._user && <div className="ph"><img src={result._user.avatar_url} alt="" className="ph-av"/><div><div className="ph-name">{result._user.name||result._user.login}</div><div className="ph-user">@{result._user.login}</div>{result._user.bio&&<div className="ph-bio">{result._user.bio}</div>}</div></div>}
            <div className="sum-top">
              <ScoreRing score={result.score} color={s}/>
              <div className="sum-info">
                <div className="gr-row"><span className="gr-badge" style={{background:g.bg,color:g.color}}>{g.grade}</span>{result._signals&&<span className="cf-badge">★ {result._signals.totalStars} total stars</span>}</div>
                <div className="tags">{result.tags?.map((t,i)=><span key={i} className="tag">{t}</span>)}</div>
                <div className="ins-box"><div className="ins-lbl">AI ASSESSMENT</div>{result.headline}</div>
              </div>
            </div>
            <div className="sp-row">
              <div className="sp-box"><div className="sp-ttl" style={{color:'var(--ok)'}}>STRENGTHS</div>{result.strengths?.map((s,i)=><div key={i} className="sp-item"><span className="sp-ic">✔</span>{s}</div>)}</div>
              <div className="sp-box"><div className="sp-ttl" style={{color:'var(--warn)'}}>GAPS</div>{result.gaps?.map((g,i)=><div key={i} className="sp-item"><span className="sp-ic">⚡</span>{g}</div>)}</div>
            </div>
          </div>

          <SaveBar result={result} mode="profile"/>

          <div className="sec-title">Key Metrics</div>
          <div className="mg">
            <div className="mc"><div className="mc-v" style={{color:sc(result.hirability||result.score)}}>{result.hirability||'—'}</div><div className="mc-l">HIRABILITY</div></div>
            <div className="mc"><div className="mc-v" style={{color:sc(result.openSourceScore||result.score)}}>{result.openSourceScore||'—'}</div><div className="mc-l">OPEN SOURCE</div></div>
            <div className="mc"><div className="mc-v" style={{color:sc(result.consistencyScore||result.score)}}>{result.consistencyScore||'—'}</div><div className="mc-l">CONSISTENCY</div></div>
          </div>

          <div className="vg">
            <div className="gc"><div className="gc-title">Profile Health Radar</div>{result.radarData&&<RadarChart data={result.radarData}/>}</div>
            <div className="gc">
              <div className="gc-title">Top Languages</div>
              {result._signals?.topLangs&&(<><div className="lang-bar">{result._signals.topLangs.map((l,i)=><div key={i} className="lang-seg" style={{flex:1,background:LC[i%LC.length]}}/>)}</div><div className="lang-leg">{result._signals.topLangs.map((l,i)=><span key={i} className="lang-it"><span className="lang-dot" style={{background:LC[i%LC.length]}}/>{l}</span>)}</div></>)}
              {result._user&&<div style={{marginTop:12,display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
                <div style={{background:'var(--glass2)',borderRadius:9,padding:'9px 11px'}}><div style={{fontFamily:'var(--fd)',fontSize:17,fontWeight:700}}>{result._user.followers}</div><div style={{fontSize:9,color:'var(--text3)',marginTop:2}}>FOLLOWERS</div></div>
                <div style={{background:'var(--glass2)',borderRadius:9,padding:'9px 11px'}}><div style={{fontFamily:'var(--fd)',fontSize:17,fontWeight:700}}>{result._user.public_repos}</div><div style={{fontSize:9,color:'var(--text3)',marginTop:2}}>REPOS</div></div>
              </div>}
            </div>
          </div>

          <div className="sec-title">How to Improve</div>
          <div className="imp-list">{result.improvements?.map((s,i)=>{ const p=pc(s.priority); return <div key={i} className="imp-card"><div className="imp-dot" style={{background:p.color}}/><div className="imp-cnt"><div className="imp-ttl">{s.title}</div><div className="imp-why">{s.why}</div></div><span className="imp-badge" style={{background:p.bg,color:p.color}}>{s.priority}</span></div>; })}</div>

          <div className="sec-title">Ask the Career AI</div>
          <ChatWidget result={result} mode="profile" prompts={["How to get more stars?","Improve hirability?","What repos to add?","Best practices?"]}/>
        </div>
      )}
    </div>
  );
}

// ── LinkedIn Panel ────────────────────────────────────────────────────────────
function LinkedInPanel({ paidFor, onPaidUpdate, rzpKeyId, rzpAvailable }) {
  const [inputMode, setInputMode] = useState('paste'); // 'paste' | 'url'
  const [text, setText]   = useState("");
  const [url, setUrl]     = useState("");
  const [role, setRole]   = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState("");
  const [urlMsg, setUrlMsg]   = useState("");

  const unlocked = paidFor.linkedin || paidFor.combo;

  async function fetchFromUrl() {
    if (!url.trim()) return;
    setFetching(true); setUrlMsg("Trying to fetch LinkedIn page…"); setError("");
    try {
      const res = await fetch(`${API}/fetch-linkedin`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ url: url.trim() }) });
      const data = await res.json();
      if (!data.blocked && data.text && data.text.length >= 100) {
        setText(data.text);
        setUrlMsg(`✔ Fetched ${data.text.length} characters from LinkedIn. Switched to paste mode — review and click Analyze.`);
        setInputMode('paste');
      } else {
        // Blocked — show specific guidance
        const hint = data.hint || 'LinkedIn blocks automated access. Please copy your profile sections (About, Experience, Skills) and paste below.';
        setUrlMsg('');
        setError('⚠ LinkedIn blocked: ' + hint);
        setInputMode('paste');
      }
    } catch(e) { setUrlMsg(''); setError("Fetch failed: " + e.message + ". Please paste your profile text instead."); setInputMode('paste'); }
    finally { setFetching(false); }
  }

  async function analyze() {
    if (!text.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${API}/analyze-linkedin`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ profileText:text, targetRole:role }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const parsed = pj(data.text);
      if (!parsed) throw new Error("Invalid AI response");
      setResult(parsed);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }

  const g = result ? gi(result.score) : null;
  const s = result ? sc(result.score) : "#B8A9FF";

  return (
    <div>
      <div className="hero">
        <div className="badge"><div className="badge-dot"/>LinkedIn Profile AI</div>
        <h1>LinkedIn<br/>Optimizer</h1>
        <p>ATS scoring, recruiter readability, keyword optimization. Paste text or try a URL.</p>

        {unlocked && (<>
          <div className="tab-switch" style={{maxWidth:400,marginBottom:16}}>
            <button className={`ts-btn ${inputMode==='paste'?'on':''}`} onClick={()=>setInputMode('paste')}>📋 Paste Profile Text</button>
            <button className={`ts-btn ${inputMode==='url'?'on':''}`} onClick={()=>setInputMode('url')}>🔗 Try LinkedIn URL</button>
          </div>

          {inputMode === 'url' && (
            <div style={{maxWidth:600,margin:'0 auto 10px'}}>
              <div className="iw" style={{marginBottom:8}}>
                <input type="text" placeholder="https://linkedin.com/in/your-username" value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>e.key==='Enter'&&fetchFromUrl()}/>
                <button className="btn-a" onClick={fetchFromUrl} disabled={fetching||!url.trim()}>{fetching?'Trying…':'Fetch →'}</button>
              </div>
              {error && <div style={{fontSize:12,color:'var(--warn)',textAlign:'left',padding:'8px 12px',background:'rgba(253,211,77,.06)',border:'1px solid rgba(253,211,77,.2)',borderRadius:10,marginBottom:8,lineHeight:1.6}}>{error}</div>}
              <div style={{background:'rgba(147,197,253,.06)',border:'1px solid rgba(147,197,253,.15)',borderRadius:10,padding:'10px 14px',fontSize:11,color:'var(--sky)',lineHeight:1.7,textAlign:'left'}}>
                <strong style={{display:'block',marginBottom:4}}>💡 If fetch fails (LinkedIn blocks ~90% of requests):</strong>
                1. Open your LinkedIn profile in browser<br/>
                2. Select all text on the page (Ctrl+A / Cmd+A)<br/>
                3. Copy (Ctrl+C / Cmd+C) and switch to "Paste Profile Text"<br/>
                <em style={{color:'var(--text3)'}}>Or: LinkedIn → Me → Settings → Data privacy → Get a copy of your data</em>
              </div>
            </div>
          )}

          {inputMode === 'paste' && (
            <>
              <div className="tw"><textarea placeholder="Paste your LinkedIn profile text here (About section, Experience, Skills, Certifications)…" value={text} onChange={e=>setText(e.target.value)}/></div>
              <div style={{maxWidth:600,margin:'0 auto 10px'}}>
                <input className="if" style={{width:'100%'}} placeholder="Target role (e.g. ML Engineer, Backend SWE)" value={role} onChange={e=>setRole(e.target.value)}/>
              </div>
              {error && <p style={{color:'var(--err)',fontSize:12,marginTop:8,textAlign:'center'}}>{error}</p>}
              <div className="bc"><button className="btn-af" onClick={analyze} disabled={loading||!text.trim()}>{loading?'Analyzing…':'Analyze LinkedIn Profile →'}</button></div>
            </>
          )}
        </>)}
      </div>

      {!unlocked && <PaymentGate mode="linkedin" onPaid={onPaidUpdate} rzpKeyId={rzpKeyId} rzpAvailable={rzpAvailable}/>}
      {loading && <div className="sk" style={{height:200,borderRadius:22,marginTop:16}}/>}

      {result && !loading && (
        <div className="results">
          <div className="sum-card">
            <div className="sum-top">
              <ScoreRing score={result.score} color={s}/>
              <div className="sum-info">
                <div className="gr-row"><span className="gr-badge" style={{background:g.bg,color:g.color}}>{g.grade}</span><span className="cf-badge">ATS: {result.atsScore}/100</span></div>
                <div className="tags">{result.tags?.map((t,i)=><span key={i} className="tag">{t}</span>)}</div>
                <div className="ins-box"><div className="ins-lbl">AI ASSESSMENT</div>{result.headline}</div>
              </div>
            </div>
            <div className="sp-row">
              <div className="sp-box"><div className="sp-ttl" style={{color:'var(--ok)'}}>STRENGTHS</div>{result.strengths?.map((s,i)=><div key={i} className="sp-item"><span className="sp-ic">✔</span>{s}</div>)}</div>
              <div className="sp-box"><div className="sp-ttl" style={{color:'var(--warn)'}}>GAPS</div>{result.gaps?.map((g,i)=><div key={i} className="sp-item"><span className="sp-ic">⚡</span>{g}</div>)}</div>
            </div>
          </div>

          <SaveBar result={result} mode="linkedin"/>

          <div className="mg">
            <div className="mc"><div className="mc-v" style={{color:sc(result.atsScore)}}>{result.atsScore}</div><div className="mc-l">ATS SCORE</div></div>
            <div className="mc"><div className="mc-v" style={{color:sc(result.estimatedRecruiterScore)}}>{result.estimatedRecruiterScore}</div><div className="mc-l">RECRUITER SCORE</div></div>
            <div className="mc"><div className="mc-v" style={{color:sc(result.profileCompleteness)}}>{result.profileCompleteness}</div><div className="mc-l">COMPLETENESS</div></div>
          </div>

          <div className="vg">
            <div className="gc"><div className="gc-title">Profile Health Radar</div>{result.radarData&&<RadarChart data={result.radarData}/>}</div>
            <div className="gc">
              <div className="gc-title">Keywords</div>
              {result.keywordsFound?.length>0&&(<><div style={{marginBottom:7,fontSize:10,color:'var(--ok)'}}>✔ Found</div><div className="kw-row" style={{marginBottom:12}}>{result.keywordsFound.map((k,i)=><span key={i} className="kw ok">{k}</span>)}</div></>)}
              {result.keywordsMissing?.length>0&&(<><div style={{marginBottom:7,fontSize:10,color:'var(--err)'}}>✖ Missing</div><div className="kw-row">{result.keywordsMissing.map((k,i)=><span key={i} className="kw no">{k}</span>)}</div></>)}
            </div>
          </div>

          <div className="sec-title">Section Analysis</div>
          <div className="sec-list">{result.sections?.map((s,i)=>{ const c=sc(s.score); return <div key={i} className="sec-card"><div className="sc-hd"><span className="sc-nm">{s.name}</span><span className="sc-sc" style={{color:c}}>{s.score}</span></div><div className="sc-bar"><div className="sc-fill" style={{width:`${s.score}%`,background:`linear-gradient(90deg,${c}60,${c})`}}/></div><div className="sc-fb">{s.feedback}</div></div>; })}</div>

          <div className="sec-title">Improvements</div>
          <div className="imp-list">{result.improvements?.map((s,i)=>{ const p=pc(s.priority); return <div key={i} className="imp-card"><div className="imp-dot" style={{background:p.color}}/><div className="imp-cnt"><div className="imp-ttl">{s.title}</div><div className="imp-why">{s.why}</div></div><span className="imp-badge" style={{background:p.bg,color:p.color}}>{s.priority}</span></div>; })}</div>

          <div className="sec-title">Ask the LinkedIn AI</div>
          <ChatWidget result={result} mode="linkedin" prompts={["Rewrite my headline?","Improve ATS score?","Add missing keywords?","Summary rewrite?"]}/>
        </div>
      )}
    </div>
  );
}

// ── Resume Panel ──────────────────────────────────────────────────────────────
function ResumePanel({ paidFor, onPaidUpdate, rzpKeyId, rzpAvailable }) {
  const [inputMode, setInputMode] = useState('paste'); // 'paste' | 'upload'
  const [text, setText]     = useState("");
  const [role, setRole]     = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError]   = useState("");
  const [pdfName, setPdfName] = useState("");
  const [drag, setDrag]     = useState(false);
  const fileRef = useRef(null);
  const unlocked = paidFor.resume || paidFor.combo;

  function extractPdfText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // Use PDF.js from CDN if available, otherwise fall back to text extraction
          if (window.pdfjsLib) {
            const typedArray = new Uint8Array(e.target.result);
            const pdf = await window.pdfjsLib.getDocument(typedArray).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              fullText += content.items.map(item => item.str).join(' ') + '\n';
            }
            resolve(fullText);
          } else {
            // Fallback: read as text if possible
            const textReader = new FileReader();
            textReader.onload = (te) => resolve(te.target.result);
            textReader.onerror = () => reject(new Error('Could not read file'));
            textReader.readAsText(file);
          }
        } catch(err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('File read error'));
      reader.readAsArrayBuffer(file);
    });
  }

  async function handleFile(file) {
    if (!file) return;
    setPdfName(file.name);
    try {
      let extracted = '';
      if (file.type === 'application/pdf') {
        extracted = await extractPdfText(file);
      } else {
        // Plain text / docx as text
        extracted = await new Promise((res, rej) => {
          const r = new FileReader();
          r.onload = e => res(e.target.result);
          r.onerror = () => rej(new Error('Could not read file'));
          r.readAsText(file);
        });
      }
      if (!extracted || extracted.trim().length < 50) {
        setError("Could not extract text from this file. Please paste your resume text instead.");
        setInputMode('paste');
        return;
      }
      setText(extracted.trim());
      setInputMode('paste');
    } catch(e) {
      setError("File read error: " + e.message + ". Try pasting your resume text instead.");
      setInputMode('paste');
    }
  }

  async function analyze() {
    if (!text.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${API}/analyze-resume`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ resumeText:text, targetRole:role, targetCompany:company }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const parsed = pj(data.text);
      if (!parsed) throw new Error("Invalid AI response");
      setResult(parsed);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }

  const g = result ? gi(result.score) : null;
  const s = result ? sc(result.score) : "#B8A9FF";

  return (
    <div>
      {/* Load PDF.js */}
      <script dangerouslySetInnerHTML={{__html:`
        if (!window.pdfjsLib) {
          var s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
          s.onload = function(){ window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js'; };
          document.head.appendChild(s);
        }
      `}}/>

      <div className="hero">
        <div className="badge"><div className="badge-dot"/>Resume AI Analyzer</div>
        <h1>Resume<br/>Optimizer</h1>
        <p>ATS optimization, impact scoring, and improvement suggestions. Upload PDF or paste text.</p>

        {unlocked && (<>
          <div className="tab-switch" style={{maxWidth:400,marginBottom:16}}>
            <button className={`ts-btn ${inputMode==='paste'?'on':''}`} onClick={()=>setInputMode('paste')}>📋 Paste Resume Text</button>
            <button className={`ts-btn ${inputMode==='upload'?'on':''}`} onClick={()=>setInputMode('upload')}>📄 Upload PDF</button>
          </div>

          {inputMode === 'upload' && (
            <div
              className={`upload-area ${drag?'drag':''}`}
              onDragOver={e=>{e.preventDefault();setDrag(true);}}
              onDragLeave={()=>setDrag(false)}
              onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)handleFile(f);}}
              onClick={()=>fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept=".pdf,.txt,.doc,.docx" onChange={e=>handleFile(e.target.files[0])}/>
              <div className="upload-icon">📄</div>
              <div className="upload-title">Drop your resume here or click to browse</div>
              <div className="upload-sub">Supports PDF, TXT · Text is extracted and analyzed</div>
              {pdfName && <div className="upload-done">✔ {pdfName} loaded — switch to "Paste" to review</div>}
            </div>
          )}

          {inputMode === 'paste' && (
            <>
              <div className="tw"><textarea placeholder="Paste your full resume text here (Contact, Summary, Experience, Skills, Education, Projects, Certifications)…" value={text} onChange={e=>setText(e.target.value)} style={{minHeight:130}}/></div>
              {pdfName && <div style={{fontSize:11,color:'var(--mint)',textAlign:'center',marginBottom:8}}>✔ Text extracted from {pdfName}</div>}
            </>
          )}

          {(inputMode==='paste' || text) && (<>
            <div className="ir">
              <input className="if" placeholder="Target role (e.g. ML Engineer)" value={role} onChange={e=>setRole(e.target.value)}/>
              <input className="if" placeholder="Target company (optional)" value={company} onChange={e=>setCompany(e.target.value)}/>
            </div>
            {error && <p style={{color:'var(--err)',fontSize:12,marginTop:8,textAlign:'center'}}>{error}</p>}
            <div className="bc"><button className="btn-af" onClick={analyze} disabled={loading||!text.trim()}>{loading?'Analyzing…':'Analyze Resume →'}</button></div>
          </>)}
        </>)}
      </div>

      {!unlocked && <PaymentGate mode="resume" onPaid={onPaidUpdate} rzpKeyId={rzpKeyId} rzpAvailable={rzpAvailable}/>}
      {loading && <div className="sk" style={{height:200,borderRadius:22,marginTop:16}}/>}

      {result && !loading && (
        <div className="results">
          <div className="sum-card">
            <div className="sum-top">
              <ScoreRing score={result.score} color={s}/>
              <div className="sum-info">
                <div className="gr-row"><span className="gr-badge" style={{background:g.bg,color:g.color}}>{g.grade}</span><span className="cf-badge">ATS: {result.atsScore}/100</span></div>
                <div className="tags">{result.tags?.map((t,i)=><span key={i} className="tag">{t}</span>)}</div>
                <div className="ins-box"><div className="ins-lbl">AI ASSESSMENT</div>{result.headline}</div>
              </div>
            </div>
            <div className="sp-row">
              <div className="sp-box"><div className="sp-ttl" style={{color:'var(--ok)'}}>STRENGTHS</div>{result.strengths?.map((s,i)=><div key={i} className="sp-item"><span className="sp-ic">✔</span>{s}</div>)}</div>
              <div className="sp-box"><div className="sp-ttl" style={{color:'var(--warn)'}}>GAPS</div>{result.gaps?.map((g,i)=><div key={i} className="sp-item"><span className="sp-ic">⚡</span>{g}</div>)}</div>
            </div>
          </div>

          <SaveBar result={result} mode="resume"/>

          <div className="mg">
            <div className="mc"><div className="mc-v" style={{color:sc(result.atsScore)}}>{result.atsScore}</div><div className="mc-l">ATS SCORE</div></div>
            <div className="mc"><div className="mc-v" style={{color:sc(result.readabilityScore)}}>{result.readabilityScore}</div><div className="mc-l">READABILITY</div></div>
            <div className="mc"><div className="mc-v" style={{color:sc(result.estimatedJobMatchScore)}}>{result.estimatedJobMatchScore}</div><div className="mc-l">JOB MATCH</div></div>
          </div>

          <div className="vg">
            <div className="gc"><div className="gc-title">Resume Health Radar</div>{result.radarData&&<RadarChart data={result.radarData}/>}</div>
            <div className="gc">
              <div className="gc-title">Keywords</div>
              {result.keywordsFound?.length>0&&(<><div style={{marginBottom:7,fontSize:10,color:'var(--ok)'}}>✔ Found in resume</div><div className="kw-row" style={{marginBottom:12}}>{result.keywordsFound.map((k,i)=><span key={i} className="kw ok">{k}</span>)}</div></>)}
              {result.keywordsMissing?.length>0&&(<><div style={{marginBottom:7,fontSize:10,color:'var(--err)'}}>✖ Missing — add these</div><div className="kw-row">{result.keywordsMissing.map((k,i)=><span key={i} className="kw no">{k}</span>)}</div></>)}
            </div>
          </div>

          <div className="sec-title">Section Analysis</div>
          <div className="sec-list">{result.sections?.map((s,i)=>{ const c=sc(s.score); return <div key={i} className="sec-card"><div className="sc-hd"><span className="sc-nm">{s.name}</span><span className="sc-sc" style={{color:c}}>{s.score}</span></div><div className="sc-bar"><div className="sc-fill" style={{width:`${s.score}%`,background:`linear-gradient(90deg,${c}60,${c})`}}/></div><div className="sc-fb">{s.feedback}</div></div>; })}</div>

          <div className="sec-title">Improvements</div>
          <div className="imp-list">{result.improvements?.map((s,i)=>{ const p=pc(s.priority); return <div key={i} className="imp-card"><div className="imp-dot" style={{background:p.color}}/><div className="imp-cnt"><div className="imp-ttl">{s.title}</div><div className="imp-why">{s.why}</div>{s.where&&<span className="imp-wh">{s.where}</span>}</div><span className="imp-badge" style={{background:p.bg,color:p.color}}>{s.priority}</span></div>; })}</div>

          {result.missingElements?.length>0 && (<>
            <div className="sec-title">Missing Elements</div>
            <div className="kw-row" style={{marginBottom:14}}>{result.missingElements.map((e,i)=><span key={i} className="kw no">{e}</span>)}</div>
          </>)}

          <div className="sec-title">Ask the Resume AI</div>
          <ChatWidget result={result} mode="resume" prompts={["Rewrite experience bullet?","Improve ATS score?","Add impact numbers?","Tailor for role?"]}/>
        </div>
      )}
    </div>
  );
}

// ── RepoPicker ────────────────────────────────────────────────────────────────
function RepoPicker({ onSelect, onClose }) {
  const [repos, setRepos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage]     = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => { load(1); }, []);

  async function load(p) {
    setLoading(true);
    try {
      const res = await fetch(GH_PROXY(`user/repos?sort=updated&per_page=50&page=${p}&affiliation=owner,collaborator`), { credentials:"include" });
      const data = await res.json();
      if (p===1) setRepos(data); else setRepos(r=>[...r,...data]);
      setHasMore(data.length===50); setPage(p);
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  const filtered = repos.filter(r =>
    r.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    (r.description||"").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="picker-ov" onClick={onClose}>
      <div className="picker-m" onClick={e=>e.stopPropagation()}>
        <div className="picker-hd"><span className="picker-ht">Select repository</span><button className="picker-cl" onClick={onClose}>×</button></div>
        <div className="picker-sw"><input autoFocus className="picker-si" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Filter repositories…"/></div>
        <div className="picker-li">
          {loading&&page===1?<div className="picker-em">Loading…</div>
          :filtered.length===0?<div className="picker-em">No repositories found</div>
          :filtered.map(r=>(
            <button key={r.id} className="picker-it" onClick={()=>onSelect(r)}>
              <div className="picker-itp"><span className="picker-nm">{r.full_name}</span>{r.private&&<span className="picker-prv">Private</span>}{r.language&&<span className="picker-lg">{r.language}</span>}</div>
              {r.description&&<div className="picker-ds">{r.description}</div>}
              <div className="picker-mt"><span>★ {r.stargazers_count}</span><span>{new Date(r.updated_at).toLocaleDateString()}</span></div>
            </button>
          ))}
          {hasMore&&!loading&&<button onClick={()=>load(page+1)} style={{width:'100%',padding:11,background:'none',border:'none',borderTop:'1px solid var(--border)',color:'var(--lav)',fontFamily:'var(--fd)',fontSize:11,cursor:'pointer'}}>Load more</button>}
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
const MODES = [
  { id:'repo',    icon:'🐙', label:'GitHub Repo' },
  { id:'profile', icon:'👤', label:'GH Profile'  },
  { id:'linkedin',icon:'💼', label:'LinkedIn'     },
  { id:'resume',  icon:'📄', label:'Resume'       },
];

export default function App() {
  const [mode, setMode]           = useState('repo');
  const [ghUser, setGhUser]       = useState(null);
  const [oauthAvailable, setOA]   = useState(false);
  const [rzpAvailable, setRZP]    = useState(false);
  const [rzpKeyId, setRzpKeyId]   = useState(null);
  const [paidFor, setPaidFor]     = useState({});
  const [globalErr, setGlobalErr] = useState("");

  useEffect(() => {
    fetch("/auth/me", { credentials:"include" })
      .then(r=>r.json()).then(d=>{ if(d.connected) setGhUser(d.user); }).catch(()=>{});
    fetch("/auth/status")
      .then(r=>r.json()).then(d=>{ setOA(!!d.oauthAvailable); setRZP(!!d.razorpayAvailable); setRzpKeyId(d.razorpayKeyId); }).catch(()=>{});
    fetch("/api/payment/status", { credentials:"include" })
      .then(r=>r.json()).then(d=>{ if(d.paidFor) setPaidFor(d.paidFor); }).catch(()=>{});

    const p = new URLSearchParams(window.location.search);
    if (p.get("error")) { setGlobalErr(decodeURIComponent(p.get("error"))); window.history.replaceState({},"","/ "); }

    // Load Razorpay script with onload so window.Razorpay is ready before pay()
    if (!window.Razorpay) {
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.async = true;
      s.onload = () => console.log('[DevProfile] Razorpay script loaded');
      s.onerror = () => console.error('[DevProfile] Razorpay script failed to load');
      document.head.appendChild(s);
    }
    // Load PDF.js
    if (!window.pdfjsLib) {
      const s = document.createElement('script');
      s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
      s.onload=()=>{ window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js'; };
      document.head.appendChild(s);
    }
  }, []);

  function updatePaid(newPaidFor) {
    // newPaidFor is the full paidFor object from server
    setPaidFor(prev => ({ ...prev, ...newPaidFor }));
  }

  const sharedProps = { paidFor, onPaidUpdate: updatePaid, rzpKeyId, rzpAvailable };

  const isUnlocked = (m) => paidFor[m] || paidFor.combo;

  return (
    <>
      <style>{STYLES}</style>
      <div className="orb orb1"/><div className="orb orb2"/><div className="orb orb3"/>

      <nav className="nav">
        <div className="logo"><div className="logo-dot"/>DevProfile AI</div>
        <div className="nav-r">
          {ghUser ? (
            <div className="auth-chip">
              <img src={ghUser.avatar} alt="" className="auth-av"/>
              <div><div className="auth-nm">{ghUser.name||ghUser.login}</div><div className="auth-sub">Private repos unlocked</div></div>
              <button className="btn-so" onClick={async()=>{ await fetch("/auth/logout",{method:"POST",credentials:"include"}); setGhUser(null); }}>Sign out</button>
            </div>
          ) : (
            <button className="btn-gh" onClick={()=>{ if(!oauthAvailable) setGlobalErr("Add GITHUB_CLIENT_ID + GITHUB_CLIENT_SECRET to .env"); else window.location.href="/auth/github"; }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
              Connect GitHub
            </button>
          )}
          {/* If any plan active — show status + reset button for testing */}
          {Object.keys(paidFor).length > 0 && (
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <div style={{fontSize:10,color:'var(--mint)',fontFamily:'var(--fd)',fontWeight:600,background:'rgba(127,255,212,.1)',border:'1px solid rgba(127,255,212,.2)',borderRadius:100,padding:'4px 10px'}}>
                {paidFor.combo ? '✔ Combo Active' : '✔ Unlocked'}
              </div>
              <button title="Reset payment (for testing)" style={{background:'transparent',border:'1px solid var(--border)',borderRadius:100,padding:'3px 8px',fontSize:9,color:'var(--text3)',cursor:'pointer',fontFamily:'var(--fd)'}}
                onClick={async()=>{ await fetch("/api/payment/reset",{method:"POST",credentials:"include"}); setPaidFor({}); }}>
                Reset
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="app">
        {globalErr && <div style={{background:'rgba(255,143,171,.1)',border:'1px solid rgba(255,143,171,.3)',borderRadius:11,padding:'9px 14px',fontSize:12,color:'var(--err)',marginBottom:14}}>{globalErr}</div>}

        {/* Unlock banner when combo is active */}
        {paidFor.combo && (
          <div className="unlock-banner">
            ✔ Combo plan active — all 4 analyzers unlocked for this session
          </div>
        )}

        <div className="tabs" style={{marginBottom:36}}>
          {MODES.map(m => (
            <button key={m.id} className={`tab ${mode===m.id?'on':''}`} onClick={()=>setMode(m.id)}>
              <span className="tab-icon">{m.icon}</span>
              {m.label}
              {isUnlocked(m.id) && mode!==m.id && <span style={{width:5,height:5,borderRadius:'50%',background:'var(--mint)',display:'inline-block',marginLeft:4}}/>}
            </button>
          ))}
        </div>

        {mode==='repo'     && <RepoPanel ghUser={ghUser} oauthAvailable={oauthAvailable} {...sharedProps}/>}
        {mode==='profile'  && <ProfilePanel {...sharedProps}/>}
        {mode==='linkedin' && <LinkedInPanel {...sharedProps}/>}
        {mode==='resume'   && <ResumePanel {...sharedProps}/>}
      </div>
    </>
  );
}