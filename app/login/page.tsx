"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validación básica de ejemplo (Ajusta las credenciales si tienes un backend/Supabase)
    if (email === "admin@mi-invitacion.com" && password === "admin123") {
      localStorage.setItem("user_session", JSON.stringify({ email, role: "admin" }));
      router.push("/admin");
    } else if (email && password) {
      // Simulación de acceso para clientes/colaboradores
      localStorage.setItem("user_session", JSON.stringify({ email, role: "client" }));
      router.push("/admin");
    } else {
      setError("Por favor ingresa correo y contraseña válidos.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 text-slate-100">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        
        {/* Encabezado */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-amber-500">
            Iniciar Sesión
          </h1>
          <p className="text-xs text-slate-400">
            Ingresa tus credenciales para acceder al panel de administración
          </p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Correo Electrónico
            </label>
            <input
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer mt-2"
          >
            {loading ? "Entrando..." : "Acceder al Panel"}
          </button>
        </form>

        {/* Pie de página */}
        <div className="text-center border-t border-slate-800 pt-4">
          <a
            href="/"
            className="text-xs text-slate-500 hover:text-amber-400 transition-all"
          >
            ← Volver al sitio principal
          </a>
        </div>

      </div>
    </main>
  );
}