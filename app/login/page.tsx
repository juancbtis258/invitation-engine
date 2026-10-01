"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Lista de usuarios por defecto (madrina/respaldo)
const USUARIOS_DEFAULT = [
  {
    id: "u1",
    nombre: "Alejandro Mejía",
    username: "amejia",
    whatsapp: "5218115591681",
    password: "admin123",
    rol: "ADMINISTRADOR",
    eventoAsignadoSlug: "todos",
    activo: true,
  },
  {
    id: "u2",
    nombre: "Yunnie",
    username: "yunnie",
    whatsapp: "5218116122704",
    password: "123",
    rol: "CLIENTE",
    eventoAsignadoSlug: "todos",
    activo: true,
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    setTimeout(() => {
      const userClean = username.trim().toLowerCase();

      // Cargar lista de colaboradores guardados desde localStorage o usar defaults
      let usuariosLista = USUARIOS_DEFAULT;
      const usuariosGuardados = localStorage.getItem("app_usuarios_lista");

      if (usuariosGuardados) {
        try {
          const parsed = JSON.parse(usuariosGuardados);
          if (Array.isArray(parsed) && parsed.length > 0) {
            usuariosLista = parsed;
          }
        } catch (err) {
          console.error("Error leyendo usuarios de localStorage", err);
        }
      }

      // 1. Caso SuperAdmin Maestro Hardcoded (Respaldo absoluto)
      if (
        (userClean === "admin" || userClean === "amejia") &&
        (password === "admin123" || password === "admin")
      ) {
        localStorage.setItem("userRole", "ADMINISTRADOR");
        localStorage.setItem("userSlug", "todos");
        localStorage.setItem("userName", "Alejandro Mejía");
        localStorage.setItem("userUsername", userClean);
        router.push("/admin");
        return;
      }

      // 2. Buscar si el usuario existe en la lista de Colaboradores
      const usuarioEncontrado = usuariosLista.find(
        (u) => u.username.toLowerCase().trim() === userClean
      );

      if (!usuarioEncontrado) {
        setErrorMsg("El nombre de usuario no existe o no tiene permisos.");
        setLoading(false);
        return;
      }

      // 3. Verificar si el usuario está activo/suspendido
      if (usuarioEncontrado.activo === false) {
        setErrorMsg("Tu cuenta se encuentra suspendida. Contacta al administrador.");
        setLoading(false);
        return;
      }

      // 4. Validar contraseña
      const passwordCorrecta = usuarioEncontrado.password || "123456";
      if (password !== passwordCorrecta) {
        setErrorMsg("Contraseña incorrecta. Inténtalo nuevamente.");
        setLoading(false);
        return;
      }

      // 5. Login exitoso
      localStorage.setItem("userRole", usuarioEncontrado.rol);
      localStorage.setItem("userSlug", usuarioEncontrado.eventoAsignadoSlug || "todos");
      localStorage.setItem("userName", usuarioEncontrado.nombre);
      localStorage.setItem("userUsername", usuarioEncontrado.username);

      router.push("/admin");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#0d1527] text-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-[#121c33] border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-amber-500 tracking-tight">
            Acceso a la Plataforma
          </h1>
          <p className="text-xs text-slate-400">
            Ingresa tus credenciales para administrar tus invitaciones y eventos
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-950/60 border border-rose-800/80 p-3 rounded-xl text-center text-xs text-rose-300 font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
              Nombre de Usuario
            </label>
            <input
              type="text"
              placeholder="Ej. amejia"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-amber-400 font-mono focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-emerald-400 font-mono focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? "⏳ Verificando..." : "🚀 Iniciar Sesión"}
          </button>
        </form>

        <div className="border-t border-slate-800/80 pt-4 text-center">
          <p className="text-[11px] text-slate-500">
            ¿Necesitas ayuda con tu cuenta? Contacta a tu proveedor.
          </p>
        </div>
      </div>
    </div>
  );
}