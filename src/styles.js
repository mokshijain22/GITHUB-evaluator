export const STYLES = `
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
