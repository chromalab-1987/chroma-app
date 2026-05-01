import { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const FREE_LIMIT = 3;

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
  const isCritical = issue.severity === "critical" || issue.severity === "error";
  const isMinor = issue.severity === "minor";
  const bg = isCritical ? "rgba(232,69,60,0.07)" : isMinor ? "rgba(60,184,122,0.07)" : "rgba(232,155,60,0.07)";
  const border = isCritical ? "rgba(232,69,60,0.2)" : isMinor ? "rgba(60,184,122,0.2)" : "rgba(232,155,60,0.2)";
  const icon = isCritical ? "❌" : isMinor ? "💡" : "⚠️";
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", background: bg, border: `1px solid ${border}`, borderRadius: 10, marginBottom: 8 }}>
      <span style={{ fontSize: 13, marginTop: 1 }}>{icon}</span>
      <div>
        <span style={{ fontSize: 12, color: C.linenDim, lineHeight: 1.5 }}>{issue.label}</span>
        {issue.impact && <div style={{ fontSize: 10, color: C.linenMuted, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.08em" }}>{issue.impact.replace(/_/g, " ")}</div>}
      </div>
    </div>
  );
}

function RecoCard({ text, index }) {
  // Soporta tanto string como objeto {priority, action, why}
  const isObj = text && typeof text === "object";
  const action = isObj ? text.action : text;
  const why = isObj ? text.why : null;
  const priority = isObj ? text.priority : null;
  const priorityColor = priority === "high" ? C.danger : priority === "medium" ? C.warning : C.linenMuted;
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px", background: C.onyxLight, border: `1px solid ${C.onyxBorder}`, borderLeft: `3px solid ${C.violet}`, borderRadius: "0 10px 10px 0", marginBottom: 8 }}>
      <div style={{ minWidth: 22, height: 22, background: C.violetDim, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: C.violetBright, flexShrink: 0 }}>{index + 1}</div>
      <div>
        {priority && <div style={{ fontSize: 10, color: priorityColor, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3, fontWeight: 700 }}>{priority} priority</div>}
        <div style={{ fontSize: 12, color: C.linenDim, lineHeight: 1.6 }}>{action}</div>
        {why && <div style={{ fontSize: 11, color: C.linenMuted, marginTop: 4, lineHeight: 1.5, fontStyle: "italic" }}>{why}</div>}
      </div>
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

function exportPDF(result, siteUrl) {
  const col = (s) => s >= 80 ? "#3CB87A" : s >= 55 ? "#E89B3C" : "#E8453C";
  const lbl = (s) => s >= 80 ? "Excelente" : s >= 65 ? "Bueno" : s >= 50 ? "Regular" : "Crítico";
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reporte Chroma — ${siteUrl}</title>
  <style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Segoe UI',sans-serif;background:#fff;color:#1a1a1a;padding:40px;}
  .header{display:flex;align-items:center;gap:16px;margin-bottom:32px;border-bottom:2px solid #7B35D4;padding-bottom:20px;}
  .logo{width:44px;height:44px;background:linear-gradient(135deg,#4A1D8C,#9B55F4);border-radius:12px;display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:20px;}
  .score-section{display:flex;align-items:center;gap:24px;background:#f8f8fc;border-radius:16px;padding:24px;margin-bottom:24px;}
  .score-circle{width:100px;height:100px;border-radius:50%;border:8px solid;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;}
  .section{background:#f8f8fc;border-radius:12px;padding:20px;margin-bottom:20px;}
  .section-title{font-size:11px;color:#888;letter-spacing:.12em;text-transform:uppercase;margin-bottom:16px;font-weight:600;}
  .bar-row{margin-bottom:12px;}.bar-label{display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px;}
  .bar-track{height:4px;background:#e0e0e0;border-radius:2px;}.bar-fill{height:100%;border-radius:2px;}
  .issue{display:flex;align-items:flex-start;gap:10px;padding:10px 14px;border-radius:8px;margin-bottom:8px;font-size:12px;}
  .reco{display:flex;align-items:flex-start;gap:10px;padding:10px 14px;border-left:3px solid #7B35D4;background:#f0ebfa;border-radius:0 8px 8px 0;margin-bottom:8px;font-size:12px;}
  .reco-num{background:#4A1D8C;color:#9B55F4;border-radius:5px;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;flex-shrink:0;}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
  .screenshot{width:100%;border-radius:8px;margin-bottom:24px;border:1px solid #e0e0e0;}
  .footer{margin-top:32px;text-align:center;font-size:11px;color:#aaa;border-top:1px solid #eee;padding-top:16px;}
  </style></head><body>
  <div class="header"><div class="logo">C</div><div><h1 style="font-size:22px;font-weight:700;">Chroma</h1><p style="font-size:11px;color:#888;letter-spacing:.1em;text-transform:uppercase;">Laboratorio de Identidad Visual</p></div></div>
  <div style="font-size:13px;color:#7B35D4;margin-bottom:24px;">🔗 ${siteUrl}</div>
  ${result.screenshot ? `<img src="${result.screenshot}" class="screenshot" alt="Captura" />` : ""}
  <div class="score-section">
    <div class="score-circle" style="border-color:${col(result.score)};">
      <div style="font-size:36px;font-weight:900;color:${col(result.score)};">${result.score}</div>
      <div style="font-size:11px;color:#888;">${lbl(result.score)}</div>
    </div>
    <div><div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px;">Score de Identidad Visual</div><div style="font-size:16px;font-weight:600;">${result.summary}</div></div>
  </div>
  <div class="section"><div class="section-title">Breakdown por Categoría</div>
  ${Object.entries(result.breakdown).map(([k,v])=>`<div class="bar-row"><div class="bar-label"><span>${catLabels[k]||k} · ${catWeights[k]}% peso</span><span style="color:${col(v)};font-weight:700;">${v}</span></div><div class="bar-track"><div class="bar-fill" style="width:${v}%;background:${col(v)};"></div></div></div>`).join("")}
  </div>
  <div class="two-col">
    ${result.first_impression?`<div class="section" style="grid-column:1/-1"><div class="section-title">Primera impresión (5 segundos)</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:12px;">${[{l:"¿Qué es?",v:result.first_impression.what},{l:"¿Para quién?",v:result.first_impression.who},{l:"¿Qué hacer?",v:result.first_impression.action}].map(x=>`<div style="padding:10px;background:#f0f0f8;border-radius:8px;"><div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;">${x.l}</div><div style="font-size:12px;">${x.v}</div></div>`).join("")}</div><div style="font-size:12px;">Veredicto: <strong style="color:${result.first_impression.verdict==="claro"?"#3CB87A":"#E8453C"}">${result.first_impression.verdict}</strong></div></div>`:""}
    ${result.brand_gap&&result.brand_gap!=="ninguna detectada"?`<div class="section" style="grid-column:1/-1;border-left:3px solid #E89B3C;"><div class="section-title">Brecha de marca detectada</div><div style="font-size:13px;">⚠️ ${result.brand_gap}</div></div>`:""}
    <div class="section"><div class="section-title">Problemas detectados</div>
    ${result.issues?.length>0?result.issues.map(i=>`<div class="issue" style="background:${i.severity==="error"?"rgba(232,69,60,0.07)":"rgba(232,155,60,0.07)"};border:1px solid ${i.severity==="error"?"rgba(232,69,60,0.2)":"rgba(232,155,60,0.2)"};">${i.severity==="error"?"❌":"⚠️"} ${i.label}</div>`).join(""):"<p style='font-size:12px;color:#888;'>Sin problemas críticos ✓</p>"}
    </div>
    <div class="section"><div class="section-title">Recomendaciones</div>
    ${result.recommendations?.map((r,i)=>{const isObj=r&&typeof r==="object";const action=isObj?r.action:r;const why=isObj?r.why:null;const priority=isObj?r.priority:null;const pColor=priority==="high"?"#E8453C":priority==="medium"?"#E89B3C":"#888";return`<div class="reco"><div class="reco-num">${i+1}</div><div>${priority?`<div style="font-size:10px;color:${pColor};text-transform:uppercase;letter-spacing:.08em;font-weight:700;margin-bottom:3px;">${priority} priority</div>`:""}${action}${why?`<div style="font-size:11px;color:#888;margin-top:4px;font-style:italic;">${why}</div>`:""}</div></div>`}).join("")}
    </div>
  </div>
  <div class="footer">Reporte generado por Chroma · ${new Date().toLocaleDateString("es-AR")}</div>
  </body></html>`;
  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  win.onload = () => win.print();
}

export default function App() {
  const [user, setUser]           = useState(null);
  const [usageCount, setUsageCount] = useState(0);
  const [history, setHistory]     = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [userPlan, setUserPlan] = useState("free");
  const [mode, setMode]           = useState("single");
  const [phase, setPhase]         = useState("upload");
  const [siteUrl, setSiteUrl]     = useState("");
  const [siteUrl2, setSiteUrl2]   = useState("");
  const [result, setResult]       = useState(null);
  const [result2, setResult2]     = useState(null);
  const [errMsg, setErrMsg]       = useState("");
  const [progress, setProgress]   = useState(0);
  const timerRef = useRef();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadUsage(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadUsage(session.user.id);
      else { setUsageCount(0); setHistory([]); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const ADMIN_EMAIL = "labid.chroma@gmail.com";
  const isAdmin = () => user?.email === ADMIN_EMAIL;

  const loadAdminUsers = async () => {
    setAdminLoading(true);
    // Cargar todos los usuarios con sus planes y cantidad de análisis este mes
    const startOfMonth = new Date();
    startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);

    const { data: plans } = await supabase.from("user_plans").select("user_id, plan, updated_at");
    const { data: analyses } = await supabase.from("analyses").select("user_id, created_at").gte("created_at", startOfMonth.toISOString());

    // Agrupar análisis por usuario
    const countByUser = {};
    analyses?.forEach(a => { countByUser[a.user_id] = (countByUser[a.user_id] || 0) + 1; });

    const users = plans?.map(p => ({ ...p, analysisCount: countByUser[p.user_id] || 0 })) || [];
    setAdminUsers(users);
    setAdminLoading(false);
  };

  const updateUserPlan = async (userId, newPlan) => {
    await supabase.from("user_plans").upsert({ user_id: userId, plan: newPlan, updated_at: new Date().toISOString() });
    await loadAdminUsers();
  };

  const PLAN_LIMITS = { free: 3, pro: 20, agency: Infinity };

  const loadUsage = async (uid) => {
    // Cargar plan del usuario
    const { data: planData } = await supabase.from("user_plans").select("plan").eq("user_id", uid).single();
    const plan = planData?.plan || "free";
    setUserPlan(plan);

    // Cargar conteo del mes actual (separado del historial)
    const startOfMonth = new Date();
    startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
    const { count } = await supabase.from("analyses").select("*", { count: "exact", head: true }).eq("user_id", uid).gte("created_at", startOfMonth.toISOString());
    setUsageCount(count || 0);

    // Historial completo según plan
    if (plan === "free") {
      setHistory([]);
    } else if (plan === "pro") {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const { data: histData } = await supabase.from("analyses").select("*").eq("user_id", uid).gte("created_at", thirtyDaysAgo.toISOString()).order("created_at", { ascending: false }).limit(500);
      setHistory(histData || []);
    } else {
      const { data: histData } = await supabase.from("analyses").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(500);
      setHistory(histData || []);
    }
  };

  const saveAnalysis = async (r, url) => {
    if (!user) return;
    try {
      const row = {
        user_id: user.id,
        site_url: url,
        score: r.score,
        breakdown: r.breakdown,
        issues: r.issues,
        recommendations: r.recommendations,
        summary: r.summary,
        screenshot: r.screenshot || null,
        first_impression: r.first_impression || null,
        brand_gap: r.brand_gap || null,
      };
      const { error } = await supabase.from("analyses").insert(row);
      if (error) {
        if (error.message?.includes("first_impression") || error.message?.includes("brand_gap")) {
          const { score, breakdown, issues, recommendations, summary, screenshot } = r;
          await supabase.from("analyses").insert({ user_id: user.id, site_url: url, score, breakdown, issues, recommendations, summary, screenshot: screenshot || null });
        } else {
          console.error("saveAnalysis error:", error.message);
        }
      }
    } catch (e) {
      console.error("saveAnalysis exception:", e.message);
    }
    await loadUsage(user.id);
  };

  const loginWithGoogle = () => supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
  const logout = () => supabase.auth.signOut();

  const normalizeUrl = (url) => {
    const trimmed = url.trim();
    if (!trimmed) return trimmed;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    return 'https://' + trimmed;
  };

  const reset = () => {
    setPhase("upload"); setSiteUrl(""); setSiteUrl2("");
    setResult(null); setResult2(null); setErrMsg(""); setProgress(0);
  };

  const startProgress = () => {
    setProgress(0); let p = 0;
    timerRef.current = setInterval(() => {
      p += Math.random() * 4;
      if (p > 85) { clearInterval(timerRef.current); p = 85; }
      setProgress(Math.round(p));
    }, 400);
  };

  const planLimit = PLAN_LIMITS[userPlan] || 3;
  const canAnalyze = () => usageCount < planLimit;
  const canCompare = () => userPlan === "pro" || userPlan === "agency";
  const canExportPDF = () => userPlan === "pro" || userPlan === "agency";
  const canSeeHistory = () => userPlan === "pro" || userPlan === "agency";

  const analyze = async () => {
    if (!siteUrl) return;
    if (mode === "compare" && !siteUrl2) return;
    const normalizedUrl = normalizeUrl(siteUrl);
    const normalizedUrl2 = normalizeUrl(siteUrl2);
    setSiteUrl(normalizedUrl);
    if (mode === "compare") setSiteUrl2(normalizedUrl2);
    if (!canAnalyze()) return;
    if (mode === "compare" && !canCompare()) return;
    setPhase("analyzing");
    startProgress();
    try {
      const fetchAnalysis = (url) => fetch("/api/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteUrl: url }),
      }).then(r => r.json()).then(j => { if (j.error) throw new Error(j.error); return j; });

      if (mode === "compare") {
        const r1 = await fetchAnalysis(normalizedUrl);
        const r2 = await fetchAnalysis(normalizedUrl2);
        clearInterval(timerRef.current); setProgress(100);
        await new Promise(r => setTimeout(r, 400));
        setResult(r1); setResult2(r2);
        await saveAnalysis(r1, normalizedUrl);
        await saveAnalysis(r2, normalizedUrl2);
      } else {
        const r1 = await fetchAnalysis(normalizedUrl);
        clearInterval(timerRef.current); setProgress(100);
        await new Promise(r => setTimeout(r, 400));
        setResult(r1);
        await saveAnalysis(r1, normalizedUrl);
      }
      setPhase("result");
    } catch (e) {
      clearInterval(timerRef.current);
      setErrMsg(e.message); setPhase("error");
    }
  };

  const maxWidth = mode === "compare" && phase === "result" ? 1200 : 660;

  // Vista de detalle del historial
  if (selectedHistory) {
    const h = selectedHistory;
    return (
      <div style={{ background: C.onyx, minHeight: "100vh", fontFamily: FONT_BODY, color: C.linen, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px" }}>
        <div style={{ width: "100%", maxWidth: 660, padding: "28px 0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.onyxBorder}`, marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, background: `linear-gradient(135deg, ${C.violetDim}, ${C.violetBright})`, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: C.linen }}>C</div>
            <div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700 }}>Chroma</div>
              <div style={{ fontSize: 10, color: C.linenMuted, letterSpacing: "0.14em", textTransform: "uppercase" }}>Laboratorio de Identidad</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => exportPDF(h, h.site_url)} style={{ ...btn(true), padding: "7px 14px", fontSize: 12 }}>⬇ PDF</button>
            <button onClick={() => setSelectedHistory(null)} style={{ background: "transparent", border: `1px solid ${C.onyxBorder}`, borderRadius: 100, padding: "7px 16px", color: C.linenMuted, fontSize: 12, cursor: "pointer" }}>← Historial</button>
          </div>
        </div>
        <div style={{ width: "100%", maxWidth: 660 }}>
          <div style={{ fontSize: 11, color: C.linenMuted, marginBottom: 12 }}>Analizado el {new Date(h.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}</div>
          <BrowserFrame url={h.site_url} screenshot={h.screenshot} />
          <div style={{ ...card, background: `linear-gradient(135deg, ${C.onyxLight}, #0F0F18)`, display: "flex", gap: 28, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
            <ScoreRing score={h.score} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 11, color: C.linenMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>Score de Identidad Visual</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, lineHeight: 1.35, color: C.linen, marginBottom: 8 }}>{h.summary}</div>
              <div style={{ fontSize: 12, color: C.linenMuted }}>{h.site_url}</div>
            </div>
          </div>
          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: C.linenMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>Breakdown por Categoría</div>
            {Object.entries(h.breakdown).map(([k, v]) => <CategoryBar key={k} label={`${catLabels[k] || k}  ·  ${catWeights[k]}% peso`} value={v} />)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 16 }}>
            <div style={card}>
              <div style={{ fontSize: 11, color: C.linenMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Problemas detectados</div>
              {h.issues?.length > 0 ? h.issues.map((iss, i) => <IssueTag key={i} issue={iss} />) : <div style={{ fontSize: 13, color: C.linenMuted }}>Sin problemas críticos ✓</div>}
            </div>
            <div style={card}>
              <div style={{ fontSize: 11, color: C.linenMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Recomendaciones</div>
              {h.recommendations?.map((r, i) => <RecoCard key={i} text={r} index={i} />)}
            </div>
          </div>
          <div style={{ ...card, textAlign: "center", marginBottom: 40 }}>
            <button onClick={() => setSelectedHistory(null)} style={{ ...btn(), padding: "13px 32px" }}>← Volver al historial</button>
          </div>
        </div>
        <div style={{ fontSize: 11, color: C.linenMuted, letterSpacing: "0.08em", textAlign: "center", paddingBottom: 24 }}>CHROMA © 2025 · Laboratorio de Identidad Visual</div>
      </div>
    );
  }

  // Panel de administración
  if (showAdmin && isAdmin()) {
    return (
      <div style={{ background: C.onyx, minHeight: "100vh", fontFamily: FONT_BODY, color: C.linen, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px" }}>
        <div style={{ width: "100%", maxWidth: 800, padding: "28px 0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.onyxBorder}`, marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, background: `linear-gradient(135deg, ${C.violetDim}, ${C.violetBright})`, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: C.linen }}>C</div>
            <div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700 }}>Panel de Admin</div>
              <div style={{ fontSize: 10, color: C.linenMuted, letterSpacing: "0.14em", textTransform: "uppercase" }}>Gestión de usuarios</div>
            </div>
          </div>
          <button onClick={() => setShowAdmin(false)} style={{ background: "transparent", border: `1px solid ${C.onyxBorder}`, borderRadius: 100, padding: "7px 16px", color: C.linenMuted, fontSize: 12, cursor: "pointer" }}>← Volver</button>
        </div>

        <div style={{ width: "100%", maxWidth: 800 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: C.linenMuted }}>{adminUsers.length} usuarios registrados</div>
            <button onClick={loadAdminUsers} style={{ ...btn(), padding: "8px 16px", fontSize: 12 }}>↺ Actualizar</button>
          </div>

          {adminLoading ? (
            <div style={{ textAlign: "center", padding: 40, color: C.linenMuted }}>Cargando...</div>
          ) : adminUsers.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: C.linenMuted }}>No hay usuarios con plan asignado aún.</div>
          ) : (
            <div style={{ background: C.onyxLight, border: `1px solid ${C.onyxBorder}`, borderRadius: 16, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 160px", padding: "12px 20px", borderBottom: `1px solid ${C.onyxBorder}`, fontSize: 11, color: C.linenMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                <span>Usuario</span>
                <span>Plan actual</span>
                <span>Análisis/mes</span>
                <span>Cambiar plan</span>
              </div>
              {adminUsers.map((u) => (
                <div key={u.user_id} style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 160px", padding: "14px 20px", borderBottom: `1px solid ${C.onyxBorder}`, alignItems: "center" }}>
                  <div style={{ fontSize: 12, color: C.linenDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.user_id}</div>
                  <div>
                    <span style={{ padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700, textTransform: "uppercase", background: u.plan === "agency" ? C.violetDim : u.plan === "pro" ? "rgba(123,53,212,0.3)" : C.onyxBorder, color: u.plan === "free" ? C.linenMuted : C.violetBright }}>
                      {u.plan}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: C.linenDim }}>{u.analysisCount} / {PLAN_LIMITS[u.plan] === Infinity ? "∞" : PLAN_LIMITS[u.plan]}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["free", "pro", "agency"].map(p => (
                      <button key={p} onClick={() => updateUserPlan(u.user_id, p)}
                        style={{ padding: "4px 10px", borderRadius: 8, border: `1px solid ${u.plan === p ? C.violet : C.onyxBorder}`, background: u.plan === p ? C.violetGlow : "transparent", color: u.plan === p ? C.violetBright : C.linenMuted, fontSize: 11, cursor: "pointer", fontWeight: u.plan === p ? 700 : 400 }}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 24, padding: "16px 20px", background: C.onyxLight, border: `1px solid ${C.onyxBorder}`, borderRadius: 12 }}>
            <div style={{ fontSize: 12, color: C.linenMuted, marginBottom: 8 }}>💡 Para agregar un usuario nuevo al panel, primero debe loguearse en la app al menos una vez y hacer un análisis.</div>
            <div style={{ fontSize: 12, color: C.linenMuted }}>Los planes se renuevan automáticamente el 1 de cada mes.</div>
          </div>
        </div>

        <div style={{ fontSize: 11, color: C.linenMuted, letterSpacing: "0.08em", textAlign: "center", paddingBottom: 24, marginTop: 32 }}>CHROMA © 2025 · Laboratorio de Identidad Visual</div>
      </div>
    );
  }

  // Pantalla de login obligatorio
  if (!user) {
    return (
      <div style={{ background: C.onyx, minHeight: "100vh", fontFamily: FONT_BODY, color: C.linen, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 16px" }}>
        <div style={{ width: "100%", maxWidth: 480, textAlign: "center" }}>
          <div style={{ width: 64, height: 64, background: `linear-gradient(135deg, ${C.violetDim}, ${C.violetBright})`, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: C.linen, boxShadow: `0 0 32px ${C.violetGlow}`, margin: "0 auto 24px" }}>C</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>Chroma</div>
          <div style={{ fontSize: 12, color: C.linenMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 32 }}>Laboratorio de Identidad Visual</div>
          <div style={{ background: C.onyxLight, border: `1px solid ${C.onyxBorder}`, borderRadius: 20, padding: "32px 28px", marginBottom: 20 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Analizá tu identidad visual</div>
            <p style={{ fontSize: 14, color: C.linenMuted, lineHeight: 1.7, marginBottom: 28 }}>
              Ingresá la URL de cualquier sitio web y obtené un diagnóstico profesional de su identidad visual en segundos.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {[
                { icon: "📸", text: "Captura automática del sitio" },
                { icon: "🎨", text: "Análisis de color, tipografía y composición" },
                { icon: "📊", text: "Score y recomendaciones accionables" },
                { icon: "⚖️", text: "Comparación entre sitios" },
                { icon: "⬇️", text: "Exportación en PDF" },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: C.onyx, borderRadius: 10, border: `1px solid ${C.onyxBorder}` }}>
                  <span style={{ fontSize: 16 }}>{icon}</span>
                  <span style={{ fontSize: 13, color: C.linenDim }}>{text}</span>
                </div>
              ))}
            </div>
            <button onClick={loginWithGoogle}
              style={{ width: "100%", padding: "14px 0", background: `linear-gradient(135deg, ${C.violetDim}, ${C.violetBright})`, border: "none", borderRadius: 12, color: C.linen, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
              onMouseEnter={e => e.target.style.opacity = "0.9"}
              onMouseLeave={e => e.target.style.opacity = "1"}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continuar con Google
            </button>
          </div>
          <div style={{ fontSize: 11, color: C.linenMuted }}>
            Al continuar aceptás nuestros términos de uso · {FREE_LIMIT} análisis gratuitos incluidos
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.onyx, minHeight: "100vh", fontFamily: FONT_BODY, color: C.linen, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px" }}>

      {/* HEADER */}
      <div style={{ width: "100%", maxWidth, padding: "28px 0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.onyxBorder}`, marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, background: `linear-gradient(135deg, ${C.violetDim}, ${C.violetBright})`, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: C.linen, boxShadow: `0 0 18px ${C.violetGlow}` }}>C</div>
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" }}>Chroma</div>
            <div style={{ fontSize: 10, color: C.linenMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: -2 }}>Laboratorio de Identidad</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {phase === "result" && mode === "single" && result && canExportPDF() && (
              <button onClick={() => exportPDF(result, siteUrl)} style={{ ...btn(true), padding: "7px 14px", fontSize: 12 }}>⬇ PDF</button>
            )}
          {phase === "result" && (
            <button onClick={reset} style={{ background: "transparent", border: `1px solid ${C.onyxBorder}`, borderRadius: 100, padding: "7px 16px", color: C.linenMuted, fontSize: 12, cursor: "pointer" }}>← Nuevo</button>
          )}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {isAdmin() && (
                <button onClick={() => { setShowAdmin(true); loadAdminUsers(); }} style={{ ...btn(true), padding: "7px 14px", fontSize: 12 }}>⚙️ Admin</button>
              )}
              {canSeeHistory() && history.length > 0 && (
                <button onClick={() => setShowHistory(!showHistory)} style={{ ...btn(true), padding: "7px 14px", fontSize: 12 }}>
                  📋 Historial ({history.length})
                </button>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: C.onyxLight, border: `1px solid ${C.onyxBorder}`, borderRadius: 100 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: `linear-gradient(135deg, ${C.violetDim}, ${C.violetBright})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                  {user.email[0].toUpperCase()}
                </div>
                <span style={{ fontSize: 12, color: C.linenDim }}>{usageCount}/{planLimit === Infinity ? "∞" : planLimit}</span>
                <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 100, background: userPlan === "agency" ? C.violetDim : userPlan === "pro" ? "rgba(123,53,212,0.3)" : C.onyxBorder, color: userPlan === "free" ? C.linenMuted : C.violetBright, fontWeight: 700, textTransform: "uppercase" }}>{userPlan}</span>
                <button onClick={logout} style={{ background: "none", border: "none", color: C.linenMuted, fontSize: 11, cursor: "pointer" }}>Salir</button>
              </div>
            </div>
          ) : (
            <button onClick={loginWithGoogle} style={{ ...btn(), padding: "8px 16px", fontSize: 13 }}>
              Iniciar sesión con Google
            </button>
          )}
        </div>
      </div>

      {/* HISTORIAL */}
      {showHistory && user && (
        <div style={{ ...card, maxWidth }}>
          <div style={{ fontSize: 11, color: C.linenMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Historial de análisis</div>
          {history.map((h) => (
            <div key={h.id} onClick={() => setSelectedHistory(h)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${C.onyxBorder}`, cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(123,53,212,0.05)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div>
                <div style={{ fontSize: 13, color: C.linen, marginBottom: 3 }}>{h.site_url}</div>
                <div style={{ fontSize: 11, color: C.linenMuted }}>{new Date(h.created_at).toLocaleDateString("es-AR")} · Ver análisis →</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: scoreColor(h.score), fontFamily: FONT_DISPLAY }}>{h.score}</div>
            </div>
          ))}
        </div>
      )}

      {/* LIMITE ALCANZADO */}
      {usageCount >= planLimit && phase === "upload" && (
        <div style={{ ...card, textAlign: "center", borderColor: C.violet }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>🔒</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            {userPlan === "free" ? "Límite del plan gratuito alcanzado" : `Límite del plan ${userPlan} alcanzado`}
          </div>
          <div style={{ fontSize: 13, color: C.linenMuted, marginBottom: 20, lineHeight: 1.7 }}>
            {userPlan === "free" ? `Usaste tus ${planLimit} análisis gratuitos este mes. Contactanos para obtener más.` : `Usaste tus ${planLimit} análisis este mes. Tu cuota se renueva el 1 del próximo mes.`}
          </div>
          {userPlan === "free" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ padding: "16px", background: C.onyx, border: `1px solid ${C.violet}`, borderRadius: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.violetBright, marginBottom: 4 }}>Plan Pro — $9/mes</div>
                <div style={{ fontSize: 12, color: C.linenMuted }}>20 análisis · Comparaciones · PDF · Historial 30 días</div>
              </div>
              <div style={{ padding: "16px", background: C.onyx, border: `1px solid ${C.onyxBorder}`, borderRadius: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.linen, marginBottom: 4 }}>Plan Agency — $29/mes</div>
                <div style={{ fontSize: 12, color: C.linenMuted }}>Análisis ilimitados · Todo lo del Pro · Historial ilimitado</div>
              </div>
              <div style={{ fontSize: 12, color: C.linenMuted, marginTop: 8 }}>Contactanos en <span style={{ color: C.violetBright }}>hola@chromalab.com.ar</span></div>
            </div>
          )}
        </div>
      )}

      {/* UPLOAD */}
      {phase === "upload" && usageCount < planLimit && (
        <div style={card}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8, lineHeight: 1.2 }}>Analizá tu identidad visual</h1>
            <p style={{ fontSize: 14, color: C.linenMuted, lineHeight: 1.7 }}>Pegá la URL de un sitio web y recibí un diagnóstico claro en segundos.</p>
            {!user && (
              <div style={{ marginTop: 12, padding: "10px 14px", background: C.violetGlow, border: `1px solid ${C.violetDim}`, borderRadius: 10, fontSize: 12, color: C.linenDim }}>
                💡 Iniciá sesión para guardar tu historial y tener {FREE_LIMIT} análisis gratuitos.
              </div>
            )}
            {user && (
              <div style={{ marginTop: 12, padding: "10px 14px", background: C.onyx, border: `1px solid ${C.onyxBorder}`, borderRadius: 10, fontSize: 12, color: C.linenMuted }}>
                Análisis disponibles este mes: <strong style={{ color: usageCount >= planLimit - 1 ? C.warning : C.ok }}>{planLimit === Infinity ? "∞" : planLimit - usageCount} de {planLimit === Infinity ? "∞" : planLimit}</strong>
                <span style={{ marginLeft: 8, padding: "2px 7px", borderRadius: 100, background: userPlan === "agency" ? C.violetDim : userPlan === "pro" ? "rgba(123,53,212,0.3)" : C.onyxBorder, color: userPlan === "free" ? C.linenMuted : C.violetBright, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>{userPlan}</span>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 20, background: C.onyx, borderRadius: 12, padding: 4 }}>
            {["single", "compare"].map(m => (
              <button key={m} onClick={() => canCompare() || m === "single" ? setMode(m) : null}
                style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "none", background: mode === m ? C.onyxLight : "transparent", color: mode === m ? C.linen : (!canCompare() && m === "compare") ? C.linenMuted : C.linenMuted, fontSize: 13, fontWeight: mode === m ? 600 : 400, cursor: (!canCompare() && m === "compare") ? "not-allowed" : "pointer", transition: "all 0.2s", opacity: (!canCompare() && m === "compare") ? 0.4 : 1 }}>
                {m === "single" ? "Análisis simple" : `Comparar sitios ${!canCompare() ? "🔒" : ""}`}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 12 }}>
            <input type="text" placeholder="ejemplo.com" value={siteUrl} onChange={e => setSiteUrl(e.target.value)}
              style={{ width: "100%", padding: "14px 16px", background: C.onyx, border: `1px solid ${siteUrl ? C.violet : C.onyxBorder}`, borderRadius: 12, color: C.linen, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: FONT_BODY, transition: "border 0.2s" }} />
          </div>

          {mode === "compare" && (
            <div style={{ marginBottom: 12 }}>
              <input type="text" placeholder="competidor.com" value={siteUrl2} onChange={e => setSiteUrl2(e.target.value)}
                style={{ width: "100%", padding: "14px 16px", background: C.onyx, border: `1px solid ${siteUrl2 ? C.violet : C.onyxBorder}`, borderRadius: 12, color: C.linen, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: FONT_BODY, transition: "border 0.2s" }} />
            </div>
          )}

          <button onClick={analyze}
            disabled={!siteUrl.trim() || (mode === "compare" && !siteUrl2.trim())}
            style={{ ...btn(), width: "100%", padding: 16, marginTop: 4, opacity: (siteUrl.trim() && (mode === "single" || siteUrl2.trim())) ? 1 : 0.4 }}
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

      {/* RESULT SINGLE */}
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
            {Object.entries(result.breakdown).map(([k, v]) => <CategoryBar key={k} label={`${catLabels[k] || k}  ·  ${catWeights[k]}% peso`} value={v} />)}
          </div>

          {/* Primera impresión */}
          {result.first_impression && (
            <div style={{ ...card, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: C.linenMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Primera impresión (5 segundos)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 12 }}>
                {[
                  { label: "¿Qué es?", value: result.first_impression.what },
                  { label: "¿Para quién?", value: result.first_impression.who },
                  { label: "¿Qué hacer?", value: result.first_impression.action },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: "12px 14px", background: C.onyx, borderRadius: 10, border: `1px solid ${C.onyxBorder}` }}>
                    <div style={{ fontSize: 10, color: C.linenMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{label}</div>
                    <div style={{ fontSize: 12, color: C.linenDim, lineHeight: 1.5 }}>{value}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: C.linenMuted }}>Veredicto:</span>
                <span style={{ padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700, textTransform: "uppercase", background: result.first_impression.verdict === "claro" ? "rgba(60,184,122,0.15)" : "rgba(232,69,60,0.15)", color: result.first_impression.verdict === "claro" ? C.ok : C.danger }}>
                  {result.first_impression.verdict}
                </span>
              </div>
            </div>
          )}

          {/* Brand gap */}
          {result.brand_gap && result.brand_gap !== "ninguna detectada" && (
            <div style={{ ...card, marginBottom: 16, borderColor: "rgba(232,155,60,0.3)" }}>
              <div style={{ fontSize: 11, color: C.linenMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Brecha de marca detectada</div>
              <div style={{ fontSize: 13, color: C.linenDim, lineHeight: 1.7 }}>⚠️ {result.brand_gap}</div>
            </div>
          )}

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
          <div style={{ ...card, textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: C.linenMuted, marginBottom: 16 }}>¿Aplicaste mejoras? Analizá la nueva versión para ver tu progreso.</div>
            <button onClick={reset} style={{ ...btn(), padding: "13px 32px" }} onMouseEnter={e => e.target.style.transform = "translateY(-1px)"} onMouseLeave={e => e.target.style.transform = "translateY(0)"}>↺ Re-analizar</button>
          </div>

          {/* CTA Especialista */}
          <div style={{ ...card, marginBottom: 40, background: `linear-gradient(135deg, ${C.violetDim}33, ${C.onyxLight})`, border: `1px solid ${C.violet}55`, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: C.violetBright, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>Análisis estratégico profundo</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, color: C.linen, marginBottom: 10, lineHeight: 1.3 }}>
              {result.score < 65 ? "Tu identidad visual necesita intervención estratégica." : "Tu marca tiene base sólida. Llevala al siguiente nivel."}
            </div>
            <div style={{ fontSize: 13, color: C.linenDim, lineHeight: 1.7, marginBottom: 24, maxWidth: 480, margin: "0 auto 24px" }}>
              {result.score < 65
                ? "Los problemas detectados en este reporte impactan directamente en tus conversiones y en cómo te perciben tus clientes. Un especialista puede transformar estos hallazgos en un plan de acción concreto."
                : "Este reporte es el punto de partida. Una sesión con un especialista te permite profundizar en cada hallazgo y definir una estrategia de identidad visual alineada a tus objetivos de negocio."}
            </div>
            <a href="https://calendly.com/labid-chroma/30min" target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-block", padding: "14px 36px", background: `linear-gradient(135deg, ${C.violet}, ${C.violetBright})`, borderRadius: 12, color: C.linen, fontSize: 14, fontWeight: 700, textDecoration: "none", letterSpacing: "0.02em" }}>
              Agendar auditoría con especialista →
            </a>
            <div style={{ fontSize: 11, color: C.linenMuted, marginTop: 12 }}>30 minutos · Google Meet · Sin costo</div>
          </div>
        </div>
      )}

      {/* RESULT COMPARE */}
      {phase === "result" && result && result2 && mode === "compare" && (
        <div style={{ width: "100%", maxWidth: 1200 }}>
          <div style={{ ...card, maxWidth: 1200, textAlign: "center", background: `linear-gradient(135deg, ${C.onyxLight}, #0F0F18)`, marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: C.linenMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>Resultado de la comparación</div>
            {result.score !== result2.score ? (
              <>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: C.linen, marginBottom: 6 }}>
                  {result.score > result2.score ? "🏆 Gana el Sitio 1" : "🏆 Gana el Sitio 2"}
                </div>
                <div style={{ fontSize: 13, color: C.linenMuted }}>
                  {result.score > result2.score ? siteUrl : siteUrl2} supera por {Math.abs(result.score - result2.score)} puntos
                </div>
              </>
            ) : (
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: C.linen }}>🤝 Empate</div>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            {[{ r: result, url: siteUrl, label: "Sitio 1" }, { r: result2, url: siteUrl2, label: "Sitio 2" }].map(({ r, url, label }) => (
              <div key={url}>
                <div style={{ fontSize: 11, color: C.linenMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>{label}</div>
                <BrowserFrame url={url} screenshot={r.screenshot} />
                <div style={{ background: C.onyxLight, border: `1px solid ${C.onyxBorder}`, borderRadius: 16, padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                    <ScoreRing score={r.score} size={100} />
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 700, color: C.linen, lineHeight: 1.4 }}>{r.summary}</div>
                  </div>
                  {Object.entries(r.breakdown).map(([k, v]) => <CategoryBar key={k} label={catLabels[k] || k} value={v} compact />)}
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
          <div style={{ fontSize: 13, color: C.linenMuted, marginBottom: 24, lineHeight: 1.6 }}>{errMsg}</div>
          <button onClick={reset} style={{ ...btn(), padding: "12px 28px" }}>Volver a intentar</button>
        </div>
      )}

      <div style={{ fontSize: 11, color: C.linenMuted, letterSpacing: "0.08em", textAlign: "center", paddingBottom: 24 }}>
        CHROMA © 2025 · Laboratorio de Identidad Visual
      </div>
    </div>
  );
}
