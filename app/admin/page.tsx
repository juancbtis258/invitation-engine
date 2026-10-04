"use client";

import React, { useState, useEffect } from "react";

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#060a12] flex items-center justify-center text-amber-500 font-bold text-sm">
        Cargando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 p-8">
      <h1 className="text-2xl font-bold text-amber-500">Panel Administrativo</h1>
      <p className="mt-2 text-slate-400">La página ha cargado correctamente.</p>
    </div>
  );
}