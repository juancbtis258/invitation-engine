"use client";

import { useState } from "react";
import Link from "next/link";

export default function DemoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    whatsapp: "",
    asistencia: "si",
    pases: "2",
    menu: "Carne",
    autobus: "No",
    alergias: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-500 selection:text-slate-950">
      
      {/* BANNER INFORMATIVO DE DEMO */}
      <div className="w-full max-w-lg mb-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-center">
        <p className="text-xs text-amber-400 font-semibold">
          💡 **Modo Demostración Activo:** Así es como tus invitados verán y responderán tu invitación.
        </p>
      </div>

      <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
        {/* HEADER DEL EVENTO */}
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-transparent p-6 text-center border-b border-slate-800">
          <span className="text-xs font-bold tracking-widest uppercase text-amber-400">
            NUESTRA BODA
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Sofía & Mateo
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Sábado, 18 de Octubre, 2026 • Monterrey, N.L.
          </p>
        </div>

        {!submitted ? (
          /* FORMULARIO DE CONFIRMACIÓN */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Juan Pérez"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                WhatsApp *
              </label>
              <input
                type="tel"
                required
                placeholder="+52 81 1234 5678"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-2">
                ¿Asistirás al evento? *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, asistencia: "si" })}
                  className={`py-3 rounded-xl font-bold text-sm border transition-all ${
                    formData.asistencia === "si"
                      ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  ¡Sí, ahí estaré! 🎉
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, asistencia: "no" })}
                  className={`py-3 rounded-xl font-bold text-sm border transition-all ${
                    formData.asistencia === "no"
                      ? "bg-red-500/20 text-red-400 border-red-500/40"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  No podré ir 😔
                </button>
              </div>
            </div>

            {formData.asistencia === "si" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                      Lugares a Confirmar
                    </label>
                    <select
                      value={formData.pases}
                      onChange={(e) => setFormData({ ...formData, pases: e.target.value })}
                      className="w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 text-sm"
                    >
                      <option value="1">1 Pase</option>
                      <option value="2">2 Pases</option>
                      <option value="3">3 Pases</option>
                      <option value="4">4 Pases</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                      Elección de Menú
                    </label>
                    <select
                      value={formData.menu}
                      onChange={(e) => setFormData({ ...formData, menu: e.target.value })}
                      className="w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 text-sm"
                    >
                      <option value="Carne">Res en Salsa Plum</option>
                      <option value="Pollo">Pollo al Pastor</option>
                      <option value="Vegetariano">Vegetariano</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    ¿Requieres servicio de Autobús?
                  </label>
                  <select
                    value={formData.autobus}
                    onChange={(e) => setFormData({ ...formData, autobus: e.target.value })}
                    className="w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 text-sm"
                  >
                    <option value="No">No, llego por mi cuenta</option>
                    <option value="Si">Sí, requiero lugar en el autobús</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Alergias o Restricciones (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Alergia a nueces / Gluten Free"
                    value={formData.alergias}
                    onChange={(e) => setFormData({ ...formData, alergias: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-base shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all"
            >
              Confirmar Asistencia
            </button>
          </form>
        ) : (
          /* RESPUESTA DE ÉXITO */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/40 rounded-full flex items-center justify-center text-3xl mx-auto">
              ✨
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white">
                ¡Gracias, {formData.nombre}!
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                {formData.asistencia === "si"
                  ? `Tu confirmación para ${formData.pases} lugar(es) ha sido registrada exitosamente.`
                  : "Lamentamos que no puedas acompañarnos. Tu respuesta ha sido enviada."}
              </p>
            </div>

            {formData.asistencia === "si" && (
              <div className="space-y-3 pt-2">
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-sm font-semibold flex items-center justify-center gap-2 text-slate-200 transition-colors"
                >
                  📍 Abrir Ubicación en Google Maps
                </a>
                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-sm font-semibold flex items-center justify-center gap-2 text-slate-200 transition-colors"
                >
                  📅 Agregar a mi Google Calendar
                </a>
              </div>
            )}

            <button
              onClick={() => setSubmitted(false)}
              className="text-xs font-semibold text-amber-400 hover:underline"
            >
              ← Probar el formulario otra vez
            </button>
          </div>
        )}
      </div>

      {/* FOOTER CTA PARA CONVERTIR AL CLIENTE */}
      <div className="w-full max-w-lg mt-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20 text-center space-y-3">
        <p className="text-sm font-bold text-white">
          ¿Te gustó cómo funciona para tus invitados?
        </p>
        <p className="text-xs text-slate-400">
          Crea el tuyo personalizado con reporte en Excel y panel de gestión.
        </p>
        <div className="pt-1 flex justify-center gap-3">
          <a
            href="https://wa.me/528115591681?text=Hola,%20probé%20el%20demo%20y%20quiero%20cotizar%20mi%20evento"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20"
          >
            Quiero este Sistema
          </a>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-all"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}