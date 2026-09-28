export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
        <span className="text-amber-400 text-sm uppercase tracking-widest font-semibold">
          ¡Estás invitado!
        </span>
        <h1 className="text-4xl font-bold mt-2 mb-4 text-amber-100">
          Nuestra Boda
        </h1>
        <p className="text-slate-300 text-lg mb-6">
          María & Alejandro
        </p>
        
        <div className="border-t border-b border-slate-700 py-4 my-6 space-y-2 text-sm text-slate-400">
          <p>📅 <strong>Fecha:</strong> 25 de Octubre, 2026</p>
          <p>⏰ <strong>Hora:</strong> 6:00 PM</p>
          <p>📍 <strong>Lugar:</strong> Jardin de Eventos Las Palmas</p>
        </div>

        <button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 px-6 rounded-xl transition duration-200 shadow-lg">
          Confirmar Asistencia
        </button>
      </div>
    </main>
  );
}