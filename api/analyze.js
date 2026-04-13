const PROMPT = `Eres un experto senior en diseño de marca, UX y branding con 20 años de experiencia analizando identidad visual de sitios web.

Estás viendo una captura de pantalla COMPLETA de un sitio web (toda la página de arriba a abajo). Tu análisis debe ser EXHAUSTIVO y ESPECÍFICO a lo que ves.

INSTRUCCIONES DE ANÁLISIS EXHAUSTIVO:

COLOR:
- Identificá la paleta cromática exacta (colores dominantes, secundarios, de acento)
- Evaluá el contraste entre texto y fondo (¿es legible?)
- ¿Hay coherencia cromática entre secciones?
- ¿Los colores comunican la personalidad de la marca?

TIPOGRAFÍA:
- ¿Cuántas familias tipográficas hay? (ideal: máximo 2)
- ¿Hay jerarquía clara entre títulos, subtítulos y cuerpo?
- ¿El tamaño y peso son consistentes en toda la página?

COMPOSICIÓN:
- ¿Hay una grilla visible y consistente?
- ¿El espaciado entre elementos es uniforme?
- ¿Los márgenes y paddings son consistentes?
- ¿Hay elementos que rompen la alineación?

CONSISTENCIA:
- ¿Los botones tienen el mismo estilo en toda la página?
- ¿Los íconos son del mismo estilo?
- ¿Las imágenes tienen tratamiento visual coherente?
- ¿Hay un sistema de diseño visible?

JERARQUÍA:
- ¿El ojo sabe dónde ir primero?
- ¿El CTA principal es claro y destacado?
- ¿La navegación es intuitiva?
- ¿El flujo visual lleva al usuario hacia la conversión?

CRITERIOS DE PUNTUACIÓN:
- color (20%): paleta cromática, contraste, coherencia de colores
- typography (20%): legibilidad, jerarquía tipográfica, consistencia de fuentes
- composition (20%): grilla, espaciado, alineación, uso del espacio
- consistency (25%): sistema de diseño, coherencia entre elementos
- hierarchy (15%): flujo visual, CTA, navegación

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
    { "code": "<código_corto>", "severity": "<error|warning>", "label": "<descripción específica y concreta de lo que ves>" }
  ],
  "recommendations": [
    "<recomendación concreta, accionable y específica basada en lo que ves>"
  ],
  "summary": "<resumen de 2 oraciones específico sobre la identidad visual de ESTE sitio, mencionando sus puntos fuertes y débiles>"
}

Máximo 5 issues y 5 recommendations. Solo JSON puro, sin texto extra.`;

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
    // 1. Captura de página completa
    const screenshotUrl = `https://api.screenshotone.com/take?access_key=${screenshotKey}&url=${encodeURIComponent(siteUrl)}&format=jpg&block_ads=true&block_cookie_banners=true&block_trackers=true&timeout=60&response_type=by_format&image_quality=75&viewport_width=1280&viewport_height=900&full_page=true`;

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
          maxOutputTokens: 1500,
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

    return res.status(200).json({ ...parsed, screenshot: `data:image/jpeg;base64,${base64}` });

  } catch (e) {
    return res.status(500).json({ error: "Error interno: " + e.message });
  }
}
