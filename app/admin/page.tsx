"use client";

import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const ADMIN_PASSWORD = "boda2026"; 

  useEffect(() => {
    fetch("/api/form-config")
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        setLoading(false);
      });
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Contraseña incorrecta");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/form-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setSaving(false);
    alert("¡Configuración guardada!");
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updatedQuestions = [...config.questions];
    updatedQuestions[index][field] = value;
    setConfig({ ...config, questions: updatedQuestions });
  };

  const addQuestion = () => {
    const newQuestion = {
      id: `pregunta_${Date.now()}`,
      title: "Nueva pregunta",
      type: "text",
      required: true,
      placeholder: "Escribe tu respuesta...",
    };
    setConfig({ ...config, questions: [...config.questions, newQuestion] });
  };

  const deleteQuestion = (index: number) => {
    const updatedQuestions = config.questions.filter((_: any, i: number) => i !== index);
    setConfig({ ...config, questions: updatedQuestions });
  };

  if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Cargando...</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-sm w-full space-y-4 shadow-xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-amber-300">Acceso al Admin</h1>
            <p className="text-xs text-slate-400 mt-1">Gestión del formulario Canva</p>
          </div>
          <input
            type="password"
            placeholder="Contraseña"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400 text-center"
          />
          <button type="submit" className="w-full bg-amber-400 text-slate-950 font-bold p-3 rounded-xl">Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-amber-300">Editor de Formulario (Canva)</h1>
            <p className="text-sm text-slate-400">Configura el formulario que se incrustará en Canva</p>
          </div>
          <div className="flex gap-3">
            <a href="/admin/respuestas" className="bg-slate-800 text-amber-300 border border-slate-700 font-bold px-4 py-3 rounded-xl text-sm">📋 Ver Respuestas</a>
            <button onClick={handleSave} disabled={saving} className="bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm">{saving ? "Guardando..." : "Guardar Cambios"}</button>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-semibold text-white">Título del Bloque</h2>
          <div>
            <label className="text-xs text-slate-400 font-semibold uppercase">Encabezado del Formulario</label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              className="w-full mt-1 p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Preguntas ({config.questions.length})</h2>
            <button onClick={addQuestion} className="bg-slate-800 border border-slate-700 text-amber-300 px-4 py-2 rounded-xl text-sm font-semibold">+ Agregar Pregunta</button>
          </div>

          {config.questions.map((q: any, index: number) => (
            <div key={q.id} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-400 uppercase">Pregunta #{index + 1}</span>
                <button onClick={() => deleteQuestion(index)} className="text-red-400 text-xs font-semibold">Eliminar</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400">Título</label>
                  <input
                    type="text"
                    value={q.title}
                    onChange={(e) => handleQuestionChange(index, "title", e.target.value)}
                    className="w-full mt-1 p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Tipo</label>
                  <select
                    value={q.type}
                    onChange={(e) => handleQuestionChange(index, "type", e.target.value)}
                    className="w-full mt-1 p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="text">Texto corto</option>
                    <option value="textarea">Texto largo</option>
                    <option value="number">Número de pases</option>
                    <option value="choice">Selección de opciones</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}