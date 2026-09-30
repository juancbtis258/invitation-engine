"use client";

import { useState, useEffect } from "react";

interface Question {
  id: string;
  label: string;
  type: "text" | "choice" | "boolean";
  options?: string[];
  required: boolean;
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

export default function AdminDashboardPage() {
  // Navegación por pestañas
  const [tabActiva, setTabActiva] = useState<
    "eventos" | "disenador" | "respuestas" | "colaboradores"
  >("colaboradores");

  // LISTA DE EVENTOS (Catálogo)
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
        },
      ],
    },
  ]);

  const [eventoSeleccionadoId, setEventoSeleccionadoId] = useState<string>("1");

  // Modal / Formulario para Crear / Editar Evento
  const [mostrarModalEvento, setMostrarModalEvento] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalSlug, setModalSlug] = useState("");
  const [modalDate, setModalDate] = useState("");
  const [modalPlan, setModalPlan] = useState("PLUS");
  const [modalWhatsapp, setModalWhatsapp] = useState("");
  const [modalActive, setModalActive] = useState(true);
  const [editandoEventoId, setEditandoEventoId] = useState<string | null>(null);

  // DISEÑADOR DE PREGUNTAS DINÁMICAS
  const [nuevaPreguntaLabel, setNuevaPreguntaLabel] = useState("");
  const [nuevaPreguntaTipo, setNuevaPreguntaTipo] = useState<
    "text" | "choice" | "boolean"
  >("text");
  const [nuevaPreguntaOpciones, setNuevaPreguntaOpciones] = useState("");
  const [nuevaPreguntaRequerida, setNuevaPreguntaRequerida] = useState(false);

  // USUARIOS / COLABORADORES (RÉPLICA EXACTA DE LA IMAGEN)
  const [usuarios, setUsuarios] = useState<UserItem[]>([
    {
      id: "u1",
      nombre: "Alejandro Mejía (Tú)",
      correo: "admin@mi-invitacion.com",
      rol: "ADMINISTRADOR",
      activo: true,
    },
    {
      id: "u2",
      nombre: "Cliente Demo",
      correo: "cliente@bodamaria.com",
      rol: "CLIENTE",
      activo: true,
    },
  ]);

  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoCorreo, setNuevoCorreo] = useState("");
  const [nuevoRol, setNuevoRol] = useState<"ADMINISTRADOR" | "CLIENTE">("CLIENTE");
  const [usuarioEditandoId, setUsuarioEditandoId] = useState<string | null>(null);

  // RESPUESTAS RECIBIDAS
  const [respuestas, setRespuestas] = useState<any[]>([]);

  const eventoActual = eventos.find((e) => e.id === eventoSeleccionadoId) || eventos[0];

  // Cargar datos de API al seleccionar evento
  useEffect(() => {
    if (!eventoActual) return;
    fetch(`/api/form-config?event=${eventoActual.slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data && data.data.responses) {
          setRespuestas(data.data.responses);
        }
      })
      .catch((err) => console.error("Error al sincronizar respuestas:", err));
  }, [eventoSeleccionadoId, eventoActual?.slug]);

  // --- GESTIÓN DE EVENTOS ---
  const abrirModalCrear = () => {
    setEditandoEventoId(null);
    setModalTitle("");
    setModalSlug("");
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

  const handleDuplicarEvento = (ev: EventItem) => {
    const duplicado: EventItem = {
      ...ev,
      id: Date.now().toString(),
      slug: `${ev.slug}-copia`,
      title: `${ev.title} (Copia)`,
    };
    setEventos([...eventos, duplicado]);
  };

  // --- GESTIÓN DE PREGUNTAS EN EL DISEÑADOR ---
  const handleAgregarPregunta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaPreguntaLabel || !eventoActual) return;

    const nuevaQ: Question = {
      id: Date.now().toString(),
      label: nuevaPreguntaLabel,
      type: nuevaPreguntaTipo,
      options:
        nuevaPreguntaTipo === "choice"
          ? nuevaPreguntaOpciones.split(",").map((o) => o.trim())
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

  const handleEliminarPregunta = (qId: string) => {
    if (!eventoActual) return;
    const actualizados = eventos.map((ev) =>
      ev.id === eventoActual.id
        ? { ...ev, questions: ev.questions.filter((q) => q.id !== qId) }
        : ev
    );
    setEventos(actualizados);
  };

  // --- GESTIÓN DE USUARIOS / COLABORADORES ---
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
      const nuevoU: UserItem = {
        id: Date.now().toString(),
        nombre: nuevoNombre,
        correo: nuevoCorreo,
        rol: nuevoRol,
        activo: true,
      };
      setUsuarios([...usuarios, nuevoU]);
    }

    setNuevoNombre("");
    setNuevoCorreo("");
  };

  const handleEditarUsuario = (u: UserItem) => {
    setUsuarioEditandoId(u.id);
    setNuevoNombre(u.nombre);
    setNuevoCorreo(u.correo);
    setNuevoRol(u.rol);
  };

  const handleEliminarUsuario = (uId: string) => {
    setUsuarios(usuarios.filter((u) => u.id !== uId));
  };

  return (
    <div className="min-h-screen bg-[#0d1527] text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER Y PESTAÑAS */}
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
              🛠️ Diseñador
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

            <button
              onClick={() => (window.location.href = "/")}
              className="px-4 py-2 bg-rose-950/40 border border-rose-900/50 text-rose-400 hover:bg-rose-900/50 rounded-xl text-xs font-bold transition-all"
            >
              🚪 Salir
            </button>
          </div>
        </div>

        {/* PESTAÑA 1: MIS EVENTOS */}
        {tabActiva === "eventos" && (
          <div className="space-y-6">
            <div className="bg-[#121c33] border border-slate-800/80 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <h2 className="text-xs font-black text-amber-500 uppercase tracking-wider">
                CATÁLOGO DE EVENTOS REGISTRADOS
              </h2>

              <button
                onClick={abrirModalCrear}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                + Crear Nuevo Evento
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {eventos.map((ev) => (
                <div
                  key={ev.id}
                  className={`bg-[#121c33] border ${
                    eventoSeleccionadoId === ev.id
                      ? "border-amber-500/60 ring-1 ring-amber-500/30"
                      : "border-slate-800/80"
                  } rounded-2xl p-6 space-y-4 shadow-xl transition-all`}
                >
                  <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-3">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-100">{ev.title}</h3>
                      <p className="text-xs text-amber-500/80 font-mono mt-0.5">/{ev.slug}</p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider ${
                        ev.active
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      • {ev.active ? "ACTIVO" : "INACTIVO"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <div>📅 Fecha: <span className="text-slate-200 font-semibold">{ev.targetDate || "Sin fecha"}</span></div>
                    <div>📦 Plan: <span className="text-amber-400 font-bold">{ev.plan}</span></div>
                    {ev.whatsappPhone && (
                      <div>📱 WhatsApp: <span className="text-slate-200 font-semibold">{ev.whatsappPhone}</span></div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => abrirModalEditar(ev)}
                      className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                    >
                      ⚙️ Editar
                    </button>

                    <button
                      onClick={() => handleDuplicarEvento(ev)}
                      className="bg-slate-800/80 hover:bg-slate-700 text-amber-400 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                    >
                      📋 Duplicar
                    </button>

                    <button
                      onClick={() => {
                        setEventoSeleccionadoId(ev.id);
                        setTabActiva("disenador");
                      }}
                      className="bg-slate-800/80 hover:bg-slate-700 text-emerald-400 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                    >
                      🛠️️ Diseñar Preguntas
                    </button>

                    <a
                      href={`/?event=${ev.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-slate-800/80 hover:bg-slate-700 text-amber-400 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                    >
                      🔗 Ver Demo
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA 2: DISEÑADOR */}
        {tabActiva === "disenador" && (
          <div className="bg-[#121c33] border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="text-xs font-black text-amber-500 uppercase tracking-wider">
                  🛠️ DISEÑADOR DE PREGUNTAS Y CAMPOS DEL FORMULARIO
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Evento actual: <span className="text-amber-400 font-bold">{eventoActual?.title}</span>
                </p>
              </div>

              <select
                value={eventoSeleccionadoId}
                onChange={(e) => setEventoSeleccionadoId(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-amber-400 font-bold rounded-xl px-3 py-2 focus:outline-none"
              >
                {eventos.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.slug})
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleAgregarPregunta} className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-200 uppercase">
                + Agregar Nueva Pregunta
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Ej. ¿Alergias o requerimiento de menú especial?"
                  value={nuevaPreguntaLabel}
                  onChange={(e) => setNuevaPreguntaLabel(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  required
                />

                <select
                  value={nuevaPreguntaTipo}
                  onChange={(e) => setNuevaPreguntaTipo(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="text">Texto abierto</option>
                  <option value="choice">Opción múltiple</option>
                  <option value="boolean">Sí / No</option>
                </select>
              </div>

              {nuevaPreguntaTipo === "choice" && (
                <input
                  type="text"
                  placeholder="Opciones separadas por coma (ej. Carne, Vegano, Infantil)"
                  value={nuevaPreguntaOpciones}
                  onChange={(e) => setNuevaPreguntaOpciones(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nuevaPreguntaRequerida}
                    onChange={(e) => setNuevaPreguntaRequerida(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  Obligatoria
                </label>

                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl transition-all cursor-pointer"
                >
                  + Agregar Campo
                </button>
              </div>
            </form>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase">
                Campos activos en la invitación ({eventoActual?.questions?.length || 0})
              </h3>

              {(!eventoActual?.questions || eventoActual.questions.length === 0) ? (
                <p className="text-xs text-slate-500 bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                  No has añadido preguntas personalizadas a esta invitación.
                </p>
              ) : (
                eventoActual.questions.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-200">{q.label}</p>
                      <span className="text-[10px] text-amber-500 font-mono">
                        Tipo: {q.type} {q.required ? "• Obligatoria" : ""}
                      </span>
                    </div>

                    <button
                      onClick={() => handleEliminarPregunta(q.id)}
                      className="text-rose-400 hover:text-rose-300 font-bold text-xs px-3 py-1 rounded-lg bg-rose-950/30 border border-rose-800/40"
                    >
                      Eliminar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA 3: RESPUESTAS */}
        {tabActiva === "respuestas" && (
          <div className="bg-[#121c33] border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-4 shadow-2xl">
            <h2 className="text-xs font-black text-amber-500 tracking-wider uppercase border-b border-slate-800 pb-3">
              📊 RESPUESTAS RECIBIDAS - {eventoActual?.title}
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Nombre</th>
                    <th className="p-3">Asistencia</th>
                    <th className="p-3">Pases</th>
                    <th className="p-3">Mensaje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {respuestas.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center p-6 text-slate-500">
                        No hay registros guardados para este evento.
                      </td>
                    </tr>
                  ) : (
                    respuestas.map((r, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-semibold text-slate-100">{r.nombreInvitado || "Anónimo"}</td>
                        <td className="p-3">
                          {r.asistira ? (
                            <span className="text-emerald-400 font-bold">Sí asistirá 🎉</span>
                          ) : (
                            <span className="text-rose-400 font-bold">No asistirá 😔</span>
                          )}
                        </td>
                        <td className="p-3 font-bold text-amber-400">{r.pasesConfirmados || 0}</td>
                        <td className="p-3 italic text-slate-400">{r.mensajeDeseos || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA 4: COLABORADORES (RÉPLICA EXACTA DE TU CAPTURA) */}
        {tabActiva === "colaboradores" && (
          <div className="space-y-6">
            
            {/* FORMULARIO: REGISTRAR NUEVO COLABORADOR O CLIENTE */}
            <div className="bg-[#121c33] border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
              <h2 className="text-xs font-black text-amber-500 tracking-wider uppercase">
                {usuarioEditandoId ? "EDITAR COLABORADOR O CLIENTE" : "REGISTRAR NUEVO COLABORADOR O CLIENTE"}
              </h2>

              <form onSubmit={handleGuardarUsuario} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                <div>
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={nuevoCorreo}
                    onChange={(e) => setNuevoCorreo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <select
                    value={nuevoRol}
                    onChange={(e) => setNuevoRol(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="CLIENTE">Cliente (Acceso a su evento)</option>
                    <option value="ADMINISTRADOR">Administrador (Acceso total)</option>
                  </select>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    {usuarioEditandoId ? "Actualizar" : "+ Dar Acceso"}
                  </button>
                </div>
              </form>
            </div>

            {/* TABLA: USUARIOS REGISTRADOS EN LA PLATAFORMA */}
            <div className="bg-[#121c33] border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
              <h2 className="text-xs font-black text-amber-500 tracking-wider uppercase">
                USUARIOS REGISTRADOS EN LA PLATAFORMA
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0a101f] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3">Nombre</th>
                      <th className="p-3">Correo</th>
                      <th className="p-3">Rol</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {usuarios.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 font-semibold text-slate-100">{u.nombre}</td>
                        <td className="p-3 text-slate-400">{u.correo}</td>
                        <td className="p-3">
                          {u.rol === "ADMINISTRADOR" ? (
                            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2.5 py-1 rounded text-[10px] font-black tracking-wider">
                              ADMINISTRADOR
                            </span>
                          ) : (
                            <span className="bg-blue-600/20 text-blue-400 border border-blue-500/40 px-2.5 py-1 rounded text-[10px] font-black tracking-wider">
                              CLIENTE
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            • ACTIVO
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => handleEditarUsuario(u)}
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-[11px] px-3 py-1 rounded-lg transition-all"
                          >
                            ✏️ Editar
                          </button>
                          {u.rol !== "ADMINISTRADOR" && (
                            <button
                              onClick={() => handleEliminarUsuario(u.id)}
                              className="bg-rose-950/40 hover:bg-rose-900/50 text-rose-400 border border-rose-800/40 font-bold text-[11px] px-3 py-1 rounded-lg transition-all"
                            >
                              Eliminar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* MODAL CREAR / EDITAR EVENTO */}
        {mostrarModalEvento && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#121c33] border border-slate-800 w-full max-w-lg rounded-2xl p-6 md:p-8 space-y-5 shadow-2xl">
              <h2 className="text-sm font-extrabold text-amber-500 uppercase tracking-wider">
                {editandoEventoId ? "⚙️ Editar Configuración de Evento" : "✨ Crear Nuevo Evento"}
              </h2>

              <form onSubmit={handleGuardarEvento} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Título del Evento
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Boda María & Alejandro"
                    value={modalTitle}
                    onChange={(e) => setModalTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Slug / Identificador de la URL
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. boda-maria-alejandro"
                    value={modalSlug}
                    onChange={(e) => setModalSlug(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Fecha del Evento
                  </label>
                  <input
                    type="date"
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl space-y-1">
                  <label className="block text-xs font-bold text-amber-400">
                    📱 WhatsApp Receptor de Confirmaciones
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej. 5218112345678"
                    value={modalWhatsapp}
                    onChange={(e) => setModalWhatsapp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Plan
                  </label>
                  <select
                    value={modalPlan}
                    onChange={(e) => setModalPlan(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="PLUS">PLUS</option>
                    <option value="BASIC">BASIC</option>
                    <option value="PREMIUM">PREMIUM</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="modalActiveCheck"
                    checked={modalActive}
                    onChange={(e) => setModalActive(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <label htmlFor="modalActiveCheck" className="text-xs text-slate-300 cursor-pointer">
                    Evento activo / publicado
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setMostrarModalEvento(false)}
                    className="bg-slate-800 text-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    {editandoEventoId ? "Guardar Cambios" : "Crear Evento"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}