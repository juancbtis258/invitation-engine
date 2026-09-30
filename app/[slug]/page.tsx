"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";

export interface Question {
  id: string;
  label: string;
  type: string;
  options?: string[];
  required: boolean;
  placeholder?: string;
}

export default function InvitacionPublicaPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = (params?.slug as string) || "evento";

  // Obtener pases desde URL (?pases=2) o default a 2
  const pasesUrl = Number(searchParams.get("pases")) || 2;

  // Estados de configuración del evento
  const [cargando, setCargando] = useState(true);
  const [tituloEvento, setTituloEvento] = useState("Mi Evento");
  const [fechaEvento, setFechaEvento] = useState("");
  const [whatsappNotif, setWhatsappNotif] = useState("");
  const [preguntasExtra, setPreguntasExtra] = useState<Question[]>([]);

  // Estado del flujo paso a paso (Tally-Style)
  // Pasos: "asistencia" -> "pases" -> "nombres_asistentes" -> "preguntas_extra" -> "mensaje_final"
  const [pasoActual, setPasoActual] = useState<
    "asistencia" | "pases" | "nombres_asistentes" | "preguntas_extra" | "mensaje_final"
  >("asistencia");

  // Respuestas del formulario
  const [nombreInvitado, setNombreInvitado] = useState("");
  const [whatsappInvitado, setWhatsappInvitado] = useState("");
  const [asistira, setAsistira] = useState<boolean | null>(null);
  const [pasesSeleccionados, setPasesSeleccionados] = useState<number>(1);
  const [nombresAcompanantes, setNombresAcompanantes] = useState<string[]>([""]);
  const [respuestasCustom, setRespuestasCustom] = useState<Record<string, any>>({});
  const [mensajeLibre, setMensajeLibre] = useState("");

  // Cargar configuración real del evento desde el backend
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/form-config?event=${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setTituloEvento(data.data.title || "Mi Evento");
          setFechaEvento(data.data.targetDate || "");
          setWhatsappNotif(data.data.whatsappPhone || "");
          setPreguntasExtra(data.data.questions || []);
        }
      })
      .catch((err) => console.error("Error al cargar evento:", err))
      .finally(() => setCargando(false));
  }, [slug]);

  // Manejador del Paso 1: Nombre, WhatsApp y Asistencia
  const handlePaso1Siguiente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreInvitado.trim() || asistira === null) return;

    if (asistira === false) {
      // LÓGICA CONDICIONAL TALLY: Si no asistirá, brinca directo al mensaje de despedida
      setPasoActual("mensaje_final");
    } else {
      // Si asistirá, avanza al paso de pases
      setPasoActual("pases");
    }
  };

  // Manejador del Paso 2: Selección de pases
  const handlePaso2Pases = (e: React.FormEvent) => {
    e.preventDefault();
    // Ajustar array de acompañantes según la cantidad elegida
    const arrNombres = Array.from({ length: pasesSeleccionados }, (_, i) =>
      i === 0 ? nombreInvitado : nombresAcompanantes[i] || ""
    );
    setNombresAcompanantes(arrNombres);
    setPasoActual("nombres_asistentes");
  };

  // Manejador del Paso 3: Nombres de los asistentes
  const handlePaso3Nombres = (e: React.FormEvent) => {
    e.preventDefault();
    if (preguntasExtra.length > 0) {
      setPasoActual("preguntas_extra");
    } else {
      setPasoActual("mensaje_final");
    }
  };

  // Manejador del Paso 4: Preguntas personalizadas
  const handlePaso4Extra = (e: React.FormEvent) => {
    e.preventDefault();
    setPasoActual("mensaje_final");
  };

  // Enviar confirmación final y redirigir a WhatsApp
  const handleFinalizarYEnviar = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificamos si el plan configurado es BÁSICO
    const esBasico = (event as any)?.plan === "BASICO";

    const payload = {
      eventSlug: slug,
      name: nombreInvitado,
      whatsapp: whatsappInvitado,
      attending: asistira,
      pasesConfirmados: esBasico ? (asistira ? 1 : 0) : (asistira ? pasesSeleccionados : 0),
      acompanantes: esBasico ? [] : (asistira ? nombresAcompanantes : []),
      customAnswers: esBasico ? {} : respuestasCustom,
      mensaje: mensajeLibre,
    };

    try {
      await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Error al guardar respuesta:", err);
    }

    // Armar mensaje directo para WhatsApp
    let textoWA = `*CONFIRMACIÓN DE ASISTENCIA - ${tituloEvento.toUpperCase()}*%0A%0A`;
    textoWA += `👤 *Nombre:* ${nombreInvitado}%0A`;
    if (whatsappInvitado) textoWA += `📱 *WhatsApp:* ${whatsappInvitado}%0A`;
    textoWA += `✨ *¿Asistirá?:* ${asistira ? "SÍ, ¡ahí estaré! 🎉" : "NO podré asistir 😔"}%0A`;

    // SOLO si NO es plan Básico y SÍ asistirá, incluimos pases, acompañantes y preguntas
    if (!esBasico && asistira) {
      textoWA += `🎫 *Pases Confirmados:* ${pasesSeleccionados}%0A`;
      if (nombresAcompanantes.length > 0) {
        textoWA += `👥 *Asistentes:* ${nombresAcompanantes.filter(Boolean).join(", ")}%0A`;
      }
      if (Object.keys(respuestasCustom).length > 0) {
        textoWA += `%0A*Respuestas adicionales:*%0A`;
        Object.entries(respuestasCustom).forEach(([key, val]) => {
          textoWA += `• ${key}: ${val}%0A`;
        });
      }
    }

    if (mensajeLibre) {
      textoWA += `%0A💬 *Mensaje:* "${mensajeLibre}"%0A`;
    }

    const destinoWA = whatsappNotif.replace(/\D/g, "") || "5218115591681";
    window.location.href = `https://wa.me/${destinoWA}?text=${textoWA}`;
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#0d1527] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1527] text-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
        
        {/* TITULO Y ENCABEZADO */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-amber-500 tracking-tight">
            {tituloEvento}
          </h1>
          {fechaEvento && (
            <p className="text-xs text-slate-400 font-semibold">
              📅 Fecha del Evento: {fechaEvento}
            </p>
          )}
        </div>

        {/* PASO 1: IDENTIFICACIÓN Y ASISTENCIA */}
        {pasoActual === "asistencia" && (
          <form onSubmit={handlePaso1Siguiente} className="space-y-5 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-100">Confirma tu asistencia</h2>
              <p className="text-xs text-slate-400">
                Gracias por confirmar tu asistencia. Completa la siguiente información para reservar tus lugares.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Ingresa tu nombre *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={nombreInvitado}
                  onChange={(e) => setNombreInvitado(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Ingresa tu número de WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+52 811 000 0000"
                  value={whatsappInvitado}
                  onChange={(e) => setWhatsappInvitado(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  ¿Asistirás al evento? *
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setAsistira(true)}
                    className={`w-full p-3 rounded-xl border text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                      asistira === true
                        ? "bg-amber-500 text-slate-950 border-amber-400"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <span className="bg-slate-950 text-amber-400 px-2 py-0.5 rounded font-black text-[10px]">
                      A
                    </span>
                    Sí, asistiré
                  </button>

                  <button
                    type="button"
                    onClick={() => setAsistira(false)}
                    className={`w-full p-3 rounded-xl border text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                      asistira === false
                        ? "bg-rose-500 text-white border-rose-400"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <span className="bg-slate-950 text-rose-400 px-2 py-0.5 rounded font-black text-[10px]">
                      B
                    </span>
                    No podré asistir
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!nombreInvitado.trim() || asistira === null}
              className="w-full bg-slate-100 hover:bg-white disabled:opacity-40 text-slate-950 font-black py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Siguiente →
            </button>
          </form>
        )}

        {/* PASO 2: SELECCIÓN DE CANTIDAD DE PASES */}
        {pasoActual === "pases" && (
          <form onSubmit={handlePaso2Pases} className="space-y-5 animate-fadeIn">
            <button
              type="button"
              onClick={() => setPasoActual("asistencia")}
              className="text-xs text-slate-400 hover:text-slate-200 font-bold flex items-center gap-1 cursor-pointer"
            >
              ← Back
            </button>

           <div className={(event as any)?.plan === "BASICO" ? "hidden" : "block"}>
              <label className="block text-slate-400 font-bold mb-1">
                ¿Cuántas personas asistirán? *
              </label>
              <select
                value={pasesSeleccionados}
                onChange={(e) => setPasesSeleccionados(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-amber-400 font-bold focus:outline-none focus:border-amber-500"
              >
                {Array.from({ length: pasesUrl }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "persona" : "personas"}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-100 hover:bg-white text-slate-950 font-black py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Siguiente →
            </button>
          </form>
        )}

        {/* PASO 3: NOMBRES DE ASISTENTES DINÁMICOS */}
        {pasoActual === "nombres_asistentes" && (
          <form onSubmit={handlePaso3Nombres} className="space-y-5 animate-fadeIn">
            <button
              type="button"
              onClick={() => setPasoActual("pases")}
              className="text-xs text-slate-400 hover:text-slate-200 font-bold flex items-center gap-1 cursor-pointer"
            >
              ← Back
            </button>

            <div className="space-y-1">
              <p className="text-xs text-slate-300 font-medium">
                Por favor ingresa los nombres de las personas que asistirán con este pase
              </p>
            </div>

            <div className="space-y-3">
              {nombresAcompanantes.map((nombre, idx) => (
                <div key={idx}>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Asistente {idx + 1} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={`Nombre del asistente ${idx + 1}`}
                    value={nombre}
                    onChange={(e) => {
                      const copia = [...nombresAcompanantes];
                      copia[idx] = e.target.value;
                      setNombresAcompanantes(copia);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-slate-100 hover:bg-white text-slate-950 font-black py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Siguiente →
            </button>
          </form>
        )}

        {/* PASO 4: PREGUNTAS PERSONALIZADAS DEL DISEÑADOR */}
        {pasoActual === "preguntas_extra" && (
          <form onSubmit={handlePaso4Extra} className="space-y-5 animate-fadeIn">
            <button
              type="button"
              onClick={() => setPasoActual("nombres_asistentes")}
              className="text-xs text-slate-400 hover:text-slate-200 font-bold flex items-center gap-1 cursor-pointer"
            >
              ← Back
            </button>

            <div className="space-y-4">
              {preguntasExtra.map((q) => (
                <div key={q.id} className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-200">
                    {q.label} {q.required && <span className="text-rose-400">*</span>}
                  </label>

                  {/* Renderizado de tipo texto */}
                  {["text", "paragraph", "email_phone", "number"].includes(q.type) && (
                    <input
                      type={q.type === "number" ? "number" : "text"}
                      required={q.required}
                      placeholder={q.placeholder || "Tu respuesta..."}
                      value={respuestasCustom[q.label] || ""}
                      onChange={(e) =>
                        setRespuestasCustom({
                          ...respuestasCustom,
                          [q.label]: e.target.value,
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  )}

                  {/* Renderizado de Opción Única */}
                  {q.type === "choice" && q.options && (
                    <select
                      required={q.required}
                      value={respuestasCustom[q.label] || ""}
                      onChange={(e) =>
                        setRespuestasCustom({
                          ...respuestasCustom,
                          [q.label]: e.target.value,
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-amber-400 font-bold focus:outline-none"
                    >
                      <option value="">Selecciona una opción...</option>
                      {q.options.map((opt, i) => (
                        <option key={i} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-slate-100 hover:bg-white text-slate-950 font-black py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Siguiente →
            </button>
          </form>
        )}

        {/* PASO FINAL: MENSAJE DE FELICITACIÓN Y ENVÍO A WHATSAPP */}
        {pasoActual === "mensaje_final" && (
          <form onSubmit={handleFinalizarYEnviar} className="space-y-5 animate-fadeIn">
            <button
              type="button"
              onClick={() =>
                setPasoActual(
                  asistira === false
                    ? "asistencia"
                    : preguntasExtra.length > 0
                    ? "preguntas_extra"
                    : "nombres_asistentes"
                )
              }
              className="text-xs text-slate-400 hover:text-slate-200 font-bold flex items-center gap-1 cursor-pointer"
            >
              ← Back
            </button>

            <div className="space-y-2">
              <label className="block text-sm font-black text-slate-100">
                Unas palabras siempre me alegran el corazón ❤️ deja tu mensaje
              </label>
              <p className="text-[11px] text-slate-400 italic">(este campo no es obligatorio)</p>
              <textarea
                rows={4}
                placeholder="¡Muchas felicidades por este gran día!..."
                value={mensajeLibre}
                onChange={(e) => setMensajeLibre(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              📲 Enviar Respuesta por WhatsApp
            </button>
          </form>
        )}

      </div>
    </div>
  );
}