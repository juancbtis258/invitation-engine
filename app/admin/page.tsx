"use client";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Clave de acceso al panel
  const ADMIN_PASSWORD = "admin"; 

  useEffect(() => {
    fetch("/api/form-config")
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando configuración:", err);
        setLoading(false);
      });
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Contraseña incorrecta");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/form-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        alert("¡Configuración guardada exitosamente!");
      } else {
        alert("Error al guardar la configuración.");
      }
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error.");
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#0b192c] text-white flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-[#1e293b] p-8 rounded-xl border border-slate-700 w-full max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-amber-400 text-center">Panel de Administración</h1>
          <p className="text-slate-400 text-sm text-center">Introduce tu contraseña para continuar</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
          />
          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold p-3 rounded-lg transition-colors">
            Ingresar
          </button>
        </form>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b192c] text-white flex items-center justify-center">
        <p className="text-amber-400">Cargando panel...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b192c] text-white p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b border-slate-700 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-400">Creador & Configuración de Invitación</h1>
            <p className="text-slate-400 text-sm">Diseña preguntas y gestiona tus clientes tipo Tally</p>
          </div>
          <a
            href="/admin/respuestas"
            className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold px-4 py-2 rounded-lg border border-slate-700 text-sm transition-colors"
          >
            Ver Respuestas →
          </a>
        </div>

        {config && (
          <div className="bg-[#1e293b] p-6 rounded-xl border border-slate-700 space-y-4">
            <h2 className="text-xl font-bold text-amber-300">Ajustes del Evento</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Título del Evento / Cliente</label>
                <input
                  type="text"
                  value={config.title || ""}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Fecha Objetivo</label>
                <input
                  type="text"
                  value={config.targetDate || ""}
                  onChange={(e) => setConfig({ ...config, targetDate: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-2.5 rounded-lg transition-colors text-sm shadow-md"
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}