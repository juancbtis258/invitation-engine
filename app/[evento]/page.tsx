"use client";

import { useEffect, useState, use } from "react";
import FormEngine from "../components/FormEngine";

export default function EventPage({ params }: { params: Promise<{ evento: string }> }) {
  const resolvedParams = use(params);
  const eventSlug = resolvedParams.evento;

  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/form-config?event=${eventSlug}`)
      .then((res) => res.json())
      .then((res) => {
        setEventData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [eventSlug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <p className="text-slate-600 text-sm font-medium">Cargando evento...</p>
      </main>
    );
  }

  if (!eventData) {
    return (
      <main className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-slate-800">Evento no encontrado</h1>
          <p className="text-slate-500 text-sm">El enlace ingresado no existe o no se encuentra activo.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8f5] py-10 px-4">
      <div className="max-w-md mx-auto mb-6 text-center">
        <h1 className="text-2xl font-extrabold text-slate-900">{eventData.title}</h1>
        {eventData.targetDate && (
          <p className="text-xs text-slate-500 mt-1">Fecha: {eventData.targetDate}</p>
        )}
      </div>

      {/* Renderiza el motor con la ID del evento correspondiente */}
      <FormEngine eventSlug={eventSlug} />
    </main>
  );
}