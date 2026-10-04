"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface ResponseItem {
  id: string;
  eventSlug?: string;
  name?: string;
  nombre?: string;
  phone?: string;
  whatsapp?: string;
  attending?: boolean;
  asistira?: boolean;
  pasesConfirmados?: number;
  asistentes?: string[];
  customAnswers?: Record<string, string>;
  mensaje?: string;
  createdAt?: string;
}

export default function AdminRespuestasPage() {
  const searchParams = useSearchParams();
  const slugParam = searchParams?.get("event") || searchParams?.get("slug") || "";

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

      // 1. Cargar desde localStorage local
      try {
        const local = localStorage.getItem("app_respuestas_lista");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            parsed
              .filter(
                (r) => (r.eventSlug || r.slug || "").toLowerCase() === slugParam.toLowerCase()
              )
              .forEach((r) => {
                const itemNormalizado: ResponseItem = {
                  id: r.id || `local-${Math.random()}`,
                  eventSlug: r.eventSlug || slugParam,
                  nombre: r.name || r.nombre || "Sin Nombre",
                  whatsapp: r.phone || r.whatsapp || "-",
                  asistira: r.attending !== undefined ? Boolean(r.attending) : Boolean(r.asistira),
                  pasesConfirmados: r.pasesConfirmados !== undefined ? Number(r.pasesConfirmados) : 1,
                  asistentes: Array.isArray(r.asistentes) ? r.asistentes : [],
                  customAnswers: r.customAnswers || {},
                  mensaje: r.mensaje || "-",
                  createdAt: r.createdAt,
                };
                listaCombinada.push(itemNormalizado);
                if (r.id) idsProcesados.add(r.id);
              });
          }
        }
      } catch (e) {
        console.error("Error al leer de localStorage:", e);
      }

      // 2. Cargar desde la API interna
      try {
        const resApi = await fetch(`/api/form-config?action=get_responses&event=${slugParam}`);
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
                  asistira: r.attending !== undefined ? Boolean(r.attending) : Boolean(r.asistira),
                  pasesConfirmados: r.pasesConfirmados !== undefined ? Number(r.pasesConfirmados) : 1,
                  asistentes: Array.isArray(r.asistentes) ? r.asistentes : [],
                  customAnswers: r.customAnswers || {},
                  mensaje: r.mensaje || "-",
                  createdAt: r.createdAt,
                });
                idsProcesados.add(id);
              }
            });
          }
        }
      } catch (e) {
        // Si falla la API local, continúa con los datos cargados de localStorage
      }

      // 3. Cargar desde Google Sheets (Webhook de lectura si está disponible)
      try {
        const resScript = await fetch(
          "https://script.google.com/macros/s/AKfycbwZ4jQVBC_Puii6O4pMMuPZr-8VnUzSo0tqnOdAyPFoEglrfPQJqRBdIR9zChCtyEOOmA/exec"
        );
        const dataSheets = await resScript.json();

        if (Array.isArray(dataSheets) && dataSheets.length > 0) {
          dataSheets.forEach((item: any, idx: number) => {
            const itemSlug = (item.eventSlug || item.slug || item.evento || item.event || "")
              .toString()
              .toLowerCase()
              .trim();

            if (!itemSlug || itemSlug === slugParam.toLowerCase().trim()) {
              const asisteStr = String(item.asistencia || item.attending || "").toLowerCase();
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
      } catch (e) {
        // Ignorar si el webhook público falla o no está disponible
      }

      setRespuestas(listaCombinada);
      setLoading(false);
    };

    cargarRespuestas();
  }, [slugParam]);

  // Métricas
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
    <div className="w-full space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-amber-500 uppercase flex items-center gap-2">
            📊 RESPUESTAS DEL EVENTO: {slugParam ? slugParam.toUpperCase() : "GENERAL"}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {slugParam ? `Enlace de respuestas: /${slugParam}` : "Selecciona un evento para ver detalles"}
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

      {/* Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
            TOTAL ENVÍOS
          </span>
          <p className="text-2xl font-extrabold mt-1 text-white">{totalEnvios}</p>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider block">
            CONFIRMADOS
          </span>
          <p className="text-2xl font-extrabold mt-1 text-emerald-400">{confirmados.length}</p>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-rose-500 font-bold uppercase tracking-wider block">
            CANCELADOS
          </span>
          <p className="text-2xl font-extrabold mt-1 text-rose-500">{cancelados.length}</p>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-amber-500 font-bold uppercase tracking-wider block">
            PERSONAS TOTALES
          </span>
          <p className="text-2xl font-extrabold mt-1 text-amber-500">
            {totalPersonasAsistentes} asist.
          </p>
        </div>
      </div>

      {/* Tabla Detallada */}
      <div className="bg-[#0f172a] rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-8 text-center text-amber-400 font-medium">
            Cargando lista de respuestas...
          </div>
        ) : respuestas.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            Aún no hay respuestas registradas para este evento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1e293b] text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                  <th className="p-3.5">NOMBRE</th>
                  <th className="p-3.5">WHATSAPP</th>
                  <th className="p-3.5">ASISTENCIA</th>
                  <th className="p-3.5">PASES</th>
                  <th className="p-3.5">ACOMPAÑANTES</th>
                  <th className="p-3.5">MENSAJE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {respuestas.map((item) => {
                  const asiste = item.asistira;
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-bold text-white">{item.nombre}</td>
                      <td className="p-3.5 text-slate-400">{item.whatsapp}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                            asiste
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {asiste ? "¡Sí asistirá!" : "No asistirá"}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-amber-500">
                        {asiste ? item.pasesConfirmados || 1 : 0}
                      </td>
                      <td className="p-3.5 text-slate-300 text-xs">
                        {asiste && (item.asistentes || []).length > 0
                          ? item.asistentes?.join(", ")
                          : "Ninguno"}
                      </td>
                      <td className="p-3.5 text-slate-400 text-xs">{item.mensaje}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}