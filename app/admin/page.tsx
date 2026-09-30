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
  whatsapp: string;
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

  // Pestaña Activa con Persistencia en localStorage
  const [tabActiva, setTabActiva] = useState<
    "eventos" | "disenador" | "respuestas" | "colaboradores"
  >("eventos");

  const [rolUsuarioActual, setRolUsuarioActual] = useState<"ADMINISTRADOR" | "CLIENTE">("ADMINISTRADOR");
  const [slugAsignado, setSlugAsignado] = useState<string>("todos");
  const [nombreSesion, setNombreSesion] = useState<string>("");

  const [copiadoTipo, setCopiadoTipo] = useState<string | null>(null);
  const [busquedaEvento, setBusquedaEvento] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "activos" | "inactivos">("todos");

  // Cargar sesión y recordar pestaña activa al recargar (F5)
  useEffect(() => {
    const role = (localStorage.getItem("userRole") as "ADMINISTRADOR" | "CLIENTE") || "ADMINISTRADOR";
    const slug = localStorage.getItem("userSlug") || "todos";
    const name = localStorage.getItem("userName") || "";
    const tabGuardada = localStorage.getItem("adminTabActiva") as any;

    setRolUsuarioActual(role);
    setSlugAsignado(slug);
    setNombreSesion(name);

    if (tabGuardada) {
      setTabActiva(tabGuardada);
    }
  }, []);

  // Función para cambiar pestaña y guardarla en localStorage
  const cambiarTab = (
    tab: "eventos" | "disenador" | "respuestas" | "colaboradores"
  ) => {
    setTabActiva(tab);
    localStorage.setItem("adminTabActiva", tab);
  };

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

  // Usuarios / Clientes (B2B Reseller con WhatsApp Directo)
  const [usuarios, setUsuarios] = useState<UserItem[]>([
    {
      id: "u1",
      nombre: "Alejandro Mejía",
      username: "amejia",
      whatsapp: "5218115591681",
      password: "••••••••",
      rol: "ADMINISTRADOR",
      eventoAsignadoSlug: "todos",
      activo: true,
      createdAt: "2026-01-10",
    },
  ]);

  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoUsername, setNuevoUsername] = useState("");
  const [nuevoWhatsapp, setNuevoWhatsapp] = useState("");
  const [nuevoPassword, setNuevoPassword] = useState("");
  const [nuevoRol, setNuevoRol] = useState<"ADMINISTRADOR" | "CLIENTE">("CLIENTE");
  const [nuevoEventoSlug, setNuevoEventoSlug] = useState("demo");
  const [nuevoActivo, setNuevoActivo] = useState(true);
  const [usuarioEditandoId, setUsuarioEditandoId] = useState<string | null>(null);

  const [respuestas, setRespuestas] = useState<any[]>([]);

  // Filtrado por rol
  const eventosVisibles =
    rolUsuarioActual === "ADMINISTRADOR"
      ? eventos
      : eventos.filter((e) => e.slug === slugAsignado || slugAsignado === "todos");

  const eventoActual =
    eventosVisibles.find((e) => e.id === eventoSeleccionadoId) || eventosVisibles[0];

  const totalRespuestas = respuestas.length;
  const totalConfirmados = respuestas.filter((r) => r.attending).length;
  const totalCancelados = respuestas.filter((r) => !r.attending).length;
  const totalAsistentesPersona = respuestas
    .filter((r) => r.attending)
    .reduce((acc, curr) => acc + (Number(curr.pasesConfirmados) || 1), 0);

  const eventosFiltrados = eventosVisibles.filter((ev) => {
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
    localStorage.clear();
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

  // Manejo de Clientes
  const handleGuardarUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre || !nuevoWhatsapp) return;

    if (usuarioEditandoId) {
      setUsuarios(
        usuarios.map((u) =>
          u.id === usuarioEditandoId
            ? {
                ...u,
                nombre: nuevoNombre,
                username: nuevoUsername || generateSlug(nuevoNombre),
                whatsapp: nuevoWhatsapp,
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
          whatsapp: nuevoWhatsapp,
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
    setNuevoWhatsapp("");
    setNuevoPassword("");
    setNuevoRol("CLIENTE");
    setNuevoEventoSlug(eventos[0]?.slug || "demo");
    setNuevoActivo(true);
  };

  const handleEditarUsuario = (u: UserItem) => {
    setUsuarioEditandoId(u.id);
    setNuevoNombre(u.nombre);
    setNuevoUsername(u.username || "");
    setNuevoWhatsapp(u.whatsapp || "");
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

  const enviarAccesosPorWhatsapp = (u: UserItem) => {
    const numeroLimpio = String(u.whatsapp).replace(/\D/g, "");
    if (!numeroLimpio) {
      alert("Por favor asigna un número de WhatsApp válido para este cliente.");
      return;
    }

    const loginUrl = `${window.location.origin}/login`;
    const portalUrl =
      u.eventoAsignadoSlug && u.eventoAsignadoSlug !== "todos"
        ? `${window.location.origin}/respuestas/${u.eventoAsignadoSlug}`
        : loginUrl;

    const texto =
      `¡Hola ${u.nombre}! 👋\n\n` +
      `Tus credenciales de acceso a la plataforma ya están activas. Puedes consultar tus eventos y respuestas:\n\n` +
      `🌐 *Enlace de Inicio:* ${loginUrl}\n` +
      `📊 *Portal Directo:* ${portalUrl}\n` +
      `👤 *Usuario:* ${u.username}\n` +
      `🔑 *Contraseña:* ${u.password || "123456"}\n` +
      `📌 *Evento Asignado:* /${u.eventoAsignadoSlug || "demo"}\n\n` +
      `¡Cualquier duda quedamos a tus órdenes! ✨`;

    const url = `https://api.whatsapp.com/send?phone=${numeroLimpio}&text=${encodeURIComponent(
      texto
    )}`;
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
              Bienvenido{" "}
              <span className="text-amber-400 font-bold">
                {nombreSesion || "Usuario"}
              </span>{" "}
              ({rolUsuarioActual})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <button
              onClick={() => cambiarTab("eventos")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tabActiva === "eventos"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
              }`}
            >
              📁 Mis Eventos
            </button>

            <button
              onClick={() => cambiarTab("disenador")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tabActiva === "disenador"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
              }`}
            >
              🛠 Diseñador
            </button>

            <button
              onClick={() => cambiarTab("respuestas")}
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
                onClick={() => cambiarTab("colaboradores")}
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

        {/* PESTAÑA 1: EVENTOS */}
        {tabActiva === "eventos" && (
          <div className="bg-[#121c33] border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xs font-black text-amber-500 uppercase tracking-wider">
                  📁 GESTIÓN DE EVENTOS
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Listado de eventos asignados a tu cuenta.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <button
                  onClick={abrirModalCrear}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer whitespace-nowrap"
                >
                  + Crear Nuevo Evento
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventosFiltrados.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-sm font-bold text-slate-100">
                        {ev.title}
                      </h3>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {ev.active ? "ACTIVO" : "INACTIVO"}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-amber-400 mt-1">
                      /{ev.slug}
                    </p>

                    <div className="text-[11px] text-slate-400 mt-3 space-y-1">
                      <p>📅 Fecha: {ev.targetDate || "Sin fecha"}</p>
                      <p>📱 WhatsApp: {ev.whatsappPhone || "No asignado"}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-900 flex flex-col gap-2">
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => copiarLinkGeneral(ev.slug)}
                          className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-1.5 rounded-lg text-center truncate cursor-pointer"
                        >
                          🔗 Demo
                        </button>
                        <button
                          onClick={() =>
                            copiarLinkPases(ev.slug, ev.pasesAsignados || 2)
                          }
                          className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1.5 rounded-lg text-center truncate cursor-pointer"
                        >
                          🎫 Pases
                        </button>
                        <button
                          onClick={() => copiarLinkPortalCliente(ev.slug)}
                          className="text-[10px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2 py-1.5 rounded-lg text-center truncate cursor-pointer"
                        >
                          📊 Portal
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-900">
                    <button
                      onClick={() => abrirModalEditar(ev)}
                      className="text-xs bg-slate-900 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg cursor-pointer"
                    >
                      ✏️ Editar
                    </button>
                    {rolUsuarioActual === "ADMINISTRADOR" && (
                      <button
                        onClick={() => handleEliminarEvento(ev.id)}
                        className="text-xs bg-rose-950/40 text-rose-400 border border-rose-900/50 px-3 py-1.5 rounded-lg cursor-pointer"
                      >
                        🗑️ Eliminar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA 2: DISEÑADOR */}
        {tabActiva === "disenador" && (
          <div className="bg-[#121c33] border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xs font-black text-amber-500 uppercase tracking-wider">
                🛠️ DISEÑADOR DE PREGUNTAS Y FORMULARIO
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Evento activo:{" "}
                <span className="text-amber-400 font-bold">
                  {eventoActual?.title}
                </span>
              </p>
            </div>

            <form
              onSubmit={handleAgregarPregunta}
              className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4"
            >
              <h3 className="text-xs font-bold text-amber-400 uppercase">
                ➕ AGREGAR PREGUNTA PERSONALIZADA
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-7">
                  <input
                    type="text"
                    placeholder="Ej. ¿Requiere menú vegetariano?"
                    value={nuevaPreguntaLabel}
                    onChange={(e) => setNuevaPreguntaLabel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200"
                    required
                  />
                </div>

                <div className="md:col-span-5">
                  <select
                    value={nuevaPreguntaTipo}
                    onChange={(e) =>
                      setNuevaPreguntaTipo(e.target.value as QuestionType)
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-400"
                  >
                    {Object.entries(TIPO_LABELS).map(([key, item]) => (
                      <option key={key} value={key}>
                        {item.icon} {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-6 py-2.5 rounded-xl cursor-pointer"
                >
                  + Agregar Campo
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {eventoActual?.questions?.map((q, index) => (
                <div
                  key={q.id}
                  className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center"
                >
                  <span className="text-xs text-slate-200 font-bold">
                    {index + 1}. {q.label}
                  </span>
                  <button
                    onClick={() => handleEliminarPregunta(q.id)}
                    className="text-rose-400 text-xs font-bold cursor-pointer"
                  >
                    🗑 Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA 3: RESPUESTAS */}
        {tabActiva === "respuestas" && (
          <div className="bg-[#121c33] border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
              <h2 className="text-xs font-black text-amber-500 uppercase">
                📊 RESPUESTAS DEL EVENTO: {eventoActual?.title}
              </h2>
              <button
                onClick={exportarRespuestasCSV}
                className="bg-emerald-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                📥 Descargar Excel (CSV)
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold">
                  TOTAL ENVÍOS
                </span>
                <p className="text-xl font-black text-slate-100">
                  {totalRespuestas}
                </p>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-emerald-500 font-bold">
                  CONFIRMADOS
                </span>
                <p className="text-xl font-black text-emerald-400">
                  {totalConfirmados}
                </p>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-rose-500 font-bold">
                  CANCELADOS
                </span>
                <p className="text-xl font-black text-rose-400">
                  {totalCancelados}
                </p>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-amber-500 font-bold">
                  PERSONAS
                </span>
                <p className="text-xl font-black text-amber-400">
                  {totalAsistentesPersona} asist.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 4: COLABORADORES (SOLO MASTER ADMIN) */}
        {tabActiva === "colaboradores" &&
          rolUsuarioActual === "ADMINISTRADOR" && (
            <div className="bg-[#121c33] border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xs font-black text-amber-500 uppercase">
                  👥 GESTIÓN PROFESIONAL DE CLIENTES Y ACCESOS
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Alta de revendedores y envío de accesos directo por WhatsApp.
                </p>
              </div>

              {/* FORMULARIO */}
              <form
                onSubmit={handleGuardarUsuario}
                className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Nombre Completo *"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Usuario Login *"
                    value={nuevoUsername}
                    onChange={(e) => setNuevoUsername(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-amber-400 font-mono"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="WhatsApp (ej. 5218115591681) *"
                    value={nuevoWhatsapp}
                    onChange={(e) => setNuevoWhatsapp(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-emerald-400 font-mono"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Contraseña *"
                    value={nuevoPassword}
                    onChange={(e) => setNuevoPassword(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-emerald-400 font-mono"
                    required
                  />
                  <select
                    value={nuevoRol}
                    onChange={(e) => setNuevoRol(e.target.value as any)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-amber-400 font-bold"
                  >
                    <option value="CLIENTE">
                      CLIENTE (Solo ver su evento)
                    </option>
                    <option value="ADMINISTRADOR">
                      ADMINISTRADOR (Acceso Total)
                    </option>
                  </select>
                  <select
                    value={nuevoEventoSlug}
                    onChange={(e) => setNuevoEventoSlug(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-sky-400 font-bold"
                  >
                    <option value="todos">🌐 Todos los eventos (Admin)</option>
                    {eventos.map((ev) => (
                      <option key={ev.id} value={ev.slug}>
                        {ev.title} (/{ev.slug})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-6 py-2 rounded-xl cursor-pointer"
                  >
                    + Guardar Colaborador
                  </button>
                </div>
              </form>

              {/* TABLA DE CLIENTES */}
              <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] bg-slate-900/60">
                      <th className="p-3">Usuario</th>
                      <th className="p-3">WhatsApp</th>
                      <th className="p-3">Contraseña</th>
                      <th className="p-3">Rol / Evento</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {usuarios.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-900/40">
                        <td className="p-3 font-semibold text-slate-100">
                          {u.nombre} (@{u.username})
                        </td>
                        <td className="p-3 text-emerald-400 font-mono font-bold">
                          📱 {u.whatsapp}
                        </td>
                        <td className="p-3 font-mono text-emerald-400 font-bold">
                          {u.password || "••••••••"}
                        </td>
                        <td className="p-3 text-amber-400 font-bold">
                          {u.rol} (/{u.eventoAsignadoSlug})
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleEstadoUsuario(u.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold cursor-pointer ${
                              u.activo
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-rose-500/10 text-rose-400"
                            }`}
                          >
                            {u.activo ? "🟢 ACTIVO" : "🔴 SUSPENDIDO"}
                          </button>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <button
                            onClick={() => enviarAccesosPorWhatsapp(u)}
                            className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-bold cursor-pointer"
                          >
                            💬 Enviar
                          </button>
                          <button
                            onClick={() => handleEliminarUsuario(u.id)}
                            className="bg-rose-950/40 text-rose-400 border border-rose-900/50 px-2.5 py-1 rounded-lg cursor-pointer"
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

      {/* MODAL EDITAR EVENTO */}
      {mostrarModalEvento && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#121c33] border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-amber-500 uppercase tracking-wider">
              {editandoEventoId ? "✏️ Editar Evento" : "➕ Crear Nuevo Evento"}
            </h3>

            <form onSubmit={handleGuardarEvento} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Nombre del Evento
                </label>
                <input
                  type="text"
                  value={modalTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Slug URL (ej. boda-maria)
                </label>
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
                  <label className="block text-slate-400 font-bold mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    WhatsApp Notificaciones
                  </label>
                  <input
                    type="text"
                    value={modalWhatsapp}
                    onChange={(e) => setModalWhatsapp(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMostrarModalEvento(false)}
                  className="bg-slate-800 text-slate-300 font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-5 py-2 rounded-xl cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}