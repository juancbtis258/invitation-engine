"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface ResponseItem {
  id: string;
  eventSlug?: string;
  nombre?: string;
  whatsapp?: string;
  asistira?: boolean;
  pasesConfirmados?: number;
  asistentes?: string[];
  mensaje?: string;
  createdAt?: string;
}

export default function RespuestasSlugPage() {
  const params = useParams();
  const slugParam = (params?.slug as string) || "";

  const [loading, setLoading] = useState(true);
  const [respuestas, setRespuestas] = useState<ResponseItem[]>([]);

  useEffect(() => {
    if (!slugParam) {
      setLoading(false);
      return;
    }

    const cargarRespuestas = async () => {
      setLoading(true);
      const listaCombinada: ResponseItem[] = [];
      const idsProcesados = new Set<string>();

      // 1. Cargar desde localStorage
      try {
        const local = localStorage.getItem("app_respuestas_lista");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            parsed
              .filter(
                (r) =>
                  (r.eventSlug || r.slug || "").toLowerCase() ===
                  slugParam.toLowerCase()
              )
              .forEach((r) => {
                const item: ResponseItem = {
                  id: r.id || `local-${Math.random()}`,
                  eventSlug: r.eventSlug || slugParam,
                  nombre: r.name || r.nombre || "Sin Nombre",
                  whatsapp: r.phone || r.whatsapp || "-",
                  asistira:
                    r.attending !== undefined
                      ? Boolean(r.attending)
                      : Boolean(r.asistira),
                  pasesConfirmados:
                    r.pasesConfirmados !== undefined
                      ? Number(r.pasesConfirmados)
                      : 1,
                  asistentes: Array.isArray(r.asistentes) ? r.asistentes : [],
                  mensaje: r.mensaje || "-",
                };
                listaCombinada.push(item);
                if (r.id) idsProcesados.add(r.id);
              });
          }
        }
      } catch (e) {}

      // 2. Cargar desde API local
      try {
        const resApi = await fetch(
          `/api/form-config?action=get_responses&event=${slugParam}`
        );
        if (resApi.ok) {
          const dataApi = await resApi.json();
          const itemsApi = dataApi.data || dataApi.responses || dataApi;
          if (Array.isArray(itemsApi)) {
            itemsApi.forEach((r: any, idx: number) => {
              const id = r.id || `api-${idx}`;
              if (!idsProcesados.has(id)) {
                listaCombinada.push({
                  id,
                  eventSlug: r.eventSlug || slugParam,
                  nombre: r.name || r.nombre || "Sin Nombre",
                  whatsapp: r.phone || r.whatsapp || "-",
                  asistira:
                    r.attending !== undefined
                      ? Boolean(r.attending)
                      : Boolean(r.asistira),
                  pasesConfirmados:
                    r.pasesConfirmados !== undefined
                      ? Number(r.pasesConfirmados)
                      : 1,
                  asistentes: Array.isArray(r.asistentes) ? r.asistentes : [],
                  mensaje: r.mensaje || "-",
                });
                idsProcesados.add(id);
              }
            });
          }
        }
      } catch (e) {}

      // 3. Cargar desde Google Sheets (si está configurado)
      try {
        const resScript = await fetch(
          "https://script.google.com/macros/s/AKfycbwZ4jQVBC_Puii6O4pMMuPZr-8VnUzSo0tqnOdAyPFoEglrfPQJqRBdIR9zChCtyEOOmA/exec"
        );
        if (resScript.ok) {
          const dataSheets = await resScript.json();
          if (Array.isArray(dataSheets) && dataSheets.length > 0) {
            dataSheets.forEach((item: any, idx: number) => {
              const itemSlug = (
                item.eventSlug ||
                item.slug ||
                item.evento ||
                item.event ||
                ""
              )
                .toString()
                .toLowerCase()
                .trim();

              if (!itemSlug || itemSlug === slugParam.toLowerCase().trim()) {
                const asisteStr = String(
                  item.asistencia || item.attending || ""
                ).toLowerCase();
                const asiste =
                  asisteStr.includes("si") ||
                  asisteStr.includes("confirmado") ||
                  item.asistencia === true ||
                  item.attending === true;

                const sheetId = `sheets-${idx}`;
                if (!idsProcesados.has(sheetId)) {
                  listaCombinada.push({
                    id: sheetId,
                    nombre: item.nombre || item.name || "Sin Nombre",
                    whatsapp: item.whatsapp || item.phone || "-",
                    asistira: asiste,
                    pasesConfirmados: asiste
                      ? parseInt(item.pases || item.pasesConfirmados || "1", 10) || 1
                      : 0,
                    asistentes: Array.isArray(item.asistentes)
                      ? item.asistentes
                      : item.asistentes
                      ? [item.asistentes]
                      : [],
                    mensaje: item.mensaje || "-",
                  });
                }
              }
            });
          }
        }
      } catch (e) {}

      setRespuestas(listaCombinada);
      setLoading(false);
    };

    cargarRespuestas();
  }, [slugParam]);

  // Cálculos de métricas
  const totalEnvios = respuestas.length;
  const confirmados = respuestas.filter((r) => r.asistira === true);
  const cancelados = respuestas.filter((r) => r.asistira === false);
  const totalPersonasAsistentes = confirmados.reduce(
    (acc, r) => acc + (r.pasesConfirmados || 1),
    0
  );

  const exportarCSV = () => {
    if (respuestas.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Nombre,WhatsApp,Asistira,Pases,Acompañantes,Mensaje\n";

    respuestas.forEach((r) => {
      const nombre = `"${r.nombre || ""}"`;
      const phone = `"${r.whatsapp || ""}"`;
      const asiste = r.asistira ? "SI" : "NO";
      const pases = r.asistira ? r.pasesConfirmados || 1 : 0;
      const acomp = `"${(r.asistentes || []).join(", ")}"`;
      const msg = `"${(r.mensaje || "").replace(/"/g, '""')}"`;

      csvContent += `${nombre},${phone},${asiste},${pases},${acomp},${msg}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `respuestas_${slugParam || "evento"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-4 sm:p-6 space-y-6">
      {/* Cabecera idéntica al diseño del cliente */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0d1527] p-5 rounded-2xl border border-slate-800 shadow-lg">
        <div className="space-y-1">
          <h1 className="text-base font-black text-amber-500 uppercase tracking-wide flex items-center gap-2">
            📊 RESPUESTAS DEL EVENTO: {slugParam ? slugParam.toUpperCase() : "..."}
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Enlace de respuestas: /{slugParam}
          </p>
        </div>

        <button
          onClick={exportarCSV}
          disabled={respuestas.length === 0}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-black font-extrabold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg transition-all self-end sm:self-auto"
        >
          📥 Descargar Excel (CSV)
        </button>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0d1527] p-4 rounded-2xl border border-slate-800/80 shadow-md">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
            TOTAL ENVÍOS
          </span>
          <p className="text-3xl font-black mt-2 text-white">{totalEnvios}</p>
        </div>

        <div className="bg-[#0d1527] p-4 rounded-2xl border border-slate-800/80 shadow-md">
          <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider block">
            CONFIRMADOS
          </span>
          <p className="text-3xl font-black mt-2 text-emerald-400">{confirmados.length}</p>
        </div>

        <div className="bg-[#0d1527] p-4 rounded-2xl border border-slate-800/80 shadow-md">
          <span className="text-[11px] text-rose-500 font-bold uppercase tracking-wider block">
            CANCELADOS
          </span>
          <p className="text-3xl font-black mt-2 text-rose-500">{cancelados.length}</p>
        </div>

        <div className="bg-[#0d1527] p-4 rounded-2xl border border-slate-800/80 shadow-md">
          <span className="text-[11px] text-amber-500 font-bold uppercase tracking-wider block">
            PERSONAS TOTALES
          </span>
          <p className="text-3xl font-black mt-2 text-amber-500">
            {totalPersonasAsistentes} <span className="text-lg">asist.</span>
          </p>
        </div>
      </div>

      {/* Tabla de Registros */}
      <div className="bg-[#0d1527] rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl p-4">
        {loading ? (
          <div className="p-12 text-center text-amber-400 font-bold text-sm">
            Cargando respuestas del evento...
          </div>
        ) : respuestas.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium text-sm">
            Aún no hay respuestas registradas para este evento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4">NOMBRE</th>
                  <th className="p-4">WHATSAPP</th>
                  <th className="p-4">ASISTENCIA</th>
                  <th className="p-4">PASES</th>
                  <th className="p-4">ACOMPAÑANTES</th>
                  <th className="p-4">MENSAJE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-sm">
                {respuestas.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 font-bold text-white">{item.nombre}</td>
                    <td className="p-4 text-slate-300 font-mono text-xs">{item.whatsapp}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          item.asistira
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {item.asistira ? "¡Sí asistirá!" : "No asistirá"}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-amber-400">
                      {item.asistira ? item.pasesConfirmados || 1 : 0}
                    </td>
                    <td className="p-4 text-slate-300 text-xs">
                      {item.asistira && (item.asistentes || []).length > 0
                        ? item.asistentes?.join(", ")
                        : "Ninguno"}
                    </td>
                    <td className="p-4 text-slate-400 text-xs">{item.mensaje}</td>
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