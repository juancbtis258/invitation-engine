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
              href="/login"
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-slate-800/60"
            >
              Acceso Clientes
            </Link>
            <a
              href="https://wa.me/528115591681?text=Hola,%20me%20interesa%20un%20sistema%20de%20control%20de%20invitados%20para%20mi%20evento"
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
            📊 Sistema de Control y Confirmación de Invitados
          </span>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Gestión y Control de Invitados para tus <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">Eventos Especiales</span>
          </h1>

          <p className="text-lg text-slate-400 leading-relaxed">
            Organiza tus Bodas, XV Años y fiestas con formularios personalizados, confirmación de asistencia en tiempo real, preguntas a medida y descarga de reportes en Excel.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-base transition-all shadow-xl shadow-amber-500/20 hover:scale-105 text-center"
            >
              Acceder al Panel de Control
            </Link>
            <a
              href="https://wa.me/528115591681?text=Hola,%20me%20gustaria%20ver%20una%20demostracion%20del%20sistema"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-base transition-all text-center"
            >
              Ver Demo en Vivo
            </a>
          </div>
        </div>

        {/* CARACTERÍSTICAS DE LA PLATAFORMA */}
        <section className="mt-28 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-2xl font-bold">
              ✍️
            </div>
            <h3 className="text-xl font-bold text-white">Formularios Personalizados</h3>
            <p className="text-sm text-slate-400">
              Crea campos a la medida: número de pases, requerimientos de autobús, confirmación de menú o preguntas de opción múltiple.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-2xl font-bold">
              📈
            </div>
            <h3 className="text-xl font-bold text-white">Métricas en Tiempo Real</h3>
            <p className="text-sm text-slate-400">
              Visualiza el total de asistentes confirmados, lugares cancelados y respuestas completas desde tu panel de control.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-2xl font-bold">
              📥
            </div>
            <h3 className="text-xl font-bold text-white">Exportación a Excel</h3>
            <p className="text-sm text-slate-400">
              Descarga en un clic la lista completa de invitados confirmados en formato CSV/Excel para entregarlo a tu banquetero o salón.
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