"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  const [eventSlug, setEventSlug] = useState("demo");
  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Cargar la configuración actual al cambiar el slug
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
        }
      })
      .catch((err) => console.error("Error al cargar datos:", err));
  }, [eventSlug]);

  // Guardar la configuración actualizada
  const handleGuardarConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMensaje("");

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
        setMensaje("¡Configuración e integración de WhatsApp guardadas con éxito!");
      } else {
        setMensaje("Hubo un detalle al guardar. Intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      setMensaje("Error al conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-xl font-extrabold text-amber-500">
            ⚙️ Panel de Configuración de la Invitación
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configura los datos del evento y el número de WhatsApp receptor.
          </p>
        </div>

        <form onSubmit={handleGuardarConfig} className="space-y-5">
          {/* Identificador del evento */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Slug / Identificador del Evento
            </label>
            <input
              type="text"
              value={eventSlug}
              onChange={(e) => setEventSlug(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {/* Título del Evento */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Título del Evento
            </label>
            <input
              type="text"
              placeholder="Ej. Boda María & Alejandro"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {/* Fecha del Evento */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Fecha del Evento
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {/* Campo de WhatsApp Receptor */}
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl space-y-2">
            <label className="block text-xs font-bold text-amber-400">
              📱 WhatsApp que recibirá las confirmaciones
            </label>
            <input
              type="tel"
              placeholder="Ej. 5218112345678 (incluye clave de país sin espacios)"
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              required
            />
            <p className="text-[11px] text-slate-400">
              El botón final de la invitación abrirá automáticamente un chat con este número incluyendo el resumen de la respuesta.
            </p>
          </div>

          {/* Estado de la Invitación */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
            <label htmlFor="active" className="text-xs font-semibold text-slate-300 cursor-pointer">
              Invitación activa y pública
            </label>
          </div>

          {mensaje && (
            <p className="text-xs font-semibold text-emerald-400 text-center bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
              {mensaje}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            {saving ? "Guardando..." : "Guardar Configuración"}
          </button>
        </form>
      </div>
    </div>
  );
}