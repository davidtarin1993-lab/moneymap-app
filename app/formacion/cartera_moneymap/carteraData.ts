// app/formacion/cartera_moneymap/carteraData.ts

export interface Movimiento {
  id: number;
  tipo: "COMPRA" | "VENTA";
  activo: string;
  categoria: "Acciones" | "Cripto" | "Oro" | "Liquidez";
  fecha: string;
  precio: number;      // Este es el precio de COMPRA por título
  titulos: number;     // <-- NUEVO: Número de acciones / participaciones
  precioVenta?: number; // <-- NUEVO: Precio al que se vendió (solo si está Cerrado)
  estado: "Abierto" | "Cerrado";
  motivacion: string;
}

export const capitalInicialSoporte = 10000;

export const listaMovimientos: Movimiento[] = [
  {
    id: 1,
    tipo: "COMPRA",
    activo: "ETF S&P 500 (VUSA)",
    categoria: "Acciones",
    fecha: "01 Jul 2026",
    precio: 84.50,
    titulos: 15, // 15 participaciones
    estado: "Abierto",
    motivacion: "Aportación mensual recurrente indexada. Aprovechamos la ligera corrección del inicio de trimestre para promediar precios a la baja con una visión patrimonial a más de 10 años."
  },
  {
    id: 2,
    tipo: "COMPRA",
    activo: "Bitcoin (BTC)",
    categoria: "Cripto",
    fecha: "25 Jun 2026",
    precio: 61200,
    titulos: 0.05, // 0.05 BTC
    estado: "Abierto",
    motivacion: "Tesis de acumulación institucional. El activo muestra un fuerte soporte técnico en los 60k y sirve como cobertura contra el riesgo de inflación y degradación de la divisa tradicional."
  },
  {
    id: 3,
    tipo: "VENTA",
    activo: "Apple Inc. (AAPL)",
    categoria: "Acciones",
    fecha: "10 Jun 2026",
    precio: 170.00, // Comprado a 170€
    precioVenta: 192.10, // <-- VENDIDO A 192.10€ (El sistema calculará el +13% solo)
    titulos: 10, // 10 acciones
    estado: "Cerrado",
    motivacion: "Venta por valoración exigente. Tras un rally impulsado por los anuncios de inteligencia artificial, la acción cotiza a un PER muy elevado. Recogemos beneficios para aumentar liquidez."
  },
  {
    id: 4,
    tipo: "VENTA",
    activo: "Gold Bullion",
    categoria: "Oro",
    fecha: "28 May 2026",
    precio: 2250,
    precioVenta: 2350, // <-- El sistema calculará la ganancia automáticamente
    titulos: 2,
    estado: "Cerrado",
    motivacion: "Rebalanceo estructural de cartera. El oro ha cumplido su función de refugio durante las tensiones del mes pasado. Reducimos peso para redistribuir el capital hacia activos de mayor crecimiento."
  }
];
