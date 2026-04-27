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


export { LC, sc, gi, pj, pc, saveReport };
