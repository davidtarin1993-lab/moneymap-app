"use client";

import React from 'react';
import Link from 'next/link';
import { LogIn, ArrowRight, ShieldCheck, TrendingUp, Cpu, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="w-full min-h-screen bg-white text-slate-800 font-sans antialiased flex flex-col justify-between selection:bg-[#0B3A6E]/10">
      
      {/* 1. BARRA DE NAVEGACIÓN SUPERIOR COMMERCIAL */}
      <nav className="w-full max-w-5xl mx-auto px-4 py-4 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0B3A6E] rounded-xl flex items-center justify-center text-white text-sm font-black shadow-sm">
            M
          </div>
          <span className="text-base font-black text-[#0B3A6E] tracking-tight uppercase">MoneyMap</span>
        </div>
        
        <Link 
          href="/login" 
          className="text-xs font-black uppercase tracking-wider px-4 py-2 border border-slate-200 rounded-xl text-[#0B3A6E] bg-white hover:bg-slate-50 transition-all flex items-center gap-1.5"
        >
          <LogIn size={12} /> Acceso Clientes
        </Link>
      </nav>

      {/* 2. CONTENIDO HERO PRINCIPAL DE VENTAS (SIN BANNER SUPERIOR) */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-3xl mx-auto space-y-6">

        {/* Titular de Impacto Corporativo */}
        <h1 className="text-3xl md:text-5xl font-black text-[#0B3A6E] tracking-tight leading-tight uppercase">
          Tu dinero necesita <span className="text-[#1FA187]">dirección</span>, <br className="hidden sm:inline" /> no más esfuerzo.
        </h1>

        {/* Subtítulo de propuesta de valor */}
        <p className="text-slate-500 text-sm md:text-base font-medium max-w-xl leading-relaxed">
          Centraliza tus flujos de caja, analiza tu mix de ingresos multicampaña y optimiza tu eficiencia fiscal de forma automatizada.
        </p>

        {/* BOTÓN DE ACCIÓN PRINCIPAL AL LOGIN */}
        <div className="pt-2">
          <Link
            href="/login"
            className="bg-[#0B3A6E] text-white text-xs font-black uppercase tracking-wider px-6 py-3.5 rounded-2xl flex items-center gap-2 shadow-[0_8px_25px_rgba(11,58,110,0.15)] hover:bg-[#11498a] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Iniciar Sesión <ArrowRight size={13} />
          </Link>
        </div>
        {/* 3. PROPUESTAS DE VALOR DESTACADAS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 w-full max-w-3xl text-left">
          
          <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-1.5 hover:shadow-md hover:border-slate-300 transition-all">
            <div className="text-[#1FA187] font-black flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <TrendingUp size={14} /> Mix de Ingresos
            </div>
            <p className="text-[11px] text-slate-500 font-semibold leading-normal">
              Visualización combinada y evolutiva de rentas del trabajo y del ahorro.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-1.5 hover:shadow-md hover:border-slate-300 transition-all">
            <div className="text-[#0B3A6E] font-black flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <ShieldCheck size={14} /> Presión Fiscal
            </div>
            <p className="text-[11px] text-slate-500 font-semibold leading-normal">
              Auditoría automatizada de tu tipo medio real de gravamen y ratios de IRPF.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-1.5 hover:shadow-md hover:border-slate-300 transition-all">
            <div className="text-blue-500 font-black flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Cpu size={14} /> Gestión de Citas
            </div>
            <p className="text-[11px] text-slate-500 font-semibold leading-normal">
              Sincronización de asesoramiento uno a uno bloqueando horarios ocupados.
            </p>
          </div>

        </div>

      </main>

      {/* 4. PIE DE PÁGINA */}
      <footer className="w-full text-center py-4 border-t border-slate-100 text-slate-400 text-[10px] font-bold tracking-wide uppercase">
        © {new Date().getFullYear()} MoneyMap. Todos los derechos reservados.
      </footer>

    </div>
  );
}
