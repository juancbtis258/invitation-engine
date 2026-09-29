"use client";

import { useEffect, useState } from "react";

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
  responses: any[];
}

export default function AdminDashboard() {
  const [eventSlug, setEventSlug] = useState("demo");
  const [title, setTitle] = useState("Boda María & Alejandro");
  const [targetDate, setTargetDate] = useState("2026-10-15");
  const [plan, setPlan] = useState("plus");
  const [active, setActive] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([
    { id: "q1", label: "Ingresa tu nombre", type: "text" },
    { id: "q2", label: "Ingresa tu número de WhatsApp", type: "text" },
    { id: "q3", label: "¿Asistirás al evento?", type: "choice", options: ["Sí", "No"] },
  ]);
  
  const [responses, setResponses] = useState<any[]>([]);
  const [allEvents, setAllEvents] = useState<Record<string, EventConfig>>({
    demo: {
      title: "Boda María & Alejandro",
      targetDate: "2026-10-15",
      plan: "plus",
      active: true,
      questions: [],
      responses: []
    }
  });

  const [activeTab, setActiveTab] = useState<"list" | "builder" | "responses">("list");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Cargar datos
  const loadEventData = (slugToLoad: string) => {
    fetch(`/api/form-config?event=${slugToLoad}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          setTitle(res.data.title || "Mi Evento");
          setTargetDate(res.data.targetDate || "2026-10-15");
          setPlan(res.data.plan || "plus");
          setActive(res.data.active !== undefined ? res.data.active : true);
          if (res.data.questions && res.data.questions.length > 0) {
            setQuestions(res.data.questions);
          }
          setResponses(res.data.responses || []);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadEventData(eventSlug);
  }, [eventSlug]);

  const handleSelectEvent = (slug: string) => {
    setEventSlug(slug);
    loadEventData(slug);
    setActiveTab("builder");
  };

  // FUNCIÓN PARA DUPLICAR EVENTO
  const handleDuplicateEvent = async (originalSlug: string, originalConfig: EventConfig) => {
    const newTitle = prompt("Ingresa el título del nuevo evento:", `${originalConfig.title || "Evento"} (Copia)`);
    if (!newTitle) return;

    const baseSlug = newTitle.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const newSlug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;

    const duplicatedConfig: EventConfig = {
      title: newTitle,
      targetDate: originalConfig.targetDate || "2026-12-31",
      plan: originalConfig.plan || "plus",
      active: true,
      questions: JSON.parse(JSON.stringify(originalConfig.questions || questions)), // Copia limpia de preguntas
      responses: [], // Reinicia respuestas a cero
    };

    try {
      const res = await fetch("/api/form-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_event",
          eventSlug: newSlug,
          eventConfig: duplicatedConfig,
        }),
      });

      if (res.ok) {
        setAllEvents((prev) => ({
          ...prev,
          [newSlug]: duplicatedConfig,
        }));
        alert(`¡Evento duplicado exitosamente como "/${newSlug}"!`);
        handleSelectEvent(newSlug);
      }
    } catch (e) {
      console.error(e);
      alert("Error al duplicar el evento.");
    }
  };

  const toggleEventStatus = async (slug: string, currentStatus: boolean) => {
    const updatedEvents = { ...allEvents };
    if (updatedEvents[slug]) {
      updatedEvents[slug].active = !currentStatus;
      setAllEvents(updatedEvents);
    }

    if (slug === eventSlug) {
      setActive(!currentStatus);
    }

    try {
      await fetch("/api/form-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_event",
          eventSlug: slug,
          eventConfig: { active: !currentStatus },
        }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const addQuestion = () => {
    const newQ: Question = {
      id: `q_${Date.now()}`,
      label: "Nueva Pregunta",
      type: "text",
    };
    setQuestions([...questions, newQ]);
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const configToSave = {
        title,
        targetDate,
        plan,
        active,
        questions,
        responses,
      };

      const res = await fetch("/api/form-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_event",
          eventSlug,
          eventConfig: configToSave,
        }),
      });

      if (res.ok) {
        setAllEvents((prev) => ({
          ...prev,
          [eventSlug]: configToSave,
        }));
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
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-amber-500">
              Creador & Gestor de Invitaciones
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Administra tus eventos activos, diseña formularios y revisa respuestas
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("list")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "list"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              📂 Mis Eventos
            </button>
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
              📊 Respuestas ({responses.length})
            </button>
          </div>
        </div>

        {/* CATÁLOGO DE EVENTOS */}
        {activeTab === "list" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <h2 className="text-sm font-bold text-amber-500 uppercase tracking-wider">
                Catálogo de Eventos Registrados
              </h2>
              <button
                onClick={() => {
                  const newSlug = `evento-${Date.now().toString().slice(-4)}`;
                  setEventSlug(newSlug);
                  setTitle("Nuevo Evento");
                  setTargetDate("2026-12-31");
                  setActive(true);
                  setActiveTab("builder");
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold px-3 py-2 rounded-xl transition-all"
              >
                + Crear Nuevo Evento
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(allEvents).map(([slug, item]) => (
                <div
                  key={slug}
                  className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4 hover:border-slate-700 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-bold text-white">{item.title || slug}</h3>
                      <p className="text-xs font-mono text-amber-400/80 mt-0.5">/{slug}</p>
                    </div>
                    
                    <button
                      onClick={() => toggleEventStatus(slug, item.active)}
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider transition-all ${
                        item.active
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {item.active ? "● Activo" : "○ Inactivo"}
                    </button>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1">
                    <p>📅 Fecha: <span className="text-slate-200">{item.targetDate || "Sin fecha"}</span></p>
                    <p>📦 Plan: <span className="text-slate-200 uppercase">{item.plan || "plus"}</span></p>
                  </div>

                  {/* Acciones de Tarjeta con Duplicar */}
                  <div className="flex gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleSelectEvent(slug)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2 rounded-xl transition-all"
                    >
                      ⚙️ Editar
                    </button>
                    
                    <button
                      onClick={() => handleDuplicateEvent(slug, item)}
                      className="px-3 py-2 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-400 text-xs font-bold rounded-xl transition-all"
                      title="Duplicar estructura de este evento"
                    >
                      📋 Duplicar
                    </button>

                    <a
                      href={`/${slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold rounded-xl transition-all"
                    >
                      🔗 Ver Demo
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DISEÑADOR */}
        {activeTab === "builder" && (
          <>
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cliente / Slug:</span>
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

            <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-amber-500 uppercase tracking-wider">
                  1. Ajustes del Evento
                </h2>
                
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <span className={active ? "text-emerald-400" : "text-red-400"}>
                    {active ? "Evento Activo" : "Evento Desactivado"}
                  </span>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="accent-amber-500 h-4 w-4 rounded"
                  />
                </label>
              </div>

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
                    className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3"
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
                          onChange={(e) => updateQuestion(q.id, "label", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Tipo de Campo
                        </label>
                        <select
                          value={q.type}
                          onChange={(e) => updateQuestion(q.id, "type", e.target.value as any)}
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
        )}

        {/* RESPUESTAS */}
        {activeTab === "responses" && (
          <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold text-amber-500 uppercase tracking-wider">
              Respuestas Recibidas para /{eventSlug}
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