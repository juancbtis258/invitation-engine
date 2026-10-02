  "use client";

import React, { useState, useEffect } from "react";
import { User, EventoItem, UserItem } from "@/types"; // Ajusta los tipos según la estructura de tu proyecto

export default function AdminPage() {
  // --- ESTADOS DE SESIÓN ---
  const [rolUsuarioActual, setRolUsuarioActual] = useState<"ADMINISTRADOR" | "CLIENTE">("CLIENTE");
  const [slugAsignado, setSlugAsignado] = useState<string>("todos");
  const [nombreSesion, setNombreSesion] = useState<string>("");
  const [usernameSesion, setUsernameSesion] = useState<string>("");
  const [cargandoSesion, setCargandoSesion] = useState<boolean>(true);
  const [tabActiva, setTabActiva] = useState<"respuestas" | "eventos" | "colaboradores" | "config">("colaboradores");

  // --- ESTADOS DE DATOS ---
  const [eventos, setEventos] = useState<EventoItem[]>([]);
  const [usuarios, setUsuarios] = useState<UserItem[]>([]);

  // --- ESTADOS DE FORMULARIO USUARIO ---
  const [usuarioEditandoId, setUsuarioEditandoId] = useState<string | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState<string>("");
  const [nuevoUsername, setNuevoUsername] = useState<string>("");
  const [nuevoWhatsapp, setNuevoWhatsapp] = useState<string>("");
  const [nuevoPassword, setNuevoPassword] = useState<string>("");
  const [nuevoRol, setNuevoRol] = useState<"ADMINISTRADOR" | "CLIENTE">("CLIENTE");
  const [nuevoEventoSlug, setNuevoEventoSlug] = useState<string>("todos");
  const [nuevoActivo, setNuevoActivo] = useState<boolean>(true);

  // Helper para generar slug
  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  // --- CARGA INICIAL Y RESTAURACIÓN DE PERSISTENCIA ---
  useEffect(() => {
    // 1. Cargar datos de sesión
    const role = (localStorage.getItem("userRole") as "ADMINISTRADOR" | "CLIENTE") || "ADMINISTRADOR";
    const slug = localStorage.getItem("userSlug") || "todos";
    const name = localStorage.getItem("userName") || "Usuario Administrador";
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

    // 2. Cargar eventos guardados
    const eventosGuardados = localStorage.getItem("app_eventos_lista");
    if (eventosGuardados) {
      try {
        const parsed = JSON.parse(eventosGuardados);
        if (Array.isArray(parsed)) setEventos(parsed);
      } catch (err) {
        console.error("Error al parsear lista de eventos:", err);
      }
    }

    // 3. Cargar usuarios guardados con persistencia garantizada
    const usuariosGuardados = localStorage.getItem("app_usuarios_lista");
    if (usuariosGuardados) {
      try {
        const parsedUsers = JSON.parse(usuariosGuardados);
        if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
          setUsuarios(parsedUsers);
        }
      } catch (err) {
        console.error("Error al parsear lista de usuarios:", err);
      }
    }

    setCargandoSesion(false);
  }, []);

  // --- MÉTODOS DE PERSISTENCIA DE USUARIOS ---
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
    setNuevoPassword(""); // Por seguridad se deja en blanco para no sobreescribir salvo cambio expreso
    setNuevoRol(u.rol);
    setNuevoEventoSlug(u.eventoAsignadoSlug || "todos");
    setNuevoActivo(u.activo);
  };

  const handleEliminarUsuario = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este colaborador/usuario?")) {
      const nuevaLista = usuarios.filter((u) => u.id !== id);
      actualizarUsuarios(nuevaLista);
    }
  };

  const cambiarTab = (tab: "respuestas" | "eventos" | "colaboradores" | "config") => {
    setTabActiva(tab);
    localStorage.setItem("adminTabActiva", tab);
  };

  if (cargandoSesion) {
    return <div className="p-8 text-center text-gray-600">Cargando panel de administración...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HEADER BAR */}
      <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Panel Administrativo</h1>
          <p className="text-sm text-gray-500">
            Sesión: <span className="font-semibold text-gray-700">{nombreSesion}</span> ({rolUsuarioActual})
          </p>
        </div>
      </header>

      {/* NAVEGACIÓN TAB */}
      <div className="bg-white border-b px-6 flex space-x-4">
        <button
          onClick={() => cambiarTab("respuestas")}
          className={`py-3 px-4 font-medium text-sm border-b-2 ${
            tabActiva === "respuestas"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          📋 Respuestas
        </button>

        {rolUsuarioActual === "ADMINISTRADOR" && (
          <>
            <button
              onClick={() => cambiarTab("eventos")}
              className={`py-3 px-4 font-medium text-sm border-b-2 ${
                tabActiva === "eventos"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              🎉 Eventos
            </button>
            <button
              onClick={() => cambiarTab("colaboradores")}
              className={`py-3 px-4 font-medium text-sm border-b-2 ${
                tabActiva === "colaboradores"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              👥 Colaboradores
            </button>
          </>
        )}
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {tabActiva === "colaboradores" && rolUsuarioActual === "ADMINISTRADOR" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* FORMULARIO DE USUARIO */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-lg font-bold mb-4 text-gray-800">
                {usuarioEditandoId ? "✏️ Editar Colaborador" : "➕ Crear Nuevo Colaborador"}
              </h2>
              <form onSubmit={handleGuardarUsuario} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    className="w-full border rounded p-2 text-sm mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ej. María López"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Usuario (Login / Slug)</label>
                  <input
                    type="text"
                    value={nuevoUsername}
                    onChange={(e) => setNuevoUsername(e.target.value)}
                    className="w-full border rounded p-2 text-sm mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Opcional: maria-lopez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={nuevoWhatsapp}
                    onChange={(e) => setNuevoWhatsapp(e.target.value)}
                    className="w-full border rounded p-2 text-sm mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="+52 1 55 1234 5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                  <input
                    type="password"
                    value={nuevoPassword}
                    onChange={(e) => setNuevoPassword(e.target.value)}
                    className="w-full border rounded p-2 text-sm mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder={usuarioEditandoId ? "Dejar en blanco para no cambiar" : "Por defecto: 123456"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Rol de Acceso</label>
                  <select
                    value={nuevoRol}
                    onChange={(e) => setNuevoRol(e.target.value as any)}
                    className="w-full border rounded p-2 text-sm mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="CLIENTE">CLIENTE (Acceso limitado)</option>
                    <option value="ADMINISTRADOR">ADMINISTRADOR (Acceso total)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Evento Asignado</label>
                  <select
                    value={nuevoEventoSlug}
                    onChange={(e) => setNuevoEventoSlug(e.target.value)}
                    className="w-full border rounded p-2 text-sm mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
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
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <label htmlFor="activo" className="text-sm font-medium text-gray-700">
                    Usuario Activo
                  </label>
                </div>

                <div className="flex space-x-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded text-sm transition"
                  >
                    {usuarioEditandoId ? "Actualizar" : "Guardar Colaborador"}
                  </button>
                  {usuarioEditandoId && (
                    <button
                      type="button"
                      onClick={limpiarFormularioUsuario}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-4 py-2 rounded text-sm transition"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* TABLA DE USUARIOS */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-lg font-bold mb-4 text-gray-800">
                Lista de Colaboradores ({usuarios.length})
              </h2>
              {usuarios.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay colaboradores registrados aun.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b bg-gray-50 text-gray-600">
                        <th className="p-2">Nombre / Usuario</th>
                        <th className="p-2">WhatsApp</th>
                        <th className="p-2">Rol</th>
                        <th className="p-2">Estado</th>
                        <th className="p-2 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map((u) => (
                        <tr key={u.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <div className="font-semibold text-gray-800">{u.nombre}</div>
                            <div className="text-xs text-gray-500">@{u.username}</div>
                          </td>
                          <td className="p-2 text-gray-600">{u.whatsapp}</td>
                          <td className="p-2">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                u.rol === "ADMINISTRADOR"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {u.rol}
                            </span>
                          </td>
                          <td className="p-2">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                u.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {u.activo ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className="p-2 text-right space-x-2">
                            <button
                              onClick={() => handleEditarUsuario(u)}
                              className="text-indigo-600 hover:text-indigo-900 text-xs font-semibold"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleEliminarUsuario(u.id)}
                              className="text-red-600 hover:text-red-900 text-xs font-semibold"
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

        {tabActiva === "respuestas" && (
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-lg font-bold text-gray-800">Panel de Respuestas</h2>
            <p className="text-sm text-gray-500 mt-2">
              Aquí se visualizan los registros y confirmaciones del evento.
            </p>
          </div>
        )}

        {tabActiva === "eventos" && rolUsuarioActual === "ADMINISTRADOR" && (
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-lg font-bold text-gray-800">Gestión de Eventos</h2>
            <p className="text-sm text-gray-500 mt-2">
              Configura los eventos disponibles para tus clientes y colaboradores.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}