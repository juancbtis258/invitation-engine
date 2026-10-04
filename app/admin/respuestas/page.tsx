"use client";

import React, { useState, useEffect } from "react";

// Tipos de datos
interface EventoItem {
  slug: string;
  title?: string;
  customTitle?: string;
}

interface ResponseItem {
  id: string;
  eventSlug?: string;
  nombre?: string;
  whatsapp?: string;
  asistira?: boolean;
  pasesConfirmados?: number;
  asistentes?: string[];
  mensaje?: string;
}

interface Colaborador {
  id: string;
  nombre: string;
  usuario: string;
  whatsapp: string;
  password?: string;
  rol: string;
  permisoEvento: string;
  activo: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const [tab, setTab] = useState<"eventos" | "respuestas" | "colaboradores">("respuestas");

  // Estados Eventos y Respuestas
  const [eventos, setEventos] = useState<EventoItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [respuestas, setRespuestas] = useState<ResponseItem[]>([]);
  const [loadingRespuestas, setLoadingRespuestas] = useState(false);

  // Estados Colaboradores
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loadingColaboradores, setLoadingColaboradores] = useState(false);
  const [nombreColab, setNombreColab] = useState("");
  const [usuarioColab, setUsuarioColab] = useState("");
  const [whatsappColab, setWhatsappColab] = useState("");
  const [passwordColab, setPasswordColab] = useState("");
  const [rolColab, setRolColab] = useState("CLIENTE");
  const [permisoColab, setPermisoColab] = useState("TODOS");

  // 1. Cargar lista global de eventos
  useEffect(() => {
    const cargarEventos = async () => {
      let lista: EventoItem[] = [];

      try {
        const local = localStorage.getItem("app_eventos_lista");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) lista = parsed;
        }
      } catch (e) {}

      try {
        const res = await fetch("/api/form-config?action=get_events");
        if (res.ok) {
          const data = await res.json();
          const items = data.data || data.events || data;
          if (Array.isArray(items) && items.length > 0) lista = items;
        }
      } catch (e) {}

      setEventos(lista);
      if (lista.length > 0 && !selectedSlug) {
        setSelectedSlug(lista[0].slug);
      }
    };

    cargarEventos();
  }, []);

  // 2. Cargar Respuestas según el evento seleccionado
  useEffect(() => {
    if (!selectedSlug) {
      setRespuestas([]);
      return;
    }

    const cargarRespuestas = async () => {
      setLoadingRespuestas(true);
      const listaCombinada: ResponseItem[] = [];
      const idsProcesados = new Set<string>();

      // LocalStorage
      try {
        const local = localStorage.getItem("app_respuestas_lista");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            parsed
              .filter((r) => (r.eventSlug || r.slug || "").toLowerCase() === selectedSlug.toLowerCase())
              .forEach((r) => {
                const item: ResponseItem = {
                  id: r.id || `local-${Math.random()}`,
                  eventSlug: r.eventSlug || selectedSlug,
                  nombre: r.name || r.nombre || "Sin Nombre",
                  whatsapp: r.phone || r.whatsapp || "-",
                  asistira: r.attending !== undefined ? Boolean(r.attending) : Boolean(r.asistira),
                  pasesConfirmados: r.pasesConfirmados !== undefined ? Number(r.pasesConfirmados) : 1,
                  asistentes: Array.isArray(r.asistentes) ? r.asistentes : [],
                  mensaje: r.mensaje || "-",
                };
                listaCombinada.push(item);
                if (r.id) idsProcesados.add(r.id);
              });
          }
        }
      } catch (e) {}

      // API Backend
      try {
        const resApi = await fetch(`/api/form-config?action=get_responses&event=${selectedSlug}`);
        if (resApi.ok) {
          const dataApi = await resApi.json();
          const itemsApi = dataApi.data || dataApi.responses || dataApi;
          if (Array.isArray(itemsApi)) {
            itemsApi.forEach((r: any, idx: number) => {
              const id = r.id || `api-${idx}`;
              if (!idsProcesados.has(id)) {
                listaCombinada.push({
                  id,
                  eventSlug: r.eventSlug || selectedSlug,
                  nombre: r.name || r.nombre || "Sin Nombre",
                  whatsapp: r.phone || r.whatsapp || "-",
                  asistira: r.attending !== undefined ? Boolean(r.attending) : Boolean(r.asistira),
                  pasesConfirmados: r.pasesConfirmados !== undefined ? Number(r.pasesConfirmados) : 1,
                  asistentes: Array.isArray(r.asistentes) ? r.asistentes : [],
                  mensaje: r.mensaje || "-",
                });
                idsProcesados.add(id);
              }
            });
          }
        }
      } catch (e) {}

      setRespuestas(listaCombinada);
      setLoadingRespuestas(false);
    };

    cargarRespuestas();
  }, [selectedSlug]);

  // 3. Cargar Lista de Colaboradores
  useEffect(() => {
    const cargarColaboradores = async () => {
      setLoadingColaboradores(true);
      let lista: Colaborador[] = [];

      try {
        const local = localStorage.getItem("app_colaboradores_lista");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) lista = parsed;
        }
      } catch (e) {}

      try {
        const res = await fetch("/api/form-config?action=get_users");
        if (res.ok) {
          const data = await res.json();
          const items = data.data || data.users || [];
          if (Array.isArray(items)) {
            items.forEach((itemApi: any) => {
              if (!lista.some((l) => l.id === itemApi.id || l.usuario === itemApi.usuario)) {
                lista.push(itemApi);
              }
            });
          }
        }
      } catch (e) {}

      setColaboradores(lista);
      setLoadingColaboradores(false);
    };

    cargarColaboradores();
  }, []);

  // Guardar Colaborador
  const handleGuardarColaborador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreColab || !usuarioColab || !passwordColab) return;

    const nuevo: Colaborador = {
      id: Date.now().toString(),
      nombre: nombreColab,
      usuario: usuarioColab,
      whatsapp: whatsappColab,
      password: passwordColab,
      rol: rolColab,
      permisoEvento: permisoColab,
      activo: true,
      createdAt: new Date().toISOString(),
    };

    const nuevaLista = [...colaboradores, nuevo];
    setColaboradores(nuevaLista);

    try {
      localStorage.setItem("app_colaboradores_lista", JSON.stringify(nuevaLista));
    } catch (e) {}

    try {
      await fetch("/api/form-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_user", user: nuevo }),
      });
    } catch (e) {}

    setNombreColab("");
    setUsuarioColab("");
    setWhatsappColab("");
    setPasswordColab("");
  };

  const handleEliminarColaborador = (id: string) => {
    const filtrados = colaboradores.filter((c) => c.id !== id);
    setColaboradores(filtrados);
    try {
      localStorage.setItem("app_colaboradores_lista", JSON.stringify(filtrados));
    } catch (e) {}
  };

  // Exportar CSV
  const exportarCSV = () => {
    if (respuestas.length === 0) return;
    let csv = "data:text/csv;charset=utf-8,Nombre,WhatsApp,Asistira,Pases,Acompañantes,Mensaje\n";
    respuestas.forEach((r) => {
      csv += `"${r.nombre || ""}","${r.whatsapp || ""}","${r.asistira ? "SI" : "NO"}","${
        r.asistira ? r.pasesConfirmados || 1 : 0
      }","${(r.asistentes || []).join(", ")}","${(r.mensaje || "").replace(/"/g, '""')}"\n`;
    });
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `respuestas_${selectedSlug || "evento"}.csv`;
    link.click();
  };

  const confirmados = respuestas.filter((r) => r.asistira === true);
  const cancelados = respuestas.filter((r) => r.asistira === false);
  const totalPersonas = confirmados.reduce((acc, r) => acc + (r.pasesConfirmados || 1), 0);

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 p-6 space-y-6">
      {/* Header y Navegación de Pestañas */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0f172a] p-4 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-xl font-black text-amber-500 uppercase tracking-wide">
            Plataforma de Gestión de Eventos
          </h1>
          <p className="text-xs text-slate-400">Bienvenido Alejandro Mejia (ADMINISTRADOR)</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTab("eventos")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === "eventos"
                ? "bg-amber-500 text-black shadow-lg"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            💻 Mis Eventos ({eventos.length})
          </button>
          <button
            onClick={() => setTab("respuestas")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === "respuestas"
                ? "bg-amber-500 text-black shadow-lg"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            📊 Respuestas ({respuestas.length})
          </button>
          <button
            onClick={() => setTab("colaboradores")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === "colaboradores"
                ? "bg-amber-500 text-black shadow-lg"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            👥 Colaboradores ({colaboradores.length})
          </button>
        </div>
      </div>

      {/* PESTAÑA: RESPUESTAS */}
      {tab === "respuestas" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0f172a] p-4 rounded-xl border border-slate-800">
            <div className="space-y-1 w-full sm:w-auto">
              <label className="text-xs font-bold text-amber-500 uppercase tracking-wider block">
                📊 RESPUESTAS DEL EVENTO:
              </label>
              <select
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                className="bg-[#080d19] border border-slate-700 text-white font-bold text-sm rounded-lg p-2.5 w-full sm:w-64 focus:outline-none focus:border-amber-500"
              >
                {eventos.length === 0 && <option value="">No hay eventos cargados</option>}
                {eventos.map((ev) => (
                  <option key={ev.slug} value={ev.slug}>
                    {ev.title || ev.customTitle || ev.slug} (/{ev.slug})
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400">Enlace de respuestas: /{selectedSlug}</p>
            </div>

            <button
              onClick={exportarCSV}
              disabled={respuestas.length === 0}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-md transition-all self-end sm:self-auto"
            >
              📥 Descargar Excel (CSV)
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-bold uppercase">TOTAL ENVÍOS</span>
              <p className="text-2xl font-extrabold mt-1 text-white">{respuestas.length}</p>
            </div>
            <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] text-emerald-400 font-bold uppercase">CONFIRMADOS</span>
              <p className="text-2xl font-extrabold mt-1 text-emerald-400">{confirmados.length}</p>
            </div>
            <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] text-rose-500 font-bold uppercase">CANCELADOS</span>
              <p className="text-2xl font-extrabold mt-1 text-rose-500">{cancelados.length}</p>
            </div>
            <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] text-amber-500 font-bold uppercase">PERSONAS TOTALES</span>
              <p className="text-2xl font-extrabold mt-1 text-amber-500">{totalPersonas} asist.</p>
            </div>
          </div>

          <div className="bg-[#0f172a] rounded-xl border border-slate-800 overflow-hidden shadow-xl">
            {loadingRespuestas ? (
              <div className="p-8 text-center text-amber-400 font-medium">Cargando respuestas...</div>
            ) : respuestas.length === 0 ? (
              <div className="p-8 text-center text-slate-400">Aún no hay respuestas registradas para este evento.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1e293b] text-slate-400 text-xs font-semibold uppercase border-b border-slate-800">
                      <th className="p-3.5">NOMBRE</th>
                      <th className="p-3.5">WHATSAPP</th>
                      <th className="p-3.5">ASISTENCIA</th>
                      <th className="p-3.5">PASES</th>
                      <th className="p-3.5">ACOMPAÑANTES</th>
                      <th className="p-3.5">MENSAJE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {respuestas.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-800/30">
                        <td className="p-3.5 font-bold text-white">{r.nombre}</td>
                        <td className="p-3.5 text-slate-400">{r.whatsapp}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                              r.asistira
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {r.asistira ? "¡Sí asistirá!" : "No asistirá"}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-amber-500">{r.asistira ? r.pasesConfirmados || 1 : 0}</td>
                        <td className="p-3.5 text-slate-300 text-xs">
                          {r.asistira && (r.asistentes || []).length > 0 ? r.asistentes?.join(", ") : "Ninguno"}
                        </td>
                        <td className="p-3.5 text-slate-400 text-xs">{r.mensaje}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA: COLABORADORES */}
      {tab === "colaboradores" && (
        <div className="space-y-6">
          <form onSubmit={handleGuardarColaborador} className="bg-[#0f172a] p-5 rounded-xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase">👥 GESTIÓN PROFESIONAL DE CLIENTES Y ACCESOS</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="Nombre Completo *"
                value={nombreColab}
                onChange={(e) => setNombreColab(e.target.value)}
                className="bg-[#080d19] border border-slate-800 text-white text-sm rounded-lg p-3 focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                required
                placeholder="Usuario Login *"
                value={usuarioColab}
                onChange={(e) => setUsuarioColab(e.target.value)}
                className="bg-[#080d19] border border-slate-800 text-white text-sm rounded-lg p-3 focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                placeholder="WhatsApp (ej. 5218115591681) *"
                value={whatsappColab}
                onChange={(e) => setWhatsappColab(e.target.value)}
                className="bg-[#080d19] border border-slate-800 text-white text-sm rounded-lg p-3 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="password"
                required
                placeholder="Contraseña *"
                value={passwordColab}
                onChange={(e) => setPasswordColab(e.target.value)}
                className="bg-[#080d19] border border-slate-800 text-white text-sm rounded-lg p-3 focus:outline-none focus:border-amber-500"
              />
              <select
                value={rolColab}
                onChange={(e) => setRolColab(e.target.value)}
                className="bg-[#080d19] border border-slate-800 text-amber-500 font-bold text-sm rounded-lg p-3 focus:outline-none"
              >
                <option value="CLIENTE">CLIENTE (Panel Multievento)</option>
                <option value="ADMIN">ADMINISTRADOR (Acceso Total)</option>
              </select>
              <select
                value={permisoColab}
                onChange={(e) => setPermisoColab(e.target.value)}
                className="bg-[#080d19] border border-slate-800 text-sky-400 font-bold text-sm rounded-lg p-3 focus:outline-none"
              >
                <option value="TODOS">🌐 Todos los eventos (Admin / Multievento)</option>
              </select>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs px-6 py-3 rounded-lg shadow-lg transition-all"
              >
                + Guardar Colaborador
              </button>
            </div>
          </form>

          <div className="bg-[#0f172a] rounded-xl border border-slate-800 overflow-hidden shadow-xl">
            {loadingColaboradores ? (
              <div className="p-8 text-center text-amber-400 font-medium">Cargando colaboradores...</div>
            ) : colaboradores.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No hay colaboradores registrados todavía.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1e293b] text-slate-400 text-xs font-semibold uppercase border-b border-slate-800">
                      <th className="p-3.5">USUARIO</th>
                      <th className="p-3.5">WHATSAPP</th>
                      <th className="p-3.5">CONTRASEÑA</th>
                      <th className="p-3.5">ROL / PERMISO</th>
                      <th className="p-3.5">ESTADO</th>
                      <th className="p-3.5 text-right">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {colaboradores.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/30">
                        <td className="p-3.5 font-bold text-white">
                          {item.nombre}
                          <span className="block text-xs font-normal text-slate-400">@{item.usuario}</span>
                        </td>
                        <td className="p-3.5 text-slate-300">{item.whatsapp || "-"}</td>
                        <td className="p-3.5 text-slate-400 font-mono text-xs">{item.password || "••••••"}</td>
                        <td className="p-3.5 font-bold text-amber-500">{item.rol}</td>
                        <td className="p-3.5">
                          <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-md font-bold">
                            Activo
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleEliminarColaborador(item.id)}
                            className="bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 text-xs px-3 py-1.5 rounded-md font-bold transition-all"
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

      {/* PESTAÑA: MIS EVENTOS */}
      {tab === "eventos" && (
        <div className="bg-[#0f172a] p-6 rounded-xl border border-slate-800 text-center text-slate-400">
          <p className="text-sm">Lista de eventos registrados ({eventos.length}).</p>
        </div>
      )}
    </div>
  );
}