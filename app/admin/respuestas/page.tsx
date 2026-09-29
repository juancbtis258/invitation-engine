"use client";
import { useEffect, useState } from "react";

export default function AdminRespuestasPage() {
  const [respuestas, setRespuestas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // PEGA AQUÍ TU URL DE GOOGLE APPS SCRIPT
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwZ4jQVBC_Puii6O4pMMuPZr-8VnUzSo0tqnOdAyPFoEglrfPQJqRBdIR9zChCtyEOOmA/exec";

  useEffect(() => {
    fetch(SCRIPT_URL)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRespuestas(data);
        } else {
          setRespuestas([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener respuestas:", err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-[#0b192c] text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex justify-between items-center border-b border-slate-700 pb-4">
          <h1 className="text-2xl font-bold text-amber-400">Lista de Invitados Confirmados</h1>
          <a href="/admin" className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300">
            ← Volver al Admin
          </a>
        </div>

        {loading ? (
          <div className="bg-[#1e293b] rounded-xl p-8 text-center border border-slate-700">
            <p className="text-amber-400">Cargando datos de Google Sheets...</p>
          </div>
        ) : respuestas.length === 0 ? (
          <div className="bg-[#1e293b] rounded-xl p-8 text-center border border-slate-700">
            <p className="text-slate-400">Aún no hay respuestas registradas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-[#1e293b] rounded-xl border border-slate-700 shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-amber-400 bg-slate-800/50">
                  <th className="p-3">#</th>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Asistencia</th>
                  <th className="p-3">Pases</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {respuestas.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 text-slate-400 text-sm">{idx + 1}</td>
                    <td className="p-3 font-medium">{item.nombre || "Sin nombre"}</td>
                    <td className="p-3">{item.asistencia || "Confirmado"}</td>
                    <td className="p-3 text-slate-300">{item.pases || 1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}