"use client";

import { useState } from "react";
import formData from "../data/form-config.json";

// Tu URL de Google Apps Script:
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwZ4jQVBC_Puii6O4pMMuPZr-8VnUzSo0tqnOdAyPFoEglrfPQJqRBdIR9zChCtyEOOmA/exec";

export default function FormEngine() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = formData.questions[currentIndex];
  const progress = ((currentIndex + 1) / formData.questions.length) * 100;

  const handleInputChange = (value: any) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = async () => {
    if (currentIndex < formData.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsSubmitting(true);
      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "text/plain",
          },
          body: JSON.stringify(answers),
        });
      } catch (err) {
        console.error("Error al enviar la respuesta:", err);
      } finally {
        setIsSubmitting(false);
        setIsFinished(true);
      }
    }
  };

  if (isFinished) {
    return (
      <div className="text-center p-8 bg-slate-800 rounded-2xl border border-amber-400/30 max-w-md w-full shadow-2xl animate-fade-in">
        <div className="w-16 h-16 bg-amber-400/10 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-400/20">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-amber-300 mb-2">
          ¡Gracias por confirmar!
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed">
          Hemos registrado tus respuestas. ¡Nos alegra mucho contar contigo en este día tan especial!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
      {/* Barra de progreso */}
      <div className="w-full bg-slate-700 h-2 rounded-full mb-6 overflow-hidden">
        <div
          className="bg-amber-400 h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <span className="text-xs text-amber-400 font-semibold tracking-wider uppercase">
        Pregunta {currentIndex + 1} de {formData.questions.length}
      </span>

      <h2 className="text-xl font-bold text-white mt-2 mb-4">
        {currentQuestion.title}
      </h2>

      {/* Renderizado dinámico de tipos de pregunta */}
      <div className="mb-6">
        {currentQuestion.type === "text" && (
          <input
            type="text"
            placeholder={currentQuestion.placeholder}
            value={answers[currentQuestion.id] || ""}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full p-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-amber-400"
          />
        )}

        {currentQuestion.type === "number" && (
          <input
            type="number"
            min={currentQuestion.min}
            max={currentQuestion.max}
            value={answers[currentQuestion.id] ?? 1}
            onChange={(e) => handleInputChange(Number(e.target.value))}
            className="w-full p-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-amber-400"
          />
        )}

        {currentQuestion.type === "choice" && (
          <div className="space-y-2">
            {currentQuestion.options?.map((option) => (
              <button
                key={option}
                onClick={() => handleInputChange(option)}
                className={`w-full text-left p-3 rounded-xl border transition ${
                  answers[currentQuestion.id] === option
                    ? "bg-amber-500/20 border-amber-400 text-amber-200"
                    : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleNext}
        disabled={
          isSubmitting ||
          (currentQuestion.required && !answers[currentQuestion.id])
        }
        className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold py-3 rounded-xl transition flex items-center justify-center"
      >
        {isSubmitting
          ? "Enviando..."
          : currentIndex === formData.questions.length - 1
          ? "Enviar Respuesta"
          : "Siguiente →"}
      </button>
    </div>
  );
}