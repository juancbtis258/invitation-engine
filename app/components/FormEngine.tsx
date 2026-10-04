"use client";

import { useState } from "react";

export default function FormEngine({ eventSlug = "demo" }: { eventSlug?: string }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre: "",
    whatsapp: "",
    asistira: "",
    numPersonas: 1,
    asistentes: [""] as string[],
    mensaje: "",
  });
  const [loading, setLoading] = useState(false);

  const handleNumPersonasChange = (num: number) => {
    const nuevosAsistentes = Array.from({ length: num }, (_, i) => formData.asistentes[i] || "");
    setFormData({ ...formData, numPersonas: num, asistentes: nuevosAsistentes });
  };

  const handleAsistenteNombreChange = (index: number, val: string) => {
    const list = [...formData.asistentes];
    list[index] = val;
    setFormData({ ...formData, asistentes: list });
  };

  const handleNextStep1 = () => {
    if (!formData.nombre.trim() || !formData.whatsapp.trim() || !formData.asistira) {
      alert("Por favor completa tu nombre, WhatsApp y selecciona si asistirás.");
      return;
    }
    if (formData.asistira === "No") {
      submitForm();
    } else {
      // Aseguramos que al menos haya un campo de asistente para el paso 3
      if (formData.asistentes.length === 0) {
        setFormData({ ...formData, asistentes: [formData.nombre] });
      }
      setStep(2);
    }
  };

  const handleNextStep3 = () => {
    const faltantes = formData.asistentes.some((nombre) => !nombre.trim());
    if (faltantes) {
      alert("Por favor completa los nombres de todos los asistentes.");
      return;
    }
    setStep(4);
  };

  const submitForm = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/form-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_response",
          eventSlug: eventSlug,
          responseData: formData,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStep(5);
      } else {
        alert(data.error || "Error al enviar la respuesta.");
      }
    } catch (error) {
      console.error("Error al enviar la respuesta:", error);
      alert("Error de conexión al enviar la respuesta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-lg text-slate-800 border border-slate-200">
      {step > 1 && step < 5 && (
        <button
          onClick={() => setStep(step - 1)}
          className="text-xs text-slate-500 hover:text-slate-800 mb-4 flex items-center gap-1 font-medium transition"
        >
          ← Regresar
        </button>
      )}

      {/* PANTALLA 1 */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Confirma tu asistencia</h2>
            <p className="text-xs text-slate-600 mt-1">
              Completa la siguiente información para reservar tus lugares.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ingresa tu nombre *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej. Juan Sosa"
                className="w-full p-2.5 rounded-lg bg-white border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ingresa tu número de WhatsApp *</label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+52 811 000 0000"
                className="w-full p-2.5 rounded-lg bg-white border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">¿Asistirás al evento? *</label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, asistira: "Sí" })}
                  className={`w-full text-left p-2.5 rounded-lg border text-sm font-semibold flex items-center gap-2 transition-all ${
                    formData.asistira === "Sí"
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-xs font-bold">A</span> Sí
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, asistira: "No" })}
                  className={`w-full text-left p-2.5 rounded-lg border text-sm font-semibold flex items-center gap-2 transition-all ${
                    formData.asistira === "No"
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-xs font-bold">B</span> No
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextStep1}
              className="w-auto bg-black hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-all"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* PANTALLA 2 */}
      {step === 2 && (
        <div className="space-y-5">
          <h2 className="text-lg font-bold text-slate-900">¿Cuántas personas asistirán? *</h2>
          <select
            value={formData.numPersonas}
            onChange={(e) => handleNumPersonasChange(Number(e.target.value))}
            className="w-full p-2.5 rounded-lg bg-white border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>{n} persona{n > 1 ? "s" : ""}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setStep(3)}
            className="bg-black hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-all"
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* PANTALLA 3 */}
      {step === 3 && (
        <div className="space-y-5">
          <p className="text-xs text-slate-600 font-medium">
            Por favor ingresa los nombres de las personas que asistirán con este pase:
          </p>

          <div className="space-y-3">
            {Array.from({ length: formData.numPersonas }).map((_, idx) => (
              <div key={idx}>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Asistente {idx + 1} *
                </label>
                <input
                  type="text"
                  value={formData.asistentes[idx] || ""}
                  onChange={(e) => handleAsistenteNombreChange(idx, e.target.value)}
                  placeholder={`Nombre completo asistente ${idx + 1}`}
                  className="w-full p-2.5 rounded-lg bg-white border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleNextStep3}
            className="bg-black hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-all"
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* PANTALLA 4 */}
      {step === 4 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Unas palabras siempre me alegran el corazón ❤️️ deja tu mensaje
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">(este campo no es obligatorio)</p>
          </div>

          <textarea
            rows={4}
            value={formData.mensaje}
            onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
            placeholder="Escribe tu mensaje aquí..."
            className="w-full p-3 rounded-lg bg-white border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
          />

          <button
            type="button"
            onClick={submitForm}
            disabled={loading}
            className="bg-black hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Finalizar y Enviar →"}
          </button>
        </div>
      )}

      {/* PANTALLA 5 */}
      {step === 5 && (
        <div className="text-center py-8 space-y-3">
          <p className="text-base font-bold text-slate-900">
            ¡Perfecto! Tu respuesta ha quedado registrada.
          </p>
          <p className="text-sm text-slate-600">
            {formData.asistira === "Sí"
              ? "Te esperamos con mucha alegría 🎉"
              : "Lamentamos que no puedas asistir, ¡gracias por responder!"}
          </p>
        </div>
      )}
    </div>
  );
}