export interface Nivel {
  umbralMeses: number;
  nombre: string;
  descripcion: string;
}

export const NIVELES: Nivel[] = [
  { umbralMeses: 0, nombre: "Primeros Pasos", descripcion: "Acabas de trazar tu ruta. La paciencia es tu mejor aliada al principio del camino." },
  { umbralMeses: 3, nombre: "Rumbo Definido", descripcion: "Ya tienes el rumbo claro. Cada mes que pasa, tu ruta se consolida." },
  { umbralMeses: 6, nombre: "Piloto en Marcha", descripcion: "Llevas medio año navegando tus finanzas con dirección. El hábito ya es tuyo." },
  { umbralMeses: 12, nombre: "Navegante Experto", descripcion: "Un año de trayecto. Conoces tu mapa financiero mejor que nadie." },
  { umbralMeses: 24, nombre: "Conductor Experto", descripcion: "Dos años recorriendo tu ruta financiera. Eres un referente de constancia." },
];

export function calcularMesesTranscurridos(fechaInicio: Date): number {
  const ahora = new Date();
  let meses = (ahora.getFullYear() - fechaInicio.getFullYear()) * 12 + (ahora.getMonth() - fechaInicio.getMonth());
  if (ahora.getDate() < fechaInicio.getDate()) meses -= 1;
  return Math.max(0, meses);
}

export function obtenerNivel(mesesTranscurridos: number) {
  let indiceActual = 0;
  for (let i = 0; i < NIVELES.length; i++) {
    if (mesesTranscurridos >= NIVELES[i].umbralMeses) indiceActual = i;
  }
  const nivelActual = NIVELES[indiceActual];
  const siguienteNivel = NIVELES[indiceActual + 1] ?? null;
  const mesesParaSiguiente = siguienteNivel ? siguienteNivel.umbralMeses - mesesTranscurridos : null;
  return { indiceActual, nivelActual, siguienteNivel, mesesParaSiguiente };
}