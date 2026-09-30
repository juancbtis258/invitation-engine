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
}

function PublicEventContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;

  // Leer parámetro ?pases=X de la URL (por defecto 2 pases si no se pasa nada)
  const pasesParam = searchParams.get("pases");
  const maxPases = pasesParam && !isNaN(Number(pasesParam)) && Number(pasesParam) > 0 
    ? parseInt(pasesParam, 10) 
    : 2;

  const [config, setConfig] = useState<EventConfig | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Respuestas del formulario
  const [pasesSeleccionados, setPasesSeleccionados] = useState<number>(1);
  const [nombresAsistentes, setNombresAsistentes] = useState<string[]>([""]);
  const [extraAnswers, setExtraAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
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

  // Actualizar la lista de campos de nombres al cambiar la cantidad seleccionada
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const respuestaFinal = {
      pasesConfirmados: pasesSeleccionados,
      pasesDisponibles: maxPases,
      asistentes: nombresAsistentes,
      preguntasAdicionales: extraAnswers,
      fechaRespuesta: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/form-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_response",
          eventSlug: slug,
          response: respuestaFinal,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        alert("Ocurrió un error al enviar tu confirmación. Inténtalo de nuevo.");
      }
    } catch (err) {
      console.error(err);
      alert("Error conectando con el servidor.");
    } finally {
      setSubmitting(false);
    }
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
      
      {/* Encabezado */}
      <div className="text-center space-y-2 border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-extrabold text-amber-500">{config.title}</h1>
        <p className="text-xs font-semibold text-slate-400">
          📅 Fecha del Evento: <span className="text-slate-200">{config.targetDate}</span>
        </p>
      </div>

      {submitted ? (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl text-center space-y-2">
          <h2 className="text-lg font-bold text-emerald-400">¡Confirmación Recibida!</h2>
          <p className="text-xs text-slate-300">
            Hemos registrado correctamente tu asistencia para <strong>{pasesSeleccionados}</strong> {pasesSeleccionados === 1 ? "lugar" : "lugares"}.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Selector de pases dinámico en base al parámetro URL */}
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

            {/* Campos para ingresar nombres según los pases elegidos */}
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

          {/* Preguntas adicionales de la invitación */}
          {config.questions && config.questions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Información Adicional
              </h3>
              {config.questions.map((q) => (
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
            disabled={submitting}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            {submitting ? "Confirmando..." : "Confirmar Asistencia"}
          </button>
        </form>
      )}

    </div>
  );
}

export default function PublicEventPage() {
  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center p-4 md:p-8">
      <Suspense fallback={<p className="text-sm font-medium text-slate-400">Cargando pases...</p>}>
        <PublicEventContent />
      </Suspense>
    </main>
  );
}