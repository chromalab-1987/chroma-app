const PROMPT = `Eres un consultor senior en branding estratégico, identidad visual y optimización de conversión con 20 años de experiencia auditando sitios web de marcas que quieren posicionarse en segmentos premium.

Estás viendo una captura de pantalla COMPLETA de un sitio web (toda la página de arriba a abajo). Tu análisis debe ser DEVASTADORAMENTE ESPECÍFICO a lo que ves — no genérico, no teórico. Cada observación debe nombrar elementos concretos visibles en la pantalla.

CRITERIO DE SCORING ESTRICTO:
Un sitio promedio del mercado parte de 50 puntos. Cada inconsistencia de sistema, cada elemento fuera de grilla, cada componente con tratamiento distinto al resto, resta puntos. No inflés el score por cortesía ni por dar una impresión positiva. Un score de 70+ debe ganarse con coherencia visual real y sostenida de arriba a abajo. Si ves un problema, marcalo como critical cuando rompe el sistema de diseño, no lo suavices como warning para no incomodar.

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
- ¿El texto dentro de los botones está centrado vertical y horizontalmente, o el label aparece corrido hacia arriba, abajo o a un costado?
- ¿Los títulos de sección usan la misma alineación (izquierda / centrada) en toda la página, o cambia entre secciones sin intención?
- ¿El interlineado (leading) es proporcional al tamaño del tipo, o hay textos que se solapan / respiran demasiado?
- ¿Hay orphans visibles (una palabra sola en la última línea de un párrafo)?
- ¿Las líneas de texto tienen un largo razonable (45–75 caracteres) o son demasiado anchas y dificultan la lectura?

COMPOSICIÓN:
- ¿Hay una grilla visible y consistente?
- ¿El espaciado entre elementos es uniforme?
- ¿Hay elementos que rompen la alineación o generan ruido visual?
- ¿El uso del espacio en blanco es intencional o accidental?
- ¿El padding interno de los botones es simétrico izquierda/derecha, o algún botón parece más apretado que otro?
- ¿Las columnas de texto en secciones paralelas (ej: tres columnas de features) terminan a la misma altura, o las cabeceras de distinto largo rompen la alineación?
- ¿Los elementos que deberían estar centrados en pantalla lo están realmente, o tienen un offset visual sutil?
- ¿El margen entre el borde del viewport y el contenido es consistente en todas las secciones?

MICRO-DETALLES DE COMPONENTES:
Inspeccioná cada tipo de componente de forma granular:
- BOTONES: ¿El label está centrado dentro del botón (vertical y horizontal)? ¿El padding es simétrico? ¿El tamaño de fuente y el peso son idénticos en todos los botones de la página? ¿Hay algún botón donde el texto se vea recortado o con overflow?
- TÍTULOS (H1, H2, H3): ¿Están alineados con la grilla o flotan libremente? ¿El espacio debajo de cada título es consistente con el elemento que le sigue? ¿La alineación (izquierda / centrada) es la misma para todos los títulos del mismo nivel jerárquico?
- CTAs: ¿El texto del CTA principal tiene exactamente el mismo tamaño y peso en todas sus apariciones? ¿Hay CTAs secundarios que compiten por peso tipográfico con el primario?
- ÍCONOS + TEXTO: ¿Los íconos están alineados al centro óptico del texto que los acompaña, o alguno sube o baja respecto a la línea base del label?
- TARJETAS / CARDS: ¿El padding interno es uniforme en todas las tarjetas? ¿Los títulos dentro de las cards arrancan siempre desde la misma posición relativa?
- BADGES / TAGS / CHIPS: ¿Usan el mismo tamaño de fuente y padding en todas sus apariciones?
- LISTAS Y BULLETS: ¿La sangría es uniforme? ¿El texto de cada ítem está alineado correctamente o algún ítem rompe la columna?

CONSISTENCIA Y SISTEMA DE DISEÑO:
- ¿Los botones, íconos e imágenes tienen tratamiento visual coherente?
- ¿Se percibe un sistema de diseño o parece armado por partes?
- ¿La marca se ve igual de arriba a abajo o pierde coherencia al scrollear?
- ¿Todos los botones primarios tienen el mismo alto, border-radius y peso tipográfico? Comparalos uno a uno.
- ¿Los botones secundarios u outlined tienen el mismo grosor de borde en toda la página?
- ¿Los números o datos destacados (métricas, estadísticas) usan siempre la misma familia y peso tipográfico?

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
- typography (25%): legibilidad, jerarquía tipográfica, consistencia, alineación de texto en componentes
- composition (20%): grilla, espaciado, uso del espacio en blanco, simetría de componentes
- consistency (25%): sistema de diseño, coherencia de botones/badges/cards/íconos entre sí y a lo largo de la página
- hierarchy (10%): flujo visual, CTA, arquitectura de conversión

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

  const groqKey = process.env.GROQ_API_KEY;
  const screenshotKey = process.env.SCREENSHOT_API_KEY;

  if (!groqKey) return res.status(500).json({ error: "GROQ_API_KEY no configurada." });
  if (!screenshotKey) return res.status(500).json({ error: "SCREENSHOT_API_KEY no configurada." });

  const { siteUrl } = req.body;
  if (!siteUrl) return res.status(400).json({ error: "Falta siteUrl." });

  try {
    // 1. Captura de página completa
    const screenshotUrl = `https://api.screenshotone.com/take?access_key=${screenshotKey}&url=${encodeURIComponent(siteUrl)}&format=jpg&block_ads=true&block_cookie_banners=true&block_trackers=true&timeout=60&response_type=by_format&image_quality=75&viewport_width=1280&viewport_height=900&full_page=true`;

    const screenshotRes = await fetch(screenshotUrl);
    if (!screenshotRes.ok) {
      const errText = await screenshotRes.text();
      throw new Error(`ScreenshotOne falló (${screenshotRes.status}): ${errText}`);
    }
    const arrayBuffer = await screenshotRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // 2. Analizar con Groq (vision)
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64}`,
                },
              },
              {
                type: "text",
                text: PROMPT,
              },
            ],
          },
        ],
        temperature: 0.4,
        max_tokens: 2048,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.error?.message || "Error de Groq.";
      return res.status(500).json({ error: errMsg });
    }

    const raw = data.choices?.[0]?.message?.content || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No se pudo extraer JSON de la respuesta.");
    const parsed = JSON.parse(match[0]);

    return res.status(200).json({ ...parsed, screenshot: `data:image/jpeg;base64,${base64}` });

  } catch (e) {
    return res.status(500).json({ error: "Error interno: " + e.message });
  }
}
