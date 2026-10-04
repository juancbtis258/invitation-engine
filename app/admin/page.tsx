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
  id?: string;
  nombre: string;
  slug: string;
  createdAt?: string;
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

  // --- ESTADOS DE SESIÓN ---
  const [rolUsuarioActual, setRolUsuarioActual] = useState<"ADMINISTRADOR" | "CLIENTE">("ADMINISTRADOR");
  const [slugAsignado, setSlugAsignado] = useState<string>("todos");
  const [nombreSesion, setNombreSesion] = useState<string>("");
  const [cargandoSesion, setCargandoSesion] = useState<boolean>(true);
  const [tabActiva, setTabActiva] = useState<"respuestas" | "eventos" | "colaboradores">("colaboradores");

  // --- ESTADOS DE DATOS ---
  const [eventos, setEventos] = useState<EventoItem[]>([]);
  const [usuarios, setUsuarios] = useState<UserItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [respuestas, setRespuestas] = useState<ResponseItem[]>([]);

  // --- ESTADOS DE FORMULARIO USUARIO ---
  const [usuarioEditandoId, setUsuarioEditandoId] = useState<string | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState<string>("");
  const [nuevoUsername, setNuevoUsername] = useState<string>("");
  const [nuevoWhatsapp, setNuevoWhatsapp] = useState<string>("");
  const [nuevoPassword, setNuevoPassword] = useState<string>("");
  const [nuevoRol, setNuevoRol] = useState<"ADMINISTRADOR" | "CLIENTE">("CLIENTE");
  const [nuevoEventoSlug, setNuevoEventoSlug] = useState<string>("todos");
  const [nuevoActivo, setNuevoActivo] = useState<boolean>(true);

  // --- ESTADOS DE FORMULARIO EVENTO ---
  const [nombreEventoNuevo, setNombreEventoNuevo] = useState<string>("");
  const [slugEventoNuevo, setSlugEventoNuevo] = useState<string>("");

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  // --- CARGA INICIAL ---
  useEffect(() => {
    const role = (localStorage.getItem("userRole") as "ADMINISTRADOR" | "CLIENTE") || "ADMINISTRADOR";
    const slug = localStorage.getItem("userSlug") || "todos";
    const name = localStorage.getItem("userName") || "Alejandro Mejía";

    setRolUsuarioActual(role);
    setSlugAsignado(slug);
    setNombreSesion(name);

    // Cargar Eventos
    const eventosGuardados = localStorage.getItem("app_eventos_lista");
    if (eventosGuardados) {
      try {
        const parsed = JSON.parse(eventosGuardados);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEventos(parsed);
          setSelectedSlug(parsed[0].slug);
        }
      } catch (err) {}
    }

    // Cargar Usuarios
    const usuariosGuardados = localStorage.getItem("app_usuarios_lista");
    if (usuariosGuardados) {
      try {
        const parsedUsers = JSON.parse(usuariosGuardados);
        if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
          setUsuarios(parsedUsers);
        }
      } catch (err) {}
    }

    // Cargar Respuestas iniciales
    cargarRespuestasLocales();

    setCargandoSesion(false);
  }, []);

  const cargarRespuestasLocales = () => {
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

  // --- CERRAR SESIÓN ---
  const handleCerrarSesion = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userSlug");
    localStorage.removeItem("userName");
    localStorage.removeItem("userUsername");
    router.push("/login");
  };

  // --- GESTIÓN DE EVENTOS ---
  const handleCrearEvento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreEventoNuevo.trim()) {
      alert("Por favor ingresa un nombre para el evento.");
      return;
    }

    const slugFinal = slugEventoNuevo.trim() ? generateSlug(slugEventoNuevo) : generateSlug(nombreEventoNuevo);

    if (eventos.some((evt) => evt.slug === slugFinal)) {
      alert("Ya existe un evento con este slug/identificador.");
      return;
    }

    const nuevoEvento: EventoItem = {
      id: Date.now().toString(),
      nombre: nombreEventoNuevo.trim(),
      slug: slugFinal,
      createdAt: new Date().toISOString().split("T")[0],
    };

    const nuevaListaEventos = [...eventos, nuevoEvento];
    setEventos(nuevaListaEventos);
    localStorage.setItem("app_eventos_lista", JSON.stringify(nuevaListaEventos));

    if (!selectedSlug) setSelectedSlug(slugFinal);

    setNombreEventoNuevo("");
    setSlugEventoNuevo("");
    alert("¡Evento creado con éxito!");
  };

  const handleEliminarEvento = (slug: string) => {
    if (confirm("¿Estás seguro de eliminar este evento?")) {
      const nuevaLista = eventos.filter((e) => e.slug !== slug);
      setEventos(nuevaLista);
      localStorage.setItem("app_eventos_lista", JSON.stringify(nuevaLista));
    }
  };

  // --- GESTIÓN DE COLABORADORES ---
  const actualizarUsuarios = (nuevaLista: UserItem[]) => {
    setUsuarios(nuevaLista);
    localStorage.setItem("app_usuarios_lista", JSON.stringify(nuevaLista));
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

  const handleGuardarUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim() || !nuevoWhatsapp.trim()) {
      alert("Por favor completa el nombre y el número de WhatsApp.");
      return;
    }

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
    limpiarFormularioUsuario();
    alert(usuarioEditandoId ? "¡Usuario actualizado exitosamente!" : "¡Usuario creado exitosamente!");
  };

  const handleEditarUsuario = (u: UserItem) => {
    setUsuarioEditandoId(u.id);
    setNuevoNombre(u.nombre);
    setNuevoUsername(u.username);
    setNuevoWhatsapp(u.whatsapp);
    setNuevoPassword("");
    setNuevoRol(u.rol);
    setNuevoEventoSlug(u.eventoAsignadoSlug || "todos");
    setNuevoActivo(u.activo);
  };

  const handleEliminarUsuario = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este colaborador?")) {
      const nuevaLista = usuarios.filter((u) => u.id !== id);
      actualizarUsuarios(nuevaLista);
    }
  };

  // --- DESCARGAR RESPUESTAS / PREGUNTAS (CSV) ---
  const handleDescargarCSV = () => {
    const respuestasFiltradas = selectedSlug
      ? respuestas.filter((r) => r.eventSlug?.toLowerCase() === selectedSlug.toLowerCase())
      : respuestas;

    if (respuestasFiltradas.length === 0) {
      alert("No hay registros disponibles para descargar.");
      return;
    }

    const headers = ["ID", "Evento", "Nombre", "WhatsApp", "Asistirá", "Pases", "Mensaje / Preguntas"];
    const rows = respuestasFiltradas.map((r) => [
      r.id,
      r.eventSlug || selectedSlug || "General",
      `"${r.nombre || ""}"`,
      `"${r.whatsapp || ""}"`,
      r.asistira ? "Sí" : "No",
      r.pasesConfirmados || 1,
      `"${(r.mensaje || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `respuestas_evento_${selectedSlug || "todos"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (cargandoSesion) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-amber-500 font-bold">
        Cargando Panel Administrativo...
      </div>
    );
  }

  const respuestasFiltradas = selectedSlug
    ? respuestas.filter((r) => r.eventSlug?.toLowerCase() === selectedSlug.toLowerCase())
    : respuestas;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-4 sm:p-6 space-y-6">
      {/* HEADER BAR */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0d1527] p-5 rounded-2xl border border-slate-800 shadow-lg">
        <div>
          <h1 className="text-xl font-black text-amber-500 uppercase tracking-wide">
            Panel Administrativo
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Sesión: <span className="text-slate-200 font-bold">{nombreSesion}</span> ({rolUsuarioActual}) - Slug: {slugAsignado}
          </p>
        </div>

        {/* CONTROLES Y CERRAR SESIÓN */}
        <div className="flex flex-wrap items-center gap-3 self-stretch sm:self-auto">
          <div className="flex items-center gap-1.5 bg-[#050914] p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setTabActiva("respuestas")}
              className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all ${
                tabActiva === "respuestas"
                  ? "bg-amber-500 text-black shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📋 Respuestas
            </button>

            {rolUsuarioActual === "ADMINISTRADOR" && (
              <>
                <button
                  onClick={() => setTabActiva("eventos")}
                  className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all ${
                    tabActiva === "eventos"
                      ? "bg-amber-500 text-black shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  🎉 Eventos
                </button>
                <button
                  onClick={() => setTabActiva("colaboradores")}
                  className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all ${
                    tabActiva === "colaboradores"
                      ? "bg-amber-500 text-black shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  👥 Colaboradores
                </button>
              </>
            )}
          </div>

          <button
            onClick={handleCerrarSesion}
            className="bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 px-3.5 py-2 rounded-xl text-xs font-extrabold transition shadow-sm"
          >
            🚪 Salir
          </button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl w-full mx-auto">
        {/* VISTA 1: COLABORADORES */}
        {tabActiva === "colaboradores" && rolUsuarioActual === "ADMINISTRADOR" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-[#0d1527] p-6 rounded-2xl border border-slate-800 shadow-xl">
              <h2 className="text-base font-black text-amber-500 uppercase tracking-wide mb-4">
                {usuarioEditandoId ? "✏️ Editar Colaborador" : "➕ Crear Nuevo Colaborador"}
              </h2>
              <form onSubmit={handleGuardarUsuario} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    className="w-full bg-[#050914] border border-slate-700 rounded-xl p-2.5 text-sm text-white mt-1 focus:border-amber-500 outline-none"
                    placeholder="Ej. María López"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase">Usuario (Login / Slug)</label>
                  <input
                    type="text"
                    value={nuevoUsername}
                    onChange={(e) => setNuevoUsername(e.target.value)}
                    className="w-full bg-[#050914] border border-slate-700 rounded-xl p-2.5 text-sm text-white mt-1 focus:border-amber-500 outline-none"
                    placeholder="Opcional: maria-lopez"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase">WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={nuevoWhatsapp}
                    onChange={(e) => setNuevoWhatsapp(e.target.value)}
                    className="w-full bg-[#050914] border border-slate-700 rounded-xl p-2.5 text-sm text-white mt-1 focus:border-amber-500 outline-none"
                    placeholder="+52 1 55 1234 5678"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase">Contraseña</label>
                  <input
                    type="password"
                    value={nuevoPassword}
                    onChange={(e) => setNuevoPassword(e.target.value)}
                    className="w-full bg-[#050914] border border-slate-700 rounded-xl p-2.5 text-sm text-white mt-1 focus:border-amber-500 outline-none"
                    placeholder={usuarioEditandoId ? "Dejar en blanco para conservar" : "123456"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase">Rol de Acceso</label>
                  <select
                    value={nuevoRol}
                    onChange={(e) => setNuevoRol(e.target.value as any)}
                    className="w-full bg-[#050914] border border-slate-700 rounded-xl p-2.5 text-sm text-white mt-1 focus:border-amber-500 outline-none"
                  >
                    <option value="CLIENTE">CLIENTE (Acceso limitado)</option>
                    <option value="ADMINISTRADOR">ADMINISTRADOR (Acceso total)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase">Evento Asignado</label>
                  <select
                    value={nuevoEventoSlug}
                    onChange={(e) => setNuevoEventoSlug(e.target.value)}
                    className="w-full bg-[#050914] border border-slate-700 rounded-xl p-2.5 text-sm text-white mt-1 focus:border-amber-500 outline-none"
                  >
                    <option value="todos">Todos los eventos</option>
                    {eventos.map((evt) => (
                      <option key={evt.id || evt.slug} value={evt.slug}>
                        {evt.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="activo"
                    checked={nuevoActivo}
                    onChange={(e) => setNuevoActivo(e.target.checked)}
                    className="rounded accent-amber-500 h-4 w-4"
                  />
                  <label htmlFor="activo" className="text-sm text-slate-300 font-medium">
                    Usuario Activo
                  </label>
                </div>

                <div className="flex space-x-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-extrabold py-3 rounded-xl text-xs transition shadow-lg"
                  >
                    {usuarioEditandoId ? "Actualizar" : "Guardar Colaborador"}
                  </button>
                  {usuarioEditandoId && (
                    <button
                      type="button"
                      onClick={limpiarFormularioUsuario}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-3 rounded-xl text-xs transition"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="lg:col-span-2 bg-[#0d1527] p-6 rounded-2xl border border-slate-800 shadow-xl">
              <h2 className="text-base font-black text-white uppercase tracking-wide mb-4">
                Lista de Colaboradores ({usuarios.length})
              </h2>
              {usuarios.length === 0 ? (
                <p className="text-slate-400 text-sm">No hay colaboradores registrados aún.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase">
                        <th className="p-3">Nombre / Usuario</th>
                        <th className="p-3">WhatsApp</th>
                        <th className="p-3">Rol</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {usuarios.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/30 transition">
                          <td className="p-3">
                            <div className="font-bold text-white">{u.nombre}</div>
                            <div className="text-xs text-amber-500 font-mono">@{u.username}</div>
                          </td>
                          <td className="p-3 text-slate-300 font-mono text-xs">{u.whatsapp}</td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                u.rol === "ADMINISTRADOR"
                                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                  : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              }`}
                            >
                              {u.rol}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                u.activo
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              }`}
                            >
                              {u.activo ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-2">
                            <button
                              onClick={() => handleEditarUsuario(u)}
                              className="text-amber-400 hover:text-amber-300 text-xs font-bold"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleEliminarUsuario(u.id)}
                              className="text-rose-400 hover:text-rose-300 text-xs font-bold"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VISTA 2: RESPUESTAS & DESCARGAR CSV */}
        {tabActiva === "respuestas" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#0d1527] p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-amber-500 font-bold text-xs uppercase">SELECCIONAR EVENTO:</span>
                <select
                  value={selectedSlug}
                  onChange={(e) => setSelectedSlug(e.target.value)}
                  className="bg-[#050914] border border-slate-700 text-amber-400 font-bold text-sm rounded-xl p-2 outline-none"
                >
                  <option value="">Todos los eventos</option>
                  {eventos.map((e) => (
                    <option key={e.slug} value={e.slug}>
                      {e.nombre || e.slug}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleDescargarCSV}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs transition shadow-md"
              >
                📥 Descargar Preguntas/Respuestas (CSV)
              </button>
            </div>

            <div className="bg-[#0d1527] rounded-2xl border border-slate-800 p-6">
              <h2 className="text-base font-black text-white uppercase tracking-wide mb-4">
                Registros Obtenidos ({respuestasFiltradas.length})
              </h2>

              {respuestasFiltradas.length === 0 ? (
                <p className="text-slate-400 text-sm">No hay respuestas registradas para este evento.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase">
                        <th className="p-3">NOMBRE</th>
                        <th className="p-3">WHATSAPP</th>
                        <th className="p-3">ASISTENCIA</th>
                        <th className="p-3">PASES</th>
                        <th className="p-3">RESPUESTAS / MENSAJE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {respuestasFiltradas.map((r) => (
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
              )}
            </div>
          </div>
        )}

        {/* VISTA 3: GESTIÓN DE EVENTOS */}
        {tabActiva === "eventos" && rolUsuarioActual === "ADMINISTRADOR" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-[#0d1527] p-6 rounded-2xl border border-slate-800 shadow-xl">
              <h2 className="text-base font-black text-amber-500 uppercase tracking-wide mb-4">
                ➕ Crear Nuevo Evento
              </h2>
              <form onSubmit={handleCrearEvento} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase">Nombre del Evento *</label>
                  <input
                    type="text"
                    required
                    value={nombreEventoNuevo}
                    onChange={(e) => setNombreEventoNuevo(e.target.value)}
                    className="w-full bg-[#050914] border border-slate-700 rounded-xl p-2.5 text-sm text-white mt-1 focus:border-amber-500 outline-none"
                    placeholder="Ej. Boda Sofía y Mateo"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase">Slug / Identificador</label>
                  <input
                    type="text"
                    value={slugEventoNuevo}
                    onChange={(e) => setSlugEventoNuevo(e.target.value)}
                    className="w-full bg-[#050914] border border-slate-700 rounded-xl p-2.5 text-sm text-white mt-1 focus:border-amber-500 outline-none"
                    placeholder="boda-sofia-mateo"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-extrabold py-3 rounded-xl text-xs transition shadow-lg mt-2"
                >
                  Guardar Evento
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-[#0d1527] p-6 rounded-2xl border border-slate-800 shadow-xl">
              <h2 className="text-base font-black text-white uppercase tracking-wide mb-4">
                Eventos Creados ({eventos.length})
              </h2>
              {eventos.length === 0 ? (
                <p className="text-slate-400 text-sm">No hay eventos creados todavía.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase">
                        <th className="p-3">Nombre</th>
                        <th className="p-3">Slug / Ruta</th>
                        <th className="p-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {eventos.map((evt) => (
                        <tr key={evt.slug} className="hover:bg-slate-800/30 transition">
                          <td className="p-3 font-bold text-white">{evt.nombre}</td>
                          <td className="p-3 font-mono text-xs text-amber-500">/{evt.slug}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleEliminarEvento(evt.slug)}
                              className="text-rose-400 hover:text-rose-300 text-xs font-bold"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}