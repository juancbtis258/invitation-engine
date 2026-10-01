"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface EventConfig {
  planType: string;
  customTitle?: string;
  customMessage?: string;
  maxPasses?: number;
  whatsappNotif?: string;
  preguntas?: string[];
  bannerUrl?: string;
  musicUrl?: string;
  responses?: any[];
}

export default function EventPublicPage() {
  const params = useParams();
  const slug = params?.slug as string;

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

    fetch(`/api/form-config?eventSlug=${slug}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setConfig(resData.data);
        }
      })
      .catch((err) => console.error("Error al cargar configuración del evento:", err))
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
          backgroundColor: "#f4f6f8",
          color: "#555",
        }}
      >
        <p style={{ fontSize: 18, fontWeight: 500 }}>Cargando invitación...</p>
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
          backgroundColor: "#f4f6f8",
          padding: 20,
        }}
      >
        <div
          style={{
            backgroundColor: "#fff",
            padding: 30,
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            textAlign: "center",
            maxWidth: 400,
          }}
        >
          <h2 style={{ color: "#e53e3e", marginTop: 0 }}>Evento no encontrado</h2>
          <p style={{ color: "#666" }}>
            La invitación solicitada no existe o el enlace ha expirado.
          </p>
        </div>
      </div>
    );
  }

  const esBasico = config.planType === "basico";
  const tituloEvento = config.customTitle || "Confirmación de Asistencia";
  const mensajeCustom = config.customMessage || "¡Nos encantaría contar con tu presencia!";
  const whatsappNotif = config.whatsappNotif || "5218115591681";
  const maxPases = config.maxPasses || 5;

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

  const handleCustomAnswerChange = (pregunta: string, respuesta: string) => {
    setRespuestasCustom((prev) => ({
      ...prev,
      [pregunta]: respuesta,
    }));
  };

  const handleFinalizarYEnviar = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guardado de respuesta en servidor central
    const payload = {
      action: "save_response",
      eventSlug: slug,
      response: {
        name: nombreInvitado,
        phone: whatsappInvitado,
        attending: asistira,
        pasesConfirmados: esBasico ? (asistira ? 1 : 0) : (asistira ? pasesSeleccionados : 0),
        asistentes: esBasico ? [] : (asistira ? nombresAcompanantes : []),
        customAnswers: esBasico ? {} : respuestasCustom,
        mensaje: mensajeLibre,
        createdAt: new Date().toISOString(),
      },
    };

    try {
      await fetch("/api/form-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Error al guardar respuesta en servidor:", err);
    }

    // Formateo del mensaje para redirección a WhatsApp
    let textoWA = `*CONFIRMACIÓN DE ASISTENCIA - ${tituloEvento.toUpperCase()}*%0A%0A`;
    textoWA += `👤 *Nombre:* ${nombreInvitado}%0A`;
    if (whatsappInvitado) textoWA += `📱 *WhatsApp:* ${whatsappInvitado}%0A`;
    textoWA += `✨ *¿Asistirá?:* ${asistira ? "SÍ, ¡ahí estaré! 🎉" : "NO podré asistir 😔"}%0A`;

    if (!esBasico && asistira) {
      textoWA += `🎫 *Pases Confirmados:* ${pasesSeleccionados}%0A`;
      if (nombresAcompanantes.length > 0) {
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

    const destinoWA = whatsappNotif.replace(/\D/g, "") || "5218115591681";
    window.location.href = `https://wa.me/${destinoWA}?text=${textoWA}`;
  };

  return (
    <div
      style={{
        backgroundColor: "#f4f6f8",
        minHeight: "100vh",
        padding: "30px 15px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 550,
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          overflow: "hidden",
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
              fontSize: 24,
              fontWeight: 700,
              textAlign: "center",
              marginTop: 0,
              marginBottom: 10,
              color: "#1a202c",
            }}
          >
            {tituloEvento}
          </h1>

          <p
            style={{
              textAlign: "center",
              color: "#4a5568",
              fontSize: 15,
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
                  fontSize: 14,
                  marginBottom: 6,
                  color: "#2d3748",
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
                  borderRadius: 8,
                  border: "1px solid #cbd5e0",
                  fontSize: 15,
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
                  fontSize: 14,
                  marginBottom: 6,
                  color: "#2d3748",
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
                  borderRadius: 8,
                  border: "1px solid #cbd5e0",
                  fontSize: 15,
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
                  fontSize: 14,
                  marginBottom: 6,
                  color: "#2d3748",
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
                  borderRadius: 8,
                  border: "1px solid #cbd5e0",
                  fontSize: 15,
                  backgroundColor: "#fff",
                  boxSizing: "border-box",
                }}
              >
                <option value="si">SÍ, ¡ahí estaré! 🎉</option>
                <option value="no">NO podré asistir 😔</option>
              </select>
            </div>

            {/* Campos adicionales para planes no básicos */}
            {!esBasico && asistira && (
              <>
                <div style={{ marginBottom: 18 }}>
                  <label
                    style={{
                      display: "block",
                      fontWeight: 600,
                      fontSize: 14,
                      marginBottom: 6,
                      color: "#2d3748",
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
                      borderRadius: 8,
                      border: "1px solid #cbd5e0",
                      fontSize: 15,
                      backgroundColor: "#fff",
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

                {nombresAcompanantes.map((nombre, idx) => (
                  <div key={idx} style={{ marginBottom: 18 }}>
                    <label
                      style={{
                        display: "block",
                        fontWeight: 600,
                        fontSize: 14,
                        marginBottom: 6,
                        color: "#2d3748",
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
                        borderRadius: 8,
                        border: "1px solid #cbd5e0",
                        fontSize: 15,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                ))}

                {config.preguntas &&
                  config.preguntas.map((preg, idx) => (
                    <div key={idx} style={{ marginBottom: 18 }}>
                      <label
                        style={{
                          display: "block",
                          fontWeight: 600,
                          fontSize: 14,
                          marginBottom: 6,
                          color: "#2d3748",
                        }}
                      >
                        {preg}
                      </label>
                      <input
                        type="text"
                        value={respuestasCustom[preg] || ""}
                        onChange={(e) => handleCustomAnswerChange(preg, e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: "1px solid #cbd5e0",
                          fontSize: 15,
                          boxSizing: "border-box",
                        }}
                      />
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
                  fontSize: 14,
                  marginBottom: 6,
                  color: "#2d3748",
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
                  borderRadius: 8,
                  border: "1px solid #cbd5e0",
                  fontSize: 15,
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
                backgroundColor: "#25D366",
                color: "#ffffff",
                border: "none",
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(37, 211, 102, 0.25)",
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