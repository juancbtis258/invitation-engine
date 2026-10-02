"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function AdminRespuestasPage() {
  const searchParams = useSearchParams();
  const slugParam = searchParams?.get("event") || searchParams?.get("slug") || "asdasd";

  const [todasLasRespuestas, setTodasLasRespuestas] = useState<any[]>([]);
  const [respuestasFiltradas, setRespuestasFiltradas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwZ4jQVBC_Puii6O4pMMuPZr-8VnUzSo0tqnOdAyPFoEglrfPQJqRBdIR9zChCtyEOOmA/exec";

  useEffect(() => {
    setLoading(true);
    fetch(SCRIPT_URL)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTodasLasRespuestas(data);
        } else {
          setTodasLasRespuestas([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener respuestas:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!slugParam) {
      setRespuestasFiltradas(todasLasRespuestas);
      return;
    }

    const filtradas = todasLasRespuestas.filter((item) => {
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

      return itemSlug ? itemSlug === slugParam.toLowerCase().trim() : true;
    });

    setRespuestasFiltradas(filtradas);
  }, [slugParam, todasLasRespuestas]);

  // Métricas
  const totalEnvios = respuestasFiltradas.length;
  const confirmados = respuestasFiltradas.filter((r) => {
    const asisteStr = String(r.asistencia || r.attending || "").toLowerCase();
    return (
      asisteStr.includes("si") ||
      asisteStr.includes("confirmado") ||
      r.asistencia === true ||
      r.attending === true
    );
  });
  const cancelados = respuestasFiltradas.filter((r) => {
    const asisteStr = String(r.asistencia || r.attending || "").toLowerCase();
    return asisteStr.includes("no") || asisteStr.includes("cancelado") || r.asistencia === false;
  });
  const totalPersonasAsistentes = confirmados.reduce((acc, r) => {
    const pasesNum = parseInt(r.pases || r.pasesConfirmados || "1", 10);
    return acc + (isNaN(pasesNum) ? 1 : pasesNum);
  }, 0);

  const exportarCSV = () => {
    if (respuestasFiltradas.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Nombre,WhatsApp,Asistira,Pases,Acompañantes,Mensaje\n";

    respuestasFiltradas.forEach((r) => {
      const nombre = `"${r.nombre || r.name || ""}"`;
      const phone = `"${r.whatsapp || r.phone || ""}"`;
      const asisteStr = String(r.asistencia || r.attending || "").toLowerCase();
      const asiste =
        asisteStr.includes("si") ||
        asisteStr.includes("confirmado") ||
        r.asistencia === true ||
        r.attending === true
          ? "SI"
          : "NO";
      const pases = r.pases || r.pasesConfirmados || 1;
      const acomp = `"${
        Array.isArray(r.asistentes)
          ? r.asistentes.join(", ")
          : r.asistentes || r.acompanantes || ""
      }"`;
      const msg = `"${(r.mensaje || "").replace(/"/g, '""')}"`;

      csvContent += `${nombre},${phone},${asiste},${pases},${acomp},${msg}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `respuestas_${slugParam}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-6">
      {/* Cabecera y Botón Exportar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-amber-500 uppercase flex items-center gap-2">
            📊 RESPUESTAS DEL EVENTO: {slugParam.toUpperCase()}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Enlace de respuestas: /{slugParam}
          </p>
        </div>

        <button
          onClick={exportarCSV}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-md transition-all"
        >
          📥 Descargar Excel (CSV)
        </button>
      </div>

      {/* Tarjetas de Métricas */}
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
          <p className="text-2xl font-extrabold mt-1 text-emerald-400">
            {confirmados.length}
          </p>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-rose-500 font-bold uppercase tracking-wider block">
            CANCELADOS
          </span>
          <p className="text-2xl font-extrabold mt-1 text-rose-500">
            {cancelados.length}
          </p>
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

      {/* Tabla Detallada de Invitados */}
      <div className="bg-[#0f172a] rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-8 text-center text-amber-400 font-medium">
            Cargando lista de respuestas...
          </div>
        ) : respuestasFiltradas.length === 0 ? (
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
                {respuestasFiltradas.map((item, idx) => {
                  const asisteStr = String(item.asistencia || item.attending || "").toLowerCase();
                  const asiste =
                    asisteStr.includes("si") ||
                    asisteStr.includes("confirmado") ||
                    item.asistencia === true ||
                    item.attending === true;

                  return (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-bold text-white">
                        {item.nombre || item.name || "Sin Nombre"}
                      </td>
                      <td className="p-3.5 text-slate-400">
                        {item.whatsapp || item.phone || "-"}
                      </td>
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
                        {asiste ? item.pases || item.pasesConfirmados || 1 : 0}
                      </td>
                      <td className="p-3.5 text-slate-300 text-xs">
                        {Array.isArray(item.asistentes)
                          ? item.asistentes.join(", ")
                          : item.asistentes || item.acompanantes || "Ninguno"}
                      </td>
                      <td className="p-3.5 text-slate-400 text-xs">
                        {item.mensaje || "-"}
                      </td>
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