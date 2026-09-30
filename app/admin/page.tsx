"use client";

import { useState, useEffect } from "react";

// Tipos de campo expandidos estilo Tally
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
  >("disenador");

  const [eventos, setEventos] = useState<EventItem[]>([
    {
      id: "1",
      slug: "demo",
      title: "Boda María & Alejandro",
      targetDate: "2026-10-15",
      plan: "PLUS",
      active: true,
      whatsappPhone: "5218112345678",
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

  // Modal / Formulario Eventos
  const [mostrarModalEvento, setMostrarModalEvento] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalSlug, setModalSlug] = useState("");
  const [slugEditadoManualmente, setSlugEditadoManualmente] = useState(false);
  const [modalDate, setModalDate] = useState("");
  const [modalPlan, setModalPlan] = useState("PLUS");
  const [modalWhatsapp, setModalWhatsapp] = useState("");
  const [modalActive, setModalActive] = useState(true);
  const [editandoEventoId, setEditandoEventoId] = useState<string | null>(null);

  // ESTADOS DEL DISEÑADOR (NUEVO CAMPO)
  const [nuevaPreguntaLabel, setNuevaPreguntaLabel] = useState("");
  const [nuevaPreguntaTipo, setNuevaPreguntaTipo] = useState<QuestionType>("text");
  const [nuevaPreguntaOpciones, setNuevaPreguntaOpciones] = useState("");
  const [nuevaPreguntaRequerida, setNuevaPreguntaRequerida] = useState(false);

  // USUARIOS & RESPUESTAS
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

  // Manejador del Título & Slug
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
        questions: [],
      };
      setEventos([...eventos, nuevo]);
      setEventoSeleccionadoId(nuevo.id);
    }
    setMostrarModalEvento(false);
  };

  // FUNCIONES DEL DISEÑADOR
  const handleAgregarPregunta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaPreguntaLabel || !eventoActual) return;

    const nuevaQ: Question = {
      id: Date.now().toString(),
      label: nuevaPreguntaLabel,
      type: nuevaPreguntaTipo,
      options:
        ["choice", "checkbox"].includes(nuevaPreguntaTipo)
          ? nuevaPreguntaOpciones.split(",").map((o) => o.trim()).filter(Boolean)
          : undefined,
      required: nuevaPreguntaRequerida,
    };

    const actualizados = eventos.map((ev) =>
      ev.id === eventoActual.id
        ? { ...ev, questions: [...ev.questions, nuevaQ] }
        : ev
    );

    setEventos(actualizados);
    setNuevaPreguntaLabel("");
    setNuevaPreguntaOpciones("");
    setNuevaPreguntaRequerida(false);
  };

  // Edición directa de cualquier propiedad de una pregunta existente
  const handleUpdatePregunta = (
    qId: string,
    field: keyof Question,
    value: any
  ) => {
    if (!eventoActual) return;
    const actualizados = eventos.map((ev) => {
      if (ev.id !== eventoActual.id) return ev;
      return {
        ...ev,
        questions: ev.questions.map((q) => {
          if (q.id !== qId) return q;
          return { ...q, [field]: value };
        }),
      };
    });
    setEventos(actualizados);
  };

  const handleEliminarPregunta = (qId: string) => {
    if (!eventoActual) return;
    const actualizados = eventos.map((ev) =>
      ev.id === eventoActual.id
        ? { ...ev, questions: ev.questions.filter((q) => q.id !== qId) }
        : ev
    );
    setEventos(actualizados);
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
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                tabActiva === "eventos"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
              }`}
            >
              📁 Mis Eventos
            </button>

            <button
              onClick={() => setTabActiva("disenador")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                tabActiva === "disenador"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
              }`}
            >
              🛠️ Diseñador Tally
            </button>

            <button
              onClick={() => setTabActiva("respuestas")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                tabActiva === "respuestas"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
              }`}
            >
              📊 Respuestas ({respuestas.length})
            </button>

            <button
              onClick={() => setTabActiva("colaboradores")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                tabActiva === "colaboradores"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
              }`}
            >
              👥 Colaboradores
            </button>
          </div>
        </div>

        {/* PESTAÑA: DISEÑADOR ESTILO TALLY */}
        {tabActiva === "disenador" && (
          <div className="bg-[#121c33] border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xs font-black text-amber-500 uppercase tracking-wider flex items-center gap-2">
                  <span>🛠️</span> CONSTRUCTOR DE FORMULARIO INTERACTIVO
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

            {/* CREAR NUEVO CAMPO */}
            <form onSubmit={handleAgregarPregunta} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>➕</span> Agregar Nuevo Campo al Formulario
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-7">
                  <input
                    type="text"
                    placeholder="Título o Pregunta (ej. ¿Número de acompañantes o menú preferencia?)"
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
                  <span>Campo obligatorio</span>
                </label>

                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  + Insertar Campo
                </button>
              </div>
            </form>

            {/* LISTADO Y EDICIÓN EN TIEMPO REAL */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Campos Activos ({eventoActual?.questions?.length || 0})
                </h3>
                <span className="text-[11px] text-slate-500">
                  Puedes modificar los títulos, tipos y opciones directamente abajo.
                </span>
              </div>

              {(!eventoActual?.questions || eventoActual.questions.length === 0) ? (
                <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-500">
                    No has añadido preguntas personalizadas a este evento aún.
                  </p>
                </div>
              ) : (
                eventoActual.questions.map((q, index) => (
                  <div
                    key={q.id}
                    className="bg-slate-950 p-4 md:p-5 rounded-2xl border border-slate-800/90 hover:border-slate-700 transition-all space-y-3"
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
                      {/* Editar Título */}
                      <div className="md:col-span-7">
                        <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1">
                          Título del campo
                        </label>
                        <input
                          type="text"
                          value={q.label}
                          onChange={(e) =>
                            handleUpdatePregunta(q.id, "label", e.target.value)
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Editar Tipo de Campo en todo momento */}
                      <div className="md:col-span-5">
                        <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1">
                          Tipo de entrada
                        </label>
                        <select
                          value={q.type}
                          onChange={(e) =>
                            handleUpdatePregunta(q.id, "type", e.target.value as QuestionType)
                          }
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

                    {/* Editar Opciones si aplica */}
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
                          placeholder="Opción 1, Opción 2, Opción 3"
                        />
                      </div>
                    )}

                    {/* Checkbox Obligatorio */}
                    <div className="pt-1 flex items-center justify-between text-xs">
                      <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) =>
                            handleUpdatePregunta(q.id, "required", e.target.checked)
                          }
                          className="w-4 h-4 accent-amber-500 rounded"
                        />
                        <span>Obligatorio responder</span>
                      </label>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}