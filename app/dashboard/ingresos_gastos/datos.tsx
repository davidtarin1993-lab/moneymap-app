import React from 'react';
import path from 'path';
import * as XLSX from 'xlsx';
import fs from 'fs';
import MoneyMapClientDashboard from './page';

// 1. INTERFAZ ESTRUCTURAL DE DATOS
interface Movimiento {
  fecha: string;
  descripcion: string;
  importe: number;
  tipo: 'ingreso' | 'gasto' | 'transferencia' | 'inversión';
  categoriaReducida: string;
  naturaleza: 'fijo' | 'variable' | 'no aplica';
  esencialidad: string;
}

// 2. COMPONENTE DE SERVIDOR: LEE EL EXCEL AUTOMÁTICAMENTE
export default async function FlujoCajaPage() {
  let movimientos: Movimiento[] = [];

  try {
    // Localiza de forma automática el archivo Excel en la carpeta /data del proyecto
    const rutaExcel = path.join(process.cwd(), 'data', 'movimientos.xlsx');
    
    // Lee el archivo directamente desde el sistema de archivos del servidor
    const bufferArchivo = fs.readFileSync(rutaExcel);
    const libro = XLSX.read(bufferArchivo, { type: 'buffer' });
    
    // Extrae la primera hoja de cálculo
    const nombreHoja = libro.SheetNames[0];
    const hoja = libro.Sheets[nombreHoja];
    
    // Convierte las filas en un objeto JSON nativo
    const filasRaw = XLSX.utils.sheet_to_json(hoja) as any[];

    // Normaliza las columnas del Excel automáticamente al formato del TSX
    movimientos = filasRaw.map((fila) => {
      const importeNumerico = Number(fila['importe']) || 0;
      return {
        fecha: fila['fecha'] || '',
        descripcion: fila['descripcion_original'] || fila['Concepto Registrado'] || '',
        importe: importeNumerico,
        tipo: fila['tipo_movimiento'] || (importeNumerico < 0 ? 'gasto' : 'ingreso'),
        categoriaReducida: fila['categoria_reducida'] || 'Otros',
        naturaleza: fila['naturaleza_gasto'] || 'variable',
        esencialidad: fila['nivel_necesidad'] || 'discrecional'
      };
    });
  } catch (error) {
    console.error("Error al leer el archivo Excel de forma automática:", error);
  }

  // Le envía los datos del Excel procesados en segundo plano al Dashboard del Cliente
  return <MoneyMapClientDashboard datosExcel={movimientos} />;
}
