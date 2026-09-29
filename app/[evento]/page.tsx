"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import FormEngine from "../components/FormEngine";

export default function EventPage() {
  const params = useParams();
  const eventSlug = (params?.evento as string) || "demo";

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

  return (
    <main className="min-h-screen bg-[#faf8f5] py-10 px-4">
      <div className="max-w-md mx-auto mb-6 text-center">
        <h1 className="text-2xl font-extrabold text-slate-900">
          {eventData?.title || "Boda María & Alejandro"}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Fecha: {eventData?.targetDate || "2026-10-15"}
        </p>
      </div>

      <FormEngine eventSlug={eventSlug} />
    </main>
  );
}