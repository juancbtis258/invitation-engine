"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface UserItem {
  id: string;
  nombre: string;
  username: string;
  whatsapp: string;
  password?: string;
  rol: "ADMINISTRADOR" | "CLIENTE";
  eventoAsignadoSlug?: string;
  activo: boolean;
  createdAt?: string;
}

export interface EventoItem {
  id: string;
  nombre: string;
  slug: string;
  fecha: string;
  pasesDefault: number;
  whatsapp: string;
  plan: "BASICO" | "PLUS" | "PREMIUM";
  activo: boolean;
}

export interface ResponseItem {
  id: string;
  eventSlug?: string;
  nombre?: string;
  whatsapp?: string;
  asistira?: boolean;
  pasesConfirmados?: number;
  asistentes?: string[];
  mensaje?: string;
}

export default function AdminPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState<boolean>(false);
  const [rolUsuarioActual, setRolUsuarioActual] = useState<"ADMINISTRADOR" | "CLIENTE">("ADMINISTRADOR");
  const [slugAsignado, setSlugAsignado] = useState<string>("todos");
  const [nombreSesion, setNombreSesion] = useState<string>("");
  const [cargandoSesion, setCargandoSesion] = useState<boolean>(true);
  const [tabActiva, setTabActiva] = useState<"respuestas" | "eventos" | "colaboradores">("eventos");

  const [eventos, setEventos] = useState<EventoItem[]>([]);
  const [usuarios, setUsuarios] = useState<UserItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [respuestas, setRespuestas] = useState<ResponseItem[]>([]);

  const [busquedaEvento, setBusquedaEvento] = useState<string>("");
  const [filtroEstadoEvento, setFiltroEstadoEvento] = useState<"todos" | "activos" | "inactivos">("todos");

  const [modalEventoAbierto, setModalEventoAbierto] = useState<boolean>(false);
  const [eventoEditandoId, setEventoEditandoId] = useState<string | null>(null);
  const [nombreEventoForm, setNombreEventoForm] = useState<string>("");
  const [slugEventoForm, setSlugEventoForm] = useState<string>("");
  const [fechaEventoForm, setFechaEventoForm] = useState<string>("");
  const [pasesEventoForm, setPasesEventoForm] = useState<number>(2);
  const [whatsappEventoForm, setWhatsappEventoForm] = useState<string>("");
  const [planEventoForm, setPlanEventoForm] = useState<"BASICO" | "PLUS" | "PREMIUM">("PLUS");
  const [activoEventoForm, setActivoEventoForm] = useState<boolean>(true);

  const [usuarioEditandoId, setUsuarioEditandoId] = useState<string | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState<string>("");
  const [nuevoUsername, setNuevoUsername] = useState<string>("");
  const [nuevoWhatsapp, setNuevoWhatsapp] = useState<string>("");
  const [nuevoPassword, setNuevoPassword] = useState<string>("");
  const [nuevoRol, setNuevoRol] = useState<"ADMINISTRADOR" | "CLIENTE">("CLIENTE");
  const [nuevoEventoSlug, setNuevoEventoSlug] = useState<string>("todos");
  const [nuevoActivo, setNuevoActivo] = useState<boolean>(true);

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  useEffect(() => {
    setMounted(true);

    if (typeof window !== "undefined") {
      const role = (localStorage.getItem("userRole") as "ADMINISTRADOR" | "CLIENTE") || "ADMINISTRADOR";
      const slug = localStorage.getItem("userSlug") || "todos";
      const name = localStorage.getItem("userName") || "Alejandro Mejía";

      setRolUsuarioActual(role);
      setSlugAsignado(slug);
      setNombreSesion(name);

      const eventosGuardados = localStorage.getItem("app_eventos_lista");
      if (eventosGuardados) {
        try {
          const parsed = JSON.parse(eventosGuardados);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setEventos(parsed);
            setSelectedSlug(parsed[0].slug);
          } else {
            cargarEventoDemo();
          }
        } catch (err) {
          cargarEventoDemo();
        }
      } else {
        cargarEventoDemo();
      }

      const usuariosGuardados = localStorage.getItem("app_usuarios_lista");
      if (usuariosGuardados) {
        try {
          const parsedUsers = JSON.parse(usuariosGuardados);
          if (Array.isArray(parsedUsers)) setUsuarios(parsedUsers);
        } catch (err) {}
      }

      cargarRespuestasLocales();
    }
    setCargandoSesion(false);
  }, []);

  const cargarEventoDemo = () => {
    const demo: EventoItem[] = [
      {
        id: "1",
        nombre: "Yunnie y Juan",
        slug: "yunnie-y-juan",
        fecha: "2026-09-21",
        pasesDefault: 2,
        whatsapp: "5218116122704",
        plan: "PLUS",
        activo: true,
      },
    ];
    setEventos(demo);
    if (typeof window !== "undefined") {
      localStorage.setItem("app_eventos_lista", JSON.stringify(demo));
    }
    setSelectedSlug("yunnie-y-juan");
  };

  const cargarRespuestasLocales = () => {
    if (typeof window === "undefined") return;
    try {
      const local = localStorage.getItem("app_respuestas_lista");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          setRespuestas(
            parsed.map((r, idx) => ({
              id: r.id || `local-${idx}`,
              eventSlug: r.eventSlug || r.slug || "todos",
              nombre: r.name || r.nombre || "Sin Nombre",
              whatsapp: r.phone || r.whatsapp || "-",
              asistira: r.attending !== undefined ? Boolean(r.attending) : Boolean(r.asistira),
              pasesConfirmados: r.pasesConfirmados ? Number(r.pasesConfirmados) : 1,
              asistentes: Array.isArray(r.asistentes) ? r.asistentes : [],
              mensaje: r.mensaje || "-",
            }))
          );
        }
      }
    } catch (e) {}
  };

  const handleCerrarSesion = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("userRole");
      localStorage.removeItem("userSlug");
      localStorage.removeItem("userName");
      localStorage.removeItem("userUsername");
    }
    router.push("/login");
  };

  const handleAbrirModalNuevo = () => {
    setEventoEditandoId(null);
    setNombreEventoForm("");
    setSlugEventoForm("");
    setFechaEventoForm(new Date().toISOString().split("T")[0]);
    setPasesEventoForm(2);
    setWhatsappEventoForm("");
    setPlanEventoForm("PLUS");
    setActivoEventoForm(true);
    setModalEventoAbierto(true);
  };

  const handleAbrirModalEditar = (e: EventoItem) => {
    setEventoEditandoId(e.id);
    setNombreEventoForm(e.nombre);
    setSlugEventoForm(e.slug);
    setFechaEventoForm(e.fecha || "");
    setPasesEventoForm(e.pasesDefault || 2);
    setWhatsappEventoForm(e.whatsapp || "");
    setPlanEventoForm(e.plan || "PLUS");
    setActivoEventoForm(e.activo ?? true);
    setModalEventoAbierto(true);
  };

  const handleGuardarEvento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreEventoForm.trim()) return;

    const slugFinal = slugEventoForm.trim() ? generateSlug(slugEventoForm) : generateSlug(nombreEventoForm);

    let nuevaLista: EventoItem[];

    if (eventoEditandoId) {
      nuevaLista = eventos.map((evt) =>
        evt.id === eventoEditandoId
          ? {
              ...evt,
              nombre: nombreEventoForm,
              slug: slugFinal,
              fecha: fechaEventoForm,
              pasesDefault: Number(pasesEventoForm),
              whatsapp: whatsappEventoForm,
              plan: planEventoForm,
              activo: activoEventoForm,
            }
          : evt
      );
    } else {
      const nuevoEvento: EventoItem = {
        id: Date.now().toString(),
        nombre: nombreEventoForm,
        slug: slugFinal,
        fecha: fechaEventoForm,
        pasesDefault: Number(pasesEventoForm),
        whatsapp: whatsappEventoForm,
        plan: planEventoForm,
        activo: activoEventoForm,
      };
      nuevaLista = [...eventos, nuevoEvento];
    }

    setEventos(nuevaLista);
    if (typeof window !== "undefined") {
      localStorage.setItem("app_eventos_lista", JSON.stringify(nuevaLista));
    }
    setModalEventoAbierto(false);
  };

  const handleEliminarEvento = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este evento?")) {
      const nuevaLista = eventos.filter((e) => e.id !== id);
      setEventos(nuevaLista);
      if (typeof window !== "undefined") {
        localStorage.setItem("app_eventos_lista", JSON.stringify(nuevaLista));
      }
    }
  };

  const actualizarUsuarios = (nuevaLista: UserItem[]) => {
    setUsuarios(nuevaLista);
    if (typeof window !== "undefined") {
      localStorage.setItem("app_usuarios_lista", JSON.stringify(nuevaLista));
    }
  };

  const handleGuardarUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;

    const usernameGenerado = nuevoUsername.trim() || generateSlug(nuevoNombre);
    const passwordGenerada = nuevoPassword.trim() || (usuarioEditandoId ? "" : "123456");

    let nuevaLista: UserItem[];

    if (usuarioEditandoId) {
      nuevaLista = usuarios.map((u) =>
        u.id === usuarioEditandoId
          ? {
              ...u,
              nombre: nuevoNombre,
              username: usernameGenerado,
              whatsapp: nuevoWhatsapp,
              password: nuevoPassword ? nuevoPassword : u.password,
              rol: nuevoRol,
              eventoAsignadoSlug: nuevoEventoSlug,
              activo: nuevoActivo,
            }
          : u
      );
    } else {
      const nuevoUsuario: UserItem = {
        id: Date.now().toString(),
        nombre: nuevoNombre,
        username: usernameGenerado,
        whatsapp: nuevoWhatsapp,
        password: passwordGenerada,
        rol: nuevoRol,
        eventoAsignadoSlug: nuevoEventoSlug,
        activo: nuevoActivo,
        createdAt: new Date().toISOString().split("T")[0],
      };
      nuevaLista = [...usuarios, nuevoUsuario];
    }

    actualizarUsuarios(nuevaLista);
    setUsuarioEditandoId(null);
    setNuevoNombre("");
    setNuevoUsername("");
    setNuevoWhatsapp("");
    setNuevoPassword("");
  };

  const handleDescargarCSV = () => {
    const filtradas = selectedSlug
      ? respuestas.filter((r) => r.eventSlug?.toLowerCase() === selectedSlug.toLowerCase())
      : respuestas;

    if (filtradas.length === 0) {
      alert("No hay respuestas para exportar.");
      return;
    }

    const headers = ["ID", "Evento", "Nombre", "WhatsApp", "Asistirá", "Pases", "Mensaje"];
    const rows = filtradas.map((r) => [
      r.id,
      r.eventSlug || selectedSlug || "General",
      `"${r.nombre || ""}"`,
      `"${r.whatsapp || ""}"`,
      r.asistira ? "Sí" : "No",
      r.pasesConfirmados || 1,
      `"${(r.mensaje || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `respuestas_${selectedSlug || "todos"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!mounted || cargandoSesion) {
    return (
      <div className="min-h-screen bg-[#060a12] flex items-center justify-center text-amber-500 font-bold text-sm">
        Cargando Panel...
      </div>
    );
  }

  const eventosFiltrados = eventos.filter((e) => {
    const coincideTexto =
      e.nombre.toLowerCase().includes(busquedaEvento.toLowerCase()) ||
      e.slug.toLowerCase().includes(busquedaEvento.toLowerCase());
    const coincideEstado =
      filtroEstadoEvento === "todos" ? true : filtroEstadoEvento === "activos" ? e.activo : !e.activo;
    return coincideTexto && coincideEstado;
  });

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 p-4 sm:p-6 space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0a101f] p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-lg font-black text-amber-500 uppercase tracking-wide">PANEL ADMINISTRATIVO</h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Sesión: <span className="text-slate-200 font-bold">{nombreSesion}</span> ({rolUsuarioActual}) - Slug: {slugAsignado}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTabActiva("respuestas")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              tabActiva === "respuestas" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            📋 Respuestas
          </button>
          {rolUsuarioActual === "ADMINISTRADOR" && (
            <>
              <button
                onClick={() => setTabActiva("eventos")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  tabActiva === "eventos" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                🎉 Eventos
              </button>
              <button
                onClick={() => setTabActiva("colaboradores")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  tabActiva === "colaboradores" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                👥 Colaboradores
              </button>
            </>
          )}

          <button
            onClick={handleCerrarSesion}
            className="bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition shadow"
          >
            🚪 Salir
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {tabActiva === "eventos" && (
          <div className="bg-[#0a101f] p-6 rounded-2xl border border-slate-800/80 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-base font-black text-amber-500 uppercase tracking-wide flex items-center gap-2">
                  📁 CATÁLOGO COMPLETO DE EVENTOS
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Gestiona, crea y filtra todos tus eventos disponibles.</p>
              </div>

              <button
                onClick={handleAbrirModalNuevo}
                className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-5 py-2.5 rounded-xl text-xs transition shadow-lg flex items-center gap-1"
              >
                + Crear Nuevo Evento
              </button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={busquedaEvento}
                    onChange={(e) => setBusquedaEvento(e.target.value)}
                    placeholder="🔍 Buscar evento por nombre o URL slug..."
                    className="w-full bg-[#050811] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-amber-500"
                  />
                </div>

                <select
                  value={filtroEstadoEvento}
                  onChange={(e) => setFiltroEstadoEvento(e.target.value as any)}
                  className="bg-[#050811] border border-slate-800 text-amber-400 text-xs font-bold rounded-xl px-3 py-2.5 outline-none"
                >
                  <option value="todos">Todos los Estados</option>
                  <option value="activos">Solo Activos</option>
                  <option value="inactivos">Solo Inactivos</option>
                </select>
              </div>

              <span className="text-xs text-slate-400 font-mono">
                Mostrando {eventosFiltrados.length} de {eventos.length} eventos
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {eventosFiltrados.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-[#050811] border border-amber-500/80 rounded-2xl p-5 shadow-lg relative flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-black text-white">{evt.nombre}</h3>
                        <p className="text-xs text-amber-400 font-mono">/{evt.slug}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black px-2 py-0.5 rounded-md">
                          {evt.plan || "PLUS"}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                            evt.activo
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {evt.activo ? "ACTIVO" : "INACTIVO"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1 text-xs text-slate-300 font-mono">
                      <p className="flex items-center gap-1.5">📅 Fecha: {evt.fecha || "No definida"}</p>
                      <p className="flex items-center gap-1.5">🎟️ Pases por defecto: {evt.pasesDefault || 2}</p>
                      <p className="flex items-center gap-1.5">📱 WhatsApp: {evt.whatsapp || "No asignado"}</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="grid grid-cols-3 gap-2">
                      <a
                        href={`/${evt.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 text-center py-1.5 rounded-lg text-xs font-bold transition"
                      >
                        🔗 Demo
                      </a>
                      <button
                        onClick={() => {
                          setSelectedSlug(evt.slug);
                          setTabActiva("respuestas");
                        }}
                        className="bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-800/80 text-center py-1.5 rounded-lg text-xs font-bold transition"
                      >
                        🎟️ Pases
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSlug(evt.slug);
                          setTabActiva("respuestas");
                        }}
                        className="bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-800/80 text-center py-1.5 rounded-lg text-xs font-bold transition"
                      >
                        📊 Portal
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        onClick={() => setSelectedSlug(evt.slug)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${
                          selectedSlug === evt.slug
                            ? "bg-amber-500 text-black border-amber-500 font-extrabold"
                            : "bg-slate-900 text-slate-300 border-slate-800"
                        }`}
                      >
                        {selectedSlug === evt.slug ? "✓ Seleccionado" : "Seleccionar"}
                      </button>

                      <button
                        onClick={() => handleAbrirModalEditar(evt)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700"
                      >
                        ✏️ Editar
                      </button>

                      <button
                        onClick={() => handleEliminarEvento(evt.id)}
                        className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 px-2.5 py-1.5 rounded-lg text-xs border border-rose-900/50"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tabActiva === "respuestas" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#0a101f] p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-amber-500 font-bold text-xs uppercase">FILTRAR EVENTO:</span>
                <select
                  value={selectedSlug}
                  onChange={(e) => setSelectedSlug(e.target.value)}
                  className="bg-[#050811] border border-slate-800 text-amber-400 font-bold text-xs rounded-xl p-2.5 outline-none"
                >
                  <option value="">Todos los eventos</option>
                  {eventos.map((e) => (
                    <option key={e.id} value={e.slug}>
                      {e.nombre} ({e.slug})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleDescargarCSV}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs transition shadow-md"
              >
                📥 Descargar Respuestas (CSV)
              </button>
            </div>

            <div className="bg-[#0a101f] rounded-2xl border border-slate-800 p-6">
              <h2 className="text-base font-black text-white uppercase tracking-wide mb-4">
                Panel de Respuestas / Confirmaciones
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase">
                      <th className="p-3">Nombre</th>
                      <th className="p-3">WhatsApp</th>
                      <th className="p-3">Asistencia</th>
                      <th className="p-3">Pases</th>
                      <th className="p-3">Mensaje / Respuestas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {respuestas
                      .filter((r) => (!selectedSlug ? true : r.eventSlug?.toLowerCase() === selectedSlug.toLowerCase()))
                      .map((r) => (
                        <tr key={r.id}>
                          <td className="p-3 font-bold text-white">{r.nombre}</td>
                          <td className="p-3 text-slate-400 font-mono text-xs">{r.whatsapp}</td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                r.asistira ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                              }`}
                            >
                              {r.asistira ? "Sí asistirá" : "No asistirá"}
                            </span>
                          </td>
                          <td className="p-3 text-amber-500 font-bold">{r.asistira ? r.pasesConfirmados : 0}</td>
                          <td className="p-3 text-slate-300 text-xs">{r.mensaje}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tabActiva === "colaboradores" && rolUsuarioActual === "ADMINISTRADOR" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-[#0a101f] p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <h2 className="text-base font-black text-amber-500 uppercase tracking-wide">
                {usuarioEditandoId ? "✏️ Editar Colaborador" : "➕ Crear Nuevo Colaborador"}
              </h2>

              <form onSubmit={handleGuardarUsuario} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    className="w-full bg-[#050811] border border-slate-800 rounded-xl p-2.5 text-xs text-white mt-1 outline-none focus:border-amber-500"
                    placeholder="Ej. María López"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={nuevoWhatsapp}
                    onChange={(e) => setNuevoWhatsapp(e.target.value)}
                    className="w-full bg-[#050811] border border-slate-800 rounded-xl p-2.5 text-xs text-white mt-1 outline-none focus:border-amber-500"
                    placeholder="+52 1 55 1234 5678"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Contraseña</label>
                  <input
                    type="password"
                    value={nuevoPassword}
                    onChange={(e) => setNuevoPassword(e.target.value)}
                    className="w-full bg-[#050811] border border-slate-800 rounded-xl p-2.5 text-xs text-white mt-1 outline-none focus:border-amber-500"
                    placeholder="123456"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Rol de Acceso</label>
                  <select
                    value={nuevoRol}
                    onChange={(e) => setNuevoRol(e.target.value as any)}
                    className="w-full bg-[#050811] border border-slate-800 rounded-xl p-2.5 text-xs text-white mt-1 outline-none"
                  >
                    <option value="CLIENTE">CLIENTE (Acceso limitado)</option>
                    <option value="ADMINISTRADOR">ADMINISTRADOR (Acceso total)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3 rounded-xl text-xs transition shadow-lg mt-2"
                >
                  Guardar Colaborador
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-[#0a101f] p-6 rounded-2xl border border-slate-800 shadow-xl">
              <h2 className="text-base font-black text-white uppercase tracking-wide mb-4">
                Lista de Colaboradores ({usuarios.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase">
                      <th className="p-3">Nombre</th>
                      <th className="p-3">WhatsApp</th>
                      <th className="p-3">Rol</th>
                      <th className="p-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {usuarios.map((u) => (
                      <tr key={u.id}>
                        <td className="p-3 font-bold text-white">{u.nombre}</td>
                        <td className="p-3 font-mono text-slate-300">{u.whatsapp}</td>
                        <td className="p-3">
                          <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                            {u.rol}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setUsuarioEditandoId(u.id);
                              setNuevoNombre(u.nombre);
                              setNuevoWhatsapp(u.whatsapp);
                            }}
                            className="text-amber-400 hover:text-amber-300 font-bold"
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {modalEventoAbierto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0a101f] border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="text-sm font-black text-amber-500 uppercase tracking-wide flex items-center gap-2">
              ✏️ {eventoEditandoId ? "EDITAR EVENTO" : "CREAR NUEVO EVENTO"}
            </h2>

            <form onSubmit={handleGuardarEvento} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase">Nombre del Evento</label>
                <input
                  type="text"
                  required
                  value={nombreEventoForm}
                  onChange={(e) => setNombreEventoForm(e.target.value)}
                  className="w-full bg-[#050811] border border-slate-800 rounded-xl p-2.5 text-xs text-white mt-1 outline-none focus:border-amber-500"
                  placeholder="Boda María & Alejandro"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase">Slug URL (ej. boda-maria)</label>
                <input
                  type="text"
                  value={slugEventoForm}
                  onChange={(e) => setSlugEventoForm(e.target.value)}
                  className="w-full bg-[#050811] border border-slate-800 rounded-xl p-2.5 text-xs text-amber-400 font-mono mt-1 outline-none focus:border-amber-500"
                  placeholder="demo"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Fecha del Evento</label>
                  <input
                    type="date"
                    value={fechaEventoForm}
                    onChange={(e) => setFechaEventoForm(e.target.value)}
                    className="w-full bg-[#050811] border border-slate-800 rounded-xl p-2.5 text-xs text-white mt-1 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Plan Contratado</label>
                  <select
                    value={planEventoForm}
                    onChange={(e) => setPlanEventoForm(e.target.value as any)}
                    className="w-full bg-[#050811] border border-slate-800 rounded-xl p-2.5 text-xs text-amber-400 font-bold mt-1 outline-none"
                  >
                    <option value="BASICO">BÁSICO (WhatsApp Directo)</option>
                    <option value="PLUS">PLUS ($300 MXN - Panel & Exportación)</option>
                    <option value="PREMIUM">PREMIUM ($800 MXN - Gestión Assist)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase">Pases Asignados (Boletos)</label>
                <input
                  type="number"
                  min={1}
                  value={pasesEventoForm}
                  onChange={(e) => setPasesEventoForm(Number(e.target.value))}
                  className="w-full bg-[#050811] border border-slate-800 rounded-xl p-2.5 text-xs text-white mt-1 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="eventoActivo"
                  checked={activoEventoForm}
                  onChange={(e) => setActivoEventoForm(e.target.checked)}
                  className="rounded accent-amber-500 h-4 w-4"
                />
                <label htmlFor="eventoActivo" className="text-xs text-slate-300 font-medium">
                  Evento activo
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalEventoAbierto(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-5 py-2.5 rounded-xl text-xs transition shadow-lg"
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