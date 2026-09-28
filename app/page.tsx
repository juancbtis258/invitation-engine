import FormEngine from "./components/FormEngine";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-amber-100">Boda María & Alejandro</h1>
        <p className="text-slate-400 text-sm mt-1">Confirmación de Asistencia Digital</p>
      </header>
      
      <FormEngine />
    </main>
  );
}