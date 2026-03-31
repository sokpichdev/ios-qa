#!/usr/bin/env python3
"""
generate_site.py
Reads all Q&A .md files in the repo and generates a fresh index.html.
Run locally or via GitHub Actions on every push to main.
"""

import re
import json
import os
from pathlib import Path

# ── Category metadata ────────────────────────────────────────────────────────
CATEGORY_META = {
    "swift":         {"emoji": "🔷", "color": "#4a9eff",  "label": "Swift"},
    "swiftui":       {"emoji": "🔶", "color": "#f05a28",  "label": "SwiftUI"},
    "concurrency":   {"emoji": "⚡", "color": "#ffd60a",  "label": "Concurrency"},
    "architecture":  {"emoji": "🏗",  "color": "#bf5af2",  "label": "Architecture"},
    "networking":    {"emoji": "🌐", "color": "#30d158",  "label": "Networking"},
    "testing":       {"emoji": "🧪", "color": "#5ac8fa",  "label": "Testing"},
    "uikit":         {"emoji": "📐", "color": "#ff375f",  "label": "UIKit"},
    "xcode-tools":   {"emoji": "🛠",  "color": "#ff9f0a",  "label": "Xcode"},
    "interview-prep":{"emoji": "🎯", "color": "#64d2ff",  "label": "Interview"},
}

def parse_questions(repo_root: Path) -> list[dict]:
    """Walk all .md files and extract ## Q: headings."""
    questions = []
    for folder, meta in CATEGORY_META.items():
        folder_path = repo_root / folder
        if not folder_path.exists():
            continue
        for md_file in sorted(folder_path.glob("*.md")):
            text = md_file.read_text(encoding="utf-8", errors="ignore")
            # Match lines like:  ## Q: Some question text?
            for m in re.finditer(r"^#{1,3}\s+Q:\s*(.+)", text, re.MULTILINE):
                q_text = m.group(1).strip()
                if q_text:
                    questions.append({
                        "cat":   meta["label"],
                        "key":   folder,
                        "emoji": meta["emoji"],
                        "color": meta["color"],
                        "q":     q_text,
                    })
    return questions


def build_html(questions: list[dict]) -> str:
    """Return full index.html as a string."""
    q_json   = json.dumps(questions, ensure_ascii=False)
    cat_json = json.dumps(list(CATEGORY_META.values()), ensure_ascii=False)
    total    = len(questions)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>iOS Developer Q&A</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Sora:wght@300;600;800&display=swap');

*,*::before,*::after{{box-sizing:border-box;margin:0;padding:0}}
:root{{
  --bg:#0d0f14;--surface:#151821;--card:#1c2030;--border:#252a3a;
  --orange:#f05a28;--og:rgba(240,90,40,.15);
  --text:#e8eaf0;--muted:#6b7280;--cyan:#5ac8fa;
  --mono:'JetBrains Mono',monospace;--sans:'Sora',sans-serif;
}}
body{{background:var(--bg);color:var(--text);font-family:var(--sans);min-height:100vh;overflow-x:hidden}}

/* ── Header ── */
header{{
  padding:28px 40px 22px;border-bottom:1px solid var(--border);
  display:flex;align-items:center;gap:16px;position:relative;overflow:hidden;
}}
header::before{{
  content:'';position:absolute;top:-60px;left:-60px;
  width:300px;height:300px;
  background:radial-gradient(circle,rgba(240,90,40,.12) 0%,transparent 70%);
  pointer-events:none;
}}
.logo{{
  width:44px;height:44px;background:var(--orange);border-radius:12px;
  display:flex;align-items:center;justify-content:center;font-size:22px;
  flex-shrink:0;box-shadow:0 0 20px rgba(240,90,40,.4);
}}
header h1{{font-size:20px;font-weight:800;letter-spacing:-.5px}}
header p{{font-size:13px;color:var(--muted);margin-top:2px;font-family:var(--mono)}}
.tag-count{{
  margin-left:auto;background:var(--og);border:1px solid var(--orange);
  color:var(--orange);font-family:var(--mono);font-size:12px;
  padding:4px 12px;border-radius:20px;white-space:nowrap;
}}

/* ── Spin Section ── */
.spin-section{{
  margin:32px 40px;background:var(--surface);border:1px solid var(--border);
  border-radius:20px;padding:36px;text-align:center;position:relative;overflow:hidden;
}}
.spin-section::before{{
  content:'';position:absolute;inset:0;
  background:radial-gradient(ellipse at 50% 0%,rgba(240,90,40,.08) 0%,transparent 60%);
  pointer-events:none;
}}
.spin-label{{font-family:var(--mono);font-size:11px;color:var(--orange);letter-spacing:2px;text-transform:uppercase;margin-bottom:12px}}
.spin-section h2{{font-size:26px;font-weight:800;letter-spacing:-.5px;margin-bottom:8px}}
.spin-section>p{{color:var(--muted);font-size:14px;margin-bottom:28px}}

.wheel-wrap{{display:flex;align-items:center;justify-content:center;gap:40px;flex-wrap:wrap}}
.wheel-outer{{position:relative;width:220px;height:220px;flex-shrink:0}}
.wheel-pointer{{
  position:absolute;top:-14px;left:50%;transform:translateX(-50%);
  width:0;height:0;
  border-left:10px solid transparent;border-right:10px solid transparent;
  border-top:20px solid var(--orange);
  filter:drop-shadow(0 0 6px rgba(240,90,40,.8));z-index:2;
}}

.question-card{{
  flex:1;min-width:240px;max-width:400px;background:var(--card);
  border:1px solid var(--border);border-radius:16px;padding:24px;
  text-align:left;min-height:160px;display:flex;flex-direction:column;
  justify-content:center;transition:border-color .3s,box-shadow .3s;
}}
.question-card.revealed{{border-color:var(--orange);box-shadow:0 0 20px rgba(240,90,40,.1)}}
.q-category{{font-family:var(--mono);font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px}}
.q-text{{font-size:16px;font-weight:600;line-height:1.5;margin-bottom:16px}}
.q-placeholder{{color:var(--muted);font-size:14px;text-align:center;width:100%}}
.q-hint{{font-family:var(--mono);font-size:12px;color:var(--muted);border-top:1px solid var(--border);padding-top:12px;margin-top:auto}}

.spin-btn{{
  display:block;margin:24px auto 0;background:var(--orange);color:#fff;border:none;
  padding:14px 36px;border-radius:12px;font-family:var(--sans);font-size:15px;
  font-weight:700;cursor:pointer;transition:all .2s;
  box-shadow:0 4px 20px rgba(240,90,40,.35);letter-spacing:.3px;
}}
.spin-btn:hover{{transform:translateY(-2px);box-shadow:0 6px 24px rgba(240,90,40,.5)}}
.spin-btn:active{{transform:translateY(0)}}
.spin-btn:disabled{{opacity:.5;cursor:not-allowed;transform:none}}

/* ── Filters ── */
.filters{{padding:0 40px 20px;display:flex;gap:8px;flex-wrap:wrap}}
.filter-btn{{
  background:var(--surface);border:1px solid var(--border);color:var(--muted);
  padding:6px 14px;border-radius:20px;font-family:var(--mono);font-size:12px;
  cursor:pointer;transition:all .2s;
}}
.filter-btn:hover,.filter-btn.active{{color:#fff;border-color:var(--orange);background:var(--og)}}

/* ── Grid ── */
.grid-section{{padding:0 40px 40px}}
.grid-section h3{{font-size:13px;font-family:var(--mono);color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:16px}}
.q-grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}}
.q-item{{
  background:var(--surface);border:1px solid var(--border);border-radius:12px;
  padding:16px;cursor:default;transition:all .2s;
}}
.q-item:hover{{border-color:var(--orange);background:var(--card);transform:translateY(-2px)}}
.q-item-cat{{font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px}}
.q-item-text{{font-size:13px;line-height:1.5;color:#c8ccd8}}
code{{font-family:var(--mono);background:rgba(255,255,255,.07);padding:1px 5px;border-radius:4px;font-size:.9em;color:var(--cyan)}}

/* ── Footer ── */
footer{{
  text-align:center;padding:24px 40px;border-top:1px solid var(--border);
  font-family:var(--mono);font-size:12px;color:var(--muted);
}}
footer a{{color:var(--orange);text-decoration:none}}
footer a:hover{{text-decoration:underline}}
</style>
</head>
<body>

<header>
  <div class="logo">📱</div>
  <div>
    <h1>iOS Developer Q&A</h1>
    <p>cobra-PICH/ios-qa · interview prep knowledge base</p>
  </div>
  <div class="tag-count">{total} questions</div>
</header>

<!-- Spin -->
<div class="spin-section">
  <div class="spin-label">🎰 Random Challenge Mode</div>
  <h2>Spin the Wheel</h2>
  <p>Pick a random iOS interview question from your knowledge base</p>
  <div class="wheel-wrap">
    <div class="wheel-outer">
      <div class="wheel-pointer"></div>
      <canvas id="wheel" width="220" height="220"></canvas>
    </div>
    <div class="question-card" id="qCard">
      <p class="q-placeholder">🎯 Spin the wheel to get a random question</p>
    </div>
  </div>
  <button class="spin-btn" id="spinBtn" onclick="spinWheel()">🎰 Spin!</button>
</div>

<div class="filters" id="filters"></div>
<div class="grid-section">
  <h3 id="gridLabel">All Questions</h3>
  <div class="q-grid" id="qGrid"></div>
</div>

<footer>
  <p>Auto-generated from <a href="https://github.com/cobra-PICH/ios-qa">cobra-PICH/ios-qa</a> · Built with GitHub Actions</p>
</footer>

<script>
const QUESTIONS = {q_json};
const CAT_META  = {cat_json};

// Build lookup: label → meta
const catByLabel = {{}};
CAT_META.forEach(m => catByLabel[m.label] = m);
// unique categories present in questions
const CATS = [...new Set(QUESTIONS.map(q => q.cat))];

// ── Wheel ──────────────────────────────────────────────────────────────────
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const W=220, CX=W/2, CY=W/2, R=W/2-4;
const segments = CATS.map(c => catByLabel[c] || {{emoji:'❓',color:'#888',label:c}});
const N = segments.length;
const ARC = Math.PI*2 / N;
let rotation=0, spinning=false;

function drawWheel(rot) {{
  ctx.clearRect(0,0,W,W);
  for(let i=0;i<N;i++) {{
    const s=rot+i*ARC, e=s+ARC;
    ctx.beginPath(); ctx.moveTo(CX,CY); ctx.arc(CX,CY,R,s,e); ctx.closePath();
    ctx.fillStyle=segments[i].color+'33'; ctx.fill();
    ctx.strokeStyle='#0d0f14'; ctx.lineWidth=2; ctx.stroke();
    ctx.beginPath(); ctx.arc(CX,CY,R,s,e);
    ctx.strokeStyle=segments[i].color+'88'; ctx.lineWidth=2; ctx.stroke();
    const ang=s+ARC/2;
    const tx=CX+Math.cos(ang)*(R*.65), ty=CY+Math.sin(ang)*(R*.65);
    ctx.save(); ctx.translate(tx,ty);
    ctx.font='16px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(segments[i].emoji,0,0); ctx.restore();
  }}
  ctx.beginPath(); ctx.arc(CX,CY,22,0,Math.PI*2);
  ctx.fillStyle='#1c2030'; ctx.fill();
  ctx.strokeStyle='#f05a28'; ctx.lineWidth=2; ctx.stroke();
  ctx.font='bold 14px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle='#f05a28'; ctx.fillText('🎰',CX,CY);
}}
drawWheel(rotation);

function spinWheel() {{
  if(spinning) return;
  spinning=true;
  document.getElementById('spinBtn').disabled=true;
  const card=document.getElementById('qCard');
  card.classList.remove('revealed');
  card.innerHTML='<p class="q-placeholder">⏳ Spinning…</p>';
  const total=(5+Math.random()*5)*Math.PI*2, dur=3000+Math.random()*1000;
  const t0=performance.now(), r0=rotation;
  const ease=t=>1-Math.pow(1-t,3);
  function frame(now) {{
    const el=now-t0, t=Math.min(el/dur,1);
    rotation=r0+total*ease(t); drawWheel(rotation);
    if(t<1) requestAnimationFrame(frame);
    else {{ spinning=false; document.getElementById('spinBtn').disabled=false; reveal(rotation); }}
  }}
  requestAnimationFrame(frame);
}}

function reveal(rot) {{
  const norm=(((-rot-Math.PI/2)%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
  const idx=Math.floor(norm/ARC)%N;
  const cat=segments[idx].label;
  const pool=QUESTIONS.filter(q=>q.cat===cat);
  const q=pool[Math.floor(Math.random()*pool.length)];
  const card=document.getElementById('qCard');
  card.classList.add('revealed');
  card.innerHTML=`
    <div class="q-category" style="color:${{segments[idx].color}}">${{segments[idx].emoji}} ${{cat}}</div>
    <div class="q-text">${{fmt(q.q)}}</div>
    <div class="q-hint">💡 Answer this without looking — then check your notes</div>
  `;
}}

function fmt(q){{return q.replace(/`([^`]+)`/g,'<code>$1</code>')}}

// ── Filters + Grid ─────────────────────────────────────────────────────────
let active='All';

function renderAll() {{
  const filtersDiv=document.getElementById('filters');
  filtersDiv.innerHTML='';
  [['⚡ All','All'],...CATS.map(c=>[catByLabel[c]?.emoji+' '+c,c])].forEach(([label,key])=>{{
    const btn=document.createElement('button');
    btn.className='filter-btn'+(active===key?' active':'');
    btn.textContent=label;
    btn.onclick=()=>{{active=key;renderAll()}};
    filtersDiv.appendChild(btn);
  }});
  const filtered=active==='All'?QUESTIONS:QUESTIONS.filter(q=>q.cat===active);
  const meta=active==='All'?null:catByLabel[active];
  document.getElementById('gridLabel').textContent=
    active==='All'?`All ${{QUESTIONS.length}} Questions`:`${{meta?.emoji}} ${{active}} (${{filtered.length}})`;
  const grid=document.getElementById('qGrid');
  grid.innerHTML='';
  filtered.forEach(q=>{{
    const m=catByLabel[q.cat]||{{}};
    const div=document.createElement('div'); div.className='q-item';
    div.innerHTML=`<div class="q-item-cat" style="color:${{m.color}}">${{m.emoji}} ${{q.cat}}</div>
      <div class="q-item-text">${{fmt(q.q)}}</div>`;
    grid.appendChild(div);
  }});
}}
renderAll();
</script>
</body>
</html>"""


def main():
    repo_root = Path(__file__).parent.parent   # scripts/ → repo root
    questions = parse_questions(repo_root)
    print(f"[generate_site] Found {len(questions)} questions across {len(CATEGORY_META)} categories")
    html = build_html(questions)
    out = repo_root / "index.html"
    out.write_text(html, encoding="utf-8")
    print(f"[generate_site] Written → {out}")


if __name__ == "__main__":
    main()
