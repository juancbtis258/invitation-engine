"use client";

import { useEffect, useState } from "react";

interface Question {
  id: string;
  label: string;
  type: "text" | "choice" | "number";
  options?: string[];
}

interface EventData {
  title: string;
  targetDate: string;
  plan: string;
  questions: Question[];
  responses: any[];
}

export default function AdminDashboard() {
  const [eventSlug, setEventSlug] = useState("demo");
  const [title, setTitle] = useState("Boda María & Alejandro");
  const [targetDate, setTargetDate] = useState("2026-10-15");
  const [plan, setPlan] = useState("plus");
  const [questions, setQuestions] = useState<Question[]>([
    { id: "q1", label: "Ingresa tu nombre", type: "text" },
    { id: "q2", label: "Ingresa tu número de WhatsApp", type: "text" },
    { id: "q3", label: "¿Asistirás al evento?", type: "choice", options: ["Sí", "No"] },
  ]);
  
  const [responses, setResponses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"builder" | "responses">("builder");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Cargar la configuración del evento seleccionado
  useEffect(() => {
    fetch(`/api/form-config?event=${eventSlug}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          setTitle(res.data.title || "Mi Evento");
          setTargetDate(res.data.targetDate || "2026-10-15");
          setPlan(res.data.plan || "plus");
          if (res.data.questions && res.data.questions.length > 0) {
            setQuestions(res.data.questions);
          }
          setResponses(res.data.responses || []);
        }
      })
      .catch((err) => console.error(err));
  }, [eventSlug]);

  // Agregar nueva pregunta al constructor
  const addQuestion = () => {
    const newQ: Question = {
      id: `q_${Date.now()}`,
      label: "Nueva Pregunta",
      type: "text",
    };
    setQuestions([...questions, newQ]);
  };

  // Actualizar campo de pregunta
  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  // Eliminar pregunta
  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  // Guardar configuración completa en la API
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/form-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_event",
          eventSlug,
          eventConfig: {
            title,
            targetDate,
            plan,
            questions,
            responses,
          },
        }),
      });

      if (res.ok) {
        alert(`¡Configuración de "${title}" guardada exitosamente!`);
      } else {
        alert("Ocurrió un error al guardar.");
      }
    } catch (e) {
      console.error(e);
      alert("Error conectando con el servidor.");
    } finally {
      setSaving(false);
    }
  };

  const currentUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/${eventSlug}` 
    : `https://invitation-engine-nine.vercel.app/${eventSlug}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header Principal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-amber-500">
              Creador & Configuración de Invitaciones
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Diseña preguntas y gestiona tus eventos estilo Tally
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("builder")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "builder"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              🛠️ Diseñador
            </button>
            <button
              onClick={() => setActiveTab("responses")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "responses"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              📊 Ver Respuestas ({responses.length})
            </button>
          </div>
        </div>

        {/* Selector de Evento Activo & Generador de Link */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cliente / URL:</span>
            <input
              type="text"
              value={eventSlug}
              onChange={(e) => setEventSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              className="bg-slate-800 border border-slate-700 font-mono text-amber-400 font-bold text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-mono text-slate-400 truncate max-w-[220px]">
              {currentUrl}
            </span>
            <button
              onClick={copyToClipboard}
              className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-400 px-2.5 py-1 rounded-lg transition-all"
            >
              {copied ? "¡Copiado! ✓" : "Copiar Link"}
            </button>
          </div>
        </div>

        {activeTab === "builder" ? (
          <>
            {/* 1. Ajustes del Evento */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-4">
              <h2 className="text-sm font-bold text-amber-500 uppercase tracking-wider">
                1. Ajustes del Evento
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Título del Evento / Cliente
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Fecha del Evento
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. Preguntas del Formulario */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-amber-500 uppercase tracking-wider">
                  2. Preguntas del Formulario
                </h2>
                <button
                  onClick={addQuestion}
                  className="bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                >
                  + Agregar Pregunta
                </button>
              </div>

              <div className="space-y-3">
                {questions.map((q, index) => (
                  <div
                    key={q.id}
                    className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3 relative group"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">
                        Paso {index + 1}
                      </span>
                      {questions.length > 1 && (
                        <button
                          onClick={() => removeQuestion(q.id)}
                          className="text-xs font-bold text-red-400 hover:text-red-300"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Pregunta / Texto
                        </label>
                        <input
                          type="text"
                          value={q.label}
                          onChange={(e) =>
                            updateQuestion(q.id, "label", e.target.value)
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Tipo de Campo
                        </label>
                        <select
                          value={q.type}
                          onChange={(e) =>
                            updateQuestion(q.id, "type", e.target.value)
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 focus:outline-none focus:border-amber-500"
                        >
                          <option value="text">Texto corto</option>
                          <option value="choice">Selección de Opciones</option>
                          <option value="number">Número</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Guardar Cambios */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm px-6 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all"
              >
                {saving ? "Guardando..." : "Guardar Todos los Cambios"}
              </button>
            </div>
          </>
        ) : (
          /* Vista de Respuestas Recibidas */
          <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold text-amber-500 uppercase tracking-wider">
              Respuestas Confirmadas
            </h2>

            {responses.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Aún no hay respuestas registradas para este evento.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3 font-semibold">Fecha</th>
                      <th className="p-3 font-semibold">Respuesta / Datos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {responses.map((res, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="p-3 font-mono text-slate-500 text-[11px]">
                          {res.date ? new Date(res.date).toLocaleString() : "Reciente"}
                        </td>
                        <td className="p-3">
                          <pre className="text-xs font-mono text-amber-300/90 whitespace-pre-wrap">
                            {JSON.stringify(res, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}