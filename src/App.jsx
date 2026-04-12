import { useState, useRef } from "react";

const C = {
  onyx:        "#0C0C0F",
  onyxLight:   "#13131A",
  onyxBorder:  "#1E1E2A",
  linen:       "#F2EDE4",
  linenDim:    "#A09890",
  linenMuted:  "#5A5450",
  violet:      "#7B35D4",
  violetBright:"#9B55F4",
  violetDim:   "#4A1D8C",
  violetGlow:  "rgba(123,53,212,0.18)",
  danger:      "#E8453C",
  warning:     "#E89B3C",
  ok:          "#3CB87A",
};

const FONT_DISPLAY = "'Playfair Display', Georgia, serif";
const FONT_BODY    = "'DM Sans', 'Segoe UI', sans-serif";
const catLabels  = { color: "Color", typography: "Tipografía", composition: "Composición", consistency: "Consistencia", hierarchy: "Jerarquía" };
const catWeights = { color: 20, typography: 20, composition: 20, consistency: 25, hierarchy: 15 };

function scoreColor(s) { return s >= 80 ? C.ok : s >= 55 ? C.warning : C.danger; }
function scoreLabel(s) { return s >= 80 ? "Excelente" : s >= 65 ? "Bueno" : s >= 50 ? "Regular" : "Crítico"; }

const card = {
  width: "100%", maxWidth: 660, background: C.onyxLight,
  border: `1px solid ${C.onyxBorder}`, borderRadius: 20,
  padding: "32px 28px", marginBottom: 16, boxSizing: "border-box",
};

function btn(outline = false) {
  return outline ? {
    background: "transparent", border: `1px solid ${C.onyxBorder}`,
    borderRadius: 12, color: C.linenDim, fontSize: 14, fontWeight: 600,
    cursor: "pointer", transition: "transform 0.15s",
  } : {
    background: `linear-gradient(135deg, #7B35D4, #9B55F4)`,
    border: "none", borderRadius: 12, color: "#F2EDE4",
    fontSize: 14, fontWeight: 600, cursor: "pointer",
    transition: "transform 0.15s",
  };
}

function ScoreRing({ score, size = 140 }) {
  const r = size === 100 ? 38 : 54;
  const circ = 2 * Math.PI * r, dash = (score / 100) * circ, col = scoreColor(score);
  const fs = size === 100 ? 26 : 38;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.onyxBorder} strokeWidth="7" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: fs, fontWeight: 900, fontFamily: FONT_DISPLAY, color: col, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 10, color: C.linenMuted, letterSpacing: "0.1em", marginTop: 2 }}>{scoreLabel(score)}</div>
      </div>
    </div>
  );
}

function CategoryBar({ label, value, compact = false }) {
  const col = scoreColor(value);
  return (
    <div style={{ marginBottom: compact ? 10 : 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: compact ? 11 : 12, color: C.linenDim }}>{label}</span>
        <span style={{ fontSize: compact ? 11 : 12, fontWeight: 700, color: col }}>{value}</span>
      </div>
      <div style={{ height: 3, background: C.onyxBorder, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 2, width: `${value}%`, background: `linear-gradient(90deg, ${col}99, ${col})`, transition: "width 1s cubic-bezier(.4,0,.2,1)" }} />
      </div>
    </div>
  );
}

function IssueTag({ issue }) {
  const isError = issue.severity === "error";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: isError ? "rgba(232,69,60,0.07)" : "rgba(232,155,60,0.07)", border: `1px solid ${isError ? "rgba(232,69,60,0.2)" : "rgba(232,155,60,0.2)"}`, borderRadius: 10, marginBottom: 8 }}>
      <span style={{ fontSize: 13 }}>{isError ? "❌" : "⚠️"}</span>
      <span style={{ fontSize: 12, color: C.linenDim, lineHeight: 1.5 }}>{issue.label}</span>
    </div>
  );
}

function RecoCard({ text, index }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px", background: C.onyxLight, border: `1px solid ${C.onyxBorder}`, borderLeft: `3px solid ${C.violet}`, borderRadius: "0 10px 10px 0", marginBottom: 8 }}>
      <div style={{ minWidth: 22, height: 22, background: C.violetDim, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: C.violetBright }}>{index + 1}</div>
      <span style={{ fontSize: 12, color: C.linenDim, lineHeight: 1.6 }}>{text}</span>
    </div>
  );
}

function BrowserFrame({ url, screenshot }) {
  return (
    <div style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${C.onyxBorder}`, marginBottom: 16 }}>
      <div style={{ padding: "12px 16px", background: C.onyxLight, borderBottom: `1px solid ${C.onyxBorder}`, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#E8453C" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#E89B3C" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#3CB87A" }} />
        </div>
        <div style={{ fontSize: 11, color: C.linenMuted, flex: 1, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</div>
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: C.violetBright, textDecoration: "none" }}>↗</a>
      </div>
      {screenshot && <img src={screenshot} alt="Captura del sitio" style={{ width: "100%", display: "block" }} />}
    </div>
  );
}

// Exportar PDF usando ventana de impresión del navegador
function exportPDF(result, siteUrl) {
  const col = (s) => s >= 80 ? "#3CB87A" : s >= 55 ? "#E89B3C" : "#E8453C";
  const lbl = (s) => s >= 80 ? "Excelente" : s >= 65 ? "Bueno" : s >= 50 ? "Regular" : "Crítico";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reporte Chroma — ${siteUrl}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; background: #fff; color: #1a1a1a; padding: 40px; }
        .header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; border-bottom: 2px solid #7B35D4; padding-bottom: 20px; }
        .logo { width: 44px; height: 44px; background: linear-gradient(135deg, #4A1D8C, #9B55F4); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 20px; }
        .brand h1 { font-size: 22px; font-weight: 700; color: #1a1a1a; }
        .brand p { font-size: 11px; color: #888; letter-spacing: 0.1em; text-transform: uppercase; }
        .url { font-size: 13px; color: #7B35D4; margin-bottom: 24px; }
        .score-section { display: flex; align-items: center; gap: 24px; background: #f8f8fc; border-radius: 16px; padding: 24px; margin-bottom: 24px; }
        .score-circle { width: 100px; height: 100px; border-radius: 50%; border: 8px solid; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
        .score-num { font-size: 36px; font-weight: 900; line-height: 1; }
        .score-lbl { font-size: 11px; color: #888; margin-top: 2px; }
        .summary { font-size: 16px; font-weight: 600; color: #1a1a1a; line-height: 1.4; }
        .section-title { font-size: 11px; color: #888; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; font-weight: 600; }
        .section { background: #f8f8fc; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
        .bar-row { margin-bottom: 12px; }
        .bar-label { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px; }
        .bar-track { height: 4px; background: #e0e0e0; border-radius: 2px; }
        .bar-fill { height: 100%; border-radius: 2px; }
        .issue { display: flex; align-items: flex-start; gap: 10px; padding: 10px 14px; border-radius: 8px; margin-bottom: 8px; font-size: 12px; }
        .reco { display: flex; align-items: flex-start; gap: 10px; padding: 10px 14px; border-left: 3px solid #7B35D4; background: #f0ebfa; border-radius: 0 8px 8px 0; margin-bottom: 8px; font-size: 12px; }
        .reco-num { background: #4A1D8C; color: #9B55F4; border-radius: 5px; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; flex-shrink: 0; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .screenshot { width: 100%; border-radius: 8px; margin-bottom: 24px; border: 1px solid #e0e0e0; }
        .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 16px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">C</div>
        <div class="brand">
          <h1>Chroma</h1>
          <p>Laboratorio de Identidad Visual</p>
        </div>
      </div>
      <div class="url">🔗 ${siteUrl}</div>
      ${result.screenshot ? `<img src="${result.screenshot}" class="screenshot" alt="Captura del sitio" />` : ""}
      <div class="score-section">
        <div class="score-circle" style="border-color: ${col(result.score)};">
          <div class="score-num" style="color: ${col(result.score)};">${result.score}</div>
          <div class="score-lbl">${lbl(result.score)}</div>
        </div>
        <div>
          <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px;">Score de Identidad Visual</div>
          <div class="summary">${result.summary}</div>
        </div>
      </div>
      <div class="section">
        <div class="section-title">Breakdown por Categoría</div>
        ${Object.entries(result.breakdown).map(([k, v]) => `
          <div class="bar-row">
            <div class="bar-label"><span>${catLabels[k] || k} · ${catWeights[k]}% peso</span><span style="color:${col(v)};font-weight:700;">${v}</span></div>
            <div class="bar-track"><div class="bar-fill" style="width:${v}%;background:${col(v)};"></div></div>
          </div>
        `).join("")}
      </div>
      <div class="two-col">
        <div class="section">
          <div class="section-title">Problemas detectados</div>
          ${result.issues?.length > 0 ? result.issues.map(i => `
            <div class="issue" style="background:${i.severity==="error"?"rgba(232,69,60,0.07)":"rgba(232,155,60,0.07)"};border:1px solid ${i.severity==="error"?"rgba(232,69,60,0.2)":"rgba(232,155,60,0.2)"};">
              ${i.severity === "error" ? "❌" : "⚠️"} ${i.label}
            </div>
          `).join("") : "<p style='font-size:12px;color:#888;'>Sin problemas críticos ✓</p>"}
        </div>
        <div class="section">
          <div class="section-title">Recomendaciones</div>
          ${result.recommendations?.map((r, i) => `
            <div class="reco">
              <div class="reco-num">${i+1}</div>
              <span>${r}</span>
            </div>
          `).join("")}
        </div>
      </div>
      <div class="footer">Reporte generado por Chroma · Laboratorio de Identidad Visual · ${new Date().toLocaleDateString("es-AR")}</div>
    </body>
    </html>
  `;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.print(); };
}

export default function App() {
  const [mode, setMode]           = useState("single"); // "single" | "compare"
  const [phase, setPhase]         = useState("upload");
  const [siteUrl, setSiteUrl]     = useState("");
  const [siteUrl2, setSiteUrl2]   = useState("");
  const [result, setResult]       = useState(null);
  const [result2, setResult2]     = useState(null);
  const [errMsg, setErrMsg]       = useState("");
  const [progress, setProgress]   = useState(0);
  const timerRef = useRef();

  const reset = () => {
    setPhase("upload");
    setSiteUrl(""); setSiteUrl2("");
    setResult(null); setResult2(null);
    setErrMsg(""); setProgress(0);
  };

  const startProgress = () => {
    setProgress(0); let p = 0;
    timerRef.current = setInterval(() => {
      p += Math.random() * 4;
      if (p > 85) { clearInterval(timerRef.current); p = 85; }
      setProgress(Math.round(p));
    }, 400);
  };

  const analyze = async () => {
    if (!siteUrl) return;
    if (mode === "compare" && !siteUrl2) return;
    setPhase("analyzing");
    startProgress();
    try {
      const fetchAnalysis = (url) => fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteUrl: url }),
      }).then(r => r.json()).then(j => { if (j.error) throw new Error(j.error); return j; });

      if (mode === "compare") {
        const [r1, r2] = await Promise.all([fetchAnalysis(siteUrl), fetchAnalysis(siteUrl2)]);
        clearInterval(timerRef.current); setProgress(100);
        await new Promise(r => setTimeout(r, 400));
        setResult(r1); setResult2(r2);
      } else {
        const r1 = await fetchAnalysis(siteUrl);
        clearInterval(timerRef.current); setProgress(100);
        await new Promise(r => setTimeout(r, 400));
        setResult(r1);
      }
      setPhase("result");
    } catch (e) {
      clearInterval(timerRef.current);
      setErrMsg(e.message); setPhase("error");
    }
  };

  return (
    <div style={{ background: C.onyx, minHeight: "100vh", fontFamily: FONT_BODY, color: C.linen, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px" }}>

      {/* HEADER */}
      <div style={{ width: "100%", maxWidth: mode === "compare" && phase === "result" ? 1200 : 660, padding: "36px 0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.onyxBorder}`, marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, background: `linear-gradient(135deg, ${C.violetDim}, ${C.violetBright})`, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: C.linen, boxShadow: `0 0 18px ${C.violetGlow}` }}>C</div>
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" }}>Chroma</div>
            <div style={{ fontSize: 10, color: C.linenMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: -2 }}>Laboratorio de Identidad</div>
          </div>
        </div>
        {phase === "result" && (
          <div style={{ display: "flex", gap: 10 }}>
            {mode === "single" && result && (
              <button onClick={() => exportPDF(result, siteUrl)} style={{ ...btn(true), padding: "7px 16px", fontSize: 12 }}>⬇ Exportar PDF</button>
            )}
            <button onClick={reset} style={{ background: "transparent", border: `1px solid ${C.onyxBorder}`, borderRadius: 100, padding: "7px 18px", color: C.linenMuted, fontSize: 12, cursor: "pointer" }}>← Nuevo análisis</button>
          </div>
        )}
      </div>

      {/* UPLOAD */}
      {phase === "upload" && (
        <div style={card}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8, lineHeight: 1.2 }}>Analizá tu identidad visual</h1>
            <p style={{ fontSize: 14, color: C.linenMuted, lineHeight: 1.7 }}>Pegá la URL de un sitio web y recibí un diagnóstico claro en segundos.</p>
          </div>

          {/* Modo selector */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, background: C.onyx, borderRadius: 12, padding: 4 }}>
            {["single", "compare"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "none", background: mode === m ? C.onyxLight : "transparent", color: mode === m ? C.linen : C.linenMuted, fontSize: 13, fontWeight: mode === m ? 600 : 400, cursor: "pointer", transition: "all 0.2s" }}>
                {m === "single" ? "Análisis simple" : "Comparar sitios"}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 12 }}>
            <input type="text" placeholder="https://ejemplo.com" value={siteUrl} onChange={e => setSiteUrl(e.target.value)}
              style={{ width: "100%", padding: "14px 16px", background: C.onyx, border: `1px solid ${siteUrl ? C.violet : C.onyxBorder}`, borderRadius: 12, color: C.linen, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: FONT_BODY, transition: "border 0.2s" }} />
          </div>

          {mode === "compare" && (
            <div style={{ marginBottom: 12 }}>
              <input type="text" placeholder="https://competidor.com" value={siteUrl2} onChange={e => setSiteUrl2(e.target.value)}
                style={{ width: "100%", padding: "14px 16px", background: C.onyx, border: `1px solid ${siteUrl2 ? C.violet : C.onyxBorder}`, borderRadius: 12, color: C.linen, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: FONT_BODY, transition: "border 0.2s" }} />
            </div>
          )}

          <button onClick={analyze}
            disabled={!siteUrl.startsWith("http") || (mode === "compare" && !siteUrl2.startsWith("http"))}
            style={{ ...btn(), width: "100%", padding: 16, marginTop: 4, opacity: (siteUrl.startsWith("http") && (mode === "single" || siteUrl2.startsWith("http"))) ? 1 : 0.4 }}
            onMouseEnter={e => e.target.style.transform = "translateY(-1px)"}
            onMouseLeave={e => e.target.style.transform = "translateY(0)"}>
            {mode === "compare" ? "Comparar sitios →" : "Analizar identidad visual →"}
          </button>

          <div style={{ marginTop: 20, padding: "12px 16px", background: C.onyx, border: `1px solid ${C.onyxBorder}`, borderRadius: 10, textAlign: "center" }}>
            <span style={{ fontSize: 12, color: C.linenMuted, fontStyle: "italic" }}>"Pegá la URL de tu sitio. Entendé qué está mal. Mejoralo."</span>
          </div>
        </div>
      )}

      {/* ANALYZING */}
      {phase === "analyzing" && (
        <div style={{ ...card, textAlign: "center" }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, marginBottom: 10 }}>
            {mode === "compare" ? "Comparando sitios..." : "Capturando y analizando el sitio"}
          </div>
          <p style={{ fontSize: 13, color: C.linenMuted, marginBottom: 8 }}>{siteUrl}{mode === "compare" && ` vs ${siteUrl2}`}</p>
          <p style={{ fontSize: 13, color: C.linenMuted, marginBottom: 32 }}>Evaluando color, tipografía, composición, consistencia y jerarquía…</p>
          <div style={{ height: 3, background: C.onyxBorder, borderRadius: 2, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${C.violetDim}, ${C.violetBright})`, borderRadius: 2, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ fontSize: 12, color: C.linenMuted, marginBottom: 28 }}>{progress}%</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            {Object.keys(catLabels).map((k, i) => (
              <div key={k} style={{ padding: "5px 12px", borderRadius: 100, fontSize: 11, border: `1px solid ${progress > i * 18 ? C.violet : C.onyxBorder}`, background: progress > i * 18 ? C.violetGlow : "transparent", color: progress > i * 18 ? C.violetBright : C.linenMuted, transition: "all 0.4s" }}>{catLabels[k]}</div>
            ))}
          </div>
        </div>
      )}

      {/* RESULT — SINGLE */}
      {phase === "result" && result && mode === "single" && (
        <div style={{ width: "100%", maxWidth: 660 }}>
          <BrowserFrame url={siteUrl} screenshot={result.screenshot} />
          <div style={{ ...card, background: `linear-gradient(135deg, ${C.onyxLight}, #0F0F18)`, display: "flex", gap: 28, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
            <ScoreRing score={result.score} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 11, color: C.linenMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>Score de Identidad Visual</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, lineHeight: 1.35, color: C.linen, marginBottom: 8 }}>{result.summary}</div>
              <div style={{ fontSize: 12, color: C.linenMuted }}>{siteUrl}</div>
            </div>
          </div>
          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: C.linenMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>Breakdown por Categoría</div>
            {Object.entries(result.breakdown).map(([k, v]) => (
              <CategoryBar key={k} label={`${catLabels[k] || k}  ·  ${catWeights[k]}% peso`} value={v} />
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 16 }}>
            <div style={card}>
              <div style={{ fontSize: 11, color: C.linenMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Problemas detectados</div>
              {result.issues?.length > 0 ? result.issues.map((iss, i) => <IssueTag key={i} issue={iss} />) : <div style={{ fontSize: 13, color: C.linenMuted }}>Sin problemas críticos ✓</div>}
            </div>
            <div style={card}>
              <div style={{ fontSize: 11, color: C.linenMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Recomendaciones</div>
              {result.recommendations?.map((r, i) => <RecoCard key={i} text={r} index={i} />)}
            </div>
          </div>
          <div style={{ ...card, textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 13, color: C.linenMuted, marginBottom: 16 }}>¿Aplicaste mejoras? Analizá la nueva versión para ver tu progreso.</div>
            <button onClick={reset} style={{ ...btn(), padding: "13px 32px" }} onMouseEnter={e => e.target.style.transform = "translateY(-1px)"} onMouseLeave={e => e.target.style.transform = "translateY(0)"}>↺ Re-analizar</button>
          </div>
        </div>
      )}

      {/* RESULT — COMPARE */}
      {phase === "result" && result && result2 && mode === "compare" && (
        <div style={{ width: "100%", maxWidth: 1200 }}>
          {/* Winner banner */}
          <div style={{ ...card, maxWidth: 1200, textAlign: "center", background: `linear-gradient(135deg, ${C.onyxLight}, #0F0F18)`, marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: C.linenMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>Resultado de la comparación</div>
            {result.score !== result2.score ? (
              <>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: C.linen, marginBottom: 6 }}>
                  {result.score > result2.score ? "🏆 Gana el sitio 1" : "🏆 Gana el sitio 2"}
                </div>
                <div style={{ fontSize: 13, color: C.linenMuted }}>
                  {result.score > result2.score ? siteUrl : siteUrl2} supera por {Math.abs(result.score - result2.score)} puntos
                </div>
              </>
            ) : (
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: C.linen }}>🤝 Empate — Ambos sitios tienen el mismo score</div>
            )}
          </div>

          {/* Comparación lado a lado */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            {[{ r: result, url: siteUrl, label: "Sitio 1" }, { r: result2, url: siteUrl2, label: "Sitio 2" }].map(({ r, url, label }) => (
              <div key={url}>
                <div style={{ fontSize: 11, color: C.linenMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>{label}</div>
                <BrowserFrame url={url} screenshot={r.screenshot} />
                <div style={{ background: C.onyxLight, border: `1px solid ${C.onyxBorder}`, borderRadius: 16, padding: "20px 20px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                    <ScoreRing score={r.score} size={100} />
                    <div>
                      <div style={{ fontSize: 11, color: C.linenMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Score</div>
                      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 700, color: C.linen, lineHeight: 1.4 }}>{r.summary}</div>
                    </div>
                  </div>
                  {Object.entries(r.breakdown).map(([k, v]) => (
                    <CategoryBar key={k} label={`${catLabels[k] || k}`} value={v} compact />
                  ))}
                  <div style={{ marginTop: 14, borderTop: `1px solid ${C.onyxBorder}`, paddingTop: 14 }}>
                    <div style={{ fontSize: 11, color: C.linenMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Problemas</div>
                    {r.issues?.length > 0 ? r.issues.map((iss, i) => <IssueTag key={i} issue={iss} />) : <div style={{ fontSize: 12, color: C.linenMuted }}>Sin problemas críticos ✓</div>}
                  </div>
                  <div style={{ marginTop: 14, borderTop: `1px solid ${C.onyxBorder}`, paddingTop: 14 }}>
                    <div style={{ fontSize: 11, color: C.linenMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Recomendaciones</div>
                    {r.recommendations?.map((rec, i) => <RecoCard key={i} text={rec} index={i} />)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ ...card, maxWidth: 1200, textAlign: "center", marginBottom: 40 }}>
            <button onClick={reset} style={{ ...btn(), padding: "13px 32px" }} onMouseEnter={e => e.target.style.transform = "translateY(-1px)"} onMouseLeave={e => e.target.style.transform = "translateY(0)"}>↺ Nueva comparación</button>
          </div>
        </div>
      )}

      {/* ERROR */}
      {phase === "error" && (
        <div style={{ ...card, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Algo salió mal</div>
          <div style={{ fontSize: 13, color: C.linenMuted, marginBottom: 24, lineHeight: 1.6 }}>{errMsg || "No pudimos analizar el sitio. Intentá de nuevo."}</div>
          <button onClick={reset} style={{ ...btn(), padding: "12px 28px" }}>Volver a intentar</button>
        </div>
      )}

      <div style={{ fontSize: 11, color: C.linenMuted, letterSpacing: "0.08em", textAlign: "center", paddingBottom: 24 }}>
        CHROMA © 2025 · Laboratorio de Identidad Visual
      </div>
    </div>
  );
}
