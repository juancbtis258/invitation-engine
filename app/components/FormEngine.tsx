"use client";

import { useState } from "react";
import formData from "../data/form-config.json";

export default function FormEngine() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const questions = formData.questions;
  const currentQ = questions[currentIndex];

  const handleNext = async (value: any) => {
    const updatedAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(updatedAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setSubmitting(true);
      try {
        await fetch("/api/responses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedAnswers),
        });
      } catch (e) {
        console.error(e);
      }
      setSubmitting(false);
      setIsFinished(true);
    }
  };

  const generateWhatsAppUrl = () => {
    const nombre = answers["nombre"] || answers["pregunta_1"] || "Un invitado";
    const text = `¡Hola! Soy *${nombre}*. Acabo de confirmar mi asistencia.`;
    return `https://wa.me/528100000000?text=${encodeURIComponent(text)}`;
  };

  if (submitting) {
    return <div className="text-center py-6 text-sm text-slate-600 font-medium">Enviando respuestas...</div>;
  }

  if (isFinished) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="text-3xl">🎉</div>
        <h2 className="text-lg font-bold text-slate-800">¡Respuesta registrada!</h2>
        <a
          href={generateWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition text-sm shadow"
        >
          📲 Enviar Confirmación por WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Indicador discreto */}
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">
        Paso {currentIndex + 1} de {questions.length}
      </div>

      <label className="block text-sm font-semibold text-slate-800">
        {currentQ.title} {currentQ.required && <span className="text-red-500">*</span>}
      </label>

      {currentQ.type === "text" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const val = (e.currentTarget.elements.namedItem("answer") as HTMLInputElement).value;
            if (val) handleNext(val);
          }}
          className="space-y-3"
        >
          <input
            name="answer"
            type="text"
            required={currentQ.required}
            placeholder={currentQ.placeholder}
            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-slate-800"
          />
          <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-sm transition">
            Siguiente →
          </button>
        </form>
      )}

      {currentQ.type === "choice" && (
        <div className="space-y-2">
          {currentQ.options?.map((opt: string) => (
            <button
              key={opt}
              onClick={() => handleNext(opt)}
              className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium transition"
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {currentQ.type === "number" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const val = (e.currentTarget.elements.namedItem("answer") as HTMLInputElement).value;
            if (val) handleNext(val);
          }}
          className="space-y-3"
        >
          <input
            name="answer"
            type="number"
            min={1}
            max={10}
            defaultValue={1}
            required={currentQ.required}
            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-center font-bold text-lg focus:outline-none focus:border-slate-800"
          />
          <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-sm transition">
            Siguiente →
          </button>
        </form>
      )}

      {currentQ.type === "textarea" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const val = (e.currentTarget.elements.namedItem("answer") as HTMLTextAreaElement).value;
            handleNext(val || "Sin mensaje");
          }}
          className="space-y-3"
        >
          <textarea
            name="answer"
            rows={3}
            placeholder={currentQ.placeholder}
            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-slate-800"
          />
          <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-sm transition">
            Finalizar →
          </button>
        </form>
      )}
    </div>
  );
}