"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

export type PlanType = "BASICO" | "PLUS" | "PREMIUM";

interface EventItem {
  id: string;
  slug: string;
  title: string;
  targetDate: string;
  plan: PlanType;
  active: boolean;
  whatsappPhone: string;
  pasesAsignados?: number;
  questions: Question[];
}

interface UserItem {
  id: string;
  nombre: string;
  username: string;
  correo: string;
  password?: string;
  rol: "ADMINISTRADOR" | "CLIENTE";
  eventoAsignadoSlug?: string;
  activo: boolean;
  createdAt: string;
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
  const router = useRouter();

  const [tabActiva, setTabActiva] = useState<
    "eventos" | "disenador" | "respuestas" | "colaboradores"
  >("eventos");

  const [rolUsuarioActual] = useState<"ADMINISTRADOR" | "CLIENTE">("ADMINISTRADOR");
  const [copiadoTipo, setCopiadoTipo] = useState<string | null>(null);
  const [busquedaEvento, setBusquedaEvento] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "activos" | "inactivos">("todos");

  const [eventos, setEventos] = useState<EventItem[]>([
    {
      id: "1",
      slug: "demo",
      title: "Boda María & Alejandro",
      targetDate: "2026-10-15",
      plan: "PLUS",
      active: true,
      whatsappPhone: "5218115591681",
      pasesAsignados: 2,
      questions: [
        {
          id: "q1",
          label: "¿Tienes alguna restricción alimenticia?",
          type: "text",
          required: false,
          placeholder: "Ej. Vegano, alergia a nueces...",
        },
      ],
    },
    {
      id: "2",
      slug: "yunnie-y-juan",
      title: "yunnie y juan",
      targetDate: "1996-09-21",
      plan: "PREMIUM",
      active: true,
      whatsappPhone: "5218115591681",
      pasesAsignados: 4,
      questions: [],
    },
  ]);

  const [eventoSeleccionadoId, setEventoSeleccionadoId] = useState<string>("1");

  // Modal Crear/Editar Evento
  const [mostrarModalEvento, setMostrarModalEvento] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalSlug, setModalSlug] = useState("");
  const [slugEditadoManualmente, setSlugEditadoManualmente] = useState(false);
  const [modalDate, setModalDate] = useState("");
  const [modalPlan, setModalPlan] = useState<PlanType>("PLUS");
  const [modalWhatsapp, setModalWhatsapp] = useState("");
  const [modalPases, setModalPases] = useState<number>(2);
  const [modalActive, setModalActive] = useState(true);
  const [editandoEventoId, setEditandoEventoId] = useState<string | null>(null);

  // Diseñador
  const [nuevaPreguntaLabel, setNuevaPreguntaLabel] = useState("");
  const [nuevaPreguntaTipo, setNuevaPreguntaTipo] = useState<QuestionType>("text");
  const [nuevaPreguntaOpciones, setNuevaPreguntaOpciones] = useState("");
  const [nuevaPreguntaRequerida, setNuevaPreguntaRequerida] = useState(false);

  // ESTADOS DE COLABORADORES Y USUARIOS
  const [usuarios, setUsuarios] = useState<UserItem[]>([
    {
      id: "u1",
      nombre: "Alejandro Mejía",
      username: "amejia",
      correo: "admin@mi-invitacion.com",
      password: "••••••••",
      rol: "ADMINISTRADOR",
      eventoAsignadoSlug: "todos",
      activo: true,
      createdAt: "2026-01-10",
    },
  ]);

  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoUsername, setNuevoUsername] = useState("");
  const [nuevoCorreo, setNuevoCorreo] = useState("");
  const [nuevoPassword, setNuevoPassword] = useState("");
  const [nuevoRol, setNuevoRol] = useState<"ADMINISTRADOR" | "CLIENTE">("CLIENTE");
  const [nuevoEventoSlug, setNuevoEventoSlug] = useState("demo");
  const [nuevoActivo, setNuevoActivo] = useState(true);
  const [usuarioEditandoId, setUsuarioEditandoId] = useState<string | null>(null);

  const [respuestas, setRespuestas] = useState<any[]>([]);

  const eventoActual = eventos.find((e) => e.id === eventoSeleccionadoId) || eventos[0];

  const totalRespuestas = respuestas.length;
  const totalConfirmados = respuestas.filter((r) => r.attending).length;
  const totalCancelados = respuestas.filter((r) => !r.attending).length;
  const totalAsistentesPersona = respuestas
    .filter((r) => r.attending)
    .reduce((acc, curr) => acc + (Number(curr.pasesConfirmados) || 1), 0);

  const eventosFiltrados = eventos.filter((ev) => {
    const coincideTexto =
      ev.title.toLowerCase().includes(busquedaEvento.toLowerCase()) ||
      ev.slug.toLowerCase().includes(busquedaEvento.toLowerCase());

    if (filtroEstado === "activos") return coincideTexto && ev.active;
    if (filtroEstado === "inactivos") return coincideTexto && !ev.active;
    return coincideTexto;
  });

  useEffect(() => {
    if (!eventoActual) return;
    fetch(`/api/form-config?event=${eventoActual.slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data?.responses) {
          setRespuestas(data.data.responses);
        } else {
          setRespuestas([]);
        }
      })
      .catch((err) => {
        console.error("Error al cargar respuestas:", err);
        setRespuestas([]);
      });
  }, [eventoSeleccionadoId, eventoActual?.slug]);

  const handleCerrarSesion = () => {
    router.push("/login");
  };

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
    setModalWhatsapp("5218115591681");
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
    setModalWhatsapp(ev.whatsappPhone || "5218115591681");
    setModalPases(ev.pasesAsignados || 2);
    setModalActive(ev.active);
    setMostrarModalEvento(true);
  };

  const handleGuardarEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle || !modalSlug) return;

    const eventoData = {
      title: modalTitle,
      slug: modalSlug,
      targetDate: modalDate,
      plan: modalPlan,
      whatsappPhone: modalWhatsapp,
      pasesAsignados: Number(modalPases),
      active: modalActive,
    };

    try {
      await fetch("/api/form-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: modalSlug, config: eventoData }),
      });
    } catch (error) {
      console.error("Error guardando en API:", error);
    }

    if (editandoEventoId) {
      setEventos(
        eventos.map((ev) =>
          ev.id === editandoEventoId ? { ...ev, ...eventoData } : ev
        )
      );
    } else {
      const nuevo: EventItem = {
        id: Date.now().toString(),
        ...eventoData,
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

  const copiarLinkGeneral = (slug: string) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiadoTipo(`demo-${slug}`);
    setTimeout(() => setCopiadoTipo(null), 2500);
  };

  const copiarLinkPases = (slug: string, pases: number = 2) => {
    const url = `${window.location.origin}/${slug}?pases=${pases}`;
    navigator.clipboard.writeText(url);
    setCopiadoTipo(`pases-${slug}`);
    setTimeout(() => setCopiadoTipo(null), 2500);
  };

  const copiarLinkPortalCliente = (slug: string) => {
    const url = `${window.location.origin}/respuestas/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiadoTipo(`portal-${slug}`);
    setTimeout(() => setCopiadoTipo(null), 2500);
  };

  const exportarRespuestasCSV = () => {
    if (!respuestas || respuestas.length === 0) return;

    let csvContent =
      "\uFEFFNro,Invitado / Familia,Asistirá,Personas Confirmadas,Respuestas Adicionales,Fecha Registro\n";

    respuestas.forEach((r, idx) => {
      const num = idx + 1;
      const nombre = `"${(r.name || "Anónimo").replace(/"/g, '""')}"`;
      const asistira = r.attending ? "SÍ" : "NO";
      const personas = r.attending ? r.pasesConfirmados || 1 : 0;
      const custom = `"${JSON.stringify(r.customAnswers || {}).replace(
        /"/g,
        '""'
      )}"`;
      const fecha = r.createdAt
        ? `"${new Date(r.createdAt).toLocaleString()}"`
        : '""';

      csvContent += `${num},${nombre},${asistira},${personas},${custom},${fecha}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Lista_Invitados_${eventoActual.slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const handleUpdatePregunta = (
    qId: string,
    field: keyof Question,
    value: any
  ) => {
    if (!eventoActual) return;
    setEventos(
      eventos.map((ev) => {
        if (ev.id !== eventoActual.id) return ev;
        return {
          ...ev,
          questions: ev.questions.map((q) =>
            q.id === qId ? { ...q, [field]: value } : q
          ),
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

  // MANEJO DE USUARIOS
  const handleGuardarUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre || !nuevoCorreo) return;

    if (usuarioEditandoId) {
      setUsuarios(
        usuarios.map((u) =>
          u.id === usuarioEditandoId
            ? {
                ...u,
                nombre: nuevoNombre,
                username: nuevoUsername || generateSlug(nuevoNombre),
                correo: nuevoCorreo,
                password: nuevoPassword || u.password,
                rol: nuevoRol,
                eventoAsignadoSlug: nuevoEventoSlug,
                activo: nuevoActivo,
              }
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
          username: nuevoUsername || generateSlug(nuevoNombre),
          correo: nuevoCorreo,
          password: nuevoPassword || "123456",
          rol: nuevoRol,
          eventoAsignadoSlug: nuevoEventoSlug,
          activo: nuevoActivo,
          createdAt: new Date().toISOString().split("T")[0],
        },
      ]);
    }

    limpiarFormularioUsuario();
  };

  const limpiarFormularioUsuario = () => {
    setUsuarioEditandoId(null);
    setNuevoNombre("");
    setNuevoUsername("");
    setNuevoCorreo("");
    setNuevoPassword("");
    setNuevoRol("CLIENTE");
    setNuevoEventoSlug(eventos[0]?.slug || "demo");
    setNuevoActivo(true);
  };

  const handleEditarUsuario = (u: UserItem) => {
    setUsuarioEditandoId(u.id);
    setNuevoNombre(u.nombre);
    setNuevoUsername(u.username || "");
    setNuevoCorreo(u.correo);
    setNuevoPassword(u.password || "");
    setNuevoRol(u.rol);
    setNuevoEventoSlug(u.eventoAsignadoSlug || "demo");
    setNuevoActivo(u.activo);
  };

  const handleToggleEstadoUsuario = (id: string) => {
    setUsuarios(
      usuarios.map((u) => (u.id === id ? { ...u, activo: !u.activo } : u))
    );
  };

  const handleEliminarUsuario = (id: string) => {
    setUsuarios(usuarios.filter((u) => u.id !== id));
  };

  // ENVIAR ACCESOS DIRECTO POR WHATSAPP
  const enviarAccesosPorWhatsapp = (u: UserItem) => {
    const loginUrl = `${window.location.origin}/login`;
    const portalUrl = u.eventoAsignadoSlug && u.eventoAsignadoSlug !== "todos"
      ? `${window.location.origin}/respuestas/${u.eventoAsignadoSlug}`
      : loginUrl;

    const texto =
      `¡Hola ${u.nombre}! 👋\n\n` +
      `Tus credenciales de acceso a la plataforma ya están activas. Puedes consultar los detalles de tu evento y las confirmaciones de tus invitados:\n\n` +
      `🌐 *Enlace de Login:* ${loginUrl}\n` +
      `📊 *Portal Directo:* ${portalUrl}\n` +
      `👤 *Usuario:* ${u.username || u.correo}\n` +
      `🔑 *Contraseña:* ${u.password || "123456"}\n` +
      `📌 *Evento Asignado:* /${u.eventoAsignadoSlug || "demo"}\n\n` +
      `Cualquier duda quedamos a tus órdenes. ¡Excelente día! ✨`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
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
              Administra tus eventos activos, visualiza respuestas y gestiona clientes
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

            {rolUsuarioActual === "ADMINISTRADOR" && (
              <button
                onClick={() => setTabActiva("disenador")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  tabActiva === "disenador"
                    ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
                }`}
              >
                🛠 Diseñador (Admin)
              </button>
            )}

            <button
              onClick={() => setTabActiva("respuestas")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tabActiva === "respuestas"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
              }`}
            >
              📊 Respuestas ({totalRespuestas})
            </button>

            {rolUsuarioActual === "ADMINISTRADOR" && (
              <button
                onClick={() => setTabActiva("colaboradores")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  tabActiva === "colaboradores"
                    ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
                }`}
              >
                👥 Colaboradores ({usuarios.length})
              </button>
            )}

            <button
              onClick={handleCerrarSesion}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-950/50 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 transition-all cursor-pointer flex items-center gap-1.5 ml-2"
              title="Cerrar sesión"
            >
              <span>🚪 Salir</span>
            </button>
          </div>
        </div>

        {/* PESTAÑA 1: MIS EVENTOS */}
        {tabActiva === "eventos" && (
          <div className="bg-[#121c33] border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xs font-black text-amber-500 uppercase tracking-wider">
                  📁 GESTIÓN DE EVENTOS
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Crea, edita y administra los eventos creados en el sistema.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 text-xs text-amber-400 font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                >
                  <option value="todos">🌐 Todos ({eventos.length})</option>
                  <option value="activos">
                    🟢 Activos ({eventos.filter((e) => e.active).length})
                  </option>
                  <option value="inactivos">
                    🔴 Inactivos ({eventos.filter((e) => !e.active).length})
                  </option>
                </select>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="🔍 Buscar título o slug..."
                    value={busquedaEvento}
                    onChange={(e) => setBusquedaEvento(e.target.value)}
                    className="w-full sm:w-56 bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 rounded-xl px-3.5 py-2 focus:outline-none focus:border-amber-500"
                  />
                  {busquedaEvento && (
                    <button
                      onClick={() => setBusquedaEvento("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  onClick={abrirModalCrear}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer whitespace-nowrap"
                >
                  + Crear Nuevo Evento
                </button>
              </div>
            </div>

            {eventosFiltrados.length === 0 ? (
              <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-500">
                  No se encontraron eventos coincidentes.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventosFiltrados.map((ev) => (
                  <div
                    key={ev.id}
                    className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between"
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

                      <p className="text-xs font-mono text-amber-400 mt-1">/{ev.slug}</p>

                      <div className="text-[11px] text-slate-400 mt-3 space-y-1">
                        <p>📅 Fecha: {ev.targetDate || "Sin fecha"}</p>
                        <p>
                          💎 Plan:{" "}
                          <span className="font-extrabold text-amber-400">{ev.plan}</span>
                        </p>
                        {ev.plan !== "BASICO" && (
                          <p>
                            🎫 Pases:{" "}
                            <span className="text-amber-400 font-bold">
                              {ev.pasesAsignados ?? 2} pases
                            </span>
                          </p>
                        )}
                        <p>📱 WhatsApp: {ev.whatsappPhone || "No asignado"}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-900 flex flex-col gap-2">
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => copiarLinkGeneral(ev.slug)}
                            className="text-[10px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2 py-1.5 rounded-lg transition-all cursor-pointer text-center truncate"
                          >
                            {copiadoTipo === `demo-${ev.slug}` ? "¡Copiado! 🚀" : "🔗 Link Demo"}
                          </button>

                          {ev.plan !== "BASICO" ? (
                            <button
                              onClick={() => copiarLinkPases(ev.slug, ev.pasesAsignados || 2)}
                              className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2 py-1.5 rounded-lg transition-all cursor-pointer text-center truncate"
                            >
                              {copiadoTipo === `pases-${ev.slug}` ? "¡Copiado! 🚀" : `🎫 Link Pases`}
                            </button>
                          ) : (
                            <div className="text-[10px] text-slate-600 bg-slate-900 px-2 py-1.5 rounded-lg text-center font-bold border border-slate-800">N/A</div>
                          )}

                          {ev.plan !== "BASICO" ? (
                            <button
                              onClick={() => copiarLinkPortalCliente(ev.slug)}
                              className="text-[10px] font-bold text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 px-2 py-1.5 rounded-lg transition-all cursor-pointer text-center truncate"
                            >
                              {copiadoTipo === `portal-${ev.slug}` ? "¡Copiado! 🚀" : "📊 Portal"}
                            </button>
                          ) : (
                            <div className="text-[10px] text-slate-600 bg-slate-900 px-2 py-1.5 rounded-lg text-center font-bold border border-slate-800">N/A</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-900">
                      <button
                        onClick={() => abrirModalEditar(ev)}
                        className="text-xs bg-slate-900 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleEliminarEvento(ev.id)}
                        className="text-xs bg-rose-950/40 text-rose-400 border border-rose-900/50 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 2: DISEÑADOR */}
        {tabActiva === "disenador" && rolUsuarioActual === "ADMINISTRADOR" && (
          <div className="bg-[#121c33] border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xs font-black text-amber-500 uppercase tracking-wider flex items-center gap-2">
                  <span>🛠️</span> DISEÑADOR DE PREGUNTAS Y CAMPOS (ADMINISTRADOR)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Evento actual: <span className="text-amber-400 font-bold">{eventoActual?.title}</span>
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

            <form onSubmit={handleAgregarPregunta} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                ➕ AGREGAR NUEVA PREGUNTA AL EVENTO
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-7">
                  <input
                    type="text"
                    placeholder="Ej. ¿Alergias o menú especial?"
                    value={nuevaPreguntaLabel}
                    onChange={(e) => setNuevaPreguntaLabel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
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

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
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

            <div className="space-y-4 pt-2">
              {eventoActual?.questions?.map((q, index) => (
                <div key={q.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-[10px] font-mono font-bold text-amber-500">Campo #{index + 1}</span>
                    <button
                      onClick={() => handleEliminarPregunta(q.id)}
                      className="text-rose-400 font-bold text-xs px-3 py-1 bg-rose-950/40 rounded-lg cursor-pointer"
                    >
                      🗑 Eliminar
                    </button>
                  </div>
                  <input
                    type="text"
                    value={q.label}
                    onChange={(e) => handleUpdatePregunta(q.id, "label", e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-semibold"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA 3: RESPUESTAS */}
        {tabActiva === "respuestas" && (
          <div className="bg-[#121c33] border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xs font-black text-amber-500 uppercase tracking-wider">
                  📊 CONCENTRADO DE RESPUESTAS E INVITADOS
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Evento: <span className="text-amber-400 font-bold">{eventoActual?.title}</span>
                </p>
              </div>

              <button
                onClick={exportarRespuestasCSV}
                disabled={respuestas.length === 0}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
              >
                📥 Descargar Excel (CSV)
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-500">ENVÍOS</span>
                <p className="text-xl font-black text-slate-100">{totalRespuestas}</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-emerald-500">CONFIRMADOS</span>
                <p className="text-xl font-black text-emerald-400">{totalConfirmados}</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-rose-500">CANCELADOS</span>
                <p className="text-xl font-black text-rose-400">{totalCancelados}</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-amber-500">PERSONAS</span>
                <p className="text-xl font-black text-amber-400">{totalAsistentesPersona} asist.</p>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 4: COLABORADORES CON WHATSAPP DIRECTO */}
        {tabActiva === "colaboradores" && rolUsuarioActual === "ADMINISTRADOR" && (
          <div className="bg-[#121c33] border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xs font-black text-amber-500 uppercase tracking-wider">
                👥 GESTIÓN PROFESIONAL DE ACCESOS Y CLIENTES
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Administra usuarios, credenciales de acceso, asignación de eventos y envía sus datos por WhatsApp.
              </p>
            </div>

            {/* FORMULARIO */}
            <form onSubmit={handleGuardarUsuario} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {usuarioEditandoId ? "✏️️ Editar Credenciales de Colaborador" : "➕ Dar de Alta Nuevo Colaborador / Cliente"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Alejandro Mejía"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Nombre de Usuario (Login)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. amejia"
                    value={nuevoUsername}
                    onChange={(e) => setNuevoUsername(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    placeholder="admin@mi-invitacion.com"
                    value={nuevoCorreo}
                    onChange={(e) => setNuevoCorreo(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    {usuarioEditandoId ? "Cambiar Contraseña" : "Asignar Contraseña *"}
                  </label>
                  <input
                    type="text"
                    placeholder={usuarioEditandoId ? "Dejar en blanco para no cambiar" : "Ej. Clave123*"}
                    value={nuevoPassword}
                    onChange={(e) => setNuevoPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-emerald-400 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Rol de Sistema
                  </label>
                  <select
                    value={nuevoRol}
                    onChange={(e) => setNuevoRol(e.target.value as "ADMINISTRADOR" | "CLIENTE")}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="CLIENTE">CLIENTE (Solo ver su evento)</option>
                    <option value="ADMINISTRADOR">ADMINISTRADOR (Acceso Total)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Evento Asignado / Cliente
                  </label>
                  <select
                    value={nuevoEventoSlug}
                    onChange={(e) => setNuevoEventoSlug(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-sky-400 font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="todos">🌐 Todos los eventos (Admin)</option>
                    {eventos.map((ev) => (
                      <option key={ev.id} value={ev.slug}>
                        {ev.title} (/{ev.slug})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={nuevoActivo}
                    onChange={(e) => setNuevoActivo(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <span>Permitir acceso al usuario (Cuenta Activa)</span>
                </label>

                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  {usuarioEditandoId && (
                    <button
                      type="button"
                      onClick={limpiarFormularioUsuario}
                      className="bg-slate-800 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-6 py-2 rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    {usuarioEditandoId ? "Actualizar Credenciales" : "+ Guardar Colaborador"}
                  </button>
                </div>
              </div>
            </form>

            {/* TABLA DE USUARIOS CON ACCIÓN WHATSAPP */}
            <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] bg-slate-900/60">
                    <th className="p-3">Usuario / Nombre</th>
                    <th className="p-3">Login / Correo</th>
                    <th className="p-3">Contraseña</th>
                    <th className="p-3">Rol / Evento</th>
                    <th className="p-3">Alta</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {usuarios.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/40">
                      <td className="p-3 font-semibold text-slate-100">
                        {u.nombre}
                        <span className="block text-[10px] font-mono text-amber-400">
                          @{u.username || "sin-user"}
                        </span>
                      </td>

                      <td className="p-3 text-slate-300 font-mono text-[11px]">
                        {u.correo}
                      </td>

                      <td className="p-3 font-mono text-emerald-400 font-bold">
                        {u.password ? u.password : "••••••••"}
                      </td>

                      <td className="p-3">
                        <span className="font-bold text-amber-400 block">{u.rol}</span>
                        <span className="text-[10px] text-sky-400 font-mono">
                          /{u.eventoAsignadoSlug || "demo"}
                        </span>
                      </td>

                      <td className="p-3 text-slate-500 font-mono text-[11px]">
                        📅 {u.createdAt || "2026-01-10"}
                      </td>

                      <td className="p-3">
                        <button
                          onClick={() => handleToggleEstadoUsuario(u.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold cursor-pointer transition-all ${
                            u.activo
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20"
                          }`}
                        >
                          {u.activo ? "🟢 ACTIVO" : "🔴 SUSPENDIDO"}
                        </button>
                      </td>

                      <td className="p-3 text-right space-x-1.5">
                        <button
                          onClick={() => enviarAccesosPorWhatsapp(u)}
                          className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold"
                          title="Enviar credenciales de acceso por WhatsApp"
                        >
                          💬 Enviar
                        </button>

                        <button
                          onClick={() => handleEditarUsuario(u)}
                          className="bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                          title="Editar usuario y contraseña"
                        >
                          ✏️
                        </button>

                        <button
                          onClick={() => handleEliminarUsuario(u.id)}
                          className="bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 border border-rose-900/50 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                          title="Eliminar usuario"
                        >
                          🗑️
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

      {/* MODAL EVENTO */}
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
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
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
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Fecha</label>
                  <input
                    type="date"
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Plan</label>
                  <select
                    value={modalPlan}
                    onChange={(e) => setModalPlan(e.target.value as PlanType)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-bold"
                  >
                    <option value="BASICO">BASICO</option>
                    <option value="PLUS">PLUS ($300 MXN)</option>
                    <option value="PREMIUM">PREMIUM ($800 MXN)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Pases</label>
                  <input
                    type="number"
                    min="1"
                    value={modalPases}
                    onChange={(e) => setModalPases(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">WhatsApp Notificaciones</label>
                  <input
                    type="text"
                    value={modalWhatsapp}
                    onChange={(e) => setModalWhatsapp(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
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