const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent";

interface ParteTexto {
  text: string;
}

interface ParteArchivo {
  inline_data: { mime_type: string; data: string };
}

type Parte = ParteTexto | ParteArchivo;

export async function llamarGemini(partes: Parte[]): Promise<string> {
  const url = `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: partes }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 60000 },
    }),
  });

  if (!response.ok) {
    const errorTexto = await response.text();
    throw new Error(`Error de la API de Gemini (${response.status}): ${errorTexto}`);
  }

  const data = await response.json();
  const textoRespuesta = data.candidates?.[0]?.content?.parts
    ?.map((p: any) => p.text)
    .join("\n");

  if (!textoRespuesta) {
    throw new Error("Gemini no devolvió contenido de texto.");
  }

  return textoRespuesta;
}

export function extraerJSON(texto: string): any {
  const limpio = texto.replace(/```json\s*|```/g, "").trim();

  try {
    return JSON.parse(limpio);
  } catch {
    // Si hay texto extra antes/después del JSON, nos quedamos solo con lo que hay entre el primer { y el último }
    const inicio = limpio.indexOf("{");
    const fin = limpio.lastIndexOf("}");

    if (inicio === -1 || fin === -1 || fin <= inicio) {
      throw new Error("No se encontró JSON válido en la respuesta.");
    }

    const fragmento = limpio.slice(inicio, fin + 1);
    return JSON.parse(fragmento);
  }
}

