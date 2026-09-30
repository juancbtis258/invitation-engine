"use client";

import { useEffect, useState, use } from "react";

interface RespuestaItem {
  name: string;
  attending: boolean;
  pasesConfirmados: number;
  phone?: string;
  asistentes?: string[];
  mensaje?: string;
  customAnswers?: Record<string, string>;
  createdAt: string;
}

interface EventoConfig {
  title: string;
  slug: string;
  responses?: RespuestaItem[];
}

export default function RespuestasClientePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [evento, setEvento] = useState<EventoConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/form-config?event=${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setEvento(data.data);
        }
      })
      .catch((err) => console.error("Error al cargar respuestas:", err))
      .finally(() => setLoading(false));
  }, [slug]);

  const respuestas = evento?.responses || [];

  const totalRespuestas = respuestas.length;
  const totalConfirmados = respuestas.filter((r) => r.attending).length;
  const totalCancelados = respuestas.filter((r) => !r.attending).length;
  const totalPersonas = respuestas
    .filter((r) => r.attending)
    .reduce((acc, curr) => acc + (Number(curr.pasesConfirmados) || 1), 0);

  const exportarCSV = () => {
    if (respuestas.length === 0) return;

    let csvContent =
      "\uFEFFNro,Invitado / Familia,Asistirá,Personas Confirmadas,Lista Asistentes,Mensaje / Felicitación,Respuestas Adicionales,Fecha Registro\n";

    respuestas.forEach((r, idx) => {
      const num = idx + 1;
      const nombre = `"${(r.name || "Anónimo").replace(/"/g, '""')}"`;
      const asistira = r.attending ? "SÍ" : "NO";
      const personas = r.attending ? r.pasesConfirmados || 1 : 0;
      const listaAsistentes = `"${(r.asistentes || []).join(", ").replace(/"/g, '""')}"`;
      const mensaje = `"${(r.mensaje || "").replace(/"/g, '""')}"`;
      const custom = `"${JSON.stringify(r.customAnswers || {}).replace(/"/g, '""')}"`;
      const fecha = r.createdAt
        ? `"${new Date(r.createdAt).toLocaleString()}"`
        : '""';

      csvContent += `${num},${nombre},${asistira},${personas},${listaAsistentes},${mensaje},${custom},${fecha}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Confirmaciones_${slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1527] text-slate-100 flex items-center justify-center font-sans">
        <p className="text-xs text-amber-500 font-bold animate-pulse">
          ⏳ Cargando concentrado de respuestas...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1527] text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* ENCABEZADO */}
        <div className="bg-[#121c33] border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
          <div>
            <h1 className="text-2xl font-black text-amber-500 tracking-tight">
              {evento?.title || slug.toUpperCase()}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Portal de Confirmaciones de Invitados
            </p>
          </div>

          <button
            onClick={exportarCSV}
            disabled={respuestas.length === 0}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 ${
              respuestas.length > 0
                ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            📥 Descargar Lista a Excel (CSV)
          </button>
        </div>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#121c33] p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-500">TOTAL ENVÍOS</span>
            <p className="text-2xl font-black text-slate-100">{totalRespuestas}</p>
          </div>

          <div className="bg-[#121c33] p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase text-emerald-500">CONFIRMADOS (SÍ)</span>
            <p className="text-2xl font-black text-emerald-400">{totalConfirmados}</p>
          </div>

          <div className="bg-[#121c33] p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase text-rose-500">CANCELADOS (NO)</span>
            <p className="text-2xl font-black text-rose-400">{totalCancelados}</p>
          </div>

          <div className="bg-[#121c33] p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase text-amber-500">TOTAL PERSONAS</span>
            <p className="text-2xl font-black text-amber-400">{totalPersonas} asist.</p>
          </div>
        </div>

        {/* TABLA DE RESPUESTAS */}
        <div className="bg-[#121c33] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            RESPUESTAS RECIBIDAS
          </h2>

          {respuestas.length === 0 ? (
            <div className="text-center py-12 bg-slate-950/60 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-500">
                Aún no hay respuestas registradas para este evento.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold">
                    <th className="p-3">#</th>
                    <th className="p-3">INVITADO / FAMILIA</th>
                    <th className="p-3">ASISTIRÁ</th>
                    <th className="p-3">PERSONAS</th>
                    <th className="p-3">DETALLES / MENSAJE</th>
                    <th className="p-3">FECHA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {respuestas.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="p-3 text-slate-500 font-mono">{idx + 1}</td>
                      <td className="p-3 font-semibold text-slate-200">
                        {r.name}
                        {r.phone && <span className="block text-[10px] text-slate-500">{r.phone}</span>}
                      </td>
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
                        {r.attending ? `${r.pasesConfirmados} pases` : "0"}
                      </td>
                      <td className="p-3 text-slate-300 max-w-xs">
                        {r.asistentes && r.asistentes.length > 0 && (
                          <p className="text-[11px] text-slate-400">
                            👥 <span className="text-slate-200">{r.asistentes.join(", ")}</span>
                          </p>
                        )}
                        {r.mensaje && (
                          <p className="text-[11px] italic text-amber-300/90 mt-0.5">
                            💬 "{r.mensaje}"
                          </p>
                        )}
                        {r.customAnswers && Object.keys(r.customAnswers).length > 0 && (
                          <pre className="text-[10px] font-mono text-slate-500 mt-1 whitespace-pre-wrap">
                            {JSON.stringify(r.customAnswers, null, 2)}
                          </pre>
                        )}
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