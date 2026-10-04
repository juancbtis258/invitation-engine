"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface ResponseItem {
  id: string;
  eventSlug?: string;
  nombre?: string;
  whatsapp?: string;
  asistira?: boolean;
  pasesConfirmados?: number;
  asistentes?: string[];
  mensaje?: string;
}

interface EventoItem {
  slug: string;
  title?: string;
  customTitle?: string;
}

export default function AdminRespuestasPage() {
  const searchParams = useSearchParams();
  const initialSlug = searchParams?.get("event") || searchParams?.get("slug") || "";

  const [eventosLista, setEventosLista] = useState<EventoItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>(initialSlug);
  const [loading, setLoading] = useState(true);
  const [respuestas, setRespuestas] = useState<ResponseItem[]>([]);

  // Cargar lista de eventos para selector
  useEffect(() => {
    const cargarEventos = async () => {
      let lista: EventoItem[] = [];

      try {
        const local = localStorage.getItem("app_eventos_lista");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) lista = parsed;
        }
      } catch (e) {}

      try {
        const res = await fetch("/api/form-config?action=get_events");
        if (res.ok) {
          const data = await res.json();
          const items = data.data || data.events || data;
          if (Array.isArray(items) && items.length > 0) lista = items;
        }
      } catch (e) {}

      setEventosLista(lista);
      if (!selectedSlug && lista.length > 0) {
        setSelectedSlug(lista[0].slug);
      }
    };

    cargarEventos();
  }, []);

  // Cargar respuestas del evento seleccionado
  useEffect(() => {
    if (!selectedSlug) {
      setRespuestas([]);
      setLoading(false);
      return;
    }

    const cargarRespuestas = async () => {
      setLoading(true);
      const listaCombinada: ResponseItem[] = [];
      const idsProcesados = new Set<string>();

      try {
        const local = localStorage.getItem("app_respuestas_lista");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            parsed
              .filter((r) => (r.eventSlug || r.slug || "").toLowerCase() === selectedSlug.toLowerCase())
              .forEach((r) => {
                const item: ResponseItem = {
                  id: r.id || `local-${Math.random()}`,
                  eventSlug: r.eventSlug || selectedSlug,
                  nombre: r.name || r.nombre || "Sin Nombre",
                  whatsapp: r.phone || r.whatsapp || "-",
                  asistira: r.attending !== undefined ? Boolean(r.attending) : Boolean(r.asistira),
                  pasesConfirmados: r.pasesConfirmados !== undefined ? Number(r.pasesConfirmados) : 1,
                  asistentes: Array.isArray(r.asistentes) ? r.asistentes : [],
                  mensaje: r.mensaje || "-",
                };
                listaCombinada.push(item);
                if (r.id) idsProcesados.add(r.id);
              });
          }
        }
      } catch (e) {}

      try {
        const resApi = await fetch(`/api/form-config?action=get_responses&event=${selectedSlug}`);
        if (resApi.ok) {
          const dataApi = await resApi.json();
          const itemsApi = dataApi.data || dataApi.responses || dataApi;
          if (Array.isArray(itemsApi)) {
            itemsApi.forEach((r: any, idx: number) => {
              const id = r.id || `api-${idx}`;
              if (!idsProcesados.has(id)) {
                listaCombinada.push({
                  id,
                  eventSlug: r.eventSlug || selectedSlug,
                  nombre: r.name || r.nombre || "Sin Nombre",
                  whatsapp: r.phone || r.whatsapp || "-",
                  asistira: r.attending !== undefined ? Boolean(r.attending) : Boolean(r.asistira),
                  pasesConfirmados: r.pasesConfirmados !== undefined ? Number(r.pasesConfirmados) : 1,
                  asistentes: Array.isArray(r.asistentes) ? r.asistentes : [],
                  mensaje: r.mensaje || "-",
                });
                idsProcesados.add(id);
              }
            });
          }
        }
      } catch (e) {}

      setRespuestas(listaCombinada);
      setLoading(false);
    };

    cargarRespuestas();
  }, [selectedSlug]);

  const confirmados = respuestas.filter((r) => r.asistira === true);
  const cancelados = respuestas.filter((r) => r.asistira === false);
  const totalPersonas = confirmados.reduce((acc, r) => acc + (r.pasesConfirmados || 1), 0);

  const exportarCSV = () => {
    if (respuestas.length === 0) return;
    let csv = "data:text/csv;charset=utf-8,Nombre,WhatsApp,Asistira,Pases,Acompañantes,Mensaje\n";
    respuestas.forEach((r) => {
      csv += `"${r.nombre || ""}","${r.whatsapp || ""}","${r.asistira ? "SI" : "NO"}","${
        r.asistira ? r.pasesConfirmados || 1 : 0
      }","${(r.asistentes || []).join(", ")}","${(r.mensaje || "").replace(/"/g, '""')}"\n`;
    });
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `respuestas_${selectedSlug || "evento"}.csv`;
    link.click();
  };

  return (
    <div className="w-full space-y-6">
      {/* Selector de Evento */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0a1120] p-4 rounded-xl border border-slate-800">
        <div className="space-y-1 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 font-bold text-sm">📊 RESPUESTAS DEL EVENTO:</span>
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="bg-[#050914] border border-slate-700 text-amber-400 font-bold text-sm rounded-lg p-1.5 focus:outline-none"
            >
              <option value="">-- Seleccionar --</option>
              {eventosLista.map((ev) => (
                <option key={ev.slug} value={ev.slug}>
                  {ev.title || ev.customTitle || ev.slug} (/{ev.slug})
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-slate-400">
            Enlace de respuestas: /{selectedSlug}
          </p>
        </div>

        <button
          onClick={exportarCSV}
          disabled={respuestas.length === 0}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-md transition-all"
        >
          📥 Descargar Excel (CSV)
        </button>
      </div>

      {/* Tarjetas Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0a1120] p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 font-bold uppercase block">TOTAL ENVÍOS</span>
          <p className="text-2xl font-extrabold mt-1 text-white">{respuestas.length}</p>
        </div>

        <div className="bg-[#0a1120] p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-emerald-400 font-bold uppercase block">CONFIRMADOS</span>
          <p className="text-2xl font-extrabold mt-1 text-emerald-400">{confirmados.length}</p>
        </div>

        <div className="bg-[#0a1120] p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-rose-500 font-bold uppercase block">CANCELADOS</span>
          <p className="text-2xl font-extrabold mt-1 text-rose-500">{cancelados.length}</p>
        </div>

        <div className="bg-[#0a1120] p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-amber-500 font-bold uppercase block">PERSONAS TOTALES</span>
          <p className="text-2xl font-extrabold mt-1 text-amber-500">{totalPersonas} asist.</p>
        </div>
      </div>

      {/* Tabla de Registros */}
      <div className="bg-[#0a1120] rounded-xl border border-slate-800 overflow-hidden shadow-xl p-4">
        {loading ? (
          <div className="p-8 text-center text-amber-400 font-medium">
            Cargando respuestas...
          </div>
        ) : respuestas.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            Aún no hay respuestas registradas para este evento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                  <th className="p-3">NOMBRE</th>
                  <th className="p-3">WHATSAPP</th>
                  <th className="p-3">ASISTENCIA</th>
                  <th className="p-3">PASES</th>
                  <th className="p-3">ACOMPAÑANTES</th>
                  <th className="p-3">MENSAJE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {respuestas.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3 font-bold text-white">{item.nombre}</td>
                    <td className="p-3 text-slate-400">{item.whatsapp}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${item.asistira ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                        {item.asistira ? "¡Sí asistirá!" : "No asistirá"}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-amber-500">{item.asistira ? item.pasesConfirmados || 1 : 0}</td>
                    <td className="p-3 text-slate-300 text-xs">{item.asistira && (item.asistentes || []).length > 0 ? item.asistentes?.join(", ") : "Ninguno"}</td>
                    <td className="p-3 text-slate-400 text-xs">{item.mensaje}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}