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
  TrendingUp,
  Scale,
  MapPinned,
  GraduationCap,
  Sparkles,
  LineChart,
  LifeBuoy,
  Star,
} from "lucide-react";

// Guardar en: app/encuesta/page.tsx

interface Respuestas {
  perfil: string;
  sentimiento: number | null;
  confianza: number | null;
  interesPrincipal: string;

  utilidadMovimientos: number | null;
  precisionClasificacion: string;
  faltaGastos: string;

  utilidadFiscalidad: number | null;
  ayudaFiscal: string;
  dudasFiscales: string;

  utilidadRuta: number | null;
  rutaAjustada: string;
  cambiariaRuta: string;

  utilidadAcademia: number | null;
  formatoPreferido: string;
  temasAprender: string;

  utilidadAplicaciones: number | null;
  appsUsadas: string[];
  fiabilidadApps: string;

  utilidadCartera: number | null;
  invertiriasCartera: string;
  faltaCartera: string;

  utilidadSoporte: number | null;
  tiempoRespuesta: string;

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
  interesPrincipal: "",

  utilidadMovimientos: null,
  precisionClasificacion: "",
  faltaGastos: "",

  utilidadFiscalidad: null,
  ayudaFiscal: "",
  dudasFiscales: "",

  utilidadRuta: null,
  rutaAjustada: "",
  cambiariaRuta: "",

  utilidadAcademia: null,
  formatoPreferido: "",
  temasAprender: "",

  utilidadAplicaciones: null,
  appsUsadas: [],
  fiabilidadApps: "",

  utilidadCartera: null,
  invertiriasCartera: "",
  faltaCartera: "",

  utilidadSoporte: null,
  tiempoRespuesta: "",

  facilidadUso: null,
  queConfundio: "",
  opinionPrecio: "",
  pagarias: "",
  nps: null,
  futuro: "",
  mejoras: "",
  emailContacto: "",
};

const AREAS_INTERES = [
  { valor: "movimientos", label: "Gastos / Movimientos" },
  { valor: "fiscalidad", label: "Fiscalidad" },
  { valor: "ruta", label: "Ruta (asesoramiento)" },
  { valor: "academia", label: "Academia" },
  { valor: "aplicaciones", label: "Apps y calculadoras" },
  { valor: "cartera", label: "Cartera de inversión" },
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

function SelectorMultiple({
  opciones,
  valores,
  onChange,
}: {
  opciones: { valor: string; label: string }[];
  valores: string[];
  onChange: (v: string[]) => void;
}) {
  function alternar(v: string) {
    onChange(valores.includes(v) ? valores.filter((x) => x !== v) : [...valores, v]);
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {opciones.map((op) => (
        <button
          key={op.valor}
          type="button"
          onClick={() => alternar(op.valor)}
          className={`px-3 py-2 rounded-xl text-[11px] font-black transition-all ${
            valores.includes(op.valor)
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

function Pregunta({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-slate-500 font-bold mb-1.5">{children}</p>;
}

function CampoTexto({
  valor,
  onChange,
  placeholder,
  rows = 3,
}: {
  valor: string;
  onChange: (v: string) => void;
  placeholder: string;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[12px] focus:outline-none focus:border-[#0B3A6E] font-medium resize-none"
    />
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
            5 minutos. Tus respuestas son anónimas salvo que quieras dejarnos tu email, y nos sirven para
            decidir cómo sigue MoneyMap a partir de ahora.
          </p>
        </header>

        {/* PERFIL */}
        <BloqueEncuesta icono={<Compass size={15} className="text-[#0B3A6E]" />} titulo="Para empezar">
          <Pregunta>¿Cuál es tu relación con MoneyMap?</Pregunta>
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
            <Pregunta>¿Cómo te hace sentir usar MoneyMap?</Pregunta>
            <EscalaNumerica
              valor={respuestas.sentimiento}
              onChange={(v) => actualizar("sentimiento", v)}
              etiquetaMin="Me abruma / confunde"
              etiquetaMax="Me da tranquilidad"
            />
          </div>
          <div>
            <Pregunta>¿Confías en la herramienta para gestionar tus finanzas?</Pregunta>
            <EscalaNumerica
              valor={respuestas.confianza}
              onChange={(v) => actualizar("confianza", v)}
              etiquetaMin="Nada"
              etiquetaMax="Totalmente"
            />
          </div>
        </BloqueEncuesta>

        {/* QUÉ TE PARECE MÁS INTERESANTE */}
        <BloqueEncuesta
          icono={<Star size={15} className="text-[#0B3A6E]" />}
          titulo="¿Qué parte te parece más interesante?"
          subtitulo="Elige la que más valor te aporta — profundizamos en cada una justo debajo"
        >
          <SelectorOpciones
            valor={respuestas.interesPrincipal}
            onChange={(v) => actualizar("interesPrincipal", v)}
            opciones={AREAS_INTERES}
          />
        </BloqueEncuesta>

        {/* MOVIMIENTOS / GASTOS */}
        <BloqueEncuesta
          icono={<TrendingUp size={15} className="text-[#0B3A6E]" />}
          titulo="Gastos y movimientos"
          subtitulo="El mapa visual de ingresos y gastos"
        >
          <div>
            <Pregunta>¿Qué tan útil te resulta? (1 = nada, 5 = mucho)</Pregunta>
            <EscalaNumerica valor={respuestas.utilidadMovimientos} onChange={(v) => actualizar("utilidadMovimientos", v)} />
          </div>
          <div>
            <Pregunta>¿La clasificación automática de tus gastos te pareció precisa?</Pregunta>
            <SelectorOpciones
              valor={respuestas.precisionClasificacion}
              onChange={(v) => actualizar("precisionClasificacion", v)}
              opciones={[
                { valor: "si_bastante", label: "Sí, bastante" },
                { valor: "mas_o_menos", label: "Más o menos" },
                { valor: "falla_mucho", label: "Falla mucho" },
                { valor: "no_probado", label: "No lo he probado" },
              ]}
            />
          </div>
          <div>
            <Pregunta>¿Qué echas en falta en el mapa de gastos? (opcional)</Pregunta>
            <CampoTexto
              valor={respuestas.faltaGastos}
              onChange={(v) => actualizar("faltaGastos", v)}
              placeholder="Ej: alertas, comparar meses, exportar a Excel..."
            />
          </div>
        </BloqueEncuesta>

        {/* FISCALIDAD */}
        <BloqueEncuesta
          icono={<Scale size={15} className="text-[#0B3A6E]" />}
          titulo="Fiscalidad"
          subtitulo="Ayuda con tu declaración y documentos fiscales"
        >
          <div>
            <Pregunta>¿Qué tan útil te resulta? (1 = nada, 5 = mucho)</Pregunta>
            <EscalaNumerica valor={respuestas.utilidadFiscalidad} onChange={(v) => actualizar("utilidadFiscalidad", v)} />
          </div>
          <div>
            <Pregunta>¿Te ayudó a entender mejor tu declaración de la renta?</Pregunta>
            <SelectorOpciones
              valor={respuestas.ayudaFiscal}
              onChange={(v) => actualizar("ayudaFiscal", v)}
              opciones={[
                { valor: "si", label: "Sí" },
                { valor: "no", label: "No" },
                { valor: "no_probado", label: "No lo he probado" },
              ]}
            />
          </div>
          <div>
            <Pregunta>¿Qué dudas fiscales te gustaría que cubriera la app? (opcional)</Pregunta>
            <CampoTexto
              valor={respuestas.dudasFiscales}
              onChange={(v) => actualizar("dudasFiscales", v)}
              placeholder="Ej: deducciones autonómicas, autónomos, alquiler..."
            />
          </div>
        </BloqueEncuesta>

        {/* RUTA */}
        <BloqueEncuesta
          icono={<MapPinned size={15} className="text-[#0B3A6E]" />}
          titulo="Ruta (asesoramiento personalizado)"
        >
          <div>
            <Pregunta>¿Qué tan útil te resulta? (1 = nada, 5 = mucho)</Pregunta>
            <EscalaNumerica valor={respuestas.utilidadRuta} onChange={(v) => actualizar("utilidadRuta", v)} />
          </div>
          <div>
            <Pregunta>¿La ruta propuesta se ajustaba a tu situación real?</Pregunta>
            <SelectorOpciones
              valor={respuestas.rutaAjustada}
              onChange={(v) => actualizar("rutaAjustada", v)}
              opciones={[
                { valor: "si", label: "Sí" },
                { valor: "mas_o_menos", label: "Más o menos" },
                { valor: "no", label: "No" },
                { valor: "no_solicitada", label: "No la he solicitado" },
              ]}
            />
          </div>
          <div>
            <Pregunta>¿Qué cambiarías del proceso de solicitar tu ruta? (opcional)</Pregunta>
            <CampoTexto
              valor={respuestas.cambiariaRuta}
              onChange={(v) => actualizar("cambiariaRuta", v)}
              placeholder="Ej: tiempo de espera, más preguntas iniciales, seguimiento..."
            />
          </div>
        </BloqueEncuesta>

        {/* ACADEMIA */}
        <BloqueEncuesta
          icono={<GraduationCap size={15} className="text-[#0B3A6E]" />}
          titulo="Academia"
          subtitulo="Píldoras, noticias y contenido formativo"
        >
          <div>
            <Pregunta>¿Qué tan útil te resulta? (1 = nada, 5 = mucho)</Pregunta>
            <EscalaNumerica valor={respuestas.utilidadAcademia} onChange={(v) => actualizar("utilidadAcademia", v)} />
          </div>
          <div>
            <Pregunta>¿Qué formato de contenido prefieres?</Pregunta>
            <SelectorOpciones
              valor={respuestas.formatoPreferido}
              onChange={(v) => actualizar("formatoPreferido", v)}
              opciones={[
                { valor: "pildoras", label: "Píldoras cortas" },
                { valor: "noticias", label: "Noticias" },
                { valor: "cartera_modelo", label: "Cartera modelo" },
                { valor: "ninguno", label: "Ninguno me engancha" },
              ]}
            />
          </div>
          <div>
            <Pregunta>¿Sobre qué te gustaría aprender más? (opcional)</Pregunta>
            <CampoTexto
              valor={respuestas.temasAprender}
              onChange={(v) => actualizar("temasAprender", v)}
              placeholder="Ej: inversión para principiantes, hipotecas, ahorro fiscal..."
            />
          </div>
        </BloqueEncuesta>

        {/* APLICACIONES */}
        <BloqueEncuesta
          icono={<Sparkles size={15} className="text-[#0B3A6E]" />}
          titulo="Apps y calculadoras"
          subtitulo="Hipoteca, perfil de riesgo, quiz, proyector de patrimonio"
        >
          <div>
            <Pregunta>¿Qué tan útil te resulta? (1 = nada, 5 = mucho)</Pregunta>
            <EscalaNumerica valor={respuestas.utilidadAplicaciones} onChange={(v) => actualizar("utilidadAplicaciones", v)} />
          </div>
          <div>
            <Pregunta>¿Cuáles usaste? (puedes marcar varias)</Pregunta>
            <SelectorMultiple
              valores={respuestas.appsUsadas}
              onChange={(v) => actualizar("appsUsadas", v)}
              opciones={[
                { valor: "hipoteca", label: "Simulador de hipoteca" },
                { valor: "riesgo", label: "Perfil de riesgo" },
                { valor: "quiz", label: "Quiz financiero" },
                { valor: "patrimonio", label: "Proyector de patrimonio" },
                { valor: "ninguna", label: "Ninguna" },
              ]}
            />
          </div>
          <div>
            <Pregunta>¿Te resultaron fiables los resultados?</Pregunta>
            <SelectorOpciones
              valor={respuestas.fiabilidadApps}
              onChange={(v) => actualizar("fiabilidadApps", v)}
              opciones={[
                { valor: "si", label: "Sí" },
                { valor: "mas_o_menos", label: "Más o menos" },
                { valor: "no", label: "No" },
                { valor: "no_probado", label: "No las he probado" },
              ]}
            />
          </div>
        </BloqueEncuesta>

        {/* CARTERA DE INVERSIÓN */}
        <BloqueEncuesta
          icono={<LineChart size={15} className="text-[#0B3A6E]" />}
          titulo="Cartera de inversión"
          subtitulo="Cartera modelo MoneyMap"
        >
          <div>
            <Pregunta>¿Qué tan útil te resulta? (1 = nada, 5 = mucho)</Pregunta>
            <EscalaNumerica valor={respuestas.utilidadCartera} onChange={(v) => actualizar("utilidadCartera", v)} />
          </div>
          <div>
            <Pregunta>¿Invertirías replicando la cartera modelo de MoneyMap?</Pregunta>
            <SelectorOpciones
              valor={respuestas.invertiriasCartera}
              onChange={(v) => actualizar("invertiriasCartera", v)}
              opciones={[
                { valor: "si", label: "Sí" },
                { valor: "tal_vez", label: "Tal vez" },
                { valor: "no", label: "No" },
              ]}
            />
          </div>
          <div>
            <Pregunta>¿Qué información echas en falta sobre la cartera? (opcional)</Pregunta>
            <CampoTexto
              valor={respuestas.faltaCartera}
              onChange={(v) => actualizar("faltaCartera", v)}
              placeholder="Ej: rentabilidad histórica, composición, nivel de riesgo..."
            />
          </div>
        </BloqueEncuesta>

        {/* SOPORTE */}
        <BloqueEncuesta icono={<LifeBuoy size={15} className="text-[#0B3A6E]" />} titulo="Soporte">
          <div>
            <Pregunta>¿Qué tan útil te resulta? (1 = nada, 5 = mucho)</Pregunta>
            <EscalaNumerica valor={respuestas.utilidadSoporte} onChange={(v) => actualizar("utilidadSoporte", v)} />
          </div>
          <div>
            <Pregunta>¿Qué tal fue el tiempo de respuesta?</Pregunta>
            <SelectorOpciones
              valor={respuestas.tiempoRespuesta}
              onChange={(v) => actualizar("tiempoRespuesta", v)}
              opciones={[
                { valor: "rapido", label: "Rápido" },
                { valor: "normal", label: "Normal" },
                { valor: "lento", label: "Lento" },
                { valor: "no_usado", label: "No lo he usado" },
              ]}
            />
          </div>
        </BloqueEncuesta>

        {/* FACILIDAD DE USO */}
        <BloqueEncuesta icono={<ShieldCheck size={15} className="text-[#0B3A6E]" />} titulo="Facilidad de uso general">
          <div>
            <Pregunta>¿Qué tan fácil te resulta usar la app?</Pregunta>
            <EscalaNumerica
              valor={respuestas.facilidadUso}
              onChange={(v) => actualizar("facilidadUso", v)}
              etiquetaMin="Complicada"
              etiquetaMax="Muy fácil"
            />
          </div>
          <div>
            <Pregunta>¿Hay algo que te resultó confuso o poco claro? (opcional)</Pregunta>
            <CampoTexto
              valor={respuestas.queConfundio}
              onChange={(v) => actualizar("queConfundio", v)}
              placeholder="Cuéntanoslo con tus palabras..."
            />
          </div>
        </BloqueEncuesta>

        {/* PRECIO */}
        <BloqueEncuesta icono={<Euro size={15} className="text-[#0B3A6E]" />} titulo="Precio">
          <div>
            <Pregunta>La suscripción cuesta 9,99€/mes (99,99€/año). ¿Qué te parece?</Pregunta>
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
            <Pregunta>¿Pagarías por MoneyMap?</Pregunta>
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
            <Pregunta>Del 0 al 10, ¿qué probabilidad hay de que recomiendes MoneyMap a alguien?</Pregunta>
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
            <Pregunta>Con sinceridad: ¿crees que deberíamos seguir desarrollando MoneyMap?</Pregunta>
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
            <Pregunta>¿Qué añadirías, quitarías o cambiarías? (opcional, pero es lo que más nos ayuda)</Pregunta>
            <CampoTexto
              valor={respuestas.mejoras}
              onChange={(v) => actualizar("mejoras", v)}
              placeholder="Sin filtros, dinos qué mejorarías..."
              rows={4}
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
