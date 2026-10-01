"use client";

import { useState } from "react";
import Link from "next/link";

// Categorías del evento
const CATEGORIAS = {
  bodas: {
    id: "bodas",
    nombre: "💍 Bodas",
    badge: "Boda Sofía & Mateo",
    fecha: "Sábado, 18 de Octubre, 2026 • Monterrey, N.L.",
    color: "from-amber-500/20 via-amber-400/10",
  },
  xv: {
    id: "xv",
    nombre: "👑 XV Años",
    badge: "Mis XV Años • Valentina",
    fecha: "Viernes, 27 de Noviembre, 2026 • San Pedro, N.L.",
    color: "from-purple-500/20 via-pink-400/10",
  },
  corporativo: {
    id: "corporativo",
    nombre: "🎉 Fiestas & Empresas",
    badge: "Evento Anual - TechCorp",
    fecha: "Sábado, 12 de Diciembre, 2026 • Monterrey, N.L.",
    color: "from-blue-500/20 via-indigo-400/10",
  },
};

// Planes disponibles
const PLANES = {
  basico: {
    id: "basico",
    nombre: "⚡ Plan Básico",
    descripcion: "Confirmación directa por WhatsApp (Sin BD)",
  },
  plus: {
    id: "plus",
    nombre: "⭐ Plan Plus",
    descripcion: "Formulario web completo y personalizado",
  },
  premium: {
    id: "premium",
    nombre: "👑 Plan Premium",
    descripcion: "Formulario completo + Panel de Gestión Admin",
  },
};

export default function DemoPage() {
  const [categoriaActual, setCategoriaActual] = useState<keyof typeof CATEGORIAS>("bodas");
  const [planActual, setPlanActual] = useState<keyof typeof PLANES>("plus");
  const [submitted, setSubmitted] = useState(false);
  const [verPanelAdmin, setVerPanelAdmin] = useState(false);

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
    setSubmitted(false);
    setVerPanelAdmin(false);
  };

  const handleCambiarPlan = (planKey: keyof typeof PLANES) => {
    setPlanActual(planKey);
    setSubmitted(false);
    setVerPanelAdmin(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (planActual === "basico") {
      // Lógica Plan Básico: Genera enlace de WhatsApp
      const textoWA = `Hola! Soy ${formData.nombre}. Confirmo que ${
        formData.asistencia === "si" ? "SÍ asistiré" : "NO podré asistir"
      } al evento ${evento.badge}.`;
      const urlWA = `https://wa.me/528115591681?text=${encodeURIComponent(textoWA)}`;
      window.open(urlWA, "_blank");
    }

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-500 selection:text-slate-950">
      
      {/* BANNER SUPERIOR INFORMATIVO */}
      <div className="w-full max-w-2xl mb-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-center">
        <p className="text-xs text-amber-400 font-semibold">
          💡 **Modo Demostración:** Selecciona la categoría del evento y el **Plan** para comparar funciones.
        </p>
      </div>

      {/* SELECTOR 1: CATEGORÍAS */}
      <div className="w-full max-w-2xl mb-3 grid grid-cols-3 gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
        {(Object.keys(CATEGORIAS) as Array<keyof typeof CATEGORIAS>).map((key) => {
          const cat = CATEGORIAS[key];
          const isActive = categoriaActual === key;
          return (
            <button
              key={key}
              onClick={() => handleCambiarCategoria(key)}
              className={`py-2 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
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

      {/* SELECTOR 2: PLANES (BÁSICO / PLUS / PREMIUM) */}
      <div className="w-full max-w-2xl mb-6 grid grid-cols-3 gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
        {(Object.keys(PLANES) as Array<keyof typeof PLANES>).map((key) => {
          const plan = PLANES[key];
          const isActive = planActual === key;
          return (
            <button
              key={key}
              onClick={() => handleCambiarPlan(key)}
              className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center ${
                isActive
                  ? "bg-slate-800 text-amber-400 border border-amber-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>{plan.nombre}</span>
              <span className="text-[10px] text-slate-500 hidden sm:block font-normal">
                {plan.descripcion}
              </span>
            </button>
          );
        })}
      </div>

      {/* TARJETA PRINCIPAL DEL DEMO */}
      <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
        
        {/* HEADER */}
        <div className={`bg-gradient-to-r ${evento.color} to-transparent p-6 text-center border-b border-slate-800`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-500/10 px-3 py-0.5 rounded-full border border-amber-500/20">
              {PLANES[planActual].nombre}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {evento.badge}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {evento.fecha}
          </p>
        </div>

        {!submitted ? (
          /* FORMULARIO ADAPTABLE SEGÚN EL PLAN */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* NOMBRE COMPLETO (Disponible en todos los planes) */}
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
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>

            {/* WHATSAPP (Solo Plus y Premium) */}
            {planActual !== "basico" && (
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
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>
            )}

            {/* ASISTENCIA (Disponible en todos los planes) */}
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

            {/* CAMPOS EXTRAS EXCLUSIVOS PARA PLAN PLUS Y PREMIUM */}
            {planActual !== "basico" && formData.asistencia === "si" && (
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
                      </select>
                    </div>
                  )}
                </div>

                {categoriaActual === "xv" && (
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                      🎵 ¿Qué canción no puede faltar?
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
                      🚌 ¿Requieres Autobús del Evento?
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
              {planActual === "basico"
                ? "Enviar Confirmación por WhatsApp 📲"
                : `Confirmar Asistencia (${PLANES[planActual].nombre})`}
            </button>
          </form>
        ) : (
          /* RESPUESTA SEGÚN EL PLAN */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/40 rounded-full flex items-center justify-center text-3xl mx-auto">
              ✨
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white">
                ¡Gracias por responder, {formData.nombre}!
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                {planActual === "basico"
                  ? "En el Plan Básico, el asistente redirige automáticamente la respuesta a tu WhatsApp."
                  : formData.asistencia === "si"
                  ? `Tu registro para ${evento.badge} (${formData.pases} pases) se guardó en la base de datos.`
                  : "Has indicado que no asistirás. El estado se actualizó en el sistema."}
              </p>
            </div>

            {/* DEMO ADICIONAL DEL PLAN PREMIUM: VISTA PREVIA PANEL ADMIN */}
            {planActual === "premium" && (
              <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase">
                    👑 Vista Previa - Panel Admin Organizador
                  </span>
                  <button
                    onClick={() => setVerPanelAdmin(!verPanelAdmin)}
                    className="text-xs text-slate-300 underline font-semibold"
                  >
                    {verPanelAdmin ? "Ocultar Panel" : "Ver Simulación de Excel"}
                  </button>
                </div>

                {verPanelAdmin && (
                  <div className="overflow-x-auto pt-2">
                    <table className="w-full text-left text-xs text-slate-300 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-amber-400">
                          <th className="p-2">Nombre</th>
                          <th className="p-2">Asiste</th>
                          <th className="p-2">Pases</th>
                          <th className="p-2">Menú</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-800/50">
                          <td className="p-2 font-semibold text-white">{formData.nombre || "María Elena"}</td>
                          <td className="p-2">{formData.asistencia === "si" ? "✅ Sí" : "❌ No"}</td>
                          <td className="p-2">{formData.pases}</td>
                          <td className="p-2">{formData.menu}</td>
                        </tr>
                        <tr>
                          <td className="p-2 text-slate-500">Carlos Garza</td>
                          <td className="p-2 text-slate-500">✅ Sí</td>
                          <td className="p-2 text-slate-500">2</td>
                          <td className="p-2 text-slate-500">Medallón de Res</td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="mt-3 text-right">
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-md font-bold">
                        📥 Exportación a Excel activada
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => {
                setSubmitted(false);
                setVerPanelAdmin(false);
              }}
              className="text-xs font-semibold text-amber-400 hover:underline block mx-auto"
            >
              ← Probar otro plan o respuesta
            </button>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="w-full max-w-2xl mt-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20 text-center space-y-3">
        <p className="text-sm font-bold text-white">
          ¿Quieres cotizar o adquirir tu invitación interactiva?
        </p>
        <div className="pt-1 flex justify-center gap-3">
          <a
            href="https://wa.me/528115591681?text=Hola,%20probé%20el%20demo%20interactivo%20y%20quiero%20cotizar"
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