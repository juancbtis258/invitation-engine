"use client"; // Le indica a Next.js que este componente se ejecuta en el navegador (para manejar botones, inputs y estados)
export const dynamic = 'force-dynamic'; // Desactiva la caché estática y fuerza a Vercel a renderizar siempre la versión más actualizada

import { useEffect, useState } from "react";

export default function AdminPage() {
  // ==========================================
  // 1. ESTADOS (Manejo de variables locales)
  // ==========================================
  const [isAuthenticated, setIsAuthenticated] = useState(false); // // Controla si el usuario ya inició sesión o sigue en el formulario de login
  const [password, setPassword] = useState("");                  // // Guarda lo que escribe el usuario en la casilla de contraseña
  const [config, setConfig] = useState<any>(null);               // // Almacena la configuración completa del formulario (título, fecha, preguntas)
  const [loading, setLoading] = useState(true);                  // // Muestra una pantalla de "Cargando..." mientras se leen los datos del backend
  const [saving, setSaving] = useState(false);                   // // Desactiva el botón de guardar mientras se envía la información a la API

  // // Contraseña hardcodeada para proteger el acceso
  const ADMIN_PASSWORD = "admin"; 

  // ==========================================
  // 2. LECTURA DE DATOS AL CARGAR LA PÁGINA
  // ==========================================
  useEffect(() => {
    // // Solicita a nuestra API (/api/form-config) el JSON con las preguntas y títulos actuales
    fetch("/api/form-config")
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        setLoading(false); // // Una vez obtenidos los datos, quitamos la pantalla de carga
      })
      .catch((err) => {
        console.error("Error cargando configuración:", err);
        setLoading(false);
      });
  }, []);

  // ==========================================
  // 3. FUNCIONES DE AUTENTICACIÓN Y GUARDADO
  // ==========================================
  // // Verifica si la contraseña ingresada coincide con "admin"
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true); // // Da acceso al panel principal
    } else {
      alert("Contraseña incorrecta");
    }
  };

  // // Envía los datos modificados del formulario a la API mediante un método POST
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/form-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config), // // Convierte el objeto de configuración a formato JSON
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

  // ==========================================
  // 4. FUNCIONES PARA EDITAR PREGUNTAS (TALLY)
  // ==========================================
  // // Agrega un nuevo objeto de pregunta al arreglo dentro de `config`
  const addQuestion = () => {
    const newQuestions = [
      ...(config.questions || []),
      {
        id: `q_${Date.now()}`, // // Genera un ID único con base en la fecha y hora exacta
        label: "Nueva Pregunta",
        type: "text",
        placeholder: "Escribe aquí...",
        required: true,
      },
    ];
    setConfig({ ...config, questions: newQuestions });
  };

  // // Actualiza un campo específico (texto, tipo, placeholder) de una pregunta determinada por su índice
  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...config.questions];
    updated[index] = { ...updated[index], [field]: value };
    setConfig({ ...config, questions: updated });
  };

  // // Elimina una pregunta de la lista según su posición
  const deleteQuestion = (index: number) => {
    const updated = config.questions.filter((_: any, i: number) => i !== index);
    setConfig({ ...config, questions: updated });
  };

  // ==========================================
  // 5. VISTA 1: FORMULARIO DE LOGIN (SI NO ESTÁ AUTENTICADO)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#0b192c] text-white flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-[#1e293b] p-8 rounded-xl border border-slate-700 w-full max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-amber-400 text-center">Panel de Administración</h1>
          <p className="text-slate-400 text-sm text-center">Introduce tu contraseña para continuar</p>
          
          {/* // Campo para ingresar la contraseña */}
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

  // ==========================================
  // 6. VISTA 2: MENSAJE DE CARGA
  // ==========================================
  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b192c] text-white flex items-center justify-center">
        <p className="text-amber-400">Cargando panel...</p>
      </main>
    );
  }

  // ==========================================
  // 7. VISTA 3: PANEL DE CONTROL COMPLETO
  // ==========================================
  return (
    <main className="min-h-screen bg-[#0b192c] text-white p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* // Encabezado superior con botón hacia la vista de respuestas */}
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
          <>
            {/* // SECCIÓN 1: Ajustes Generales del Evento (Título y Fecha) */}
            <div className="bg-[#1e293b] p-6 rounded-xl border border-slate-700 space-y-4">
              <h2 className="text-xl font-bold text-amber-300">1. Ajustes del Evento</h2>
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
                    placeholder="Ej: 2026-10-15"
                  />
                </div>
              </div>
            </div>

            {/* // SECCIÓN 2: Editor Dinámico de Preguntas (Estilo Tally) */}
            <div className="bg-[#1e293b] p-6 rounded-xl border border-slate-700 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-amber-300">2. Preguntas del Formulario</h2>
                
                {/* // Botón para añadir una nueva pregunta */}
                <button
                  onClick={addQuestion}
                  className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                >
                  + Agregar Pregunta
                </button>
              </div>

              {/* // Lista mapeada de preguntas existentes */}
              <div className="space-y-4">
                {config.questions && config.questions.map((q: any, index: number) => (
                  <div key={q.id || index} className="p-4 rounded-lg bg-slate-800/60 border border-slate-700 space-y-3 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400">Paso {index + 1}</span>
                      
                      {/* // Botón para eliminar esta pregunta específica */}
                      <button
                        onClick={() => deleteQuestion(index)}
                        className="text-red-400 hover:text-red-300 text-xs font-semibold"
                      >
                        Eliminar
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Pregunta / Texto</label>
                        {/* // Input para editar la etiqueta/pregunta */}
                        <input
                          type="text"
                          value={q.label || ""}
                          onChange={(e) => updateQuestion(index, "label", e.target.value)}
                          className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Tipo de Campo</label>
                        {/* // Selector para alternar entre tipo Texto, Opciones (Sí/No) o Número */}
                        <select
                          value={q.type || "text"}
                          onChange={(e) => updateQuestion(index, "type", e.target.value)}
                          className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white text-xs"
                        >
                          <option value="text">Texto corto</option>
                          <option value="radio">Selección única (Sí/No)</option>
                          <option value="number">Número</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* // SECCIÓN 3: Botón para guardar todos los cambios en el backend */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8 py-3 rounded-xl transition-colors text-base shadow-lg"
              >
                {saving ? "Guardando..." : "Guardar Todos los Cambios"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}