"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  // Pestaña activa: 'eventos' | 'disenador' | 'respuestas' | 'colaboradores'
  const [tabActiva, setTabActiva] = useState<
    "eventos" | "disenador" | "respuestas" | "colaboradores"
  >("colaboradores");

  // Estado del Evento / Configuración
  const [eventSlug, setEventSlug] = useState("demo");
  const [title, setTitle] = useState("Boda María & Alejandro");
  const [targetDate, setTargetDate] = useState("2026-10-15");
  const [whatsappPhone, setWhatsappPhone] = useState("5218112345678");
  const [active, setActive] = useState(true);

  // Colaboradores / Usuarios
  const [usuarios, setUsuarios] = useState([
    { nombre: "Alejandro Mejía (Tú)", usuario: "admin", pass: "123", rol: "ADMINISTRADOR" },
    { nombre: "Cliente Demo", usuario: "cliente", pass: "123", rol: "CLIENTE" },
  ]);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoUsuario, setNuevoUsuario] = useState("");
  const [nuevaPass, setNuevaPass] = useState("");
  const [nuevoRol, setNuevoRol] = useState("CLIENTE");

  // Respuestas
  const [respuestas, setRespuestas] = useState<any[]>([]);
  const [mensajeStatus, setMensajeStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar configuración al iniciar o cambiar de evento
  useEffect(() => {
    if (!eventSlug) return;
    fetch(`/api/form-config?event=${eventSlug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setTitle(data.data.title || "");
          setTargetDate(data.data.targetDate || "");
          setWhatsappPhone(data.data.whatsappPhone || "");
          setActive(data.data.active ?? true);
          setRespuestas(data.data.responses || []);
        }
      })
      .catch((err) => console.error("Error al cargar evento:", err));
  }, [eventSlug]);

  // Guardar configuración del evento (incluye WhatsApp)
  const handleGuardarConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensajeStatus("");

    try {
      const res = await fetch("/api/form-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_config",
          eventSlug,
          config: {
            title,
            targetDate,
            whatsappPhone,
            active,
          },
        }),
      });

      if (res.ok) {
        setMensajeStatus("¡Cambios e integración de WhatsApp guardados!");
      } else {
        setMensajeStatus("Error al guardar cambios.");
      }
    } catch (err) {
      setMensajeStatus("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  // Agregar nuevo colaborador / usuario
  const handleAgregarUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre || !nuevoUsuario || !nuevaPass) return;

    setUsuarios([
      ...usuarios,
      {
        nombre: nuevoNombre,
        usuario: nuevoUsuario,
        pass: nuevaPass,
        rol: nuevoRol,
      },
    ]);

    setNuevoNombre("");
    setNuevoUsuario("");
    setNuevaPass("");
  };

  return (
    <div className="min-h-screen bg-[#0b1329] text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* BARRA DE NAVEGACIÓN SUPERIOR (PESTAÑAS) */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 bg-slate-900/60 p-2 rounded-2xl border border-slate-800/80">
          <button
            onClick={() => setTabActiva("eventos")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tabActiva === "eventos"
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
            }`}
          >
            📁 Mis Eventos
          </button>

          <button
            onClick={() => setTabActiva("disenador")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tabActiva === "disenador"
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
            }`}
          >
            🛠️ Diseñador
          </button>

          <button
            onClick={() => setTabActiva("respuestas")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tabActiva === "respuestas"
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
            }`}
          >
            📊 Respuestas ({respuestas.length})
          </button>

          <button
            onClick={() => setTabActiva("colaboradores")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tabActiva === "colaboradores"
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
            }`}
          >
            👥 Colaboradores
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            className="ml-auto px-4 py-2 bg-rose-950/40 border border-rose-800/50 text-rose-400 hover:bg-rose-900/50 rounded-xl text-xs font-bold transition-all"
          >
            🚪 Salir
          </button>
        </div>

        {/* CONTENIDO DE LA PESTAÑA 1: MIS EVENTOS / AJUSTES */}
        {tabActiva === "eventos" && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
            <h2 className="text-sm font-black text-amber-500 tracking-wider uppercase border-b border-slate-800 pb-3">
              CONFIGURACIÓN DEL EVENTO & WHATSAPP
            </h2>

            <form onSubmit={handleGuardarConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Identificador (Slug del evento)
                </label>
                <input
                  type="text"
                  value={eventSlug}
                  onChange={(e) => setEventSlug(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Título del Evento
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Fecha del Evento
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* Integración con WhatsApp */}
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl space-y-1.5">
                <label className="block text-xs font-bold text-amber-400">
                  📱 WhatsApp Receptor (Confirmaciones de invitados)
                </label>
                <input
                  type="tel"
                  placeholder="Ej. 5218112345678"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
                <p className="text-[11px] text-slate-400">
                  El botón final de la invitación redirigirá a este WhatsApp con la respuesta del invitado.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <label htmlFor="activeCheck" className="text-xs text-slate-300 cursor-pointer">
                  Evento publicado y disponible
                </label>
              </div>

              {mensajeStatus && (
                <p className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-center">
                  {mensajeStatus}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs py-3 rounded-xl transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
              >
                {loading ? "Guardando..." : "Guardar Cambios del Evento"}
              </button>
            </form>
          </div>
        )}

        {/* CONTENIDO DE LA PESTAÑA 2: DISEÑADOR */}
        {tabActiva === "disenador" && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl text-center">
            <h2 className="text-sm font-black text-amber-500 tracking-wider uppercase">
              🛠️ Diseñador de Invitación
            </h2>
            <p className="text-xs text-slate-400">
              Personaliza el estilo, imágenes, tipografía y módulos de la tarjeta de invitación.
            </p>
            <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-xs text-slate-500">
              Modo de edición de tarjeta interactiva cargado.
            </div>
          </div>
        )}

        {/* CONTENIDO DE LA PESTAÑA 3: RESPUESTAS */}
        {tabActiva === "respuestas" && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl">
            <h2 className="text-sm font-black text-amber-500 tracking-wider uppercase border-b border-slate-800 pb-3">
              📊 Respuestas de Invitados
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
                        No hay respuestas registradas aún.
                      </td>
                    </tr>
                  ) : (
                    respuestas.map((r, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-semibold">{r.nombreInvitado || "Anónimo"}</td>
                        <td className="p-3">
                          {r.asistira ? (
                            <span className="text-emerald-400 font-bold">Sí asistirá</span>
                          ) : (
                            <span className="text-rose-400 font-bold">No asistirá</span>
                          )}
                        </td>
                        <td className="p-3">{r.pasesConfirmados || 0}</td>
                        <td className="p-3 italic text-slate-400">{r.mensajeDeseos || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CONTENIDO DE LA PESTAÑA 4: COLABORADORES / CLIENTES */}
        {tabActiva === "colaboradores" && (
          <div className="space-y-6">
            
            {/* Formulario de registro de usuario */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl">
              <h2 className="text-sm font-black text-amber-500 tracking-wider uppercase">
                REGISTRAR NUEVO COLABORADOR O CLIENTE
              </h2>

              <form onSubmit={handleAgregarUsuario} className="space-y-3.5">
                <div>
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Usuario (ej. admin, boda)"
                    value={nuevoUsuario}
                    onChange={(e) => setNuevoUsuario(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={nuevaPass}
                    onChange={(e) => setNuevaPass(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <select
                    value={nuevoRol}
                    onChange={(e) => setNuevoRol(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="CLIENTE">Cliente (Acceso a evento)</option>
                    <option value="ADMINISTRADOR">Administrador (Acceso total)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer mt-2"
                >
                  + Dar Acceso
                </button>
              </form>
            </div>

            {/* Tabla de usuarios registrados */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl">
              <h2 className="text-sm font-black text-amber-500 tracking-wider uppercase">
                USUARIOS REGISTRADOS EN LA PLATAFORMA
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3">Nombre</th>
                      <th className="p-3">Usuario</th>
                      <th className="p-3">Contraseña</th>
                      <th className="p-3">Rol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {usuarios.map((u, i) => (
                      <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-semibold text-slate-100">{u.nombre}</td>
                        <td className="p-3 font-bold text-amber-400">{u.usuario}</td>
                        <td className="p-3 text-slate-400">{u.pass}</td>
                        <td className="p-3">
                          {u.rol === "ADMINISTRADOR" ? (
                            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                              ADMINISTRADOR
                            </span>
                          ) : (
                            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                              CLIENTE
                            </span>
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

      </div>
    </div>
  );
}