"use client"; // Directiva obligatoria para habilitar hooks en entornos Server-Side

import React, { useState, useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Filter, Calendar } from 'lucide-react';

// ==========================================
// 1. DEFINICIÓN DE INTERFACES Y DATOS REALES
// ==========================================
interface Movimiento {
  fecha: string;
  descripcion: string;
  importe: number;
  tipo: 'ingreso' | 'gasto' | 'transferencia' | 'inversión';
  categoriaReducida: string;
  naturaleza: 'fijo' | 'variable' | 'no aplica';
  esencialidad: string;
}

interface DashboardProps {
  datosExcel: Movimiento[];
}
export default function MoneyMapClientDashboard({ datosExcel }: DashboardProps) {
  // Establecemos los estados temporales usando los datos inyectados automáticamente
  const [fechaInicio, setFechaInicio] = useState<string>('2025-01-01');
  const [fechaFin, setFechaFin] = useState<string>('2026-06-30');

  // Filtrado reactivo sobre los datos del archivo Excel
// Filtrado y cálculos reactivos con validación de seguridad incorporada
  const movimientosFiltrados = useMemo(() => {
    // Si datosExcel no existe o no es un array válido, devolvemos una lista vacía para evitar el crash
    if (!datosExcel || !Array.isArray(datosExcel)) {
      return [];
    }

    return datosExcel.filter(mov => {
        // Aseguramos que el movimiento tenga una fecha válida antes de comparar
        if (!mov || !mov.fecha) return false;
        return mov.fecha >= fechaInicio && mov.fecha <= fechaFin;
      })
      .sort((a, b) => {
        // Validación de seguridad para el ordenamiento temporal
        if (!a.fecha || !b.fecha) return 0;
        return b.fecha.localeCompare(a.fecha);
      });
  }, [datosExcel, fechaInicio, fechaFin]);

  // ==========================================
  // 3. CÁLCULO DE MÉTRICAS FINANCIERAS
  // ==========================================
  const stats = useMemo(() => {
    let ingresosTotales = 0;    
    let gastosTotales = 0;
    let gastosFijos = 0;
    let fugasOcio = 0;

    movimientosFiltrados.forEach(mov => {
      if (mov.tipo === 'ingreso') {
        ingresosTotales += mov.importe;
      } else {
        const valorAbs = Math.abs(mov.importe);
        gastosTotales += valorAbs;
        if (mov.naturaleza === 'fijo') gastosFijos += valorAbs;
        if (mov.esencialidad === 'discrecional') fugasOcio += valorAbs;
      }
    });

    const ahorroNeto = ingresosTotales - gastosTotales;
    const tasaAhorro = ingresosTotales > 0 ? (ahorroNeto / ingresosTotales) * 100 : 0;

    return { ingresosTotales, gastosTotales, gastosFijos, fugasOcio, tasaAhorro };
  }, [movimientosFiltrados]);

  // ==========================================
  // 4. ESTRUCTURA VISUAL BASE (HTML/JSX)
  // ==========================================
  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', backgroundColor: '#F9FAFB', minHeight: '100vh', color: '#111827' }}>
      <style>{`
        .filter-container-row {
          display: flex !important;
          flex-direction: row !important;
          gap: 12px !important;
          flex-wrap: nowrap !important;
        }
        .kpi-container-row {
          display: flex !important;
          flex-direction: row !important;
          gap: 8px !important;
          flex-wrap: nowrap !important;
          width: 100% !important;
        }

        @media (max-width: 600px) {
          .kpi-card-mobile {
            flex: 1 !important;
            min-width: 0 !important;
            padding: 8px !important;
          }
          .kpi-title-mobile {
            font-size: 11px !important;
          }
          .kpi-value-mobile {
            font-size: 14px !important;
            margin-top: 2px !important;
          }
          .filter-box-mobile {
            flex: 1 !important;
            min-width: 0 !important;
          }
          .filter-label-mobile {
            font-size: 11px !important;
          }
          .filter-input-mobile {
            padding: 4px 6px !important;
            font-size: 12px !important;
            height: 32px !important;
          }
        }
      `}</style>
      {/* CABECERA */}
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1E3A8A', margin: 0 }}>MoneyMap Executive Analyzer</h1>
        <p style={{ color: '#4B5563', marginTop: '4px', fontSize: '14px' }}>Auditoría estratégica automatizada de movimientos bancarios.</p>
      </header>

      {/* FILTROS */}
      {/* FILTROS CON ADAPTACIÓN MÓVIL */}
{/* FILTROS EN UNA ÚNICA LÍNEA HASTA EN MÓVIL */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '12px 16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '16px', border: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#374151', marginBottom: '8px', fontSize: '14px' }}>
          <Filter size={14} style={{ color: '#2563EB' }} /> Rango Temporal de Análisis
        </div>
        <div className="filter-container-row">
          <div className="filter-box-mobile">
            <label className="filter-label-mobile" style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4B5563', marginBottom: '2px' }}>Desde:</label>
            <input 
              type="date" 
              className="filter-input-mobile"
              value={fechaInicio} 
              onChange={(e) => setFechaInicio(e.target.value)}
              style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
          <div className="filter-box-mobile">
            <label className="filter-label-mobile" style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4B5563', marginBottom: '2px' }}>Hasta:</label>
            <input 
              type="date" 
              className="filter-input-mobile"
              value={fechaFin} 
              onChange={(e) => setFechaFin(e.target.value)}
              style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      </section>

 {/* TARJETAS RESUMEN KPI EN FILA ÚNICA OBLIGATORIA PARA MÓVIL */}
  {/* TRES TARJETAS KPI EN HORIZONTAL OBLIGATORIO */}
      <div className="kpi-container-row" style={{ marginBottom: '24px' }}>
        
        <div className="kpi-card-mobile" style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #10B981', border: '1px solid #E5E7EB', boxSizing: 'border-box' }}>
          <div className="kpi-title-mobile" style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280', fontSize: '13px', fontWeight: '600' }}>Ingresos <ArrowUpRight style={{ color: '#10B981' }} size={12} /></div>
          <div className="kpi-value-mobile" style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px', color: '#065F46' }}>+{stats.ingresosTotales.toFixed(0)}€</div>
        </div>
        
        <div className="kpi-card-mobile" style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #EF4444', border: '1px solid #E5E7EB', boxSizing: 'border-box' }}>
          <div className="kpi-title-mobile" style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280', fontSize: '13px', fontWeight: '600' }}>Gastos <ArrowDownRight style={{ color: '#EF4444' }} size={12} /></div>
          <div className="kpi-value-mobile" style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px', color: '#991B1B' }}>-{stats.gastosTotales.toFixed(0)}€</div>
        </div>
        
        <div className="kpi-card-mobile" style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #2563EB', border: '1px solid #E5E7EB', boxSizing: 'border-box' }}>
          <div className="kpi-title-mobile" style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280', fontSize: '13px', fontWeight: '600' }}>Ahorro <TrendingUp style={{ color: '#2563EB' }} size={12} /></div>
          <div className="kpi-value-mobile" style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px', color: '#1E40AF' }}>{stats.tasaAhorro.toFixed(1)}%</div>
        </div>

      </div>
                {/* CONTENEDOR DE ANÁLISIS EN DOS COLUMNAS (INGRESOS / GASTOS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        
        {/* COLUMNA 1: APARTADO DE INGRESOS CON SU CONCLUSIÓN */}
        <article style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ backgroundColor: '#E6F4EA', padding: '6px', borderRadius: '6px' }}><ArrowUpRight style={{ color: '#137333' }} size={20} /></div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>Análisis Estratégico de Ingresos</h2>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: '1', backgroundColor: '#F3F4F6', padding: '12px', borderRadius: '6px' }}>
              <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600' }}>Estables (Nómina)</span>
              <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px', color: '#111827' }}>2.822,02€</div>
            </div>
            <div style={{ flex: '1', backgroundColor: '#F3F4F6', padding: '12px', borderRadius: '6px' }}>
              <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600' }}>Flujos Puntuales</span>
              <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px', color: '#111827' }}>350,00€</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#F0FDF4', padding: '16px', borderRadius: '8px', border: '1px solid #DCFCE7', marginTop: 'auto' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#166534', margin: '0 0 6px 0' }}>Conclusión Ejecutivo MoneyMap:</h3>
            <p style={{ fontSize: '13px', color: '#14532D', lineHeight: '1.4', margin: '0' }}>
              La arquitectura de ingresos muestra una <strong>base de alta estabilidad estructural</strong> sostenida mediante el cobro recurrente de la nómina. Sin embargo, existe una <strong>elevada concentración del riesgo de ingresos (88%)</strong> en una sola fuente corporativa. Sería prudente estudiar la diversificación de flujos mediante inversiones o rentas secundarias para mitigar dependencias.
            </p>
          </div>
        </article>
 {/* COLUMNA 2: APARTADO DE GASTOS CON SU CONCLUSIÓN */}
        <article style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ backgroundColor: '#FDF2F2', padding: '6px', borderRadius: '6px' }}><ArrowDownRight style={{ color: '#B91C1C' }} size={20} /></div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>Análisis Estratégico de Gastos</h2>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: '1', backgroundColor: '#FDF2F2', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #EF4444' }}>
              <span style={{ fontSize: '11px', color: '#7F1D1D', fontWeight: '600' }}>Carga Fija</span>
              <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px', color: '#991B1B' }}>3.964,30€</div>
            </div>
            <div style={{ flex: '1', backgroundColor: '#FFFBEB', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #F59E0B' }}>
              <span style={{ fontSize: '11px', color: '#78350F', fontWeight: '600' }}>Fugas Ocio/Discrecional</span>
              <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px', color: '#92400E' }}>1.099,98€</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#FEF2F2', padding: '16px', borderRadius: '8px', border: '1px solid #FEE2E2', marginTop: 'auto' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#991B1B', margin: '0 0 6px 0' }}>Conclusión Ejecutivo MoneyMap:</h3>
            <p style={{ fontSize: '13px', color: '#7F1D1D', lineHeight: '1.4', margin: '0' }}>
              El patrón de gastos evidencia un <strong>alto peso de cargos fijos comprometidos</strong>, dominados por los recibos de amortización de préstamos (734,55€) y las cuotas recurrentes de vivienda. Se han detectado fugas de capital concentradas en compras discrecionales y transportes que reducen el margen neto. Optimizar estos gastos estructurales puede elevar la tasa de ahorro hasta un 15% adicional sin afectar el bienestar central.
            </p>
          </div>
        </article>

      </div> {/* Cierre del contenedor de dos columnas */}

      {/* NUEVO BLOQUE PROPUESTO: AUDITOR DE FUGAS Y SUSCRIPCIONES (QUICK WINS) */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E5E7EB', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#374151', marginBottom: '16px' }}>
          <span style={{ fontSize: '18px' }}>🚀</span> Plan de Acción Inmediato: Optimización de Suscripciones
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          
          <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: '700', color: '#92400E', fontSize: '14px' }}>Suscripción Telecomunicaciones (Simyo)</div>
              <div style={{ fontSize: '12px', color: '#B45309', marginTop: '2px' }}>Motivo: Tarifa duplicada o infrautilizada</div>
            </div>
            <div style={{ fontWeight: '800', color: '#92400E', fontSize: '16px' }}>-31,49€/mes</div>
          </div>

          <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: '700', color: '#991B1B', fontSize: '14px' }}>Gasto Discrecional Elevado (Qatar Airways)</div>
              <div style={{ fontSize: '12px', color: '#C53030', marginTop: '2px' }}>Motivo: Desvío presupuestario en Ocio/Viajes</div>
            </div>
            <div style={{ fontWeight: '800', color: '#991B1B', fontSize: '16px' }}>-1.099,98€</div>
          </div>

        </div>
      </section>
      
      {/* TABLA DE HISTORIAL OPERATIVO TEMPORAL 
      <section style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '16px 20px', backgroundColor: '#F3F4F6', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#374151', fontSize: '15px' }}>
          <Calendar size={16} /> Historial Operativo Bajo Criterio Temporal ({movimientosFiltrados.length} registros)
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB', color: '#4B5563', backgroundColor: '#FAFAFA', fontWeight: '600', fontSize: '13px' }}>
                <th style={{ padding: '12px 20px' }}>Fecha</th>
                <th style={{ padding: '12px 20px' }}>Concepto Registrado</th>
                <th style={{ padding: '12px 20px' }}>Categoría</th>
                <th style={{ padding: '12px 20px' }}>Estructura</th>
                <th style={{ padding: '12px 20px', textAlign: 'right' }}>Importe</th>
              </tr>
            </thead>
            <tbody>
              {movimientosFiltrados.map((mov, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }}>
                  <td style={{ padding: '12px 20px', color: '#6B7280', fontSize: '13px' }}>{mov.fecha}</td>
                  <td style={{ padding: '12px 20px', fontWeight: '600', color: '#111827' }}>{mov.descripcion}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#F3F4F6', color: '#374151', fontWeight: '600' }}>{mov.categoriaReducida}</span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: mov.naturaleza === 'fijo' ? '#EF4444' : mov.naturaleza === 'variable' ? '#F59E0B' : '#6B7280' }}>
                      {mov.naturaleza.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: '700', color: mov.importe > 0 ? '#10B981' : '#EF4444', fontSize: '14px' }}>
                    {mov.importe > 0 ? `+${mov.importe.toFixed(2)}` : `${mov.importe.toFixed(2)}`}€
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
             */}   
    </div>
  );
}
