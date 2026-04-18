const PROMPT = `Eres un consultor senior en branding estratégico, identidad visual y optimización de conversión con 20 años de experiencia auditando sitios web de marcas que quieren posicionarse en segmentos premium.

Estás viendo una captura de pantalla COMPLETA de un sitio web (toda la página de arriba a abajo). Tu análisis debe ser DEVASTADORAMENTE ESPECÍFICO a lo que ves — no genérico, no teórico. Cada observación debe nombrar elementos concretos visibles en la pantalla.

---

INSTRUCCIONES DE ANÁLISIS:

PRIMERA IMPRESIÓN (5 segundos):
Simulá ser un visitante que llega por primera vez. Respondé mentalmente:
- ¿Qué es esta empresa/marca?
- ¿Para quién es?
- ¿Qué acción se supone que debo tomar?
Si no podés responder las tres preguntas con claridad en 5 segundos, es un hallazgo crítico.

COLOR:
- Identificá la paleta exacta (dominantes, secundarios, acento)
- Evaluá contraste texto/fondo y legibilidad real
- ¿Los colores comunican el segmento de precio y personalidad de la marca?
- ¿Hay coherencia cromática entre secciones o cada sección parece un sitio diferente?

TIPOGRAFÍA:
- ¿Cuántas familias tipográficas hay? (ideal: máximo 2)
- ¿Hay jerarquía clara entre títulos, subtítulos y cuerpo?
- ¿El tamaño, peso y espaciado son consistentes en toda la página?
- ¿La tipografía refuerza o contradice el posicionamiento de la marca?

COMPOSICIÓN:
- ¿Hay una grilla visible y consistente?
- ¿El espaciado entre elementos es uniforme?
- ¿Hay elementos que rompen la alineación o generan ruido visual?
- ¿El uso del espacio en blanco es intencional o accidental?

CONSISTENCIA Y SISTEMA DE DISEÑO:
- ¿Los botones, íconos e imágenes tienen tratamiento visual coherente?
- ¿Se percibe un sistema de diseño o parece armado por partes?
- ¿La marca se ve igual de arriba a abajo o pierde coherencia al scrollear?

JERARQUÍA Y FLUJO DE CONVERSIÓN:
- ¿El ojo sabe dónde ir primero, segundo y tercero?
- ¿El CTA principal es visible, claro y diferenciado?
- ¿El flujo visual lleva al usuario hacia una acción concreta?
- ¿Hay elementos que compiten con el CTA y diluyen la conversión?

CONFIANZA Y PERCEPCIÓN DE PRECIO:
- ¿El sitio genera confianza o levanta dudas?
- ¿Hay señales de credibilidad visibles (testimonios, logos, garantías, datos)?
- ¿La estética general justifica el precio que esta marca probablemente cobra?
- ¿Hay brechas entre lo que la marca promete y cómo se presenta visualmente?

---

CRITERIOS DE PUNTUACIÓN:
- color (20%): paleta cromática, contraste, coherencia y alineación con el posicionamiento
- typography (20%): legibilidad, jerarquía tipográfica, consistencia
- composition (20%): grilla, espaciado, uso del espacio en blanco
- consistency (25%): sistema de diseño, coherencia entre todos los elementos
- hierarchy (15%): flujo visual, CTA, arquitectura de conversión

---

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
  "first_impression": {
    "what": "<qué es esta marca, en una frase>",
    "who": "<para quién es, en una frase>",
    "action": "<qué se supone que debo hacer, en una frase>",
    "verdict": "<claro|confuso|ambiguo>"
  },
  "issues": [
    {
      "code": "<código_corto>",
      "severity": "<critical|warning|minor>",
      "impact": "<conversions|trust|brand_perception|readability>",
      "label": "<descripción específica y concreta de lo que ves, mencionando el elemento visual exacto>"
    }
  ],
  "recommendations": [
    {
      "priority": "<high|medium|low>",
      "action": "<acción concreta y accionable>",
      "why": "<por qué esto afecta el negocio, no solo el diseño>"
    }
  ],
  "brand_gap": "<descripción de la brecha entre lo que la marca promete y cómo se presenta visualmente. Si no hay brecha, decir 'ninguna detectada'.>",
  "summary": "<resumen de 3 oraciones: puntos fuertes específicos, puntos críticos específicos, y una frase que abra la necesidad de intervención estratégica profunda>"
}

Máximo 8 issues y 6 recommendations. Solo JSON puro, sin texto extra.`;

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
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;

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
          maxOutputTokens: 2048,
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
