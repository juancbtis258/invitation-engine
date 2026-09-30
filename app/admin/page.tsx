"use client";

import { useState, useEffect } from "react";

export type QuestionType =
  | "text"
  | "paragraph"
  | "number"
  | "fraction"
  | "choice"
  | "checkbox"
  | "boolean"
  | "date"
  | "email_phone";

export interface Question {
  id: string;
  label: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
  placeholder?: string;
}

interface EventItem {
  id: string;
  slug: string;
  title: string;
  targetDate: string;
  plan: string;
  active: boolean;
  whatsappPhone: string;
  pasesAsignados?: number; // Configuración de Pases
  questions: Question[];
}

interface UserItem {
  id: string;
  nombre: string;
  correo: string;
  rol: "ADMINISTRADOR" | "CLIENTE";
  activo: boolean;
}

function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "-and-")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const TIPO_LABELS: Record<QuestionType, { name: string; icon: string }> = {
  text: { name: "Texto corto", icon: "📝" },
  paragraph: { name: "Texto largo (Párrafo)", icon: "📜" },
  number: { name: "Número entero", icon: "🔢" },
  fraction: { name: "Fracción / Decimal", icon: "➗" },
  choice: { name: "Opción única (Radio)", icon: "🔘" },
  checkbox: { name: "Casillas (Múltiples)", icon: "☑️" },
  boolean: { name: "Sí / No", icon: "👍" },
  date: { name: "Fecha / Hora", icon: "📅" },
  email_phone: { name: "Correo / Teléfono", icon: "📧" },
};

export default function AdminDashboardPage() {
  const [tabActiva, setTabActiva] = useState<
    "eventos" | "disenador" | "respuestas" | "colaboradores"
  >("eventos");

  const [copiadoSlug, setCopiadoSlug] = useState<string | null>(null);

  const [eventos, setEventos] = useState<EventItem[]>([
    {
      id: "1",
      slug: "demo",
      title: "Boda María & Alejandro",
      targetDate: "2026-10-15",
      plan: "PLUS",
      active: true,
      whatsappPhone: "5218112345678",
      pasesAsignados: 2,
      questions: [
        {
          id: "q1",
          label: "¿Tienes alguna restricción alimenticia?",
          type: "text",
          required: false,
          placeholder: "Ej. Vegano, alergia a nueces...",
        },
        {
          id: "q2",
          label: "¿Cuántos pases de niños necesitas?",
          type: "number",
          required: false,
        },
      ],
    },
  ]);

  const [eventoSeleccionadoId, setEventoSeleccionadoId] = useState<string>("1");

  // Modal Eventos
  const [mostrarModalEvento, setMostrarModalEvento] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalSlug, setModalSlug] = useState("");
  const [slugEditadoManualmente, setSlugEditadoManualmente] = useState(false);
  const [modalDate, setModalDate] = useState("");
  const [modalPlan, setModalPlan] = useState("PLUS");
  const [modalWhatsapp, setModalWhatsapp] = useState("");
  const [modalPases, setModalPases] = useState<number>(2);
  const [modalActive, setModalActive] = useState(true);
  const [editandoEventoId, setEditandoEventoId] = useState<string | null>(null);

  // Campos Diseñador
  const [nuevaPreguntaLabel, setNuevaPreguntaLabel] = useState("");
  const [nuevaPreguntaTipo, setNuevaPreguntaTipo] = useState<QuestionType>("text");
  const [nuevaPreguntaOpciones, setNuevaPreguntaOpciones] = useState("");
  const [nuevaPreguntaRequerida, setNuevaPreguntaRequerida] = useState(false);

  // Colaboradores & Respuestas
  const [usuarios, setUsuarios] = useState<UserItem[]>([
    {
      id: "u1",
      nombre: "Alejandro Mejía",
      correo: "admin@mi-invitacion.com",
      rol: "ADMINISTRADOR",
      activo: true,
    },
  ]);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoCorreo, setNuevoCorreo] = useState("");
  const [nuevoRol, setNuevoRol] = useState<"ADMINISTRADOR" | "CLIENTE">("CLIENTE");
  const [usuarioEditandoId, setUsuarioEditandoId] = useState<string | null>(null);
  const [respuestas, setRespuestas] = useState<any[]>([]);

  const eventoActual = eventos.find((e) => e.id === eventoSeleccionadoId) || eventos[0];

  useEffect(() => {
    if (!eventoActual) return;
    fetch(`/api/form-config?event=${eventoActual.slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data?.responses) {
          setRespuestas(data.data.responses);
        }
      })
      .catch((err) => console.error(err));
  }, [eventoSeleccionadoId, eventoActual?.slug]);

  const handleTitleChange = (val: string) => {
    setModalTitle(val);
    if (!slugEditadoManualmente) {
      setModalSlug(generateSlug(val));
    }
  };

  const abrirModalCrear = () => {
    setEditandoEventoId(null);
    setModalTitle("");
    setModalSlug("");
    setSlugEditadoManualmente(false);
    setModalDate("");
    setModalPlan("PLUS");
    setModalWhatsapp("");
    setModalPases(2);
    setModalActive(true);
    setMostrarModalEvento(true);
  };

  const abrirModalEditar = (ev: EventItem) => {
    setEditandoEventoId(ev.id);
    setModalTitle(ev.title);
    setModalSlug(ev.slug);
    setSlugEditadoManualmente(true);
    setModalDate(ev.targetDate);
    setModalPlan(ev.plan);
    setModalWhatsapp(ev.whatsappPhone || "");
    setModalPases(ev.pasesAsignados || 2);
    setModalActive(ev.active);
    setMostrarModalEvento(true);
  };

  const handleGuardarEvento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle || !modalSlug) return;

    if (editandoEventoId) {
      setEventos(
        eventos.map((ev) =>
          ev.id === editandoEventoId
            ? {
                ...ev,
                title: modalTitle,
                slug: modalSlug,
                targetDate: modalDate,
                plan: modalPlan,
                whatsappPhone: modalWhatsapp,
                pasesAsignados: Number(modalPases),
                active: modalActive,
              }
            : ev
        )
      );
    } else {
      const nuevo: EventItem = {
        id: Date.now().toString(),
        slug: modalSlug,
        title: modalTitle,
        targetDate: modalDate,
        plan: modalPlan,
        active: modalActive,
        whatsappPhone: modalWhatsapp,
        pasesAsignados: Number(modalPases),
        questions: [],
      };
      setEventos([...eventos, nuevo]);
      setEventoSeleccionadoId(nuevo.id);
    }
    setMostrarModalEvento(false);
  };

  const handleEliminarEvento = (id: string) => {
    const filtrados = eventos.filter((e) => e.id !== id);
    setEventos(filtrados);
    if (eventoSeleccionadoId === id && filtrados.length > 0) {
      setEventoSeleccionadoId(filtrados[0].id);
    }
  };

  const copiarLinkEvento = (slug: string) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiadoSlug(slug);
    setTimeout(() => setCopiadoSlug(null), 2500);
  };

  // Diseñador
  const handleAgregarPregunta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaPreguntaLabel || !eventoActual) return;

    const nuevaQ: Question = {
      id: Date.now().toString(),
      label: nuevaPreguntaLabel,
      type: nuevaPreguntaTipo,
      options: ["choice", "checkbox"].includes(nuevaPreguntaTipo)
        ? nuevaPreguntaOpciones.split(",").map((o) => o.trim()).filter(Boolean)
        : undefined,
      required: nuevaPreguntaRequerida,
    };

    setEventos(
      eventos.map((ev) =>
        ev.id === eventoActual.id
          ? { ...ev, questions: [...ev.questions, nuevaQ] }
          : ev
      )
    );
    setNuevaPreguntaLabel("");
    setNuevaPreguntaOpciones("");
    setNuevaPreguntaRequerida(false);
  };

  const handleUpdatePregunta = (qId: string, field: keyof Question, value: any) => {
    if (!eventoActual) return;
    setEventos(
      eventos.map((ev) => {
        if (ev.id !== eventoActual.id) return ev;
        return {
          ...ev,
          questions: ev.questions.map((q) => (q.id === qId ? { ...q, [field]: value } : q)),
        };
      })
    );
  };

  const handleEliminarPregunta = (qId: string) => {
    if (!eventoActual) return;
    setEventos(
      eventos.map((ev) =>
        ev.id === eventoActual.id
          ? { ...ev, questions: ev.questions.filter((q) => q.id !== qId) }
          : ev
      )
    );
  };

  // Colaboradores
  const handleGuardarUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre || !nuevoCorreo) return;

    if (usuarioEditandoId) {
      setUsuarios(
        usuarios.map((u) =>
          u.id === usuarioEditandoId
            ? { ...u, nombre: nuevoNombre, correo: nuevoCorreo, rol: nuevoRol }
            : u
        )
      );
      setUsuarioEditandoId(null);
    } else {
      setUsuarios([
        ...usuarios,
        {
          id: Date.now().toString(),
          nombre: nuevoNombre,
          correo: nuevoCorreo,
          rol: nuevoRol,
          activo: true,
        },
      ]);
    }
    setNuevoNombre("");
    setNuevoCorreo("");
    setNuevoRol("CLIENTE");
  };

  const handleEditarUsuario = (u: UserItem) => {
    setUsuarioEditandoId(u.id);
    setNuevoNombre(u.nombre);
    setNuevoCorreo(u.correo);
    setNuevoRol(u.rol);
  };

  const handleEliminarUsuario = (id: string) => {
    setUsuarios(usuarios.filter((u) => u.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0d1527] text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-amber-500 tracking-tight">
              Creador & Gestor de Invitaciones
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Administra tus eventos activos, diseña formularios y gestiona clientes
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <button
              onClick={() => setTabActiva("eventos")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tabActiva === "eventos"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
              }`}
            >
              📁 Mis Eventos
            </button>

            <button
              onClick={() => setTabActiva("disenador")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tabActiva === "disenador"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
              }`}
            >
              🛠️️ Diseñador
            </button>

            <button
              onClick={() => setTabActiva("respuestas")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tabActiva === "respuestas"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
              }`}
            >
              📊 Respuestas ({respuestas.length})
            </button>

            <button
              onClick={() => setTabActiva("colaboradores")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tabActiva === "colaboradores"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
              }`}
            >
              👥 Colaboradores
            </button>
          </div>
        </div>

        {/* PESTAÑA 1: MIS EVENTOS */}
        {tabActiva === "eventos" && (
          <div className="bg-[#121c33] border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xs font-black text-amber-500 uppercase tracking-wider">
                  📁 GESTIÓN DE EVENTOS
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Crea, edita y administra los eventos creados en el sistema.
                </p>
              </div>
              <button
                onClick={abrirModalCrear}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                + Crear Nuevo Evento
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventos.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-sm font-bold text-slate-100">{ev.title}</h3>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          ev.active
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {ev.active ? "ACTIVO" : "INACTIVO"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs font-mono text-amber-400">/{ev.slug}</p>
                      
                      {/* BOTÓN COMPARTIR LINK RÁPIDO */}
                      <button
                        onClick={() => copiarLinkEvento(ev.slug)}
                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                        title="Copiar enlace de invitación"
                      >
                        {copiadoSlug === ev.slug ? "¡Copiado! 🚀" : "🔗 Compartir Link"}
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-3 space-y-1">
                      <p>📅 Fecha: {ev.targetDate || "Sin fecha"}</p>
                      <p>💎 Plan: {ev.plan}</p>
                      <p>🎫 Pases Asignados: <span className="text-slate-200 font-bold">{ev.pasesAsignados ?? 2} pases</span></p>
                      <p>📱 WhatsApp: {ev.whatsappPhone || "No asignado"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-900">
                    <button
                      onClick={() => abrirModalEditar(ev)}
                      className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleEliminarEvento(ev.id)}
                      className="text-xs bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/50 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA 2: DISEÑADOR TALLY */}
        {tabActiva === "disenador" && (
          <div className="bg-[#121c33] border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xs font-black text-amber-500 uppercase tracking-wider flex items-center gap-2">
                  <span>🛠️</span> DISEÑADOR DE PREGUNTAS Y CAMPOS DEL FORMULARIO
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Evento actual: <span className="text-amber-400 font-bold">{eventoActual?.title}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Evento:</span>
                <select
                  value={eventoSeleccionadoId}
                  onChange={(e) => setEventoSeleccionadoId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-amber-400 font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                >
                  {eventos.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({ev.slug})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* FORMULARIO AGREGAR */}
            <form onSubmit={handleAgregarPregunta} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>➕</span> AGREGAR NUEVA PREGUNTA
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-7">
                  <input
                    type="text"
                    placeholder="Ej. ¿Alergias o requerimiento de menú especial?"
                    value={nuevaPreguntaLabel}
                    onChange={(e) => setNuevaPreguntaLabel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="md:col-span-5">
                  <select
                    value={nuevaPreguntaTipo}
                    onChange={(e) => setNuevaPreguntaTipo(e.target.value as QuestionType)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-400 font-medium focus:outline-none focus:border-amber-500"
                  >
                    {Object.entries(TIPO_LABELS).map(([key, item]) => (
                      <option key={key} value={key}>
                        {item.icon} {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {["choice", "checkbox"].includes(nuevaPreguntaTipo) && (
                <div>
                  <input
                    type="text"
                    placeholder="Opciones separadas por coma (ej. Opción A, Opción B, Opción C)"
                    value={nuevaPreguntaOpciones}
                    onChange={(e) => setNuevaPreguntaOpciones(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={nuevaPreguntaRequerida}
                    onChange={(e) => setNuevaPreguntaRequerida(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <span>Obligatoria</span>
                </label>

                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  + Agregar Campo
                </button>
              </div>
            </form>

            {/* LISTA Y EDICIÓN EN VIVO */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                CAMPOS ACTIVOS EN LA INVITACIÓN ({eventoActual?.questions?.length || 0})
              </h3>

              {(!eventoActual?.questions || eventoActual.questions.length === 0) ? (
                <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-500">
                    No has añadido preguntas personalizadas a esta invitación.
                  </p>
                </div>
              ) : (
                eventoActual.questions.map((q, index) => (
                  <div
                    key={q.id}
                    className="bg-slate-950 p-4 md:p-5 rounded-2xl border border-slate-800/90 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-900 pb-3">
                      <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                        Campo #{index + 1}
                      </span>
                      <button
                        onClick={() => handleEliminarPregunta(q.id)}
                        className="text-rose-400 hover:text-rose-300 font-bold text-xs px-3 py-1 rounded-lg bg-rose-950/40 border border-rose-900/50 hover:bg-rose-900/60 transition-all cursor-pointer"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      <div className="md:col-span-7">
                        <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1">
                          Pregunta / Título
                        </label>
                        <input
                          type="text"
                          value={q.label}
                          onChange={(e) => handleUpdatePregunta(q.id, "label", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="md:col-span-5">
                        <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1">
                          Tipo de campo
                        </label>
                        <select
                          value={q.type}
                          onChange={(e) => handleUpdatePregunta(q.id, "type", e.target.value as QuestionType)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                        >
                          {Object.entries(TIPO_LABELS).map(([key, item]) => (
                            <option key={key} value={key}>
                              {item.icon} {item.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {["choice", "checkbox"].includes(q.type) && (
                      <div>
                        <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1">
                          Opciones (separadas por coma)
                        </label>
                        <input
                          type="text"
                          value={q.options ? q.options.join(", ") : ""}
                          onChange={(e) =>
                            handleUpdatePregunta(
                              q.id,
                              "options",
                              e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                            )
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    )}

                    <div className="pt-1 flex items-center justify-between text-xs">
                      <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) => handleUpdatePregunta(q.id, "required", e.target.checked)}
                          className="w-4 h-4 accent-amber-500 rounded"
                        />
                        <span>Campo obligatorio</span>
                      </label>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA 3: RESPUESTAS */}
        {tabActiva === "respuestas" && (
          <div className="bg-[#121c33] border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xs font-black text-amber-500 uppercase tracking-wider">
                  📊 RESPUESTAS REGISTRADAS
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Respuestas recibidas para: <span className="text-amber-400 font-bold">{eventoActual?.title}</span>
                </p>
              </div>

              <select
                value={eventoSeleccionadoId}
                onChange={(e) => setEventoSeleccionadoId(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-amber-400 font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
              >
                {eventos.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.slug})
                  </option>
                ))}
              </select>
            </div>

            {respuestas.length === 0 ? (
              <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-500">
                  No hay respuestas registradas aún para este evento.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold">
                      <th className="p-3">#</th>
                      <th className="p-3">Invitado</th>
                      <th className="p-3">Asistirá</th>
                      <th className="p-3">Respuestas Formulario</th>
                      <th className="p-3">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {respuestas.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="p-3 text-slate-500 font-mono">{idx + 1}</td>
                        <td className="p-3 font-semibold text-slate-200">{r.name || "Anónimo"}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.attending
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {r.attending ? "SÍ" : "NO"}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">
                          <pre className="text-[11px] font-mono whitespace-pre-wrap">
                            {JSON.stringify(r.customAnswers || {}, null, 2)}
                          </pre>
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
        )}

        {/* PESTAÑA 4: COLABORADORES */}
        {tabActiva === "colaboradores" && (
          <div className="bg-[#121c33] border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xs font-black text-amber-500 uppercase tracking-wider">
                👥 ADMINISTRACIÓN DE COLABORADORES Y CLIENTES
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Añade o gestiona los accesos de administradores y clientes.
              </p>
            </div>

            <form onSubmit={handleGuardarUsuario} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {usuarioEditandoId ? "✏️ Editar Colaborador" : "➕ Registrar Nuevo Colaborador"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  required
                />
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={nuevoCorreo}
                  onChange={(e) => setNuevoCorreo(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  required
                />
                <select
                  value={nuevoRol}
                  onChange={(e) => setNuevoRol(e.target.value as "ADMINISTRADOR" | "CLIENTE")}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="CLIENTE">CLIENTE</option>
                  <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                </select>
              </div>

              <div className="flex justify-end gap-2">
                {usuarioEditandoId && (
                  <button
                    type="button"
                    onClick={() => {
                      setUsuarioEditandoId(null);
                      setNuevoNombre("");
                      setNuevoCorreo("");
                    }}
                    className="bg-slate-800 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-6 py-2 rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  {usuarioEditandoId ? "Actualizar Usuario" : "+ Guardar Colaborador"}
                </button>
              </div>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold">
                    <th className="p-3">Nombre</th>
                    <th className="p-3">Correo</th>
                    <th className="p-3">Rol</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {usuarios.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/40">
                      <td className="p-3 font-semibold text-slate-100">{u.nombre}</td>
                      <td className="p-3 text-slate-400">{u.correo}</td>
                      <td className="p-3 font-bold text-amber-400">{u.rol}</td>
                      <td className="p-3">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          ACTIVO
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleEditarUsuario(u)}
                          className="bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleEliminarUsuario(u.id)}
                          className="bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 border border-rose-900/50 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                        >
                          🗑️ Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* MODAL CREAR / EDITAR EVENTO */}
      {mostrarModalEvento && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#121c33] border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-amber-500 uppercase tracking-wider">
              {editandoEventoId ? "✏️ Editar Evento" : "➕ Crear Nuevo Evento"}
            </h3>

            <form onSubmit={handleGuardarEvento} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Nombre del Evento</label>
                <input
                  type="text"
                  value={modalTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Slug URL (ej. boda-maria)</label>
                <input
                  type="text"
                  value={modalSlug}
                  onChange={(e) => {
                    setModalSlug(e.target.value);
                    setSlugEditadoManualmente(true);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Fecha del Evento</label>
                  <input
                    type="date"
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Plan</label>
                  <select
                    value={modalPlan}
                    onChange={(e) => setModalPlan(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="BASICO">BASICO</option>
                    <option value="PLUS">PLUS</option>
                    <option value="PREMIUM">PREMIUM</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Pases Asignados (Boletos)</label>
                  <input
                    type="number"
                    min="1"
                    value={modalPases}
                    onChange={(e) => setModalPases(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">WhatsApp Notificaciones</label>
                  <input
                    type="text"
                    placeholder="5218112345678"
                    value={modalWhatsapp}
                    onChange={(e) => setModalWhatsapp(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalActive}
                    onChange={(e) => setModalActive(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <span>Evento activo</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMostrarModalEvento(false)}
                    className="bg-slate-800 text-slate-300 font-bold px-4 py-2 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-5 py-2 rounded-xl transition-all"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}