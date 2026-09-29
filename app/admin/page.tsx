"use client";
import { useEffect, useState } from "react";
import formConfigData from "../data/form-config.json";

export default function AdminIndexPage() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    setConfig(formConfigData);
  }, []);

  return (
    <main className="min-h-screen bg-[#0b192c] text-white p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b border-slate-700 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-400">Panel de Administración</h1>
            <p className="text-slate-400 text-sm">Gestiona la configuración y las respuestas del evento</p>
          </div>
          <a
            href="/admin/respuestas"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-lg transition-colors text-sm shadow-md"
          >
            Ver Lista de Respuestas →
          </a>
        </div>

        <div className="bg-[#1e293b] rounded-xl p-6 border border-slate-700 space-y-4">
          <h2 className="text-xl font-semibold text-amber-300">Detalles del Evento</h2>
          {config ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
                <span className="text-slate-400 block text-xs">Título:</span>
                <span className="font-medium">{config.title || "Sin título"}</span>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
                <span className="text-slate-400 block text-xs">Fecha Objetivo:</span>
                <span className="font-medium">{config.targetDate || "No definida"}</span>
              </div>
            </div>
          ) : (
            <p className="text-slate-400">Cargando datos...</p>
          )}
        </div>
      </div>
    </main>
  );
}