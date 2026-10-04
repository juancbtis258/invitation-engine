"use client";

import React, { useState, useEffect } from "react";

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
  [key: string]: any;
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
  // --- ESTADOS DE SESIÓN ---
  const [rolUsuarioActual, setRolUsuarioActual] = useState<"ADMINISTRADOR" | "CLIENTE">("ADMINISTRADOR");
  const [slugAsignado, setSlugAsignado] = useState<string>("todos");
  const [nombreSesion, setNombreSesion] = useState<string>("");
  const [usernameSesion, setUsernameSesion] = useState<string>("");
  const [cargandoSesion, setCargandoSesion] = useState<boolean>(true);
  const [tabActiva, setTabActiva] = useState<"respuestas" | "eventos" | "colaboradores">("colaboradores");

  // --- ESTADOS DE DATOS ---
  const [eventos, setEventos] = useState<EventoItem[]>([]);
  const [usuarios, setUsuarios] = useState<UserItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [respuestas, setRespuestas] = useState<ResponseItem[]>([]);
  const [loadingRespuestas, setLoadingRespuestas] = useState<boolean>(false);

  // --- ESTADOS DE FORMULARIO USUARIO ---
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

  // --- CARGA INICIAL ---
  useEffect(() => {
    const role = (localStorage.getItem("userRole") as "ADMINISTRADOR" | "CLIENTE") || "ADMINISTRADOR";
    const slug = localStorage.getItem("userSlug") || "todos";
    const name = localStorage.getItem("userName") || "Alejandro Mejía";
    const user = localStorage.getItem("userUsername") || "admin";
    const tabGuardada = localStorage.getItem("adminTabActiva") as any;

    setRolUsuarioActual(role);
    setSlugAsignado(slug);
    setNombreSesion(name);
    setUsernameSesion(user);

    if (tabGuardada) {
      setTabActiva(tabGuardada);
    } else {
      setTabActiva(role === "ADMINISTRADOR" ? "colaboradores" : "respuestas");
    }

    // Cargar Eventos
    const eventosGuardados = localStorage.getItem("app_eventos_lista");
    if (eventosGuardados) {
      try {
        const parsed = JSON.parse(eventosGuardados);
        if (Array.isArray(parsed)) {
          setEventos(parsed);
          if (parsed.length > 0) setSelectedSlug(parsed[0].slug);
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

    setCargandoSesion(false);
  }, []);

  // --- CARGAR RESPUESTAS DE EVENTO SELECCIONADO ---
  useEffect(() => {
    if (!selectedSlug) return;
    setLoadingRespuestas(true);

    const cargarRespuestas = async () => {
      const lista: ResponseItem[] = [];
      try {
        const local = localStorage.getItem("app_respuestas_lista");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            parsed
              .filter((r) => (r.eventSlug || r.slug || "").toLowerCase() === selectedSlug.toLowerCase())
              .forEach((r, idx) => {
                lista.push({
                  id: r.id || `local-${idx}`,
                  nombre: r.name || r.nombre || "Sin Nombre",
                  whatsapp: r.phone || r.whatsapp || "-",
                  asistira: r.attending !== undefined ? Boolean(r.attending) : Boolean(r.asistira),
                  pasesConfirmados: r.pasesConfirmados ? Number(r.pasesConfirmados) : 1,
                  asistentes: Array.isArray(r.asistentes) ? r.asistentes : [],
                  mensaje: r.mensaje || "-",
                });
              });
          }
        }
      } catch (e) {}

      setRespuestas(lista);
      setLoadingRespuestas(false);
    };

    cargarRespuestas();
  }, [selectedSlug]);

  // --- MÉTODOS DE USUARIOS ---
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
    alert(usuarioEditandoId ? "¡Usuario actualizado!" : "¡Usuario creado!");
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
    if (confirm("¿Estás seguro de eliminar este usuario?")) {
      const nuevaLista = usuarios.filter((u) => u.id !== id);
      actualizarUsuarios(nuevaLista);
    }
  };

  const cambiarTab = (tab: "respuestas" | "eventos" | "colaboradores") => {
    setTabActiva(tab);
    localStorage.setItem("adminTabActiva", tab);
  };

  if (cargandoSesion) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-amber-500 font-bold">
        Cargando Panel Administrativo...
      </div>
    );
  }

  // Métricas
  const confirmados = respuestas.filter((r) => r.asistira);
  const cancelados = respuestas.filter((r) => !r.asistira);
  const totalAsistentes = confirmados.reduce((acc, r) => acc + (r.pasesConfirmados || 1), 0);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-4 sm:p-6 space-y-6">
      {/* HEADER / BARRA DE NAVEGACIÓN */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0d1527] p-5 rounded-2xl border border-slate-800 shadow-lg">
        <div>
          <h1 className="text-xl font-black text-amber-500 uppercase tracking-wide">
            Panel Administrativo
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Sesión: <span className="text-slate-200 font-bold">{nombreSesion}</span> ({rolUsuarioActual}) - Slug: {slugAsignado} (@admin)
          </p>
        </div>

        {/* Pestañas estilo Oscuro / Dorado */}
        <div className="flex items-center gap-2 bg-[#050914] p-1.5 rounded-xl border border-slate-800 self-stretch sm:self-auto">
          <button
            onClick={() => cambiarTab("respuestas")}
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
                onClick={() => cambiarTab("eventos")}
                className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all ${
                  tabActiva === "eventos"
                    ? "bg-amber-500 text-black shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🎭 Eventos
              </button>
              <button
                onClick={() => cambiarTab("colaboradores")}
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
      </header>

      {/* VISTA 1: COLABORADORES */}
      {tabActiva === "colaboradores" && rolUsuarioActual === "ADMINISTRADOR" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario */}
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
                  placeholder="maria-lopez"
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
                      {evt.nombre || evt.slug}
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
                  {usuarioEditandoId ? "Actualizar Colaborador" : "Guardar Colaborador"}
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

          {/* Tabla de Usuarios */}
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

      {/* VISTA 2: RESPUESTAS */}
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
                {eventos.map((e) => (
                  <option key={e.slug} value={e.slug}>
                    {e.nombre || e.slug}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#0d1527] p-4 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-bold uppercase block">TOTAL ENVÍOS</span>
              <p className="text-3xl font-black mt-1 text-white">{respuestas.length}</p>
            </div>
            <div className="bg-[#0d1527] p-4 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-emerald-400 font-bold uppercase block">CONFIRMADOS</span>
              <p className="text-3xl font-black mt-1 text-emerald-400">{confirmados.length}</p>
            </div>
            <div className="bg-[#0d1527] p-4 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-rose-500 font-bold uppercase block">CANCELADOS</span>
              <p className="text-3xl font-black mt-1 text-rose-500">{cancelados.length}</p>
            </div>
            <div className="bg-[#0d1527] p-4 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-amber-500 font-bold uppercase block">PERSONAS TOTALES</span>
              <p className="text-3xl font-black mt-1 text-amber-500">{totalAsistentes} asist.</p>
            </div>
          </div>

          <div className="bg-[#0d1527] rounded-2xl border border-slate-800 p-4">
            {loadingRespuestas ? (
              <p className="text-center text-amber-400 p-8">Cargando registros...</p>
            ) : respuestas.length === 0 ? (
              <p className="text-center text-slate-400 p-8">No hay respuestas para este evento.</p>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase">
                    <th className="p-3">NOMBRE</th>
                    <th className="p-3">WHATSAPP</th>
                    <th className="p-3">ASISTENCIA</th>
                    <th className="p-3">PASES</th>
                    <th className="p-3">MENSAJE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {respuestas.map((r) => (
                    <tr key={r.id}>
                      <td className="p-3 font-bold text-white">{r.nombre}</td>
                      <td className="p-3 text-slate-400 font-mono text-xs">{r.whatsapp}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${r.asistira ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                          {r.asistira ? "Sí asistirá" : "No asistirá"}
                        </span>
                      </td>
                      <td className="p-3 text-amber-500 font-bold">{r.asistira ? r.pasesConfirmados : 0}</td>
                      <td className="p-3 text-slate-400 text-xs">{r.mensaje}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* VISTA 3: EVENTOS */}
      {tabActiva === "eventos" && rolUsuarioActual === "ADMINISTRADOR" && (
        <div className="bg-[#0d1527] p-6 rounded-2xl border border-slate-800 shadow-lg">
          <h2 className="text-lg font-bold text-amber-500">Gestión de Eventos</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configura los eventos disponibles para tus clientes y colaboradores.
          </p>
        </div>
      )}
    </div>
  );
}