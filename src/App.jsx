import { useState, useRef, useCallback } from "react";

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

function toBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function ScoreRing({ score }) {
  const r = 54, circ = 2 * Math.PI * r, dash = (score / 100) * circ, col = scoreColor(score);
  return (
    <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
      <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke={C.onyxBorder} strokeWidth="8" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={col} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }} />
        <circle cx="70" cy="70" r={r} fill="none" stroke={col} strokeWidth="2" opacity="0.3"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ filter: "blur(3px)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 38, fontWeight: 900, fontFamily: FONT_DISPLAY, color: col, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 11, color: C.linenMuted, letterSpacing: "0.12em", marginTop: 2 }}>{scoreLabel(score)}</div>
      </div>
    </div>
  );
}

function CategoryBar({ label, value }) {
  const col = scoreColor(value);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
        <span style={{ fontSize: 12, color: C.linenDim, letterSpacing: "0.06em" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: col }}>{value}</span>
      </div>
      <div style={{ height: 4, background: C.onyxBorder, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 2, width: `${value}%`, background: `linear-gradient(90deg, ${col}99, ${col})`, boxShadow: `0 0 6px ${col}66`, transition: "width 1s cubic-bezier(.4,0,.2,1)" }} />
      </div>
    </div>
  );
}

function IssueTag({ issue }) {
  const isError = issue.severity === "error";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: isError ? "rgba(232,69,60,0.07)" : "rgba(232,155,60,0.07)", border: `1px solid ${isError ? "rgba(232,69,60,0.2)" : "rgba(232,155,60,0.2)"}`, borderRadius: 10, marginBottom: 8 }}>
      <span style={{ fontSize: 15 }}>{isError ? "❌" : "⚠️"}</span>
      <span style={{ fontSize: 13, color: C.linenDim, lineHeight: 1.5 }}>{issue.label}</span>
    </div>
  );
}

function RecoCard({ text, index }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 16px", background: C.onyxLight, border: `1px solid ${C.onyxBorder}`, borderLeft: `3px solid ${C.violet}`, borderRadius: "0 10px 10px 0", marginBottom: 10 }}>
      <div style={{ minWidth: 24, height: 24, background: C.violetDim, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: C.violetBright }}>{index + 1}</div>
      <span style={{ fontSize: 13, color: C.linenDim, lineHeight: 1.65 }}>{text}</span>
    </div>
  );
}

export default function App() {
  const [phase, setPhase]       = useState("upload");
  const [imgFile, setImgFile]   = useState(null);
  const [imgUrl, setImgUrl]     = useState(null);
  const [result, setResult]     = useState(null);
  const [errMsg, setErrMsg]     = useState("");
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef  = useRef();
  const timerRef = useRef();

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImgFile(file);
    setImgUrl(URL.createObjectURL(file));
  }, []);

  const onDrop = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); };

  const startProgress = () => {
    setProgress(0);
    let p = 0;
    timerRef.current = setInterval(() => {
      p += Math.random() * 7;
      if (p > 88) { clearInterval(timerRef.current); p = 88; }
      setProgress(Math.round(p));
    }, 300);
  };

  const analyze = async () => {
    if (!imgFile) return;
    setPhase("analyzing");
    startProgress();
    try {
      const imageData = await toBase64(imgFile);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData, mediaType: imgFile.type }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error del servidor");
      clearInterval(timerRef.current);
      setProgress(100);
      await new Promise(r => setTimeout(r, 400));
      setResult(json);
      setPhase("result");
    } catch (e) {
      clearInterval(timerRef.current);
      setErrMsg(e.message);
      setPhase("error");
    }
  };

  const reset = () => {
    setPhase("upload"); setImgFile(null); setImgUrl(null);
    setResult(null); setErrMsg(""); setProgress(0);
  };

  const card = { background: C.onyxLight, border: `1px solid ${C.onyxBorder}`, borderRadius: 20, padding: 32, width: "100%", maxWidth: 660, boxSizing: "border-box" };
  const btn  = (extra = {}) => ({ border: "none", borderRadius: 12, color: C.linen, fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: "0.02em", background: `linear-gradient(135deg, ${C.violetDim}, ${C.violet})`, boxShadow: `0 4px 20px ${C.violetGlow}`, transition: "transform 0.15s", ...extra });

  return (
    <div style={{ background: C.onyx, minHeight: "100vh", fontFamily: FONT_BODY, color: C.linen, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px" }}>

      {/* HEADER */}
      <div style={{ width: "100%", maxWidth: 660, padding: "36px 0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.onyxBorder}`, marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, background: `linear-gradient(135deg, ${C.violetDim}, ${C.violetBright})`, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: C.linen, boxShadow: `0 0 18px ${C.violetGlow}` }}>C</div>
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" }}>Chroma</div>
            <div style={{ fontSize: 10, color: C.linenMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: -2 }}>Laboratorio de Identidad</div>
          </div>
        </div>
        {phase === "result" && (
          <button onClick={reset} style={{ background: "transparent", border: `1px solid ${C.onyxBorder}`, borderRadius: 100, padding: "7px 18px", color: C.linenMuted, fontSize: 12, cursor: "pointer" }}>← Nueva imagen</button>
        )}
      </div>

      {/* UPLOAD */}
      {phase === "upload" && (
        <div style={card}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8, lineHeight: 1.2 }}>Analizá tu identidad visual</h1>
            <p style={{ fontSize: 14, color: C.linenMuted, lineHeight: 1.7 }}>Subí una pieza de diseño y recibí un diagnóstico claro en segundos.</p>
          </div>

          <div
            onClick={() => fileRef.current.click()}
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            style={{ border: `2px dashed ${dragging ? C.violet : imgUrl ? C.violetDim : C.onyxBorder}`, borderRadius: 16, background: dragging ? C.violetGlow : imgUrl ? "rgba(123,53,212,0.05)" : "transparent", padding: imgUrl ? 0 : "52px 32px", textAlign: "center", cursor: "pointer", transition: "all 0.25s", overflow: "hidden", minHeight: imgUrl ? 220 : "auto", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}
          >
            {imgUrl ? (
              <>
                <img src={imgUrl} alt="preview" style={{ maxHeight: 320, maxWidth: "100%", objectFit: "contain", display: "block" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(12,12,15,0.6)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                  <span style={{ fontSize: 13, color: C.linen, background: C.onyxLight, padding: "8px 18px", borderRadius: 100, border: `1px solid ${C.onyxBorder}` }}>Cambiar imagen</span>
                </div>
              </>
            ) : (
              <div>
                <div style={{ fontSize: 36, marginBottom: 16 }}>◈</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.linen, marginBottom: 6 }}>Arrastrá o hacé click para subir</div>
                <div style={{ fontSize: 12, color: C.linenMuted }}>PNG, JPG, WEBP · Hasta 10 MB</div>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />

          {imgUrl && (
            <button onClick={analyze} style={{ ...btn(), width: "100%", marginTop: 20, padding: 16 }}
              onMouseEnter={e => e.target.style.transform = "translateY(-1px)"}
              onMouseLeave={e => e.target.style.transform = "translateY(0)"}>
              Analizar identidad visual →
            </button>
          )}

          <div style={{ marginTop: 24, padding: "14px 18px", background: C.onyx, border: `1px solid ${C.onyxBorder}`, borderRadius: 10, textAlign: "center" }}>
            <span style={{ fontSize: 12, color: C.linenMuted, fontStyle: "italic" }}>"Subí tu diseño. Entendé qué está mal. Mejoralo."</span>
          </div>
        </div>
      )}

      {/* ANALYZING */}
      {phase === "analyzing" && (
        <div style={{ ...card, textAlign: "center" }}>
          {imgUrl && <div style={{ width: 80, height: 80, margin: "0 auto 28px", borderRadius: 14, overflow: "hidden", border: `1px solid ${C.onyxBorder}` }}><img src={imgUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>}
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Analizando tu identidad visual</div>
          <p style={{ fontSize: 13, color: C.linenMuted, marginBottom: 32 }}>Evaluando color, tipografía, composición, consistencia y jerarquía…</p>
          <div style={{ height: 3, background: C.onyxBorder, borderRadius: 2, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${C.violetDim}, ${C.violetBright})`, borderRadius: 2, transition: "width 0.4s ease", boxShadow: `0 0 8px ${C.violetGlow}` }} />
          </div>
          <div style={{ fontSize: 12, color: C.linenMuted, marginBottom: 28 }}>{progress}%</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            {Object.keys(catLabels).map((k, i) => (
              <div key={k} style={{ padding: "5px 12px", borderRadius: 100, fontSize: 11, border: `1px solid ${progress > i * 18 ? C.violet : C.onyxBorder}`, background: progress > i * 18 ? C.violetGlow : "transparent", color: progress > i * 18 ? C.violetBright : C.linenMuted, transition: "all 0.4s" }}>{catLabels[k]}</div>
            ))}
          </div>
        </div>
      )}

      {/* RESULT */}
      {phase === "result" && result && (
        <div style={{ width: "100%", maxWidth: 660 }}>
          <div style={{ ...card, background: `linear-gradient(135deg, ${C.onyxLight}, #0F0F18)`, display: "flex", gap: 28, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
            <ScoreRing score={result.score} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 11, color: C.linenMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>Score de Identidad Visual</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, lineHeight: 1.35, color: C.linen, marginBottom: 12 }}>{result.summary}</div>
              {imgUrl && <div style={{ width: 56, height: 42, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.onyxBorder}` }}><img src={imgUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>}
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
              {result.issues?.length > 0
                ? result.issues.map((iss, i) => <IssueTag key={i} issue={iss} />)
                : <div style={{ fontSize: 13, color: C.linenMuted }}>Sin problemas críticos ✓</div>}
            </div>
            <div style={card}>
              <div style={{ fontSize: 11, color: C.linenMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Recomendaciones</div>
              {result.recommendations?.map((r, i) => <RecoCard key={i} text={r} index={i} />)}
            </div>
          </div>

          <div style={{ ...card, textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 13, color: C.linenMuted, marginBottom: 16 }}>¿Aplicaste mejoras? Subí la nueva versión para ver tu progreso.</div>
            <button onClick={reset} style={{ ...btn(), padding: "13px 32px" }}
              onMouseEnter={e => e.target.style.transform = "translateY(-1px)"}
              onMouseLeave={e => e.target.style.transform = "translateY(0)"}>
              ↺ Re-analizar
            </button>
          </div>
        </div>
      )}

      {/* ERROR */}
      {phase === "error" && (
        <div style={{ ...card, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Algo salió mal</div>
          <div style={{ fontSize: 13, color: C.linenMuted, marginBottom: 24, lineHeight: 1.6 }}>{errMsg || "No pudimos analizar la imagen. Intentá de nuevo."}</div>
          <button onClick={reset} style={{ ...btn(), padding: "12px 28px" }}>Volver a intentar</button>
        </div>
      )}

      <div style={{ fontSize: 11, color: C.linenMuted, letterSpacing: "0.08em", textAlign: "center", paddingBottom: 24 }}>
        CHROMA © 2025 · Laboratorio de Identidad Visual
      </div>
    </div>
  );
}
