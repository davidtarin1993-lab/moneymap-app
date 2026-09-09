"use client";

import { useState, useRef } from "react";
import Script from "next/script";
import Image from "next/image";
import { CheckCircle2, ArrowRight } from "lucide-react";

const CLIENT_ID = "AWQ-BQDiGzq297vDN3uW9sjgWYY6rqPZNPbTZzkdyDoirwHuJTFS3VoeQYA7F9ZfKTj52yvPoBWg01ZG";
const PLAN_ID_MENSUAL = "P-6L6220336F166293VNKQ2U4Y";
const PLAN_ID_ANUAL = "P-0FH01175UD464074SNKQ2VJA";

export default function PagoPage() {
  const [plan, setPlan] = useState<"mensual" | "anual">("mensual");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [datosConfirmados, setDatosConfirmados] = useState(false);
  const [sdkListo, setSdkListo] = useState(false);
  const [suscrito, setSuscrito] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const renderizado = useRef(false);

  const planId = plan === "mensual" ? PLAN_ID_MENSUAL : PLAN_ID_ANUAL;

  const renderizarBoton = () => {
    if (!contenedorRef.current || !(window as any).paypal) return;
    contenedorRef.current.innerHTML = "";

    (window as any).paypal.Buttons({
      style: { shape: "rect", color: "gold", layout: "vertical", label: "subscribe" },
      createSubscription: (data: any, actions: any) => {
        return actions.subscription.create({ plan_id: planId });
      },
      onApprove: async (data: any) => {
        try {
          await fetch("/api/public/registrar-suscripcion", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nombre,
              email,
              plan,
              subscriptionId: data.subscriptionID,
            }),
          });
        } catch (err) {
          console.error("Error al registrar la suscripción:", err);
        }
        setSuscrito(true);
      },
    }).render(contenedorRef.current);
  };

  const handleConfirmarDatos = (e: React.FormEvent) => {
    e.preventDefault();
    setDatosConfirmados(true);
    if (sdkListo) {
      setTimeout(renderizarBoton, 50);
    }
  };

  const handleSdkListo = () => {
    setSdkListo(true);
    if (datosConfirmados) {
      setTimeout(renderizarBoton, 50);
    }
  };

  const cambiarPlan = (nuevoPlan: "mensual" | "anual") => {
    setPlan(nuevoPlan);
    if (datosConfirmados && sdkListo) {
      setTimeout(renderizarBoton, 50);
    }
  };

  return (
    <main className="w-full min-h-screen bg-white text-slate-800 px-4 py-6 md:py-10 antialiased">
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${CLIENT_ID}&vault=true&intent=subscription`}
        onLoad={handleSdkListo}
      />

      <div className="max-w-md mx-auto w-full">
        <div className="flex justify-center mb-6">
          <Image src="/Multimedia/portada.png" alt="MoneyMap" width={160} height={46} className="object-contain" unoptimized />
        </div>

        {suscrito ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
            <CheckCircle2 size={28} className="text-emerald-600 mx-auto mb-3" />
            <h2 className="text-sm font-black text-emerald-800 mb-2">¡Suscripción confirmada!</h2>
            <p className="text-xs text-emerald-700 font-medium leading-relaxed">
              En breve activaremos tu cuenta y recibirás un email para crear tu contraseña de acceso. Si tienes alguna duda, escríbenos a hola.moneymap@gmail.com.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-lg font-black text-[#0B3A6E] text-center mb-1">Suscríbete a MoneyMap</h1>
            <p className="text-xs text-slate-500 text-center font-medium mb-5">Tu dinero, con dirección.</p>

            <div className="inline-flex bg-slate-100 border border-slate-200 rounded-xl p-1 gap-1 mb-5 w-full">
              <button
                type="button"
                onClick={() => cambiarPlan("mensual")}
                className={`flex-1 text-xs font-black uppercase tracking-wider px-3 py-2.5 rounded-lg transition-all ${plan === "mensual" ? "bg-[#0B3A6E] text-white" : "text-slate-500"}`}
              >
                Mensual — 8,99€
              </button>
              <button
                type="button"
                onClick={() => cambiarPlan("anual")}
                className={`flex-1 text-xs font-black uppercase tracking-wider px-3 py-2.5 rounded-lg transition-all ${plan === "anual" ? "bg-[#0B3A6E] text-white" : "text-slate-500"}`}
              >
                Anual — 99,99€
              </button>
            </div>

            {!datosConfirmados ? (
              <form onSubmit={handleConfirmarDatos} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <p className="text-[11px] text-slate-500 font-medium mb-1">
                  Antes de pagar, dinos quién eres para poder activar tu cuenta en cuanto se confirme el pago.
                </p>
                <input
                  type="text"
                  required
                  placeholder="Tu nombre completo"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#0B3A6E] font-medium"
                />
                <input
                  type="email"
                  required
                  placeholder="Tu correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#0B3A6E] font-medium"
                />
                <button
                  type="submit"
                  className="w-full bg-[#0B3A6E] hover:bg-[#11498a] text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  Continuar al pago <ArrowRight size={14} />
                </button>
              </form>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <p className="text-[11px] text-slate-500 font-medium mb-3 text-center">
                  Plan {plan === "mensual" ? "mensual (8,99€/mes)" : "anual (99,99€/año)"} — {nombre}
                </p>
                <div ref={contenedorRef} />
                <button
                  onClick={() => setDatosConfirmados(false)}
                  className="w-full text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-3"
                >
                  ← Cambiar mis datos
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}