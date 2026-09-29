"use client";

import { useEffect, useState } from "react";

interface Question {
  id: string;
  label: string;
  type: "text" | "choice" | "number";
  options?: string[];
}

interface EventConfig {
  title: string;
  targetDate: string;
  plan: string;
  active: boolean;
  questions: Question[];
  responses: any[];
}

interface Collaborator {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: "admin" | "collaborator" | "client";
  status: "activo" | "inactivo";
}

export default function AdminDashboard() {
  const [eventSlug, setEventSlug] = useState("demo");
  const [title, setTitle] = useState("Boda María & Alejandro");
  const [targetDate, setTargetDate] = useState("2026-10-15");
  const [plan, setPlan] = useState("plus");
  const [active, setActive] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([
    { id: "q1", label: "¿Tienen alguna restricción alimenticia?", type: "text" },
  ]);
  
  const [responses, setResponses] = useState<any[]>([]);
  const [allEvents, setAllEvents] = useState<Record<string, EventConfig>>({
    demo: {
      title: "Boda María & Alejandro",
      targetDate: "2026-10-15",
      plan: "plus",
      active: true,
      questions: [],
      responses: []
    }
  });

  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { id: "u1", name: "Alejandro Mejía (Tú)", username: "admin", password: "123", role: "admin", status: "activo" },
    { id: "u2", name: "Cliente Demo", username: "cliente", password: "123", role: "client", status: "activo" }
  ]);

  const [newCollabName, setNewCollabName] = useState("");
  const [newCollabUsername, setNewCollabUsername] = useState("");
  const [newCollabPassword, setNewCollabPassword] = useState("");
  const [newCollabRole, setNewCollabRole] = useState<"collaborator" | "client">("client");

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");

  const [testPases, setTestPases] = useState<number>(3);
  const [activeTab, setActiveTab] = useState<"list" | "builder" | "responses" | "users">("list");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/form-config?action=get_all_events")
      .then((res) => res.json())
      .then((res) => {
        if (res.data && Object.keys(res.data).length > 0) {
          setAllEvents(res.data);
        }
      })
      .catch((err) => console.error("Error al cargar lista de eventos:", err));
  }, []);

  const loadEventData = (slugToLoad: string) => {
    fetch(`/api/form-config?event=${slugToLoad}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          setTitle(res.data.title || "Mi Evento");
          setTargetDate(res.data.targetDate || "2026-10-15");
          setPlan(res.data.plan || "plus");
          setActive(res.data.active !== undefined ? res.data.active : true);
          if (res.data.questions && res.data.questions.length > 0) {
            setQuestions(res.data.questions);
          }
          setResponses(res.data.responses || []);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadEventData(eventSlug);
  }, [eventSlug]);

  const handleSelectEvent = (slug: string) => {
    setEventSlug(slug);
    loadEventData(slug);
    setActiveTab("builder");
  };

  const handleDuplicateEvent = async (originalSlug: string, originalConfig: EventConfig) => {
    const newTitle = prompt("Ingresa el título del nuevo evento:", `${originalConfig.title || "Evento"} (Copia)`);
    if (!newTitle) return;

    const baseSlug = newTitle.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const newSlug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;

    const duplicatedConfig: EventConfig = {
      title: newTitle,
      targetDate: originalConfig.targetDate || "2026-12-31",
      plan: originalConfig.plan || "plus",
      active: true,
      questions: JSON.parse(JSON.stringify(originalConfig.questions || questions)),
      responses: [],
    };

    try {
      const res = await fetch("/api/form-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_event",
          eventSlug: newSlug,
          eventConfig: duplicatedConfig,
        }),
      });

      if (res.ok) {
        setAllEvents((prev) => ({
          ...prev,
          [newSlug]: duplicatedConfig,
        }));
        alert(`¡Evento duplicado exitosamente como "/${newSlug}"!`);
        handleSelectEvent(newSlug);
      }
    } catch (e) {
      console.error(e);
      alert("Error al duplicar el evento.");
    }
  };

  const toggleEventStatus = async (slug: string, currentStatus: boolean) => {
    const updatedEvents = { ...allEvents };
    if (updatedEvents[slug]) {
      updatedEvents[slug].active = !currentStatus;
      setAllEvents(updatedEvents);
    }

    if (slug === eventSlug) {
      setActive(!currentStatus);
    }

    try {
      await fetch("/api/form-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_event",
          eventSlug: slug,
          eventConfig: { active: !currentStatus },
        }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollabName || !newCollabUsername || !newCollabPassword) return;

    const newCollab: Collaborator = {
      id: `u_${Date.now()}`,
      name: newCollabName,
      username: newCollabUsername.trim().toLowerCase(),
      password: newCollabPassword,
      role: newCollabRole,
      status: "activo"
    };

    setCollaborators([...collaborators, newCollab]);
    setNewCollabName("");
    setNewCollabUsername("");
    setNewCollabPassword("");
    alert(`¡Cliente "${newCollab.name}" registrado con el usuario "${newCollab.username}"!`);
  };

  const startEditingUser = (user: Collaborator) => {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditUsername(user.username);
    setEditPassword(user.password || "");
  };

  const saveUserEdit = (id: string) => {
    if (!editName.trim() || !editUsername.trim() || !editPassword.trim()) {
      alert("Los campos no pueden estar vacíos.");
      return;
    }

    setCollaborators(collaborators.map((c) => {
      if (c.id === id) {
        return { ...c, name: editName, username: editUsername.trim().toLowerCase(), password: editPassword };
      }
      return c;
    }));

    setEditingUserId(null);
  };

  const cancelUserEdit = () => {
    setEditingUserId(null);
  };

  const toggleCollaboratorStatus = (id: string) => {
    setCollaborators(collaborators.map((c) => {
      if (c.id === id) {
        if (c.role === "admin") {
          alert("No puedes desactivar la cuenta del Administrador principal.");
          return c;
        }
        const nextStatus = c.status === "activo" ? "inactivo" : "activo";
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const removeCollaborator = (id: string, name: string, role: string) => {
    if (role === "admin") {
      alert("No se puede eliminar al Administrador principal.");
      return;
    }
    if (confirm(`¿Estás seguro de que deseas eliminar a "${name}"?`)) {
      setCollaborators(collaborators.filter((c) => c.id !== id));
    }
  };

  const handleLogout = () => {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login";
      }
    }
  };

  const addQuestion = () => {
    const newQ: Question = {
      id: `q_${Date.now()}`,
      label: "Nueva Pregunta",
      type: "text",
    };
    setQuestions([...questions, newQ]);
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const configToSave = {
        title,
        targetDate,
        plan,
        active,
        questions,
        responses,
      };

      const res = await fetch("/api/form-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_event",
          eventSlug,
          eventConfig: configToSave,
        }),
      });

      if (res.ok) {
        setAllEvents((prev) => ({
          ...prev,
          [eventSlug]: configToSave,
        }));
        alert(`¡Configuración de "${title}" guardada exitosamente!`);
      } else {
        alert("Ocurrió un error al guardar.");
      }
    } catch (e) {
      console.error(e);
      alert("Error conectando con el servidor.");
    } finally {
      setSaving(false);
    }
  };

  const baseUrl = typeof window !== "undefined"
    ? `${window.location.origin}/${eventSlug}`
    : `https://invitation-engine-nine.vercel.app/${eventSlug}`;

  const currentUrlWithPases = `${baseUrl}?pases=${testPases}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-amber-500">
              Creador & Gestor de Invitaciones
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Administra tus eventos activos, diseña formularios y gestiona clientes
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab("list")}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "list"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              📂 Mis Eventos
            </button>
            <button
              onClick={() => setActiveTab("builder")}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "builder"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              🛠 Diseñador
            </button>
            <button
              onClick={() => setActiveTab("responses")}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "responses"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              📊 Respuestas ({responses.length})
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "users"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              👥 Colaboradores
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 transition-all ml-1 cursor-pointer"
            >
              🚪 Salir
            </button>
          </div>
        </div>

        {/* MIS EVENTOS */}
        {activeTab === "list" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <h2 className="text-sm font-bold text-amber-500 uppercase tracking-wider">
                Catálogo de Eventos Registrados
              </h2>
              <button
                onClick={() => {
                  const newSlug = `evento-${Date.now().toString().slice(-4)}`;
                  setEventSlug(newSlug);
                  setTitle("Nuevo Evento");
                  setTargetDate("2026-12-31");
                  setActive(true);
                  setActiveTab("builder");
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold px-3 py-2 rounded-xl transition-all"
              >
                + Crear Nuevo Evento
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(allEvents).map(([slug, item]) => (
                <div
                  key={slug}
                  className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4 hover:border-slate-700 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-bold text-white">{item.title || slug}</h3>
                      <p className="text-xs font-mono text-amber-400/80 mt-0.5">/{slug}</p>
                    </div>
                    
                    <button
                      onClick={() => toggleEventStatus(slug, item.active)}
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider transition-all ${
                        item.active
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {item.active ? "● Activo" : "○ Inactivo"}
                    </button>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1">
                    <p>📅 Fecha: <span className="text-slate-200">{item.targetDate || "Sin fecha"}</span></p>
                    <p>📦 Plan: <span className="text-slate-200 uppercase">{item.plan || "plus"}</span></p>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleSelectEvent(slug)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2 rounded-xl transition-all"
                    >
                      ⚙️ Editar
                    </button>
                    
                    <button
                      onClick={() => handleDuplicateEvent(slug, item)}
                      className="px-3 py-2 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-400 text-xs font-bold rounded-xl transition-all"
                    >
                      📋 Duplicar
                    </button>

                    <a
                      href={`/${slug}?pases=2`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold rounded-xl transition-all"
                    >
                      🔗 Ver Demo (2 pases)
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DISEÑADOR */}
        {activeTab === "builder" && (
          <>
            {/* Generador y Generador de Enlaces con Pases Dinámicos */}
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cliente / Slug:</span>
                <input
                  type="text"
                  value={eventSlug}
                  onChange={(e) => setEventSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  className="bg-slate-800 border border-slate-700 font-mono text-amber-400 font-bold text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Selector interactivo para probar links con pases */}
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
                <span className="text-xs font-bold text-slate-400">Pases en Link:</span>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={testPases}
                  onChange={(e) => setTestPases(parseInt(e.target.value, 10) || 1)}
                  className="w-12 bg-slate-900 border border-slate-700 text-amber-400 font-bold text-center text-xs py-1 rounded-md"
                />
                <span className="text-xs font-mono text-slate-400 truncate max-w-[180px]">
                  {currentUrlWithPases}
                </span>
                <button
                  onClick={() => copyToClipboard(currentUrlWithPases)}
                  className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-400 px-2.5 py-1 rounded-lg transition-all"
                >
                  {copied ? "¡Copiado! ✓" : "Copiar Link"}
                </button>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-amber-500 uppercase tracking-wider">
                  1. Ajustes del Evento
                </h2>
                
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <span className={active ? "text-emerald-400" : "text-red-400"}>
                    {active ? "Evento Activo" : "Evento Desactivado"}
                  </span>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="accent-amber-500 h-4 w-4 rounded"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Título del Evento / Cliente
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Fecha del Evento
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-amber-500 uppercase tracking-wider">
                  2. Preguntas Adicionales del Formulario
                </h2>
                <button
                  onClick={addQuestion}
                  className="bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                >
                  + Agregar Pregunta
                </button>
              </div>

              <div className="space-y-3">
                {questions.map((q, index) => (
                  <div
                    key={q.id}
                    className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">
                        Pregunta {index + 1}
                      </span>
                      {questions.length > 0 && (
                        <button
                          onClick={() => removeQuestion(q.id)}
                          className="text-xs font-bold text-red-400 hover:text-red-300"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Texto de la pregunta
                        </label>
                        <input
                          type="text"
                          value={q.label}
                          onChange={(e) => updateQuestion(q.id, "label", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Tipo de Campo
                        </label>
                        <select
                          value={q.type}
                          onChange={(e) => updateQuestion(q.id, "type", e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 focus:outline-none focus:border-amber-500"
                        >
                          <option value="text">Texto corto</option>
                          <option value="choice">Selección de Opciones</option>
                          <option value="number">Número</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm px-6 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all"
              >
                {saving ? "Guardando..." : "Guardar Configuración"}
              </button>
            </div>
          </>
        )}

        {/* RESPUESTAS */}
        {activeTab === "responses" && (
          <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold text-amber-500 uppercase tracking-wider">
              Confirmaciones Recibidas para /{eventSlug}
            </h2>

            {responses.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Aún no hay respuestas o confirmaciones registradas para este evento.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3 font-semibold">Fecha</th>
                      <th className="p-3 font-semibold">Pases Confirmados</th>
                      <th className="p-3 font-semibold">Asistentes</th>
                      <th className="p-3 font-semibold">Otros Datos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {responses.map((res, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="p-3 font-mono text-slate-500 text-[11px]">
                          {res.fechaRespuesta ? new Date(res.fechaRespuesta).toLocaleString() : "Reciente"}
                        </td>
                        <td className="p-3 font-bold text-amber-400">
                          {res.pasesConfirmados} de {res.pasesDisponibles || "N/A"}
                        </td>
                        <td className="p-3 text-slate-200">
                          {res.asistentes && Array.isArray(res.asistentes)
                            ? res.asistentes.join(", ")
                            : "N/A"}
                        </td>
                        <td className="p-3 font-mono text-slate-400 text-[11px]">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(res.preguntasAdicionales || {}, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* COLABORADORES */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h2 className="text-sm font-bold text-amber-500 uppercase tracking-wider">
                Registrar Nuevo Colaborador o Cliente
              </h2>

              <form onSubmit={handleAddCollaborator} className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={newCollabName}
                  onChange={(e) => setNewCollabName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:border-amber-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Usuario (ej. admin, boda)"
                  value={newCollabUsername}
                  onChange={(e) => setNewCollabUsername(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:border-amber-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Contraseña"
                  value={newCollabPassword}
                  onChange={(e) => setNewCollabPassword(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:border-amber-500"
                  required
                />
                <select
                  value={newCollabRole}
                  onChange={(e) => setNewCollabRole(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="client">Cliente (Acceso a evento)</option>
                  <option value="collaborator">Colaborador (Soporte)</option>
                </select>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold px-4 py-2 rounded-xl transition-all"
                >
                  + Dar Acceso
                </button>
              </form>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h2 className="text-sm font-bold text-amber-500 uppercase tracking-wider">
                Usuarios Registrados en la Plataforma
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3 font-semibold">Nombre</th>
                      <th className="p-3 font-semibold">Usuario</th>
                      <th className="p-3 font-semibold">Contraseña</th>
                      <th className="p-3 font-semibold">Rol</th>
                      <th className="p-3 font-semibold">Estado</th>
                      <th className="p-3 font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {collaborators.map((c) => {
                      const isEditing = editingUserId === c.id;

                      return (
                        <tr key={c.id} className="hover:bg-slate-800/30 transition-all">
                          <td className="p-3">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="bg-slate-950 border border-amber-500 rounded-lg px-2.5 py-1 text-xs font-bold text-white w-full focus:outline-none"
                              />
                            ) : (
                              <span className="font-bold text-white">{c.name}</span>
                            )}
                          </td>

                          <td className="p-3">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editUsername}
                                onChange={(e) => setEditUsername(e.target.value)}
                                className="bg-slate-950 border border-amber-500 rounded-lg px-2.5 py-1 text-xs font-mono text-amber-400 w-full focus:outline-none"
                              />
                            ) : (
                              <span className="font-mono text-amber-400 font-bold">{c.username}</span>
                            )}
                          </td>

                          <td className="p-3">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editPassword}
                                onChange={(e) => setEditPassword(e.target.value)}
                                className="bg-slate-950 border border-amber-500 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-200 w-full focus:outline-none"
                              />
                            ) : (
                              <span className="font-mono text-slate-400">{c.password || "••••••"}</span>
                            )}
                          </td>

                          <td className="p-3 uppercase font-extrabold text-[10px]">
                            <span className={`px-2 py-0.5 rounded-md ${
                              c.role === "admin" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"
                            }`}>
                              {c.role === "admin" ? "Administrador" : c.role === "client" ? "Cliente" : "Colaborador"}
                            </span>
                          </td>

                          <td className="p-3">
                            <button
                              onClick={() => toggleCollaboratorStatus(c.id)}
                              className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider transition-all cursor-pointer ${
                                c.status === "activo"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                                  : "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                              }`}
                            >
                              {c.status === "activo" ? "● Activo" : "○ Inactivo"}
                            </button>
                          </td>

                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => saveUserEdit(c.id)}
                                    className="bg-emerald-500 text-slate-950 font-bold text-[11px] px-2.5 py-1 rounded-lg hover:bg-emerald-400 transition-all"
                                  >
                                    Guardar
                                  </button>
                                  <button
                                    onClick={cancelUserEdit}
                                    className="bg-slate-800 text-slate-300 font-bold text-[11px] px-2 py-1 rounded-lg hover:bg-slate-700 transition-all"
                                  >
                                    Cancelar
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startEditingUser(c)}
                                    className="text-amber-400 hover:text-amber-300 font-bold text-[11px] bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded-lg transition-all"
                                  >
                                    ✏ Editar
                                  </button>

                                  {c.role !== "admin" && (
                                    <button
                                      onClick={() => removeCollaborator(c.id, c.name, c.role)}
                                      className="text-red-400 hover:text-red-300 font-bold text-[11px] bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded-lg transition-all"
                                    >
                                      Eliminar
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}