import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* HEADER / NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
              Z
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Zoe Creaciones
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-slate-800/60"
            >
              Acceso Clientes
            </Link>
            <a
              href="https://wa.me/528115591681?text=Hola,%20me%20interesa%20cotizar%20una%20invitación%20digital"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-amber-500/25 active:scale-95"
            >
              Cotizar por WhatsApp
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            ✨ Plataforma Profesional de Invitaciones Digitales
          </span>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Invitaciones Digitales e Interactivas para tus <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">Eventos Especiales</span>
          </h1>

          <p className="text-lg text-slate-400 leading-relaxed">
            Sorprende a tus invitados con confirmación de asistencia en tiempo real, mapas interactivos, pases personalizados y diseño exclusivo adaptado a tu marca o fiesta.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/528115591681?text=Hola,%20quiero%20crear%20mi%20invitación%20digital"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-base transition-all shadow-xl shadow-amber-500/20 hover:scale-105"
            >
              Crear mi Invitación Ahora
            </a>
            <Link
              href="/admin"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-base transition-all text-center"
            >
              Ingresar al Panel
            </Link>
          </div>
        </div>

        {/* CARACTERÍSTICAS DE LA PLATAFORMA */}
        <section className="mt-28 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-2xl font-bold">
              📋
            </div>
            <h3 className="text-xl font-bold text-white">Confirmación RSVP</h3>
            <p className="text-sm text-slate-400">
              Recibe las respuestas de tus invitados al instante en tu panel con conteo de acompañantes, alergias o restricciones.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-2xl font-bold">
              📍
            </div>
            <h3 className="text-xl font-bold text-white">Ubicación & Mapas</h3>
            <p className="text-sm text-slate-400">
              Integración directa con Google Maps y Waze para que tus invitados lleguen a la recepción sin contratiempos.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-2xl font-bold">
              🎨
            </div>
            <h3 className="text-xl font-bold text-white">Diseño Exclusivo</h3>
            <p className="text-sm text-slate-400">
              Personalización completa de colores, fuentes, cuestionarios y contenido para Bodas, XV Años, Cumpleaños y Bautizos.
            </p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} Zoe Creaciones. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}