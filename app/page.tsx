import FormEngine from "./components/FormEngine";
import formData from "./data/form-config.json";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0b192c] text-white flex flex-col items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-md bg-[#1e293b] rounded-2xl shadow-xl border border-slate-700 p-6 md:p-8">
        <h1 className="text-xl md:text-2xl font-bold text-amber-400 text-center mb-1">
          {formData.title || "Confirma tu asistencia"}
        </h1>
        <p className="text-xs text-slate-300 text-center mb-6">
          {formData.subtitle || "Completa la siguiente información para reservar tus lugares"}
        </p>

        <FormEngine />
      </div>
    </main>
  );
}