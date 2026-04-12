const PROMPT = `Eres un experto en diseño y branding con 20 años de experiencia analizando identidad visual de sitios web.

Estás viendo una captura de pantalla REAL de un sitio web. Tu análisis debe ser ESPECÍFICO a lo que ves en esta imagen concreta, no genérico.

INSTRUCCIONES DE ANÁLISIS:
- Observá los colores REALES que aparecen en la pantalla (fondos, textos, botones, íconos)
- Identificá las tipografías REALES visibles (tamaños, pesos, familias)
- Evaluá la composición y layout REAL de la página
- Detectá problemas CONCRETOS que ves, no problemas genéricos
- Las recomendaciones deben ser ESPECÍFICAS a lo que ves

CRITERIOS DE PUNTUACIÓN:
- color (20%): paleta cromática, contraste, coherencia de colores
- typography (20%): legibilidad, jerarquía tipográfica, consistencia de fuentes
- composition (20%): layout, espaciado, alineación, uso del espacio
- consistency (25%): coherencia visual entre elementos, sistema de diseño
- hierarchy (15%): claridad del flujo visual, jerarquía de información

Devuelve ÚNICAMENTE un objeto JSON válido, sin texto adicional, sin backticks, sin comentarios.

Estructura exacta requerida:
{
  "score": <número entre 0 y 100>,
  "breakdown": {
    "color": <número entre 0 y 100>,
    "typography": <número entre 0 y 100>,
    "composition": <número entre 0 y 100>,
    "consistency": <número entre 0 y 100>,
    "hierarchy": <número entre 0 y 100>
  },
  "issues": [
    { "code": "<código_corto>", "severity": "<error|warning>", "label": "<descripción específica de lo que ves>" }
  ],
  "recommendations": [
    "<recomendación concreta y accionable basada en lo que ves>"
  ],
  "summary": "<resumen de 1 oración específico sobre la identidad visual de ESTE sitio>"
}

Máximo 3 issues y 3 recommendations. Solo JSON puro, sin texto extra.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const screenshotKey = process.env.SCREENSHOT_API_KEY;

  if (!geminiKey) return res.status(500).json({ error: "GEMINI_API_KEY no configurada." });
  if (!screenshotKey) return res.status(500).json({ error: "SCREENSHOT_API_KEY no configurada." });

  const { siteUrl } = req.body;
  if (!siteUrl) return res.status(400).json({ error: "Falta siteUrl." });

  try {
    // 1. Tomar captura de pantalla con Screenshotone
    const screenshotUrl = `https://api.screenshotone.com/take?access_key=${screenshotKey}&url=${encodeURIComponent(siteUrl)}&format=jpg&block_ads=true&block_cookie_banners=true&block_trackers=true&timeout=60&response_type=by_format&image_quality=80&viewport_width=1280&viewport_height=800`;

    const screenshotRes = await fetch(screenshotUrl);
    if (!screenshotRes.ok) throw new Error("No se pudo capturar la página web.");

    const arrayBuffer = await screenshotRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // 2. Analizar con Gemini
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${geminiKey}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: PROMPT },
            { inline_data: { mime_type: "image/jpeg", data: base64 } },
          ],
        }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1000,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.error?.message || "Error de Gemini.";
      return res.status(500).json({ error: errMsg });
    }

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No se pudo extraer JSON de la respuesta.");
    const parsed = JSON.parse(match[0]);

    // 3. Devolver análisis + screenshot en base64
    return res.status(200).json({ ...parsed, screenshot: `data:image/jpeg;base64,${base64}` });

  } catch (e) {
    return res.status(500).json({ error: "Error interno: " + e.message });
  }
}
