"use client";

import { useState, useEffect } from "react";

export default function ResponsesPage() {
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/responses")
      .then((res) => res.json())
      .then((data) => {
        setResponses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const downloadCSV = () => {
    if (responses.length === 0) return alert("No hay respuestas para exportar");

    const headers = Object.keys(responses[0]).join(",");
    const rows = responses.map((r) =>
      Object.values(r)
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `confirmaciones_boda_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Cargando respuestas...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-amber-300">
              Confirmaciones de Invitados
            </h1>
            <p className="text-sm text-slate-400">
              Lista total de asistentes y respuestas en tiempo real ({responses.length})
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="/admin"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-3 rounded-xl border border-slate-700 text-sm transition"
            >
              ← Volver al Editor
            </a>
            <button
              onClick={downloadCSV}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition"
            >
              📥 Descargar Excel / CSV
            </button>
          </div>
        </div>

        {/* Tabla de Respuestas */}
        {responses.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center text-slate-400">
            Aún no hay respuestas registradas.
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-amber-400 uppercase text-xs tracking-wider border-b border-slate-800">
                <tr>
                  {Object.keys(responses[0]).map((key) => (
                    <th key={key} className="p-4 font-bold">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {responses.map((resp, i) => (
                  <tr key={i} className="hover:bg-slate-800/50 transition">
                    {Object.values(resp).map((val: any, j) => (
                      <td key={j} className="p-4">
                        {String(val)}
                      </td>
                    ))}
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