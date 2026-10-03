export interface Nivel {
  umbralMeses: number;
  nombre: string;
  descripcion: string;
}

export const NIVELES: Nivel[] = [
  { umbralMeses: 0, nombre: "Primeros Pasos", descripcion: "Acabas de trazar tu ruta. La paciencia es tu mejor aliada." },
  { umbralMeses: 3, nombre: "Rumbo Definido", descripcion: "Ya tienes el rumbo claro. Cada mes que pasa, tu ruta se consolida." },
  { umbralMeses: 6, nombre: "Tomando el control", descripcion: "Llevas medio año navegando y tus finanzas empiezan a tener dirección. El hábito lo estas construyendo." },
  { umbralMeses: 12, nombre: "Navegante", descripcion: "Un año de trayecto. Conoces tu mapa financiero mejor que nadie." },
  { umbralMeses: 24, nombre: "Conductor Experto", descripcion: "Dos años conociendo tu ruta financiera y empiezas a ser un refente en la toma de decisión financiera." },
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