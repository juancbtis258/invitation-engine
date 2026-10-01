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
  ownerUsername?: string;
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

interface TemplatePreset {
  id: string;
  title: string;
  category: "Boda" | "XV Años" | "Cumpleaños" | "Graduación" | "Comunidad";
  description: string;
  author: string;
  questions: Question[];
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

const PLANTILLAS_MUESTRA: TemplatePreset[] = [
  {
    id: "preset-boda",
    title: "👰 Boda Completa y Menú",
    category: "Boda",
    description: "Ideal para bodas con selección de banquete, transporte y música.",
    author: "Sistema",
    questions: [
      {
        id: "b1",
        label: "Selección de Platillo / Menú",
        type: "choice",
        options: ["Medallón de Res en Salsa Oporto", "Pechuga de Pollo Cordon Bleu", "Opción Vegetariana / Vegana"],
        required: true,
      },
      {
        id: "b2",
        label: "¿Tienes alguna alergia o restricción alimenticia?",
        type: "text",
        required: false,
        placeholder: "Ej. Alergia a nueces, celíaco...",
      },
      {
        id: "b3",
        label: "¿Requieres lugar en el autobús de traslado al salón?",
        type: "choice",
        options: ["Sí, requiero autobús", "No, me trasladaré en vehículo propio"],
        required: true,
      },
      {
        id: "b4",
        label: "Petición de Canción para el DJ",
        type: "text",
        required: false,
        placeholder: "Artista - Nombre de la canción",
      },
    ],
  },
  {
    id: "preset-xv",
    title: "👑 Mis XV Años",
    category: "XV Años",
    description: "Preguntas dinámicas para fiestas de quinceañeras.",
    author: "Sistema",
    questions: [
      {
        id: "xv1",
        label: "¿Asistirás a la ceremonia religiosa o solo a la recepción?",
        type: "choice",
        options: ["Misa y Recepción", "Solo a la Recepción"],
        required: true,
      },
      {
        id: "xv2",
        label: "¿Cuál es tu canción favorita para bailar?",
        type: "text",
        required: false,
      },
    ],
  },
  {
    id: "preset-cumple",
    title: "🎂 Cumpleaños / Fiesta",
    category: "Cumpleaños",
    description: "Formulario rápido para confirmación de fiestas informales.",
    author: "Sistema",
    questions: [
      {
        id: "c1",
        label: "¿Qué tipo de bebida prefieres?",
        type: "choice",
        options: ["Cerveza", "Vino / Coctelería", "Sin alcohol / Refresco"],
        required: false,
      },
    ],
  },
];

const EVENTOS_DEFAULT: EventItem[] = [
  {
    id: "1",
    slug: "demo",
    title: "Boda María & Alejandro",
    targetDate: "2026-10-15",
    plan: "BASICO",
    active: true,
    whatsappPhone: "5218115591681",
    pasesAsignados: 0,
    ownerUsername: "amejia",
    questions: [],
  },
  {
    id: "2",
    slug: "yunnie-y-juan",
    title: "Yunnie y Juan",
    targetDate: "2026-09-21",
    plan: "PLUS",
    active: true,
    whatsappPhone: "5218116122704",
    pasesAsignados: 2,
    ownerUsername: "yunnie",
    questions: [],
  },
];

const USUARIOS_DEFAULT: UserItem[] = [
  {
    id: "u1",
    nombre: "Alejandro Mejía",
    username: "amejia",
    whatsapp: "5218115591681",
    password: "admin123",
    rol: "ADMINISTRADOR",
    eventoAsignadoSlug: "todos",
    activo: true,
    createdAt: "2026-01-10",
  },
  {
    id: "u2",
    nombre: "Yunnie",
    username: "yunnie",
    whatsapp: "5218116122704",
    password: "123",
    rol: "CLIENTE",
    eventoAsignadoSlug: "todos",
    activo: true,
    createdAt: "2026-01-10",
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();

  const [cargandoSesion, setCargandoSesion] = useState(true);

  const [tabActiva, setTabActiva] = useState<
    "eventos" | "disenador" | "respuestas" | "colaboradores"
  >("eventos");

  const [rolUsuarioActual, setRolUsuarioActual] = useState<"ADMINISTRADOR" | "CLIENTE">("CLIENTE");
  const [slugAsignado, setSlugAsignado] = useState<string>("todos");
  const [nombreSesion, setNombreSesion] = useState<string>("");
  const [usernameSesion, setUsernameSesion] = useState<string>("");

  const [busquedaEvento, setBusquedaEvento] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "activos" | "inactivos">("todos");
  const [guardandoConfig, setGuardandoConfig] = useState(false);

  const [mostrarModalPlantillas, setMostrarModalPlantillas] = useState(false);
  const [plantillasComunidad, setPlantillasComunidad] = useState<TemplatePreset[]>(PLANTILLAS_MUESTRA);

  const [eventoDestinoSlug, setEventoDestinoSlug] = useState("");
  const [mostrarPasswordIds, setMostrarPasswordIds] = useState<Record<string, boolean>>({});

  // ESTADO DE EVENTOS CON PERSISTENCIA
  const [eventos, setEventos] = useState<EventItem[]>(EVENTOS_DEFAULT);
  const [eventoSeleccionadoId, setEventoSeleccionadoId] = useState<string>("2");

  // ESTADO DE COLABORADORES
  const [usuarios, setUsuarios] = useState<UserItem[]>(USUARIOS_DEFAULT);

  // CARGAR EVENTOS Y USUARIOS DE LOCALSTORAGE AL INICIAR
  useEffect(() => {
    const role = (localStorage.getItem("userRole") as "ADMINISTRADOR" | "CLIENTE") || "CLIENTE";
    const slug = localStorage.getItem("userSlug") || "todos";
    const name = localStorage.getItem("userName") || "";
    const user = localStorage.getItem("userUsername") || "";
    const tabGuardada = localStorage.getItem("adminTabActiva") as any;

    setRolUsuarioActual(role);
    setSlugAsignado(slug);
    setNombreSesion(name);
    setUsernameSesion(user);

    if (tabGuardada) {
      setTabActiva(tabGuardada);
    }

    // Restaurar eventos guardados
    const eventosGuardados = localStorage.getItem("app_eventos_lista");
    if (eventosGuardados) {
      try {
        const parsed = JSON.parse(eventosGuardados);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEventos(parsed);
          setEventoSeleccionadoId(parsed[0].id);
        }
      } catch (err) {
        console.error("Error al parsear eventos:", err);
      }
    }

    // Restaurar usuarios guardados
    const usuariosGuardados = localStorage.getItem("app_usuarios_lista");
    if (usuariosGuardados) {
      try {
        const parsedUsers = JSON.parse(usuariosGuardados);
        if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
          setUsuarios(parsedUsers);
        }
      } catch (err) {
        console.error("Error al parsear usuarios:", err);
      }
    }

    setCargandoSesion(false);
  }, []);

  // GUARDAR EVENTOS EN LOCALSTORAGE AUTOMÁTICAMENTE
  const actualizarEventos = (nuevosEventos: EventItem[]) => {
    setEventos(nuevosEventos);
    localStorage.setItem("app_eventos_lista", JSON.stringify(nuevosEventos));
  };

  // GUARDAR USUARIOS EN LOCALSTORAGE AUTOMÁTICAMENTE
  const actualizarUsuarios = (nuevosUsuarios: UserItem[]) => {
    setUsuarios(nuevosUsuarios);
    localStorage.setItem("app_usuarios_lista", JSON.stringify(nuevosUsuarios));
  };

  const cambiarTab = (
    tab: "eventos" | "disenador" | "respuestas" | "colaboradores"
  ) => {
    setTabActiva(tab);
    localStorage.setItem("adminTabActiva", tab);
  };

  // Modal de Evento
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

  // Diseñador de Preguntas
  const [nuevaPreguntaLabel, setNuevaPreguntaLabel] = useState("");
  const [nuevaPreguntaTipo, setNuevaPreguntaTipo] = useState<QuestionType>("text");
  const [nuevaPreguntaOpciones, setNuevaPreguntaOpciones] = useState("");
  const [nuevaPreguntaRequerida, setNuevaPreguntaRequerida] = useState(true);

  // Formulario Colaboradores
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoUsername, setNuevoUsername] = useState("");
  const [nuevoWhatsapp, setNuevoWhatsapp] = useState("");
  const [nuevoPassword, setNuevoPassword] = useState("");
  const [nuevoRol, setNuevoRol] = useState<"ADMINISTRADOR" | "CLIENTE">("CLIENTE");
  const [nuevoEventoSlug, setNuevoEventoSlug] = useState("todos");
  const [nuevoActivo, setNuevoActivo] = useState(true);
  const [usuarioEditandoId, setUsuarioEditandoId] = useState<string | null>(null);

  const [respuestas, setRespuestas] = useState<any[]>([]);

  const eventosVisibles = eventos.filter((e) => {
    if (rolUsuarioActual === "ADMINISTRADOR" || slugAsignado === "todos") {
      return true;
    }

    const userSesionLwr = (usernameSesion || "").toLowerCase().trim();
    const nombreSesionLwr = (nombreSesion || "").toLowerCase().trim();
    const ownerLwr = (e.ownerUsername || "").toLowerCase().trim();

    const esDuenio =
      ownerLwr === "" ||
      ownerLwr === userSesionLwr ||
      ownerLwr === nombreSesionLwr;

    const coincideSlug =
      slugAsignado &&
      slugAsignado !== "todos" &&
      e.slug.toLowerCase() === slugAsignado.toLowerCase();

    return esDuenio || coincideSlug;
  });

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
        if (data.data?.questions) {
          const actualizados = eventos.map((e) =>
            e.id === eventoActual.id ? { ...e, questions: data.data.questions } : e
          );
          setEventos(actualizados);
          localStorage.setItem("app_eventos_lista", JSON.stringify(actualizados));
        }
      })
      .catch((err) => console.error("Error al cargar datos del evento:", err));
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
    setModalWhatsapp("5218116122704");
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
    
    const planEv = ev.plan || "PLUS";
    setModalPlan(planEv);
    setModalWhatsapp(ev.whatsappPhone || "5218116122704");
    setModalPases(planEv === "BASICO" ? 0 : ev.pasesAsignados || 2);
    setModalActive(ev.active);
    setMostrarModalEvento(true);
  };

  const handleGuardarEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle || !modalSlug) return;

    const pasesFinales = modalPlan === "BASICO" ? 0 : Number(modalPases);

    const eventoData = {
      title: modalTitle,
      slug: modalSlug,
      targetDate: modalDate,
      plan: modalPlan,
      whatsappPhone: modalWhatsapp,
      pasesAsignados: pasesFinales,
      active: modalActive,
      ownerUsername: usernameSesion || nombreSesion || "cliente",
      questions: editandoEventoId ? (eventoActual?.questions || []) : [],
    };

    try {
      await fetch("/api/form-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          event: modalSlug, 
          config: {
            ...eventoData,
            plan: modalPlan,
          } 
        }),
      });
    } catch (error) {
      console.error("Error guardando en API:", error);
    }

    let listaActualizada: EventItem[];

    if (editandoEventoId) {
      listaActualizada = eventos.map((ev) =>
        ev.id === editandoEventoId 
          ? { ...ev, ...eventoData, id: editandoEventoId, plan: modalPlan } 
          : ev
      );
    } else {
      const nuevo: EventItem = {
        id: Date.now().toString(),
        ...eventoData,
        plan: modalPlan,
        questions: [],
      };
      listaActualizada = [...eventos, nuevo];
      setEventoSeleccionadoId(nuevo.id);
    }

    actualizarEventos(listaActualizada);
    setMostrarModalEvento(false);
  };

  const handleEliminarEvento = (id: string) => {
    const filtrados = eventos.filter((e) => e.id !== id);
    actualizarEventos(filtrados);
    if (eventoSeleccionadoId === id && filtrados.length > 0) {
      setEventoSeleccionadoId(filtrados[0].id);
    }
  };

  const abrirDemoLink = (slug: string) => {
    window.open(`/${slug}`, "_blank");
  };

  const abrirPasesLink = (slug: string, pases: number = 2) => {
    window.open(`/${slug}?pases=${pases}`, "_blank");
  };

  const abrirPortalLink = (slug: string) => {
    window.open(`/respuestas/${slug}`, "_blank");
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
    link.setAttribute("download", `Lista_Invitados_${eventoActual?.slug || "evento"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const guardarPreguntasEnServidor = async (targetSlug: string, nuevasPreguntas: Question[]) => {
    setGuardandoConfig(true);
    const evTarget = eventos.find((e) => e.slug === targetSlug) || eventoActual;

    try {
      await fetch("/api/form-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: targetSlug,
          config: {
            ...evTarget,
            questions: nuevasPreguntas,
          },
        }),
      });
    } catch (err) {
      console.error("Error guardando preguntas:", err);
    } finally {
      setGuardandoConfig(false);
    }
  };

  const handleAgregarPregunta = async (e: React.FormEvent) => {
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

    const actualizadas = [...(eventoActual.questions || []), nuevaQ];

    const listaActualizada = eventos.map((ev) =>
      ev.id === eventoActual.id ? { ...ev, questions: actualizadas } : ev
    );

    actualizarEventos(listaActualizada);

    setNuevaPreguntaLabel("");
    setNuevaPreguntaOpciones("");
    setNuevaPreguntaRequerida(true);

    await guardarPreguntasEnServidor(eventoActual.slug, actualizadas);
  };

  const handleEliminarPregunta = async (qId: string) => {
    if (!eventoActual) return;
    const actualizadas = (eventoActual.questions || []).filter((q) => q.id !== qId);

    const listaActualizada = eventos.map((ev) =>
      ev.id === eventoActual.id ? { ...ev, questions: actualizadas } : ev
    );

    actualizarEventos(listaActualizada);

    await guardarPreguntasEnServidor(eventoActual.slug, actualizadas);
  };

  const handleAplicarPreset = async (preset: TemplatePreset) => {
    if (!eventoActual) return;

    const listaActualizada = eventos.map((ev) =>
      ev.id === eventoActual.id ? { ...ev, questions: preset.questions } : ev
    );

    actualizarEventos(listaActualizada);

    await guardarPreguntasEnServidor(eventoActual.slug, preset.questions);
    setMostrarModalPlantillas(false);
    alert(`¡Plantilla "${preset.title}" aplicada con éxito a ${eventoActual.title}!`);
  };

  const handleCompartirMiPlantilla = () => {
    if (!eventoActual || !eventoActual.questions || eventoActual.questions.length === 0) {
      alert("Tu plantilla actual está vacía. Agrega al menos una pregunta para compartirla.");
      return;
    }

    const nuevaPlantillaCompartida: TemplatePreset = {
      id: `preset-user-${Date.now()}`,
      title: `✨ Plantilla de ${eventoActual.title}`,
      category: "Comunidad",
      description: `Creada por @${usernameSesion || "usuario"} (${eventoActual.questions.length} preguntas)`,
      author: usernameSesion || "Cliente",
      questions: eventoActual.questions,
    };

    setPlantillasComunidad((prev) => [nuevaPlantillaCompartida, ...prev]);
    alert("¡Tu plantilla ha sido publicada en el Panel Muestra!");
  };

  const handleDuplicarPlantillaAEvento = async () => {
    if (!eventoActual || !eventoDestinoSlug) {
      alert("Por favor selecciona un evento destino para copiar la plantilla.");
      return;
    }

    const preguntasCopiar = eventoActual.questions || [];

    const listaActualizada = eventos.map((ev) =>
      ev.slug === eventoDestinoSlug ? { ...ev, questions: preguntasCopiar } : ev
    );

    actualizarEventos(listaActualizada);

    await guardarPreguntasEnServidor(eventoDestinoSlug, preguntasCopiar);
    alert(`¡Plantilla duplicada con éxito hacia el evento /${eventoDestinoSlug}!`);
    setEventoDestinoSlug("");
  };

  const handleLimpiarPreguntas = async () => {
    if (!eventoActual) return;
    if (!confirm("¿Seguro que deseas eliminar todas las preguntas de este evento y dejarlo en blanco?")) {
      return;
    }

    const listaActualizada = eventos.map((ev) =>
      ev.id === eventoActual.id ? { ...ev, questions: [] } : ev
    );

    actualizarEventos(listaActualizada);

    await guardarPreguntasEnServidor(eventoActual.slug, []);
  };

  const handleGuardarUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre || !nuevoWhatsapp) return;

    let nuevaLista: UserItem[];

    if (usuarioEditandoId) {
      nuevaLista = usuarios.map((u) =>
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
      );
    } else {
      nuevaLista = [
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
      ];
    }

    actualizarUsuarios(nuevaLista);
    limpiarFormularioUsuario();
  };

  const limpiarFormularioUsuario = () => {
    setUsuarioEditandoId(null);
    setNuevoNombre("");
    setNuevoUsername("");
    setNuevoWhatsapp("");
    setNuevoPassword("");
    setNuevoRol("CLIENTE");
    setNuevoEventoSlug("todos");
    setNuevoActivo(true);
  };

  const handleEditarUsuario = (u: UserItem) => {
    setUsuarioEditandoId(u.id);
    setNuevoNombre(u.nombre);
    setNuevoUsername(u.username || "");
    setNuevoWhatsapp(u.whatsapp || "");
    setNuevoPassword(u.password || "");
    setNuevoRol(u.rol);
    setNuevoEventoSlug(u.eventoAsignadoSlug || "todos");
    setNuevoActivo(u.activo);
  };

  const handleTogglePasswordVisibilidad = (id: string) => {
    setMostrarPasswordIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleToggleEstadoUsuario = (id: string) => {
    const nuevaLista = usuarios.map((u) =>
      u.id === id ? { ...u, activo: !u.activo } : u
    );
    actualizarUsuarios(nuevaLista);
  };

  const handleEliminarUsuario = (id: string) => {
    const nuevaLista = usuarios.filter((u) => u.id !== id);
    actualizarUsuarios(nuevaLista);
  };

  const enviarAccesosPorWhatsapp = (u: UserItem) => {
    const numeroLimpio = String(u.whatsapp).replace(/\D/g, "");
    if (!numeroLimpio) {
      alert("Por favor asigna un número de WhatsApp válido para este cliente.");
      return;
    }

    const loginUrl = `${window.location.origin}/login`;
    const texto =
      `¡Hola ${u.nombre}! 👋\n\n` +
      `Tus credenciales de acceso al Panel Multievento están activas:\n\n` +
      `🌐 *Enlace de Inicio:* ${loginUrl}\n` +
      `👤 *Usuario:* ${u.username}\n` +
      `🔑 *Contraseña:* ${u.password || "123456"}\n\n` +
      `¡Podrás crear, editar y consultar todas tus invitaciones en un solo lugar! ✨`;

    const url = `https://api.whatsapp.com/send?phone=${numeroLimpio}&text=${encodeURIComponent(
      texto
    )}`;
    window.open(url, "_blank");
  };

  if (cargandoSesion) {
    return (
      <div className="min-h-screen bg-[#0d1527] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-amber-500 font-bold tracking-widest uppercase">
          Cargando Panel...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1527] text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER PRINCIPAL */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-amber-500 tracking-tight">
              Plataforma de Gestión de Eventos
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Bienvenido{" "}
              <span className="text-amber-400 font-bold">
                {nombreSesion || usernameSesion || "Usuario"}
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
              📁 Mis Eventos ({eventosVisibles.length})
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

        {/* SELECTOR GLOBAL DE EVENTO ACTIVO */}
        {eventosVisibles.length > 0 && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-400">
              📌 Evento actualmente seleccionado para Diseñador / Respuestas:
            </span>
            <select
              value={eventoSeleccionadoId}
              onChange={(e) => setEventoSeleccionadoId(e.target.value)}
              className="bg-slate-900 border border-amber-500/40 text-amber-400 font-bold text-xs rounded-lg px-3 py-1.5 focus:outline-none w-full md:w-auto"
            >
              {eventosVisibles.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} (/{ev.slug})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* PESTAÑA 1: EVENTOS */}
        {tabActiva === "eventos" && (
          <div className="bg-[#121c33] border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xs font-black text-amber-500 uppercase tracking-wider">
                  📁 CATÁLOGO COMPLETO DE EVENTOS
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Gestiona, crea y filtra todos tus eventos disponibles.
                </p>
              </div>

              <button
                onClick={abrirModalCrear}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer whitespace-nowrap"
              >
                + Crear Nuevo Evento
              </button>
            </div>

            {/* BÚSQUEDA Y FILTROS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="🔍 Buscar evento por nombre o URL slug..."
                value={busquedaEvento}
                onChange={(e) => setBusquedaEvento(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-amber-400 font-bold focus:outline-none"
              >
                <option value="todos">Todos los Estados (Activos e Inactivos)</option>
                <option value="activos">Solo Eventos Activos</option>
                <option value="inactivos">Solo Eventos Inactivos</option>
              </select>
              <div className="text-xs text-slate-400 flex items-center justify-end font-semibold">
                Mostrando {eventosFiltrados.length} de {eventosVisibles.length} eventos
              </div>
            </div>

            {/* TARJETAS DE EVENTOS */}
            {eventosFiltrados.length === 0 ? (
              <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 space-y-3">
                <p className="text-slate-400 text-xs">No hay eventos para mostrar aún.</p>
                <button
                  onClick={abrirModalCrear}
                  className="bg-amber-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                >
                  + Crear Tu Primer Evento
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventosFiltrados.map((ev) => (
                  <div
                    key={ev.id}
                    className={`bg-slate-950 p-5 rounded-2xl border transition-all space-y-4 flex flex-col justify-between ${
                      ev.id === eventoSeleccionadoId
                        ? "border-amber-500/80 ring-1 ring-amber-500/20"
                        : "border-slate-800"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-sm font-bold text-slate-100">
                          {ev.title}
                        </h3>
                        <div className="flex gap-1">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {ev.plan || "PLUS"}
                          </span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {ev.active ? "ACTIVO" : "INACTIVO"}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs font-mono text-amber-400 mt-1">
                        /{ev.slug}
                      </p>

                      <div className="text-[11px] text-slate-400 mt-3 space-y-1">
                        <p>📅 Fecha: {ev.targetDate || "Sin fecha"}</p>
                        <p>🎫 Pases por defecto: {ev.plan === "BASICO" ? 0 : ev.pasesAsignados || 2}</p>
                        <p>📱 WhatsApp: {ev.whatsappPhone || "No asignado"}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-900 flex flex-col gap-2">
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => abrirDemoLink(ev.slug)}
                            className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-1.5 rounded-lg text-center truncate cursor-pointer hover:bg-amber-500/20"
                          >
                            🔗 Demo
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              abrirPasesLink(ev.slug, ev.plan === "BASICO" ? 0 : ev.pasesAsignados || 2)
                            }
                            className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1.5 rounded-lg text-center truncate cursor-pointer hover:bg-emerald-500/20"
                          >
                            🎫 Pases
                          </button>
                          <button
                            type="button"
                            onClick={() => abrirPortalLink(ev.slug)}
                            className="text-[10px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2 py-1.5 rounded-lg text-center truncate cursor-pointer hover:bg-sky-500/20"
                          >
                            📊 Portal
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-900">
                      <button
                        type="button"
                        onClick={() => setEventoSeleccionadoId(ev.id)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          ev.id === eventoSeleccionadoId
                            ? "bg-amber-500 text-slate-950 border-amber-500"
                            : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                        }`}
                      >
                        {ev.id === eventoSeleccionadoId ? "✓ Seleccionado" : "Seleccionar"}
                      </button>

                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => abrirModalEditar(ev)}
                          className="text-xs bg-slate-900 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-lg cursor-pointer hover:bg-slate-800"
                        >
                          ✏ Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEliminarEvento(ev.id)}
                          className="text-xs bg-rose-950/40 text-rose-400 border border-rose-900/50 px-2 py-1 rounded-lg cursor-pointer hover:bg-rose-900/60"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 2: DISEÑADOR */}
        {tabActiva === "disenador" && (
          <div className="bg-[#121c33] border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h2 className="text-xs font-black text-amber-500 uppercase tracking-wider">
                  🛠 DISEÑADOR Y PANEL MUESTRA DE PLANTILLAS
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Evento actual:{" "}
                  <span className="text-amber-400 font-bold">
                    {eventoActual?.title || "Sin selección"} (/{eventoActual?.slug})
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMostrarModalPlantillas(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all shadow-lg shadow-amber-500/20"
                >
                  ✨ Ver Panel Muestra / Plantillas
                </button>

                <button
                  type="button"
                  onClick={handleCompartirMiPlantilla}
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  🌐 Compartir mi Plantilla
                </button>

                <button
                  type="button"
                  onClick={handleLimpiarPreguntas}
                  className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/50 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  🗑 Limpiar
                </button>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-300">
                📋 Copiar esta plantilla hacia otro evento de tu catálogo:
              </span>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <select
                  value={eventoDestinoSlug}
                  onChange={(e) => setEventoDestinoSlug(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-amber-400 font-bold focus:outline-none"
                >
                  <option value="">Seleccionar evento destino...</option>
                  {eventosVisibles
                    .filter((ev) => ev.slug !== eventoActual?.slug)
                    .map((ev) => (
                      <option key={ev.id} value={ev.slug}>
                        {ev.title} (/{ev.slug})
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={handleDuplicarPlantillaAEvento}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-3.5 py-1.5 rounded-xl cursor-pointer transition-all whitespace-nowrap"
                >
                  Copiar
                </button>
              </div>
            </div>

            <form
              onSubmit={handleAgregarPregunta}
              className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4"
            >
              <h3 className="text-xs font-bold text-amber-400 uppercase">
                ➕ AGREGAR PREGUNTA O CAMPO PERSONALIZADO
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-7">
                  <input
                    type="text"
                    placeholder="Ej. Escribe tu nombre completo, alergias, ¿requieres autobús?, etc."
                    value={nuevaPreguntaLabel}
                    onChange={(e) => setNuevaPreguntaLabel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="md:col-span-5">
                  <select
                    value={nuevaPreguntaTipo}
                    onChange={(e) =>
                      setNuevaPreguntaTipo(e.target.value as QuestionType)
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-400 font-bold"
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
                  <label className="block text-[11px] text-slate-400 font-bold mb-1">
                    Opciones separadas por comas (Ej: Carne, Pollo, Vegano):
                  </label>
                  <input
                    type="text"
                    placeholder="Opción 1, Opción 2, Opción 3"
                    value={nuevaPreguntaOpciones}
                    onChange={(e) => setNuevaPreguntaOpciones(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-amber-300 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              )}

              <div className="flex justify-between items-center pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nuevaPreguntaRequerida}
                    onChange={(e) => setNuevaPreguntaRequerida(e.target.checked)}
                    className="rounded border-slate-800"
                  />
                  <span>Respuesta Obligatoria</span>
                </label>

                <button
                  type="submit"
                  disabled={guardandoConfig}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-6 py-2.5 rounded-xl cursor-pointer"
                >
                  + Agregar a la Invitación
                </button>
              </div>
            </form>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase">
                Plantilla de Preguntas de este Evento ({eventoActual?.questions?.length || 0}):
              </h4>

              {eventoActual?.questions?.length === 0 ? (
                <div className="text-center py-8 bg-slate-950/40 rounded-xl border border-dashed border-slate-800 text-xs text-slate-400 space-y-2">
                  <p className="font-bold text-slate-300">¡La plantilla de este evento está limpia!</p>
                  <p className="text-[11px]">
                    Haz clic en el botón <strong className="text-amber-400">✨ Ver Panel Muestra / Plantillas</strong> para abrir la galería por categorías.
                  </p>
                </div>
              ) : (
                eventoActual?.questions?.map((q, index) => (
                  <div
                    key={q.id}
                    className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center"
                  >
                    <div>
                      <span className="text-xs text-slate-200 font-bold">
                        {index + 1}. {q.label}
                      </span>
                      <span className="ml-2 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        {TIPO_LABELS[q.type]?.name || q.type}
                      </span>
                      {q.options && q.options.length > 0 && (
                        <p className="text-[11px] text-slate-400 mt-1">
                          Opciones: {q.options.join(" | ")}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleEliminarPregunta(q.id)}
                      disabled={guardandoConfig}
                      className="text-rose-400 hover:text-rose-300 text-xs font-bold cursor-pointer bg-rose-950/30 px-3 py-1.5 rounded-xl border border-rose-900/40"
                    >
                      🗑 Eliminar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA 3: RESPUESTAS */}
        {tabActiva === "respuestas" && (
          <div className="bg-[#121c33] border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-xs font-black text-amber-500 uppercase">
                  📊 RESPUESTAS DEL EVENTO: {eventoActual?.title}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Enlace de respuestas: /{eventoActual?.slug}
                </p>
              </div>

              <button
                type="button"
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

        {/* PESTAÑA 4: COLABORADORES */}
        {tabActiva === "colaboradores" &&
          rolUsuarioActual === "ADMINISTRADOR" && (
            <div className="bg-[#121c33] border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xs font-black text-amber-500 uppercase">
                  👥 GESTIÓN PROFESIONAL DE CLIENTES Y ACCESOS
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Alta de clientes/revendedores, edición de datos y envío de accesos directo por WhatsApp.
                </p>
              </div>

              <form
                onSubmit={handleGuardarUsuario}
                className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4"
              >
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <h3 className="text-xs font-bold text-amber-400 uppercase">
                    {usuarioEditandoId
                      ? "✏ EDITAR COLABORADOR / CLIENTE"
                      : "➕ DAR DE ALTA NUEVO COLABORADOR / CLIENTE"}
                  </h3>
                  {usuarioEditandoId && (
                    <button
                      type="button"
                      onClick={limpiarFormularioUsuario}
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-200 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 cursor-pointer"
                    >
                      ✕ Cancelar Edición
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Nombre Completo *"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Usuario Login *"
                    value={nuevoUsername}
                    onChange={(e) => setNuevoUsername(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="WhatsApp (ej. 5218115591681) *"
                    value={nuevoWhatsapp}
                    onChange={(e) => setNuevoWhatsapp(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-emerald-400 font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder={
                      usuarioEditandoId
                        ? "Nueva contraseña (opcional)"
                        : "Contraseña *"
                    }
                    value={nuevoPassword}
                    onChange={(e) => setNuevoPassword(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-emerald-400 font-mono focus:outline-none focus:border-amber-500"
                    required={!usuarioEditandoId}
                  />
                  <select
                    value={nuevoRol}
                    onChange={(e) => setNuevoRol(e.target.value as any)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="CLIENTE">
                      CLIENTE (Panel Multievento)
                    </option>
                    <option value="ADMINISTRADOR">
                      ADMINISTRADOR (Acceso Total)
                    </option>
                  </select>
                  <select
                    value={nuevoEventoSlug}
                    onChange={(e) => setNuevoEventoSlug(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-sky-400 font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="todos">🌐 Todos los eventos (Admin / Multievento)</option>
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
                    {usuarioEditandoId
                      ? "💾 Guardar Cambios"
                      : "+ Guardar Colaborador"}
                  </button>
                </div>
              </form>

              <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] bg-slate-900/60">
                      <th className="p-3">Usuario</th>
                      <th className="p-3">WhatsApp</th>
                      <th className="p-3">Contraseña</th>
                      <th className="p-3">Rol / Permiso</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {usuarios.map((u) => {
                      const verPass = Boolean(mostrarPasswordIds[u.id]);
                      return (
                        <tr key={u.id} className="hover:bg-slate-900/40">
                          <td className="p-3 font-semibold text-slate-100">
                            {u.nombre} (@{u.username})
                          </td>
                          <td className="p-3 text-emerald-400 font-mono font-bold">
                            📱 {u.whatsapp}
                          </td>

                          <td className="p-3 font-mono text-emerald-400 font-bold">
                            <div className="flex items-center gap-2">
                              <span>
                                {verPass
                                  ? u.password || "admin123"
                                  : "••••••••"}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleTogglePasswordVisibilidad(u.id)
                                }
                                className="text-slate-400 hover:text-amber-400 text-xs cursor-pointer select-none"
                              >
                                {verPass ? "🙈" : "👁️"}
                              </button>
                            </div>
                          </td>

                          <td className="p-3 text-amber-400 font-bold">
                            {u.rol} (/{u.eventoAsignadoSlug})
                          </td>
                          <td className="p-3">
                            <button
                              type="button"
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
                              type="button"
                              onClick={() => enviarAccesosPorWhatsapp(u)}
                              className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-bold cursor-pointer"
                            >
                              💬 Enviar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditarUsuario(u)}
                              className="bg-slate-900 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-lg cursor-pointer hover:bg-slate-800"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEliminarUsuario(u.id)}
                              className="bg-rose-950/40 text-rose-400 border border-rose-900/50 px-2.5 py-1 rounded-lg cursor-pointer hover:bg-rose-900/60"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
      </div>

      {/* MODAL 1: PANEL MUESTRA */}
      {mostrarModalPlantillas && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#121c33] border border-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-3xl space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-black text-amber-500 uppercase tracking-wider">
                  ✨ GALERÍA Y PANEL MUESTRA DE PLANTILLAS
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Selecciona una plantilla para aplicar en{" "}
                  <strong className="text-amber-400">{eventoActual?.title}</strong>.
                </p>
              </div>
              <button
                onClick={() => setMostrarModalPlantillas(false)}
                className="text-slate-400 hover:text-slate-100 text-sm font-bold bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 cursor-pointer"
              >
                ✕ Cerrar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plantillasComunidad.map((preset) => (
                <div
                  key={preset.id}
                  className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-slate-100">{preset.title}</h4>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {preset.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{preset.description}</p>
                    <p className="text-[10px] text-slate-500 italic">Por: {preset.author}</p>

                    <div className="pt-2 border-t border-slate-900 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Incluye {preset.questions.length} preguntas:
                      </span>
                      {preset.questions.map((q, i) => (
                        <p key={i} className="text-[11px] text-slate-300 truncate">
                          • {q.label}
                        </p>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAplicarPreset(preset)}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/10"
                  >
                    Usar esta Plantilla →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CREAR / EDITAR EVENTO */}
      {mostrarModalEvento && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#121c33] border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-amber-500 uppercase tracking-wider">
              {editandoEventoId ? "✏ EDITAR EVENTO" : "➕ CREAR NUEVO EVENTO"}
            </h3>

            <form onSubmit={handleGuardarEvento} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Nombre del Evento *
                </label>
                <input
                  type="text"
                  value={modalTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Ej. Boda Yunnie y Juan"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Slug URL (ej. boda-maria) *
                </label>
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
                  <label className="block text-slate-400 font-bold mb-1">
                    Plan Contratado
                  </label>
                  <select
                    value={modalPlan}
                    onChange={(e) => {
                      const nuevoPlan = e.target.value as PlanType;
                      setModalPlan(nuevoPlan);
                      if (nuevoPlan === "BASICO") {
                        setModalPases(0);
                      } else if (modalPases === 0) {
                        setModalPases(2);
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="BASICO">BÁSICO</option>
                    <option value="PLUS">PLUS</option>
                    <option value="PREMIUM">PREMIUM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    Pases Asignados x Defecto
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={modalPlan === "BASICO" ? 0 : modalPases}
                    disabled={modalPlan === "BASICO"}
                    onChange={(e) => setModalPases(Number(e.target.value))}
                    className={`w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none ${
                      modalPlan === "BASICO"
                        ? "opacity-50 cursor-not-allowed bg-slate-950 text-slate-500"
                        : "focus:border-amber-500"
                    }`}
                  />
                  {modalPlan === "BASICO" && (
                    <span className="text-[10px] text-amber-400/90 font-medium mt-1 block">
                      🚫 Sin pases en Plan Básico (Confirmación directa a WhatsApp)
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    Fecha del Evento
                  </label>
                  <input
                    type="date"
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
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
                    placeholder="5218116122704"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setMostrarModalEvento(false)}
                  className="bg-slate-800 text-slate-300 font-bold px-4 py-2 rounded-xl cursor-pointer hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-5 py-2 rounded-xl cursor-pointer"
                >
                  Guardar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}