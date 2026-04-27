import { useEffect, useRef, useState } from "react";
import { gi, pc, saveReport } from "../utils";

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

export { ScoreRing, RadarChart, SaveBar, PaymentGate, ChatWidget };
