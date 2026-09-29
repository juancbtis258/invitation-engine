"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // DICCIONARIO DE USUARIOS
  const USERS_DATABASE: Record<string, string> = {
    admin: "123",
    cliente: "123",
    boda: "boda2026",
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanUsername = username.trim().toLowerCase();

    if (USERS_DATABASE[cleanUsername] && USERS_DATABASE[cleanUsername] === password) {
      localStorage.setItem(
        "user_session",
        JSON.stringify({ username: cleanUsername, role: cleanUsername === "admin" ? "admin" : "client" })
      );
      router.push("/admin");
    } else {
      setError("Usuario o contraseña incorrectos.");
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
              Usuario
            </label>
            <input
              type="text"
              placeholder="Ej. admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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

      </div>
    </main>
  );
}