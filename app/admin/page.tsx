"use client";

import { useState, useEffect } from "react";

interface Answer {
  id?: string;
  nombreInvitado: string;
  asistira: boolean;
  telefonoWhatsapp?: string;
  pasesConfirmados: number;
  pasesDisponibles?: number;
  asistentes?: string[];
  mensajeDeseos?: string;
  preguntasAdicionales?: Record<string, string>;
  fechaRespuesta?: string;
}

interface EventConfig {
  title: string;
  targetDate: string;
  whatsappPhone?: string;
  active: boolean;
}

export default function AdminDashboardPage() {
  const [eventSlug, setEventSlug] = useState("demo");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Estado de Configuración del Evento
  const [config, setConfig] = useState<EventConfig>({
    title: "",
    targetDate: "",
    whatsappPhone: "",
    active: true,
  });

  // Lista de respuestas registradas
  const [respuestas, setRespuestas] = useState<Answer[]>([]);
  const [filtro, setFiltro] = useState<"todas" | "confirmados" | "cancelados">("todas");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarDatosEvento();
  }, [eventSlug]);

  const cargarDatosEvento = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/form-config?event=${eventSlug}`);
      const data = await res.json();
      if (data.data) {
        setConfig({
          title: data.data.title || "",
          targetDate: data.data.targetDate || "",
          whatsappPhone: data.data.whatsappPhone || "",
          active: data.data.active ?? true,
        });
        setRespuestas(data.data.responses || []);
      }
    } catch (err) {
      console.error("Error al cargar datos del panel:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMensaje("");

    try {
      const res = await fetch("/api/form-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_config",
          eventSlug,
          config,
        }),
      });

      if (res.ok) {
        setMensaje("¡Configuración guardada correctamente!");
      } else {
        setMensaje("Error al guardar la configuración.");
      }
    } catch (err) {
      console.error("Error al guardar:", err);
      setMensaje("Error de conexión.");
    } finally {
      setSaving(false);
    }
  };

  // Cálculos de métricas
  const totalConfirmados = respuestas.filter((r) => r.asistira).length;
  const totalCancelados = respuestas.filter((r) => !r.asistira).length;
  const totalLugaresConfirmados = respuestas
    .filter((r) => r.asistira)
    .reduce((acc, curr) => acc + (curr.pasesConfirmados || 0), 0);

  // Filtrado de la tabla
  const respuestasFiltradas = respuestas.filter((r) => {
    const cumpleFiltro =
      filtro === "todas" ? true : filtro === "confirmados" ? r.asistira : !r.asistira;
    const cumpleBusqueda = r.nombreInvitado
      .toLowerCase()
      .includes(busqueda.toLowerCase());
    return cumpleFiltro && cumpleBusqueda;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center p-4">
        <p className="text-sm font-medium text-slate-400">Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Encabezado del Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-amber-500">Panel de Control & Respuestas</h1>
          <p className="text-xs text-slate-400 mt-1">
            Administra los detalles de tu evento y visualiza los invitados en tiempo real.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Evento ID:</span>
          <input
            type="text"
            value={eventSlug}
            onChange={(e) => setEventSlug(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-amber-400 font-bold focus:outline-none"
          />
        </div>
      </div>

      {/* Tarjetas de Métricas Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <span className="block text-xs text-slate-400 font-medium">Asistencias Confirmadas</span>
          <span className="text-2xl font-extrabold text-emerald-400">{totalConfirmados}</span>
          <span className="block text-[11px] text-slate-500 mt-1">
            ({totalLugaresConfirmados} lugares/pases reservados)
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <span className="block text-xs text-slate-400 font-medium">Cancelaciones / No asisten</span>
          <span className="text-2xl font-extrabold text-rose-400">{totalCancelados}</span>
          <span className="block text-[11px] text-slate-500 mt-1">Personas que declinaron</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <span className="block text-xs text-slate-400 font-medium">Total Respuestas</span>
          <span className="text-2xl font-extrabold text-amber-400">{respuestas.length}</span>
          <span className="block text-[11px] text-slate-500 mt-1">Registros recibidos</span>
        </div>
      </div>

      {/* Sección 1: Configuración del Evento & WhatsApp */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <h2 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3">
          ⚙️ Ajustes del Evento & WhatsApp Receptor
        </h2>

        <form onSubmit={handleGuardarConfig} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Título del Evento
            </label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Fecha del Evento
            </label>
            <input
              type="date"
              value={config.targetDate}
              onChange={(e) => setConfig({ ...config, targetDate: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="md:col-span-2 bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl space-y-2">
            <label className="block text-xs font-bold text-amber-400">
              📱 WhatsApp Receptor (Donde llegarán las confirmaciones)
            </label>
            <input
              type="tel"
              placeholder="Ej. 5218112345678 (incluye lada de país sin espacios)"
              value={config.whatsappPhone || ""}
              onChange={(e) => setConfig({ ...config, whatsappPhone: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-slate-400">
              Este número se enlaza automáticamente con el botón que ven los invitados al finalizar su respuesta.
            </p>
          </div>

          <div className="md:col-span-2 flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.active}
                onChange={(e) => setConfig({ ...config, active: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              Evento activo y disponible públicamente
            </label>

            <button
              type="submit"
              disabled={saving}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              {saving ? "Guardando..." : "Guardar Ajustes"}
            </button>
          </div>

          {mensaje && (
            <p className="md:col-span-2 text-xs font-medium text-emerald-400 text-center bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
              {mensaje}
            </p>
          )}
        </form>
      </div>

      {/* Sección 2: Tabla de Respuestas de Invitados */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <h2 className="text-base font-bold text-slate-200">
            📋 Respuestas de los Invitados ({respuestasFiltradas.length})
          </h2>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />

            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="todas">Todos</option>
              <option value="confirmados">Confirmados 🎉</option>
              <option value="cancelados">No asisten 😔</option>
            </select>
          </div>
        </div>

        {/* Tabla Responsiva */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Invitado</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Pases</th>
                <th className="p-3">Asistentes</th>
                <th className="p-3">Mensaje / Felicitación</th>
                <th className="p-3">WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {respuestasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-slate-500">
                    No hay respuestas que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                respuestasFiltradas.map((resp, i) => (
                  <tr key={resp.id || i} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-semibold text-slate-100">{resp.nombreInvitado}</td>
                    <td className="p-3">
                      {resp.asistira ? (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md text-[11px] font-bold">
                          Asistirá 🎉
                        </span>
                      ) : (
                        <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-md text-[11px] font-bold">
                          No asiste 😔
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-amber-400">
                      {resp.asistira ? resp.pasesConfirmados : 0}
                    </td>
                    <td className="p-3 text-slate-400">
                      {resp.asistentes && resp.asistentes.length > 0
                        ? resp.asistentes.join(", ")
                        : "-"}
                    </td>
                    <td className="p-3 max-w-xs truncate italic text-slate-300">
                      {resp.mensajeDeseos ? `"${resp.mensajeDeseos}"` : "-"}
                    </td>
                    <td className="p-3 text-slate-400">{resp.telefonoWhatsapp || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}