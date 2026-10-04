"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ClipboardList,
  Smile,
  ShieldCheck,
  Gauge,
  Euro,
  ThumbsUp,
  Compass,
  Send,
  CheckCircle2,
} from "lucide-react";

// Guardar en: app/encuesta/page.tsx

interface Respuestas {
  perfil: string;
  sentimiento: number | null;
  confianza: number | null;
  utilidadMovimientos: number | null;
  utilidadFiscalidad: number | null;
  utilidadRuta: number | null;
  utilidadAcademia: number | null;
  utilidadAplicaciones: number | null;
  utilidadCartera: number | null;
  utilidadSoporte: number | null;
  facilidadUso: number | null;
  queConfundio: string;
  opinionPrecio: string;
  pagarias: string;
  nps: number | null;
  futuro: string;
  mejoras: string;
  emailContacto: string;
}

const ESTADO_INICIAL: Respuestas = {
  perfil: "",
  sentimiento: null,
  confianza: null,
  utilidadMovimientos: null,
  utilidadFiscalidad: null,
  utilidadRuta: null,
  utilidadAcademia: null,
  utilidadAplicaciones: null,
  utilidadCartera: null,
  utilidadSoporte: null,
  facilidadUso: null,
  queConfundio: "",
  opinionPrecio: "",
  pagarias: "",
  nps: null,
  futuro: "",
  mejoras: "",
  emailContacto: "",
};

const MODULOS: { clave: keyof Respuestas; label: string }[] = [
  { clave: "utilidadMovimientos", label: "Movimientos Bancarios" },
  { clave: "utilidadFiscalidad", label: "Fiscalidad" },
  { clave: "utilidadRuta", label: "Ruta (asesoramiento)" },
  { clave: "utilidadAcademia", label: "Academia" },
  { clave: "utilidadAplicaciones", label: "Apps y calculadoras" },
  { clave: "utilidadCartera", label: "Cartera MoneyMap" },
  { clave: "utilidadSoporte", label: "Soporte" },
];

function EscalaNumerica({
  valor,
  onChange,
  min = 1,
  max = 5,
  etiquetaMin,
  etiquetaMax,
}: {
  valor: number | null;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  etiquetaMin?: string;
  etiquetaMax?: string;
}) {
  const opciones = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div>
      <div className="flex gap-1.5 flex-wrap">
        {opciones.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-9 h-9 rounded-xl text-xs font-black transition-all shrink-0 ${
              valor === n
                ? "bg-[#0B3A6E] text-white"
                : "bg-slate-50 border border-slate-200 text-slate-500 hover:border-[#0B3A6E]/30"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      {(etiquetaMin || etiquetaMax) && (
        <div className="flex justify-between mt-1.5 text-[9px] text-slate-400 font-bold">
          <span>{etiquetaMin}</span>
          <span>{etiquetaMax}</span>
        </div>
      )}
    </div>
  );
}

function SelectorOpciones({
  opciones,
  valor,
  onChange,
}: {
  opciones: { valor: string; label: string }[];
  valor: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {opciones.map((op) => (
        <button
          key={op.valor}
          type="button"
          onClick={() => onChange(op.valor)}
          className={`px-3 py-2 rounded-xl text-[11px] font-black transition-all ${
            valor === op.valor
              ? "bg-[#0B3A6E] text-white"
              : "bg-slate-50 border border-slate-200 text-slate-500 hover:border-[#0B3A6E]/30"
          }`}
        >
          {op.label}
        </button>
      ))}
    </div>
  );
}

function BloqueEncuesta({
  icono,
  titulo,
  subtitulo,
  children,
}: {
  icono: React.ReactNode;
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <div className="bg-[#0B3A6E]/10 p-1.5 rounded-lg shrink-0">{icono}</div>
        <div>
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">{titulo}</h2>
          {subtitulo && <p className="text-[10px] text-slate-400 font-medium">{subtitulo}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function EncuestaPage() {
  const [respuestas, setRespuestas] = useState<Respuestas>(ESTADO_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  function actualizar<K extends keyof Respuestas>(clave: K, valor: Respuestas[K]) {
    setRespuestas((prev) => ({ ...prev, [clave]: valor }));
  }

  async function enviarEncuesta() {
    setError("");

    if (!respuestas.perfil || respuestas.sentimiento === null || !respuestas.futuro) {
      setError("Por favor, completa al menos tu perfil, la sensación general y la última pregunta sobre el futuro de la app.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/encuesta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(respuestas),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo enviar la encuesta.");
      setEnviado(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center space-y-3 max-w-sm">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 size={26} />
          </div>
          <h1 className="text-lg font-black text-slate-800">¡Gracias por tu tiempo!</h1>
          <p className="text-sm text-slate-500 font-medium">
            Tu opinión nos ayuda muchísimo a decidir hacia dónde llevar MoneyMap.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 px-4 py-6 font-sans pb-16 antialiased">
      <div className="max-w-xl mx-auto space-y-4">

        {/* CABECERA */}
        <header className="text-center space-y-2 pb-2">
          <Image src="/Multimedia/portada.png" alt="MoneyMap" width={140} height={40} className="mx-auto object-contain" />
          <div className="flex items-center justify-center gap-2">
            <div className="bg-[#0B3A6E] p-2 rounded-xl">
              <ClipboardList size={18} className="text-[#1FA187]" />
            </div>
            <h1 className="text-lg font-black text-[#0B3A6E]">Encuesta MoneyMap</h1>
          </div>
          <p className="text-[11.5px] text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
            2-3 minutos. Tus respuestas son anónimas salvo que quieras dejarnos tu email, y nos sirven para
            decidir cómo sigue MoneyMap a partir de ahora.
          </p>
        </header>

        {/* PERFIL */}
        <BloqueEncuesta icono={<Compass size={15} className="text-[#0B3A6E]" />} titulo="Para empezar">
          <p className="text-[11px] text-slate-500 font-bold">¿Cuál es tu relación con MoneyMap?</p>
          <SelectorOpciones
            valor={respuestas.perfil}
            onChange={(v) => actualizar("perfil", v)}
            opciones={[
              { valor: "cliente", label: "Soy cliente" },
              { valor: "probe_demo", label: "Probé la demo" },
              { valor: "no_he_usado", label: "No la he usado" },
            ]}
          />
        </BloqueEncuesta>

        {/* SENTIMIENTO Y CONFIANZA */}
        <BloqueEncuesta
          icono={<Smile size={15} className="text-[#0B3A6E]" />}
          titulo="Sensación general"
          subtitulo="Lo primero, sin pensarlo mucho"
        >
          <div>
            <p className="text-[11px] text-slate-500 font-bold mb-1.5">¿Cómo te hace sentir usar MoneyMap?</p>
            <EscalaNumerica
              valor={respuestas.sentimiento}
              onChange={(v) => actualizar("sentimiento", v)}
              etiquetaMin="Me abruma / confunde"
              etiquetaMax="Me da tranquilidad"
            />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-bold mb-1.5">¿Confías en la herramienta para gestionar tus finanzas?</p>
            <EscalaNumerica
              valor={respuestas.confianza}
              onChange={(v) => actualizar("confianza", v)}
              etiquetaMin="Nada"
              etiquetaMax="Totalmente"
            />
          </div>
        </BloqueEncuesta>

        {/* UTILIDAD POR MÓDULO */}
        <BloqueEncuesta
          icono={<Gauge size={15} className="text-[#0B3A6E]" />}
          titulo="Contenido y funciones"
          subtitulo="Valora cada parte (1 = nada útil, 5 = muy útil)"
        >
          {MODULOS.map((modulo) => (
            <div key={modulo.clave}>
              <p className="text-[11px] text-slate-500 font-bold mb-1.5">{modulo.label}</p>
              <EscalaNumerica
                valor={respuestas[modulo.clave] as number | null}
                onChange={(v) => actualizar(modulo.clave, v as any)}
              />
            </div>
          ))}
        </BloqueEncuesta>

        {/* FACILIDAD DE USO */}
        <BloqueEncuesta icono={<ShieldCheck size={15} className="text-[#0B3A6E]" />} titulo="Facilidad de uso">
          <div>
            <p className="text-[11px] text-slate-500 font-bold mb-1.5">¿Qué tan fácil te resulta usar la app?</p>
            <EscalaNumerica
              valor={respuestas.facilidadUso}
              onChange={(v) => actualizar("facilidadUso", v)}
              etiquetaMin="Complicada"
              etiquetaMax="Muy fácil"
            />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-bold mb-1.5">¿Hay algo que te resultó confuso o poco claro? (opcional)</p>
            <textarea
              rows={3}
              value={respuestas.queConfundio}
              onChange={(e) => actualizar("queConfundio", e.target.value)}
              placeholder="Cuéntanoslo con tus palabras..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[12px] focus:outline-none focus:border-[#0B3A6E] font-medium resize-none"
            />
          </div>
        </BloqueEncuesta>

        {/* PRECIO */}
        <BloqueEncuesta icono={<Euro size={15} className="text-[#0B3A6E]" />} titulo="Precio">
          <div>
            <p className="text-[11px] text-slate-500 font-bold mb-1.5">La suscripción cuesta 9,99€/mes (99,99€/año). ¿Qué te parece?</p>
            <SelectorOpciones
              valor={respuestas.opinionPrecio}
              onChange={(v) => actualizar("opinionPrecio", v)}
              opciones={[
                { valor: "caro", label: "Caro" },
                { valor: "justo", label: "Justo" },
                { valor: "barato", label: "Barato" },
              ]}
            />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-bold mb-1.5">¿Pagarías por MoneyMap?</p>
            <SelectorOpciones
              valor={respuestas.pagarias}
              onChange={(v) => actualizar("pagarias", v)}
              opciones={[
                { valor: "si", label: "Sí" },
                { valor: "no", label: "No" },
                { valor: "ns", label: "No lo sé aún" },
              ]}
            />
          </div>
        </BloqueEncuesta>

        {/* VIABILIDAD / FUTURO */}
        <BloqueEncuesta
          icono={<ThumbsUp size={15} className="text-[#0B3A6E]" />}
          titulo="El futuro de MoneyMap"
          subtitulo="Esta parte nos ayuda más que ninguna otra"
        >
          <div>
            <p className="text-[11px] text-slate-500 font-bold mb-1.5">
              Del 0 al 10, ¿qué probabilidad hay de que recomiendes MoneyMap a alguien?
            </p>
            <EscalaNumerica
              valor={respuestas.nps}
              onChange={(v) => actualizar("nps", v)}
              min={0}
              max={10}
              etiquetaMin="Nada probable"
              etiquetaMax="Muy probable"
            />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-bold mb-1.5">
              Con sinceridad: ¿crees que deberíamos seguir desarrollando MoneyMap?
            </p>
            <SelectorOpciones
              valor={respuestas.futuro}
              onChange={(v) => actualizar("futuro", v)}
              opciones={[
                { valor: "seguir", label: "Sí, claramente" },
                { valor: "cambios", label: "Sí, pero con cambios importantes" },
                { valor: "no_futuro", label: "No le veo futuro" },
              ]}
            />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-bold mb-1.5">
              ¿Qué añadirías, quitarías o cambiarías? (opcional, pero es lo que más nos ayuda)
            </p>
            <textarea
              rows={4}
              value={respuestas.mejoras}
              onChange={(e) => actualizar("mejoras", e.target.value)}
              placeholder="Sin filtros, dinos qué mejorarías..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[12px] focus:outline-none focus:border-[#0B3A6E] font-medium resize-none"
            />
          </div>
        </BloqueEncuesta>

        {/* CONTACTO OPCIONAL */}
        <BloqueEncuesta icono={<Send size={15} className="text-[#0B3A6E]" />} titulo="¿Quieres que te respondamos?">
          <p className="text-[11px] text-slate-500 font-medium">
            Déjanos tu email si quieres que te contactemos sobre tu respuesta (totalmente opcional).
          </p>
          <input
            type="email"
            value={respuestas.emailContacto}
            onChange={(e) => actualizar("emailContacto", e.target.value)}
            placeholder="tu@email.com"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[12px] focus:outline-none focus:border-[#0B3A6E] font-medium"
          />
        </BloqueEncuesta>

        {error && (
          <p className="text-red-500 text-[11px] font-bold text-center px-2">{error}</p>
        )}

        <button
          onClick={enviarEncuesta}
          disabled={enviando}
          className="w-full bg-[#0B3A6E] hover:bg-[#11498a] disabled:opacity-60 text-white text-xs font-black uppercase tracking-wider px-5 py-3.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
        >
          {enviando ? "Enviando..." : <>Enviar encuesta <Send size={14} /></>}
        </button>
      </div>
    </div>
  );
}
