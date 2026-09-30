"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";

interface Question {
  id: string;
  label: string;
  type: "text" | "choice" | "number";
  options?: string[];
}

interface EventConfig {
  title: string;
  targetDate: string;
  plan: string;
  active: boolean;
  questions: Question[];
  whatsappPhone?: string;
}

function PublicEventContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;

  // Leer parámetro ?pases=X de la URL (por defecto 2 pases)
  const pasesParam = searchParams.get("pases");
  const maxPases = pasesParam && !isNaN(Number(pasesParam)) && Number(pasesParam) > 0 
    ? parseInt(pasesParam, 10) 
    : 2;

  const [config, setConfig] = useState<EventConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Pasos del formulario: 'asistencia' -> 'detalles' -> 'mensaje' -> 'finalizado'
  const [step, setStep] = useState<"asistencia" | "detalles" | "mensaje" | "finalizado">("asistencia");
  const [asistira, setAsistira] = useState<boolean | null>(null);

  // Datos recopilados
  const [nombreInvitado, setNombreInvitado] = useState("");
  const [telefonoWhatsapp, setTelefonoWhatsapp] = useState("");
  const [pasesSeleccionados, setPasesSeleccionados] = useState<number>(1);
  const [nombresAsistentes, setNombresAsistentes] = useState<string[]>([""]);
  const [mensajeDeseos, setMensajeDeseos] = useState("");
  const [extraAnswers, setExtraAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/form-config?event=${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setConfig(data.data);
        }
      })
      .catch((err) => console.error("Error al cargar evento:", err))
      .finally(() => setLoading(false));
  }, [slug]);

  const handlePasesChange = (cantidad: number) => {
    setPasesSeleccionados(cantidad);
    const nuevosNombres = Array(cantidad)
      .fill("")
      .map((_, i) => nombresAsistentes[i] || "");
    setNombresAsistentes(nuevosNombres);
  };

  const handleNombreChange = (index: number, valor: string) => {
    const copia = [...nombresAsistentes];
    copia[index] = valor;
    setNombresAsistentes(copia);
  };

  // Paso 1 -> Avanzar según la respuesta de asistencia
  const handleDecisionAsistencia = (asiste: boolean) => {
    setAsistira(asiste);
    if (asiste) {
      setStep("detalles");
    } else {
      setStep("mensaje"); // Si dice que no, pasa directo a escribir su mensaje de disculpa
    }
  };

  // Paso 2 (Detalles) -> Avanzar a escribir el mensaje bonito
  const handleContinuarAMensaje = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("mensaje");
  };

  // Guardar respuestas finales en el backend
  const handleGuardarYFinalizar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const respuestaFinal = {
      asistira,
      nombreInvitado,
      telefonoWhatsapp,
      pasesConfirmados: asistira ? pasesSeleccionados : 0,
      pasesDisponibles: maxPases,
      asistentes: asistira ? nombresAsistentes : [],
      mensajeDeseos,
      preguntasAdicionales: extraAnswers,
      fechaRespuesta: new Date().toISOString(),
    };

    try {
      await fetch("/api/form-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_response",
          eventSlug: slug,
          response: respuestaFinal,
        }),
      });
    } catch (err) {
      console.error("Error al guardar respuesta en servidor:", err);
    } finally {
      setSubmitting(false);
      setStep("finalizado");
    }
  };

  // Abrir WhatsApp con el número dinámico y codificación correcta
  const abrirWhatsapp = () => {
    // Obtener número configurado o fallback
    const rawNumero = config?.whatsappPhone || "5218115591681";
    const numero = rawNumero.replace(/\D/g, "");

    let texto = "";

    if (asistira) {
      texto = `¡Hola! Confirmo mi asistencia para ${config?.title || "el evento"}.\n\n` +
              `*Nombre:* ${nombreInvitado || "Invitado"}\n` +
              `*Pases:* ${pasesSeleccionados}\n` +
              `*Asistentes:* ${nombresAsistentes.filter(Boolean).join(", ")}`;
    } else {
      texto = `¡Hola! Lamentablemente no podré asistir a ${config?.title || "el evento"}.\n\n` +
              `*Nombre:* ${nombreInvitado || "Invitado"}`;
    }

    if (mensajeDeseos.trim()) {
      texto += `\n*Mensaje:* "${mensajeDeseos.trim()}"`;
    }

    // Estructura oficial de API WhatsApp con codificación adecuada
    const url = `https://api.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-sm font-medium text-slate-400">Cargando invitación...</p>
      </div>
    );
  }

  if (!config || !config.active) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center max-w-md space-y-3">
        <h1 className="text-xl font-bold text-amber-500">Invitación no disponible</h1>
        <p className="text-xs text-slate-400">
          Esta invitación no existe o se encuentra desactivada actualmente.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
      
      {/* Encabezado del Evento */}
      <div className="text-center space-y-2 border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-extrabold text-amber-500">{config.title}</h1>
        <p className="text-xs font-semibold text-slate-400">
          📅 Fecha del Evento: <span className="text-slate-200">{config.targetDate}</span>
        </p>
      </div>

      {/* ---------------- PASO 1: ASISTENCIA ---------------- */}
      {step === "asistencia" && (
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ingresa tu nombre completo *
              </label>
              <input
                type="text"
                placeholder="Ej. Juan Pérez"
                value={nombreInvitado}
                onChange={(e) => setNombreInvitado(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ingresa tu número de WhatsApp
              </label>
              <input
                type="tel"
                placeholder="Ej. 8110000000"
                value={telefonoWhatsapp}
                onChange={(e) => setTelefonoWhatsapp(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="block text-center text-sm font-bold text-amber-400">
              ¿Asistirás al evento? *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                disabled={!nombreInvitado.trim()}
                onClick={() => handleDecisionAsistencia(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg transition-all cursor-pointer"
              >
                ¡Sí, asistiré! 🎉
              </button>
              <button
                type="button"
                disabled={!nombreInvitado.trim()}
                onClick={() => handleDecisionAsistencia(false)}
                className="w-full bg-rose-900/60 hover:bg-rose-800 disabled:opacity-50 text-rose-200 border border-rose-700/50 font-bold py-3 rounded-xl transition-all cursor-pointer"
              >
                No podré asistir 😔
              </button>
            </div>
            {!nombreInvitado.trim() && (
              <p className="text-[11px] text-center text-amber-500/80">
                * Escribe tu nombre arriba para continuar.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ---------------- PASO 2: DETALLES DE PASES (SI ASISTIRÁ) ---------------- */}
      {step === "detalles" && (
        <form onSubmit={handleContinuarAMensaje} className="space-y-6">
          <button
            type="button"
            onClick={() => setStep("asistencia")}
            className="text-xs text-amber-400 hover:underline flex items-center gap-1"
          >
            ← Volver a pregunta de asistencia
          </button>

          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-4">
            <div>
              <label className="block text-xs font-bold text-amber-400 mb-1">
                ¿Cuántas personas asistirán? (Pases asignados: {maxPases})
              </label>
              <select
                value={pasesSeleccionados}
                onChange={(e) => handlePasesChange(parseInt(e.target.value, 10))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-amber-500"
              >
                {Array.from({ length: maxPases }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "persona" : "personas"}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-300">
                Nombres de los asistentes:
              </label>
              {nombresAsistentes.map((nombre, idx) => (
                <div key={idx}>
                  <span className="block text-[11px] text-slate-500 mb-1">
                    Asistente {idx + 1}:
                  </span>
                  <input
                    type="text"
                    placeholder={`Nombre del asistente ${idx + 1}`}
                    value={nombre}
                    onChange={(e) => handleNombreChange(idx, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Preguntas adicionales personalizadas */}
          {config.questions && config.questions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Información Adicional
              </h3>
              {config.questions
                .filter(
                  (q) =>
                    !q.label.toLowerCase().includes("nombre") &&
                    !q.label.toLowerCase().includes("asistir") &&
                    !q.label.toLowerCase().includes("whatsapp")
                )
                .map((q) => (
                  <div key={q.id}>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {q.label}
                    </label>

                    {q.type === "choice" ? (
                      <select
                        onChange={(e) => setExtraAnswers({ ...extraAnswers, [q.label]: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      >
                        <option value="">-- Selecciona una opción --</option>
                        {q.options?.map((opt, i) => (
                          <option key={i} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={q.type === "number" ? "number" : "text"}
                        onChange={(e) => setExtraAnswers({ ...extraAnswers, [q.label]: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    )}
                  </div>
                ))}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            Siguiente →
          </button>
        </form>
      )}

      {/* ---------------- PASO 3: MENSAJE O PALABRAS PARA LOS FESTEJADOS ---------------- */}
      {step === "mensaje" && (
        <form onSubmit={handleGuardarYFinalizar} className="space-y-6">
          <button
            type="button"
            onClick={() => setStep(asistira ? "detalles" : "asistencia")}
            className="text-xs text-amber-400 hover:underline flex items-center gap-1"
          >
            ← Regresar al paso anterior
          </button>

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-200">
              {asistira 
                ? "✨ Escribe un mensaje especial o felicitación para los festejados:" 
                : "💌 Escribe un mensaje o disculpa para los festejados:"}
            </h2>
            <textarea
              rows={4}
              placeholder={
                asistira 
                  ? "¡Muchas felicidades! Nos vemos muy pronto para celebrar..." 
                  : "Lamento mucho no poder acompañarlos en este día tan especial. ¡Les deseo lo mejor!"
              }
              value={mensajeDeseos}
              onChange={(e) => setMensajeDeseos(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            {submitting 
              ? (asistira ? "Guardando confirmación..." : "Guardando respuesta...") 
              : (asistira ? "Confirmar Asistencia" : "Enviar Respuesta y Mensaje")}
          </button>
        </form>
      )}

      {/* ---------------- PASO 4: PANTALLA FINAL Y WHATSAPP ---------------- */}
      {step === "finalizado" && (
        <div className="text-center space-y-6 py-4">
          {asistira ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl space-y-2">
              <h2 className="text-lg font-bold text-emerald-400">¡Asistencia Registrada! 🎉</h2>
              <p className="text-xs text-slate-300">
                Hemos registrado tu confirmación para <strong>{pasesSeleccionados}</strong> {pasesSeleccionados === 1 ? "lugar" : "lugares"}.
              </p>
            </div>
          ) : (
            <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl space-y-2">
              <h2 className="text-lg font-bold text-slate-300">Respuesta Registrada ✉️</h2>
              <p className="text-xs text-slate-400">
                Gracias por avisarnos, lamentamos que no puedas acompañarnos.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Haz clic abajo para enviar tu mensaje y respuesta directamente al WhatsApp del organizador:
            </p>
            <button
              type="button"
              onClick={abrirWhatsapp}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              💬 Enviar por WhatsApp
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function PublicEventPage() {
  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center p-4 md:p-8">
      <Suspense fallback={<p className="text-sm font-medium text-slate-400">Cargando evento...</p>}>
        <PublicEventContent />
      </Suspense>
    </main>
  );
}