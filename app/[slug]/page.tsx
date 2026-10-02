"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";

interface Question {
  id: string;
  label: string;
  type: string;
  options?: string[];
  required: boolean;
  placeholder?: string;
}

interface EventConfig {
  id?: string;
  title?: string;
  customTitle?: string;
  slug?: string;
  targetDate?: string;
  plan?: string;
  planType?: string;
  active?: boolean;
  whatsappPhone?: string;
  whatsappNotif?: string;
  pasesAsignados?: number;
  maxPasses?: number;
  bannerUrl?: string;
  customMessage?: string;
  questions?: Question[];
  preguntas?: string[];
}

export default function EventPublicPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const slug = params?.slug as string;
  // Permite leer pases personalizados pasados por URL (?pases=4)
  const pasesUrl = searchParams?.get("pases");

  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<EventConfig | null>(null);

  // Estados del Formulario
  const [nombreInvitado, setNombreInvitado] = useState("");
  const [whatsappInvitado, setWhatsappInvitado] = useState("");
  const [asistira, setAsistira] = useState<boolean>(true);
  const [pasesSeleccionados, setPasesSeleccionados] = useState<number>(1);
  const [nombresAcompanantes, setNombresAcompanantes] = useState<string[]>([]);
  const [respuestasCustom, setRespuestasCustom] = useState<Record<string, string>>({});
  const [mensajeLibre, setMensajeLibre] = useState("");

  useEffect(() => {
    if (!slug) return;

    // 1. Intentar consultar a la API usando el parámetro correcto ("event")
    fetch(`/api/form-config?event=${slug}`)
      .then((res) => res.json())
      .then((resData) => {
        let eventFound: EventConfig | null = null;

        if (resData.success && resData.data) {
          eventFound = resData.data;
        } else if (resData.data) {
          eventFound = resData.data;
        }

        // 2. Fallback: Buscar en el localStorage del navegador
        if (!eventFound) {
          const eventosGuardados = localStorage.getItem("app_eventos_lista");
          if (eventosGuardados) {
            try {
              const lista = JSON.parse(eventosGuardados);
              if (Array.isArray(lista)) {
                const match = lista.find(
                  (item: any) =>
                    item.slug?.toLowerCase() === slug.toLowerCase()
                );
                if (match) {
                  eventFound = match;
                }
              }
            } catch (e) {
              console.error("Error al leer localStorage:", e);
            }
          }
        }

        if (eventFound) {
          setConfig(eventFound);
        }
      })
      .catch((err) => {
        console.error("Error al cargar configuración del evento:", err);
        // Respaldo secundario si la API falla o está fuera de línea
        const eventosGuardados = localStorage.getItem("app_eventos_lista");
        if (eventosGuardados) {
          try {
            const lista = JSON.parse(eventosGuardados);
            const match = lista.find(
              (item: any) => item.slug?.toLowerCase() === slug.toLowerCase()
            );
            if (match) setConfig(match);
          } catch (e) {}
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          backgroundColor: "#0d1527",
          color: "#f59e0b",
        }}
      >
        <p style={{ fontSize: 16, fontWeight: 700 }}>Cargando invitación...</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          backgroundColor: "#0d1527",
          padding: 20,
        }}
      >
        <div
          style={{
            backgroundColor: "#121c33",
            border: "1px solid #1e293b",
            padding: 30,
            borderRadius: 16,
            textAlign: "center",
            maxWidth: 400,
            color: "#f8fafc",
          }}
        >
          <h2 style={{ color: "#ef4444", marginTop: 0, fontSize: 20 }}>
            Evento no encontrado
          </h2>
          <p style={{ color: "#94a3b8", fontSize: 14 }}>
            La invitación <strong>/{slug}</strong> no existe o aún no ha sido guardada en este entorno.
          </p>
        </div>
      </div>
    );
  }

  // Normalización de variables
  const planActual = (config.plan || config.planType || "PLUS").toUpperCase();
  const esBasico = planActual === "BASICO";
  const tituloEvento = config.title || config.customTitle || "Confirmación de Asistencia";
  const mensajeCustom = config.customMessage || "¡Nos encantaría contar con tu presencia!";
  const whatsappNotif = config.whatsappPhone || config.whatsappNotif || "5218116122704";

  // Determinación del número máximo de pases
  let maxPases = 2;
  if (pasesUrl && !isNaN(Number(pasesUrl))) {
    maxPases = Number(pasesUrl);
  } else if (config.pasesAsignados !== undefined) {
    maxPases = config.pasesAsignados;
  } else if (config.maxPasses !== undefined) {
    maxPases = config.maxPasses;
  }

  const handlePasesChange = (count: number) => {
    setPasesSeleccionados(count);
    const numAcompanantes = Math.max(0, count - 1);
    const nuevosAcomp = [...nombresAcompanantes];

    if (nuevosAcomp.length < numAcompanantes) {
      while (nuevosAcomp.length < numAcompanantes) {
        nuevosAcomp.push("");
      }
    } else {
      nuevosAcomp.splice(numAcompanantes);
    }
    setNombresAcompanantes(nuevosAcomp);
  };

  const handleAcompananteNombreChange = (index: number, val: string) => {
    const copia = [...nombresAcompanantes];
    copia[index] = val;
    setNombresAcompanantes(copia);
  };

  const handleCustomAnswerChange = (label: string, respuesta: string) => {
    setRespuestasCustom((prev) => ({
      ...prev,
      [label]: respuesta,
    }));
  };

  const handleFinalizarYEnviar = async (e: React.FormEvent) => {
    e.preventDefault();

    const responsePayload = {
      name: nombreInvitado,
      phone: whatsappInvitado,
      attending: asistira,
      pasesConfirmados: esBasico ? (asistira ? 1 : 0) : asistira ? pasesSeleccionados : 0,
      asistentes: esBasico ? [] : asistira ? nombresAcompanantes : [],
      customAnswers: esBasico ? {} : respuestasCustom,
      mensaje: mensajeLibre,
      createdAt: new Date().toISOString(),
    };

    // Intentar guardar en backend
    try {
      await fetch("/api/form-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_response",
          event: slug,
          eventSlug: slug,
          response: responsePayload,
        }),
      });
    } catch (err) {
      console.error("Error al guardar respuesta en servidor:", err);
    }

    // Construir mensaje de WhatsApp
    let textoWA = `*CONFIRMACIÓN DE ASISTENCIA - ${tituloEvento.toUpperCase()}*%0A%0A`;
    textoWA += `👤 *Nombre:* ${nombreInvitado}%0A`;
    if (whatsappInvitado) textoWA += `📱 *WhatsApp:* ${whatsappInvitado}%0A`;
    textoWA += `✨ *¿Asistirá?:* ${asistira ? "SÍ, ¡ahí estaré! 🎉" : "NO podré asistir 😔"}%0A`;

    if (!esBasico && asistira) {
      textoWA += `🎫 *Pases Confirmados:* ${pasesSeleccionados}%0A`;
      if (nombresAcompanantes.filter(Boolean).length > 0) {
        textoWA += `👥 *Asistentes:* ${nombresAcompanantes.filter(Boolean).join(", ")}%0A`;
      }
      if (Object.keys(respuestasCustom).length > 0) {
        textoWA += `%0A*Respuestas adicionales:*%0A`;
        Object.entries(respuestasCustom).forEach(([key, val]) => {
          textoWA += `• ${key}: ${val}%0A`;
        });
      }
    }

    if (mensajeLibre) {
      textoWA += `%0A💬 *Mensaje:* "${mensajeLibre}"%0A`;
    }

    const destinoWA = whatsappNotif.replace(/\D/g, "") || "5218116122704";
    window.location.href = `https://api.whatsapp.com/send?phone=${destinoWA}&text=${textoWA}`;
  };

  const listaPreguntas: Question[] = config.questions || [];

  return (
    <div
      style={{
        backgroundColor: "#0d1527",
        minHeight: "100vh",
        padding: "30px 15px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 550,
          margin: "0 auto",
          backgroundColor: "#121c33",
          borderRadius: 20,
          border: "1px solid #1e293b",
          boxShadow: "0 12px 32px rgba(0,0,0,0.37)",
          overflow: "hidden",
          color: "#f8fafc",
        }}
      >
        {config.bannerUrl && (
          <img
            src={config.bannerUrl}
            alt="Banner del evento"
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        )}

        <div style={{ padding: 25 }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              textAlign: "center",
              marginTop: 0,
              marginBottom: 8,
              color: "#f59e0b",
            }}
          >
            {tituloEvento}
          </h1>

          <p
            style={{
              textAlign: "center",
              color: "#94a3b8",
              fontSize: 14,
              whiteSpace: "pre-wrap",
              marginBottom: 25,
            }}
          >
            {mensajeCustom}
          </p>

          <form onSubmit={handleFinalizarYEnviar}>
            {/* Nombre Completo */}
            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  fontSize: 13,
                  marginBottom: 6,
                  color: "#cbd5e1",
                }}
              >
                Tu Nombre Completo *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. María García"
                value={nombreInvitado}
                onChange={(e) => setNombreInvitado(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #334155",
                  backgroundColor: "#0f172a",
                  color: "#f8fafc",
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Teléfono / WhatsApp */}
            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  fontSize: 13,
                  marginBottom: 6,
                  color: "#cbd5e1",
                }}
              >
                Teléfono / WhatsApp
              </label>
              <input
                type="text"
                placeholder="Ej. 8115591681"
                value={whatsappInvitado}
                onChange={(e) => setWhatsappInvitado(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #334155",
                  backgroundColor: "#0f172a",
                  color: "#f8fafc",
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Asistencia */}
            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  fontSize: 13,
                  marginBottom: 6,
                  color: "#cbd5e1",
                }}
              >
                ¿Confirmas tu asistencia?
              </label>
              <select
                value={asistira ? "si" : "no"}
                onChange={(e) => setAsistira(e.target.value === "si")}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #334155",
                  backgroundColor: "#0f172a",
                  color: "#f8fafc",
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
              >
                <option value="si">SÍ, ¡ahí estaré! 🎉</option>
                <option value="no">NO podré asistir 😔</option>
              </select>
            </div>

            {/* Campos dinámicos cuando NO es básico y SI asistirá */}
            {!esBasico && asistira && (
              <>
                {maxPases > 0 && (
                  <div style={{ marginBottom: 18 }}>
                    <label
                      style={{
                        display: "block",
                        fontWeight: 600,
                        fontSize: 13,
                        marginBottom: 6,
                        color: "#cbd5e1",
                      }}
                    >
                      Número de Pases
                    </label>
                    <select
                      value={pasesSeleccionados}
                      onChange={(e) => handlePasesChange(Number(e.target.value))}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid #334155",
                        backgroundColor: "#0f172a",
                        color: "#f59e0b",
                        fontWeight: "bold",
                        fontSize: 14,
                        boxSizing: "border-box",
                      }}
                    >
                      {Array.from({ length: maxPases }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? "pase" : "pases"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {nombresAcompanantes.map((nombre, idx) => (
                  <div key={idx} style={{ marginBottom: 18 }}>
                    <label
                      style={{
                        display: "block",
                        fontWeight: 600,
                        fontSize: 13,
                        marginBottom: 6,
                        color: "#cbd5e1",
                      }}
                    >
                      Nombre del Acompañante #{idx + 1}
                    </label>
                    <input
                      type="text"
                      placeholder={`Nombre completo acompañante ${idx + 1}`}
                      value={nombre}
                      onChange={(e) => handleAcompananteNombreChange(idx, e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid #334155",
                        backgroundColor: "#0f172a",
                        color: "#f8fafc",
                        fontSize: 14,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                ))}

                {/* Preguntas Personalizadas desde el Diseñador */}
                {listaPreguntas.map((q) => (
                  <div key={q.id} style={{ marginBottom: 18 }}>
                    <label
                      style={{
                        display: "block",
                        fontWeight: 600,
                        fontSize: 13,
                        marginBottom: 6,
                        color: "#cbd5e1",
                      }}
                    >
                      {q.label} {q.required && "*"}
                    </label>

                    {["choice", "checkbox"].includes(q.type) && q.options ? (
                      <select
                        required={q.required}
                        value={respuestasCustom[q.label] || ""}
                        onChange={(e) => handleCustomAnswerChange(q.label, e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 10,
                          border: "1px solid #334155",
                          backgroundColor: "#0f172a",
                          color: "#f8fafc",
                          fontSize: 14,
                          boxSizing: "border-box",
                        }}
                      >
                        <option value="">Selecciona una opción...</option>
                        {q.options.map((opt, i) => (
                          <option key={i} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={q.type === "number" ? "number" : "text"}
                        required={q.required}
                        placeholder={q.placeholder || "Tu respuesta..."}
                        value={respuestasCustom[q.label] || ""}
                        onChange={(e) => handleCustomAnswerChange(q.label, e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 10,
                          border: "1px solid #334155",
                          backgroundColor: "#0f172a",
                          color: "#f8fafc",
                          fontSize: 14,
                          boxSizing: "border-box",
                        }}
                      />
                    )}
                  </div>
                ))}
              </>
            )}

            {/* Mensaje opcional */}
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  fontSize: 13,
                  marginBottom: 6,
                  color: "#cbd5e1",
                }}
              >
                Mensaje o felicitación para los anfitriones
              </label>
              <textarea
                rows={3}
                placeholder="Escribe aquí unas palabras..."
                value={mensajeLibre}
                onChange={(e) => setMensajeLibre(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #334155",
                  backgroundColor: "#0f172a",
                  color: "#f8fafc",
                  fontSize: 14,
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "14px 20px",
                backgroundColor: "#10b981",
                color: "#022c22",
                border: "none",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
              }}
            >
              Confirmar y Enviar a WhatsApp
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}