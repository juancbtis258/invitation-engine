import FormEngine from "./components/FormEngine";
import Countdown from "./components/Countdown";
import formData from "./data/form-config.json";

export default function Home() {
  const theme = formData.theme || "gold";

  const themeStyles = {
    gold: "bg-slate-950 text-slate-100",
    romantic: "bg-rose-950 text-rose-50",
    emerald: "bg-emerald-950 text-emerald-50",
  };

  const selectedTheme =
    themeStyles[theme as keyof typeof themeStyles] || themeStyles.gold;

  return (
    <main
      className={`min-h-screen flex flex-col items-center justify-center p-4 md:p-8 ${selectedTheme} transition-colors duration-500`}
    >
      <div className="w-full max-w-lg text-center mb-6">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">
          {formData.title}
        </h1>
        <p className="text-sm font-medium opacity-80 uppercase tracking-widest mb-4">
          {formData.subtitle}
        </p>

        {/* Cuenta Regresiva */}
        {formData.eventDate && <Countdown targetDate={formData.eventDate} />}

        {/* Ubicación */}
        {formData.locationName && (
          <a
            href={formData.locationUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 text-amber-300 px-4 py-2 rounded-full border border-slate-700 transition mt-2"
          >
            📍 {formData.locationName} (Ver Mapa)
          </a>
        )}
      </div>

      <FormEngine />
    </main>
  );
}