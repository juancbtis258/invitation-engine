"use client";

import { useState, useEffect, use } from "react";

interface ResponseItem {
  id?: string;
  name?: string;
  attending: boolean;
  pasesConfirmados?: number;
  customAnswers?: Record<string, any>;
  createdAt?: string;
}

interface EventData {
  title: string;
  slug: string;
  targetDate?: string;
  pasesAsignados?: number;
}

export default function PortalClientePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Desenvuelve los parámetros dinámicos de la URL
  const { slug } = use(params);

  const [respuestas, setRespuestas] = useState<ResponseItem[]>([]);
  const [evento, setEvento] = useState<EventData | null>(null);
  const [cargando, setCargando] = useState(true);

  // Carga las respuestas del evento desde la API existente
  useEffect(() => {
    if (!slug) return;

    fetch(`/api/form-config?event=${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setEvento({
            title: data.data.title || slug.toUpperCase(),
            slug: slug,
            targetDate: data.data.targetDate,
            pasesAsignados: data.data.pasesAsignados || 2,
          });

          if (data.data.responses) {
            setRespuestas(data.data.responses);
          }
        }
      })
      .catch((err) => console.error("Error al cargar datos del evento:", err))
      .finally(() => setCargando(false));
  }, [slug]);

  // Cálculo de métricas
  const totalEnVIos = respuestas.length;
  const totalConfirmados = respuestas.filter((r) => r.attending).length;
  const totalCancelados = respuestas.filter((r) => !r.attending).length;
  const totalAsistentesPersonas = respuestas
    .filter((r) => r.attending)
    .reduce((acc, curr) => acc + (Number(curr.pasesConfirmados) || 1), 0);

  // Descarga directa a Excel (CSV)
  const exportarExcel = () => {
    if (respuestas.length === 0) return;

    let csvContent = "\uFEFFNro,Invitado / Familia,Asistirá,Personas Confirmadas,Respuestas Adicionales,Fecha Registro\n";

    respuestas.forEach((r, idx) => {
      const num = idx + 1;
      const nombre = `"${(r.name || "Anónimo").replace(/"/g, '""')}"`;
      const asistira = r.attending ? "SÍ" : "NO";
      const personas = r.attending ? (r.pasesConfirmados || 1) : 0;
      const custom = `"${JSON.stringify(r.customAnswers || {}).replace(/"/g, '""')}"`;
      const fecha = r.createdAt ? `"${new Date(r.createdAt).toLocaleString()}"` : '""';

      csvContent += `${num},${nombre},${asistira},${personas},${custom},${fecha}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Lista_Invitados_${slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#0d1527] text-slate-100 flex items-center justify-center font-sans">
        <p className="text-xs text-amber-500 font-bold animate-pulse">
          ⏳ Cargando portal de confirmaciones...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1527] text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* ENCABEZADO INDEPENDIENTE PARA EL CLIENTE */}
        <div className="bg-[#121c33] border border-slate-800/80 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-amber-500 tracking-tight">
              {evento?.title || "Mi Evento"}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Portal de Confirmaciones de Invitados
            </p>
          </div>

          <button
            onClick={exportarExcel}
            disabled={respuestas.length === 0}
            className={`text-xs font-bold px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
              respuestas.length > 0
                ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            <span>📥 Descargar Lista a Excel (CSV)</span>
          </button>
        </div>

        {/* MÉTRICAS CLAVE */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#121c33] p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Envíos</span>
            <p className="text-2xl font-black text-slate-100">{totalEnVIos}</p>
          </div>

          <div className="bg-[#121c33] p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase text-emerald-400">Confirmados (SÍ)</span>
            <p className="text-2xl font-black text-emerald-400">{totalConfirmados}</p>
          </div>

          <div className="bg-[#121c33] p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase text-rose-400">Cancelados (NO)</span>
            <p className="text-2xl font-black text-rose-400">{totalCancelados}</p>
          </div>

          <div className="bg-[#121c33] p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase text-amber-400">Total Personas</span>
            <p className="text-2xl font-black text-amber-400">{totalAsistentesPersonas} asist.</p>
          </div>
        </div>

        {/* TABLA DE DETALLES */}
        <div className="bg-[#121c33] border border-slate-800/80 rounded-2xl p-6 shadow-2xl space-y-4">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            RESPUESTAS RECIBIDAS
          </h2>

          {respuestas.length === 0 ? (
            <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-500">
                Aún no has recibido confirmaciones para tu evento.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold">
                    <th className="p-3">#</th>
                    <th className="p-3">Invitado / Familia</th>
                    <th className="p-3">Asistirá</th>
                    <th className="p-3">Personas</th>
                    <th className="p-3">Respuestas Adicionales</th>
                    <th className="p-3">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {respuestas.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="p-3 text-slate-500 font-mono">{idx + 1}</td>
                      <td className="p-3 font-semibold text-slate-200">{r.name || "Anónimo"}</td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            r.attending
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {r.attending ? "SÍ ASISTIRÁ" : "NO ASISTIRÁ"}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-amber-400">
                        {r.attending ? `${r.pasesConfirmados || 1} pers.` : "0"}
                      </td>
                      <td className="p-3 text-slate-300">
                        <pre className="text-[11px] font-mono whitespace-pre-wrap">
                          {JSON.stringify(r.customAnswers || {}, null, 2)}
                        </pre>
                      </td>
                      <td className="p-3 text-slate-500 text-[11px]">
                        {r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}