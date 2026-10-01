"use client";

import { useState } from "react";
import Link from "next/link";

// Datos y preguntas dinámicas según la categoría
const CATEGORIAS = {
  bodas: {
    id: "bodas",
    nombre: "💍 Bodas",
    badge: "Formulario para Bodas",
    titulo: "Boda Sofía & Mateo",
    fecha: "Sábado, 18 de Octubre, 2026 • Monterrey, N.L.",
    color: "from-amber-500/20 via-amber-400/10",
    preguntasEspeciales: true,
  },
  xv: {
    id: "xv",
    nombre: "👑 XV Años",
    badge: "Formulario para XV Años",
    titulo: "Mis XV Años • Valentina",
    fecha: "Viernes, 27 de Noviembre, 2026 • San Pedro, N.L.",
    color: "from-purple-500/20 via-pink-400/10",
    preguntasEspeciales: false,
  },
  corporativo: {
    id: "corporativo",
    nombre: "🎉 Fiestas & Empresas",
    badge: "Formulario para Eventos Corporativos / Cumpleaños",
    titulo: "Fiesta Fin de Año - TechCorp",
    fecha: "Sábado, 12 de Diciembre, 2026 • Monterrey, N.L.",
    color: "from-blue-500/20 via-indigo-400/10",
    preguntasEspeciales: false,
  },
};

export default function DemoPage() {
  const [categoriaActual, setCategoriaActual] = useState<keyof typeof CATEGORIAS>("bodas");
  const [submitted, setSubmitted] = useState(false);

  const evento = CATEGORIAS[categoriaActual];

  const [formData, setFormData] = useState({
    nombre: "",
    whatsapp: "",
    asistencia: "si",
    pases: "2",
    menu: "Carne",
    autobus: "No",
    cancion: "",
    alergias: "",
  });

  const handleCambiarCategoria = (catKey: keyof typeof CATEGORIAS) => {
    setCategoriaActual(catKey);
    setSubmitted(false); // Reinicia la vista al cambiar de categoría
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-500 selection:text-slate-950">
      
      {/* BANNER INFORMATIVO */}
      <div className="w-full max-w-xl mb-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-center">
        <p className="text-xs text-amber-400 font-semibold">
          💡 **Modo Demostración:** Selecciona el tipo de evento para ver cómo se adapta el formulario.
        </p>
      </div>

      {/* SELECTOR DE LAS 3 CATEGORÍAS (TABS) */}
      <div className="w-full max-w-xl mb-6 grid grid-cols-3 gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
        {(Object.keys(CATEGORIAS) as Array<keyof typeof CATEGORIAS>).map((key) => {
          const cat = CATEGORIAS[key];
          const isActive = categoriaActual === key;
          return (
            <button
              key={key}
              onClick={() => handleCambiarCategoria(key)}
              className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                isActive
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              {cat.nombre}
            </button>
          );
        })}
      </div>

      {/* TARJETA DEL FORMULARIO */}
      <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
        
        {/* HEADER DINÁMICO SEGÚN LA CATEGORÍA */}
        <div className={`bg-gradient-to-r ${evento.color} to-transparent p-6 text-center border-b border-slate-800`}>
          <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            {evento.badge}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
            {evento.titulo}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {evento.fecha}
          </p>
        </div>

        {!submitted ? (
          /* FORMULARIO ADAPTABLE */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. María Elena Garza"
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
                  ¡Sí, asistiré! 🎉
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                      Lugares Reservados
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

                  {/* CAMPO ESPECÍFICO PARA BODAS */}
                  {categoriaActual === "bodas" && (
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                        Elección de Menú
                      </label>
                      <select
                        value={formData.menu}
                        onChange={(e) => setFormData({ ...formData, menu: e.target.value })}
                        className="w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 text-sm"
                      >
                        <option value="Carne">Medallón de Res</option>
                        <option value="Pollo">Pechuga Cordon Bleu</option>
                        <option value="Vegetariano">Menú Vegetariano</option>
                      </select>
                    </div>
                  )}

                  {/* CAMPO ESPECÍFICO PARA XV AÑOS */}
                  {categoriaActual === "xv" && (
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                        ¿Requieres Menú Juvenil?
                      </label>
                      <select
                        value={formData.menu}
                        onChange={(e) => setFormData({ ...formData, menu: e.target.value })}
                        className="w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 text-sm"
                      >
                        <option value="Adultos">Menú Formal Adultos</option>
                        <option value="Jovenes">Menú Jóvenes / Teens</option>
                      </select>
                    </div>
                  )}

                  {/* CAMPO ESPECÍFICO PARA CORPORATIVOS */}
                  {categoriaActual === "corporativo" && (
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                        Área de la Empresa
                      </label>
                      <select
                        value={formData.menu}
                        onChange={(e) => setFormData({ ...formData, menu: e.target.value })}
                        className="w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 text-sm"
                      >
                        <option value="Ventas">Ventas / Comercial</option>
                        <option value="Sistemas">Sistemas / IT</option>
                        <option value="Administracion">Administración</option>
                        <option value="Invitado">Invitado Externo</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* PREGUNTA INTERACTIVA SEGÚN CATEGORÍA */}
                {categoriaActual === "xv" && (
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                      🎵 ¿Qué canción no puede faltar en la pista?
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Tití Me Preguntó - Bad Bunny"
                      value={formData.cancion}
                      onChange={(e) => setFormData({ ...formData, cancion: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 text-sm"
                    />
                  </div>
                )}

                {categoriaActual === "bodas" && (
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                      🚌 ¿Requieres lugar en el Autobús del Evento?
                    </label>
                    <select
                      value={formData.autobus}
                      onChange={(e) => setFormData({ ...formData, autobus: e.target.value })}
                      className="w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 text-sm"
                    >
                      <option value="No">No, llego en auto propio</option>
                      <option value="Si">Sí, apartar transporte de ida y vuelta</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Alergias o Restricciones Alimenticias
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Sin gluten / Alergia a mariscos"
                    value={formData.alergias}
                    onChange={(e) => setFormData({ ...formData, alergias: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-base shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all"
            >
              Confirmar Asistencia ({evento.nombre})
            </button>
          </form>
        ) : (
          /* RESPUESTA PERSONALIZADA */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/40 rounded-full flex items-center justify-center text-3xl mx-auto">
              ✨
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white">
                ¡Gracias por responder, {formData.nombre}!
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                {formData.asistencia === "si"
                  ? `Tu registro para ${evento.titulo} (${formData.pases} pases) ha sido guardado exitosamente.`
                  : "Has indicado que no asistirás. La información ha sido enviada al organizador."}
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
                  📍 Ver Ubicación del Salón en Maps
                </a>
                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-sm font-semibold flex items-center justify-center gap-2 text-slate-200 transition-colors"
                >
                  📅 Agendar en Google Calendar
                </a>
              </div>
            )}

            <button
              onClick={() => setSubmitted(false)}
              className="text-xs font-semibold text-amber-400 hover:underline"
            >
              ← Probar otra respuesta o cambiar de evento
            </button>
          </div>
        )}
      </div>

      {/* FOOTER Y LLAMADA A LA ACCIÓN */}
      <div className="w-full max-w-xl mt-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20 text-center space-y-3">
        <p className="text-sm font-bold text-white">
          ¿Necesitas un sistema así para tu Boda, XV Años o Evento?
        </p>
        <p className="text-xs text-slate-400">
          Personalizamos las preguntas, diseño y te entregamos tu panel con descarga a Excel.
        </p>
        <div className="pt-1 flex justify-center gap-3">
          <a
            href="https://wa.me/528115591681?text=Hola,%20probé%20el%20demo%20interactivo%20y%20quiero%20cotizar%20mi%20evento"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20"
          >
            Cotizar por WhatsApp
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