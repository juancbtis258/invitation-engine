"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulario para crear un nuevo evento
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [plan, setPlan] = useState("plus");
  const [creating, setCreating] = useState(false);

  // Evento seleccionado para ver sus respuestas
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/form-config?event=all");
      const data = await res.json();
      if (data.data) {
        setEvents([data.data]);
        setSelectedEvent(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) {
      alert("Por favor ingresa el título y la URL/Slug.");
      return;
    }

    setCreating(true);
    try {
      const formattedSlug = slug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-0-]/g, "");
      
      const response = await fetch("/api/form-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_event",
          eventSlug: formattedSlug,
          eventConfig: {
            title,
            targetDate,
            plan,
            responses: [],
          },
        }),
      });

      if (response.ok) {
        alert(`¡Evento "${title}" creado exitosamente!`);
        setTitle("");
        setSlug("");
        setTargetDate("");
        fetchEvents();
      }
    } catch (error) {
      console.error(error);
      alert("Error al crear el evento.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-sm font-medium">Cargando panel de administración...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Encabezado */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold">Panel de Administración</h1>
            <p className="text-xs text-slate-400">Gestor de eventos e invitaciones digitales</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Formulario Crear Evento */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h2 className="text-base font-bold text-white">Crear Nuevo Evento</h2>
            
            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nombre del Evento *</label>
                <input
                  type="text"
                  placeholder="Ej. Boda Sofía & Mateo"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                  }}
                  className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">URL / Slug *</label>
                <input
                  type="text"
                  placeholder="boda-sofia-y-mateo"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 focus:outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Fecha del Evento</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-300 focus:outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Plan Contratado</label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-300 focus:outline-none focus:border-slate-500"
                >
                  <option value="plus">Plan Plus (Formulario dinámico)</option>
                  <option value="basico">Plan Básico (WhatsApp directo)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full bg-white text-slate-900 font-bold text-xs py-2.5 rounded-lg hover:bg-slate-200 transition-all mt-2"
              >
                {creating ? "Creando..." : "+ Crear Evento"}
              </button>
            </form>
          </div>

          {/* Lista de Eventos y Vista Previa */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h2 className="text-base font-bold text-white">Eventos Activos</h2>

            <div className="space-y-3">
              {events.map((evt, idx) => (
                <div key={idx} className="p-4 bg-slate-800/60 border border-slate-700/50 rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-white">{evt.title}</h3>
                      <p className="text-xs text-slate-400">Fecha: {evt.targetDate || "Sin fecha"}</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                      {evt.plan || "Plus"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-700/40">
                    <span className="text-xs text-slate-400 font-mono">Enlace:</span>
                    <a
                      href={`/demo`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-400 hover:underline font-mono truncate"
                    >
                      /demo
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}