const PROMPT = `Eres el motor de análisis de identidad visual de CHROMA.
Analiza la imagen de la página web recibida y devuelve ÚNICAMENTE un objeto JSON válido, sin texto adicional, sin backticks, sin comentarios.

Usa esta estructura de ejemplo como referencia:
{
  "score": 72,
  "breakdown": {
    "color": 80,
    "typography": 60,
    "composition": 70,
    "consistency": 65,
    "hierarchy": 75
  },
  "issues": [
    { "code": "too_many_fonts", "severity": "error", "label": "Demasiadas tipografías distintas" }
  ],
  "recommendations": [
    "Reducí a 2 tipografías máximo"
  ],
  "summary": "Identidad con potencial pero inconsistente en tipografía"
}

Reglas: color 20%, typography 20%, composition 20%, consistency 25%, hierarchy 15%.
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
    const screenshotUrl = `https://api.screenshotone.com/take?access_key=${screenshotKey}&url=${encodeURIComponent(siteUrl)}&format=jpg&block_ads=true&block_cookie_banners=true&block_trackers=true&timeout=60&response_type=by_format&image_quality=80`;

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
          temperature: 0.2,
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
    return res.status(200).json(parsed);

  } catch (e) {
    return res.status(500).json({ error: "Error interno: " + e.message });
  }
}
