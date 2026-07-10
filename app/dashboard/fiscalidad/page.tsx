import React from 'react';
import path from 'path';
import * as XLSX from 'xlsx';
import fs from 'fs';
import FiscalidadClientDashboard from './fiscal-client';

export const dynamic = "force-dynamic";

interface RegistroFiscal {
  ejercicio: string;
  concepto: string;
  ingresoBruto: number;
  retencionIRPF: number;
  subcategoria: string;
}

export default async function FiscalidadPage() {
  let registros: RegistroFiscal[] = [];

  try {
    const rutaExcel = path.join(process.cwd(), 'app', 'dashboard', 'fiscalidad', 'fiscalidad.xlsx');
    
    if (fs.existsSync(rutaExcel)) {
      const bufferArchivo = fs.readFileSync(rutaExcel);
      const libro = XLSX.read(bufferArchivo, { type: 'buffer' });
      const nombreHoja = libro.SheetNames[0];
      const hoja = libro.Sheets[nombreHoja];
      const filasRaw = XLSX.utils.sheet_to_json(hoja, { defval: "" }) as any[];

      if (filasRaw.length > 0) {
        registros = filasRaw.map((fila) => {
          const metricaStr = String(fila['Metrica'] || '').trim();
          const fechaStr = String(fila['Fecha Operativa'] || '').trim();
          
          let importeNumerico = 0;
          if (typeof fila['Importe'] === 'number') {
            importeNumerico = fila['Importe'];
          } else {
            let valorImporte = String(fila['Importe'] || '0')
              .replace(/[€\s]/g, '')     
              .replace(/\./g, '')        
              .replace(',', '.');        
            importeNumerico = parseFloat(valorImporte) || 0;
          }

          // Parseo del año desde la Fecha Operativa
          let anioFinal = '2024';
          if (fechaStr.includes('/')) {
            const partes = fechaStr.split('/');
            if (partes.length === 3) anioFinal = partes[2]; 
          } else if (fechaStr.includes('-')) {
            const partes = fechaStr.split('-');
            if (partes.length === 3) anioFinal = partes[0].length === 4 ? partes[0] : partes[2];
          } else if (!isNaN(Number(fechaStr)) && Number(fechaStr) > 40000) {
            const fechaObj = XLSX.SSF.parse_date_code(Number(fechaStr));
            anioFinal = String(fechaObj.y);
          } else if (fechaStr.length === 4 && !isNaN(Number(fechaStr))) {
            anioFinal = fechaStr;
          }

          let ingresoBruto = 0;
          let retencionIRPF = 0;
          
          // Limpiador ultra-tolerante para eliminar acentos de la columna Metrica
          const metricaClean = metricaStr.toLowerCase().trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

          // CLASIFICACIÓN ESTRICTA Y LIMPIA
          if (metricaClean === 'ingresos totales' || metricaClean === 'ingresos trabajo') {
            ingresoBruto = Math.abs(importeNumerico);
          } else if (metricaClean === 'retenciones totales' || metricaClean === 'retenciones trabajo') {
            retencionIRPF = Math.abs(importeNumerico);
          } else {
            // Guardamos el importe puro para métricas como "Resultado declaración"
            ingresoBruto = importeNumerico; 
          }

          return {
            ejercicio: anioFinal,
            concepto: metricaStr,
            ingresoBruto,
            retencionIRPF,
            subcategoria: metricaStr 
          };
        });
      }
    }
  } catch (error) {
    console.error("Error procesando Excel Fiscal:", error);
  }

  return <FiscalidadClientDashboard datosExcel={registros} />;
}
