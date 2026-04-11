const PROMPT = `Eres el motor de análisis de identidad visual de CHROMA.
Analiza la imagen recibida y devuelve ÚNICAMENTE un objeto JSON válido, sin texto adicional, sin backticks, sin comentarios.

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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY no configurada." });
  }

  const { imageUrl } = req.body;
  if (!imageUrl) {
    return res.status(400).json({ error: "Falta imageUrl." });
  }

  try {
    // Descargar la imagen desde la URL
    const imgResponse = await fetch(imageUrl);
    if (!imgResponse.ok) throw new Error("No se pudo descargar la imagen desde la URL.");
    const contentType = imgResponse.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await imgResponse.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: PROMPT },
            { inline_data: { mime_type: contentType, data: base64 } },
          ],
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1000,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.error?.message || "Error de Gemini.";
      return res.status(500).json({ error: errMsg });
    }

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();

    const parsed = JSON.parse(clean);
    return res.status(200).json(parsed);

  } catch (e) {
    return res.status(500).json({ error: "Error interno: " + e.message });
  }
}
