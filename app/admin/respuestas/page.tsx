"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function AdminRespuestasPage() {
  const searchParams = useSearchParams();
  const slugParam = searchParams?.get("event") || searchParams?.get("slug") || "asdasd";

  const [todasLasRespuestas, setTodasLasRespuestas] = useState<any[]>([]);
  const [respuestasFiltradas, setRespuestasFiltradas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // URL DE GOOGLE APPS SCRIPT
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
        console.error("Error al obtener respuestas de Google Sheets:", err);
        setLoading(false);
      });
  }, []);

  // Filtrar las respuestas por el slug del evento actual
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

      // Si Google Sheets no incluye columna de slug, muestra todos o los que coincidan
      return itemSlug ? itemSlug === slugParam.toLowerCase().trim() : true;
    });

    setRespuestasFiltradas(filtradas);
  }, [slugParam, todasLasRespuestas]);

  // Cálculo de Métricas
  const totalEnvios = respuestasFiltradas.length;
  const confirmados = respuestasFiltradas.filter((r) => {
    const asisteStr = String(r.asistencia || r.attending || "").toLowerCase();
    return asisteStr.includes("si") || asisteStr.includes("confirmado") || r.asistencia === true || r.attending === true;
  });
  const cancelados = respuestasFiltradas.filter((r) => {
    const asisteStr = String(r.asistencia || r.attending || "").toLowerCase();
    return asisteStr.includes("no") || asisteStr.includes("cancelado") || r.asistencia === false;
  });
  const totalPersonasAsistentes = confirmados.reduce((acc, r) => {
    const pasesNum = parseInt(r.pases || r.pasesConfirmados || "1", 10);
    return acc + (isNaN(pasesNum) ? 1 : pasesNum);
  }, 0);

  return (
    <main className="min-h-screen bg-[#0b192c] text-white p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-700 pb-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-amber-400">
              📊 RESPUESTAS DEL EVENTO: {slugParam.toUpperCase()}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Enlace / filtro actual: /{slugParam}
            </p>
          </div>
          <a
            href="/admin"
            className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg border border-slate-700 text-slate-300 font-semibold"
          >
            ← Volver al Admin
          </a>
        </div>

        {/* Tarjetas de Métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400 font-bold uppercase block">Total Envíos</span>
            <p className="text-2xl font-extrabold mt-1 text-white">{totalEnvios}</p>
          </div>
          <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700">
            <span className="text-xs text-emerald-400 font-bold uppercase block">Confirmados</span>
            <p className="text-2xl font-extrabold mt-1 text-emerald-400">{confirmados.length}</p>
          </div>
          <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700">
            <span className="text-xs text-rose-400 font-bold uppercase block">Cancelados</span>
            <p className="text-2xl font-extrabold mt-1 text-rose-400">{cancelados.length}</p>
          </div>
          <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700">
            <span className="text-xs text-amber-400 font-bold uppercase block">Personas Totales</span>
            <p className="text-2xl font-extrabold mt-1 text-amber-400">{totalPersonasAsistentes} asist.</p>
          </div>
        </div>

        {/* Tabla de Resultados */}
        {loading ? (
          <div className="bg-[#1e293b] rounded-xl p-8 text-center border border-slate-700">
            <p className="text-amber-400 font-medium">Cargando datos desde Google Sheets...</p>
          </div>
        ) : respuestasFiltradas.length === 0 ? (
          <div className="bg-[#1e293b] rounded-xl p-8 text-center border border-slate-700">
            <p className="text-slate-400">Aún no hay respuestas registradas para el evento <strong>/{slugParam}</strong>.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-[#1e293b] rounded-xl border border-slate-700 shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-amber-400 bg-slate-800/80 text-xs font-semibold uppercase">
                  <th className="p-3">#</th>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">WhatsApp</th>
                  <th className="p-3">Asistencia</th>
                  <th className="p-3">Pases</th>
                  <th className="p-3">Acompañantes</th>
                  <th className="p-3">Mensaje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {respuestasFiltradas.map((item, idx) => {
                  const asisteStr = String(item.asistencia || item.attending || "").toLowerCase();
                  const asiste = asisteStr.includes("si") || asisteStr.includes("confirmado") || item.asistencia === true || item.attending === true;

                  return (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 text-slate-500 text-xs">{idx + 1}</td>
                      <td className="p-3 font-semibold text-white">
                        {item.nombre || item.name || "Sin nombre"}
                      </td>
                      <td className="p-3 text-slate-400">
                        {item.whatsapp || item.phone || "-"}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-bold ${
                            asiste
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-rose-500/20 text-rose-400"
                          }`}
                        >
                          {asiste ? "¡Sí asistirá!" : "No asistirá"}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-amber-400">
                        {asiste ? item.pases || item.pasesConfirmados || 1 : 0}
                      </td>
                      <td className="p-3 text-slate-300 text-xs">
                        {Array.isArray(item.asistentes)
                          ? item.asistentes.join(", ")
                          : item.asistentes || item.acompanantes || "Ninguno"}
                      </td>
                      <td className="p-3 text-slate-400 text-xs">
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
    </main>
  );
}