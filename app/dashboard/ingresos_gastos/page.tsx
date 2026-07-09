import React from 'react';
import path from 'path';
import * as XLSX from 'xlsx';
import fs from 'fs';
import MoneyMapClientDashboard from './dashboard-client';
import movimientosJsonBackup from './movimientos.json';

export const dynamic = "force-dynamic";

interface Movimiento {
  fecha: string;
  descripcion: string;
  importe: number;
  tipo: 'ingreso' | 'gasto';
  categoria: string;
  subcategoria: string; // Unificado a subcategoria
  naturaleza: 'fijo' | 'variable' | 'no aplica';
}

export default async function IngresosGastosPage() {
  let movimientos: Movimiento[] = [];

  try {
    const rutaExcel = path.join(process.cwd(), 'app', 'dashboard', 'ingresos_gastos', 'movimientos.xlsx');
    
    if (fs.existsSync(rutaExcel)) {
      const bufferArchivo = fs.readFileSync(rutaExcel);
      const libro = XLSX.read(bufferArchivo, { type: 'buffer' });
      const nombreHoja = libro.SheetNames[0];
      const hoja = libro.Sheets[nombreHoja];
      const filasRaw = XLSX.utils.sheet_to_json(hoja, { defval: "" }) as any[];

      if (filasRaw.length > 0) {
        movimientos = filasRaw.map((fila) => {
          const keys = Object.keys(fila);
          
          const kImporte = keys.find(k => k.toLowerCase().includes('import') || k.toLowerCase().includes('mont') || k.toLowerCase().includes('cant')) || '';
          const kFecha = keys.find(k => k.toLowerCase().includes('fech') || k.toLowerCase().includes('dat')) || '';
          const kDesc = keys.find(k => k.toLowerCase().includes('desc') || k.toLowerCase().includes('concep') || k.toLowerCase().includes('detall')) || '';
          const kTipo = keys.find(k => k.toLowerCase().includes('tipo')) || '';
          const kNat = keys.find(k => k.toLowerCase().includes('nat')) || '';
          const kCat = keys.find(k => k.toLowerCase().includes('cat')) || '';

          let valorImporte = String(fila[kImporte] || '0').replace(/[€\s]/g, '').replace(',', '.');
          const importeNumerico = parseFloat(valorImporte) || 0;

          let fechaRaw = String(fila[kFecha] || '').trim();
          let fechaFinal = '';

          if (!isNaN(Number(fechaRaw)) && Number(fechaRaw) > 40000) {
            const fechaObj = XLSX.SSF.parse_date_code(Number(fechaRaw));
            fechaFinal = `${fechaObj.y}-${String(fechaObj.m).padStart(2, '0')}-${String(fechaObj.d).padStart(2, '0')}`;
          } else if (fechaRaw.includes('/') || fechaRaw.includes('-')) {
            const separador = fechaRaw.includes('/') ? '/' : '-';
            const partes = fechaRaw.split(separador);
            if (partes.length === 3) {
              if (partes[0].length === 4) {
                fechaFinal = `${partes[0]}-${partes[1].padStart(2, '0')}-${partes[2].padStart(2, '0')}`;
              } else {
                fechaFinal = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
              }
            }
          }

          if (!fechaFinal) fechaFinal = new Date().toISOString().split('T')[0];

          const rawNat = String(fila[kNat] || '').toLowerCase().trim();
          const naturalezaFinal: 'fijo' | 'variable' | 'no aplica' = 
            rawNat.includes('fij') ? 'fijo' : 'variable';

          return {
            fecha: fechaFinal,
            descripcion: String(fila[kDesc] || 'Transacción Bancaria'),
            importe: importeNumerico,
            tipo: fila[kTipo] ? (String(fila[kTipo]).toLowerCase().trim() as any) : (importeNumerico < 0 ? 'gasto' : 'ingreso'),
            categoria: String(fila[kCat] || 'Otros'),
            // Buscador tolerante para mapear la subcategoría del Excel de forma nativa
            subcategoria: String(fila['subcategoria'] || fila['categoria_reducida'] || fila['Subcategoría'] || 'General'),
            naturaleza: naturalezaFinal
          };
        });
      }
    }
  } catch (error) {
    console.error("Error en servidor Excel:", error);
  }

  if (movimientos.length === 0) {
    movimientos = movimientosJsonBackup as unknown as Movimiento[];
  }

  return <MoneyMapClientDashboard datosExcel={movimientos} />;
}
