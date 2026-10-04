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
  googleSheetUrl?: string;
}

export default function EventPublicPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const slug = params?.slug as string;
  const pasesUrl = searchParams?.get("pases");

  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<EventConfig | null>(null);

  // Estados del Formulario
  const [nombreInvitado, setNombreInvitado] = useState("");
  const [whatsappInvitado, setWhatsappInvitado] = useState("");
  const [asistira, setAsistira] = useState<boolean>(true);
  const [pasesSeleccionados, setPasesSeleccionados] = useState<number>(2);
  // Inicializamos con 2 acompañantes para que al cargar coincida con los 2 pases por defecto
  const [nombresAcompanantes, setNombresAcompanantes] = useState<string[]>(["", ""]);
  const [respuestasCustom, setRespuestasCustom] = useState<Record<string, string>>({});
  const [mensajeLibre, setMensajeLibre] = useState("");

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/form-config?event=${slug}`)
      .then((res) => res.json())
      .then((resData) => {
        let eventFound: EventConfig | null = null;

        if (resData.success && resData.data) {
          eventFound = resData.data;
        } else if (resData.data) {
          eventFound = resData.data;
        }

        if (!eventFound) {
          const eventosGuardados = localStorage.getItem("app_eventos_lista");
          if (eventosGuardados) {
            try {
              const lista = JSON.parse(eventosGuardados);
              if (Array.isArray(lista)) {
                const match = lista.find(
                  (item: any) => item.slug?.toLowerCase() === slug.toLowerCase()
                );
                if (match) eventFound = match;
              }
            } catch (e) {}
          }
        }

        if (eventFound) setConfig(eventFound);
      })
      .catch(() => {
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

  const planActual = (config?.plan || config?.planType || "PLUS").toUpperCase();
  const esBasico = planActual === "BASICO";
  const tituloEvento = config?.title || config?.customTitle || "Confirmación de Asistencia";
  const mensajeCustom = config?.customMessage || "¡Nos encantaría contar con tu presencia!";
  const whatsappNotif = config?.whatsappPhone || config?.whatsappNotif || "5218116122704";

  let maxPases = 2;
  if (pasesUrl && !isNaN(Number(pasesUrl))) {
    maxPases = Number(pasesUrl);
  } else if (config?.pasesAsignados !== undefined) {
    maxPases = config.pasesAsignados;
  } else if (config?.maxPasses !== undefined) {
    maxPases = config.maxPasses;
  }

  // Genera exactamente 'count' campos de acompañantes
  const handlePasesChange = (count: number) => {
    setPasesSeleccionados(count);
    const numAcompanantesNecesarios = count;
    
    setNombresAcompanantes((prev) => {
      const nuevaLista = [...prev];
      if (nuevaLista.length < numAcompanantesNecesarios) {
        while (nuevaLista.length < numAcompanantesNecesarios) {
          nuevaLista.push("");
        }
      } else {
        nuevaLista.splice(numAcompanantesNecesarios);
      }
      return nuevaLista;
    });
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
      id: Date.now().toString(),
      eventSlug: slug,
      name: nombreInvitado,
      phone: whatsappInvitado,
      attending: asistira,
      pasesConfirmados: esBasico ? (asistira ? 1 : 0) : asistira ? pasesSeleccionados : 0,
      asistentes: esBasico ? [] : asistira ? nombresAcompanantes.filter(Boolean) : [],
      customAnswers: esBasico ? {} : respuestasCustom,
      mensaje: mensajeLibre,
      createdAt: new Date().toISOString(),
    };

    // 1. Guardar en localStorage local
    try {
      const respuestasPrevias = localStorage.getItem("app_respuestas_lista");
      let listaRespuestas = respuestasPrevias ? JSON.parse(respuestasPrevias) : [];
      if (!Array.isArray(listaRespuestas)) listaRespuestas = [];
      listaRespuestas.push(responsePayload);
      localStorage.setItem("app_respuestas_lista", JSON.stringify(listaRespuestas));
    } catch (err) {}

    // 2. Enviar a la API Central del servidor Next.js
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
    } catch (err) {}

    // 3. Enviar a Google Sheets (Si hay Webhook configurado)
    if (config?.googleSheetUrl) {
      try {
        await fetch(config.googleSheetUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(responsePayload),
        });
      } catch (err) {}
    }

    // 4. Redirigir a WhatsApp
    let textoWA = `*CONFIRMACIÓN DE ASISTENCIA - ${tituloEvento.toUpperCase()}*%0A%0A`;
    textoWA += `👤 *Nombre:* ${nombreInvitado}%0A`;
    if (whatsappInvitado) textoWA += `📱 *WhatsApp:* ${whatsappInvitado}%0A`;
    textoWA += `✨ *¿Asistirá?:* ${asistira ? "SÍ, ¡ahí estaré! 🎉" : "NO podré asistir 😔"}%0A`;

    if (!esBasico && asistira) {
      textoWA += `🎫 *Pases Confirmados:* ${pasesSeleccionados}%0A`;
      if (nombresAcompanantes.filter(Boolean).length > 0) {
        textoWA += `👥 *Acompañantes:* ${nombresAcompanantes.filter(Boolean).join(", ")}%0A`;
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

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          backgroundColor: "#080d19",
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
          backgroundColor: "#080d19",
          padding: 20,
        }}
      >
        <div
          style={{
            backgroundColor: "#0f172a",
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
            La invitación <strong>/{slug}</strong> no existe o aún no ha sido registrada.
          </p>
        </div>
      </div>
    );
  }

  const listaPreguntas: Question[] = config.questions || [];

  return (
    <div
      style={{
        backgroundColor: "#080d19",
        minHeight: "100vh",
        padding: "20px 12px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 500,
          margin: "0 auto",
          backgroundColor: "#0f172a",
          borderRadius: 20,
          border: "1px solid #1e293b",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
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

        <div style={{ padding: "24px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <span
              style={{
                backgroundColor: "rgba(245, 158, 11, 0.15)",
                color: "#f59e0b",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              ★ PLAN {planActual}
            </span>
          </div>

          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              textAlign: "center",
              marginTop: 0,
              marginBottom: 6,
              color: "#ffffff",
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
              marginBottom: 24,
            }}
          >
            {mensajeCustom}
          </p>

          <form onSubmit={handleFinalizarYEnviar}>
            {/* Nombre Completo */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontWeight: 700,
                  fontSize: 12,
                  marginBottom: 6,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                NOMBRE COMPLETO *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. María Elena Garza"
                value={nombreInvitado}
                onChange={(e) => setNombreInvitado(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid #1e293b",
                  backgroundColor: "#080d19",
                  color: "#f8fafc",
                  fontSize: 14,
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            {/* Teléfono / WhatsApp */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontWeight: 700,
                  fontSize: 12,
                  marginBottom: 6,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                WHATSAPP *
              </label>
              <input
                type="text"
                required
                placeholder="+52 81 1234 5678"
                value={whatsappInvitado}
                onChange={(e) => setWhatsappInvitado(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid #1e293b",
                  backgroundColor: "#080d19",
                  color: "#f8fafc",
                  fontSize: 14,
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            {/* Asistencia */}
            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: "block",
                  fontWeight: 700,
                  fontSize: 12,
                  marginBottom: 8,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                ¿ASISTIRÁS AL EVENTO? *
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setAsistira(true)}
                  style={{
                    padding: "12px 8px",
                    borderRadius: 10,
                    border: asistira ? "2px solid #f59e0b" : "1px solid #1e293b",
                    backgroundColor: asistira ? "#f59e0b" : "#080d19",
                    color: asistira ? "#000000" : "#94a3b8",
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  ¡Sí, asistiré! 🎉
                </button>
                <button
                  type="button"
                  onClick={() => setAsistira(false)}
                  style={{
                    padding: "12px 8px",
                    borderRadius: 10,
                    border: !asistira ? "2px solid #ef4444" : "1px solid #1e293b",
                    backgroundColor: !asistira ? "#ef4444" : "#080d19",
                    color: !asistira ? "#ffffff" : "#94a3b8",
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  No podré ir 😔
                </button>
              </div>
            </div>

            {/* Opciones cuando Asiste */}
            {!esBasico && asistira && (
              <>
                {maxPases > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <label
                      style={{
                        display: "block",
                        fontWeight: 700,
                        fontSize: 12,
                        marginBottom: 6,
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      LUGARES RESERVADOS
                    </label>
                    <select
                      value={pasesSeleccionados}
                      onChange={(e) => handlePasesChange(Number(e.target.value))}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: 10,
                        border: "1px solid #1e293b",
                        backgroundColor: "#080d19",
                        color: "#f59e0b",
                        fontWeight: 700,
                        fontSize: 14,
                        boxSizing: "border-box",
                        outline: "none",
                      }}
                    >
                      {Array.from({ length: maxPases }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? "Pase (Solo Tú)" : "Pases"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Genera 1 campo por cada pase seleccionado */}
                {nombresAcompanantes.map((nombre, idx) => (
                  <div key={idx} style={{ marginBottom: 16 }}>
                    <label
                      style={{
                        display: "block",
                        fontWeight: 700,
                        fontSize: 12,
                        marginBottom: 6,
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      NOMBRE ACOMPAÑANTE #{idx + 1}
                    </label>
                    <input
                      type="text"
                      placeholder={`Nombre completo del acompañante ${idx + 1}`}
                      value={nombre}
                      onChange={(e) => handleAcompananteNombreChange(idx, e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: 10,
                        border: "1px solid #1e293b",
                        backgroundColor: "#080d19",
                        color: "#f8fafc",
                        fontSize: 14,
                        boxSizing: "border-box",
                        outline: "none",
                      }}
                    />
                  </div>
                ))}

                {listaPreguntas.map((q) => (
                  <div key={q.id} style={{ marginBottom: 16 }}>
                    <label
                      style={{
                        display: "block",
                        fontWeight: 700,
                        fontSize: 12,
                        marginBottom: 6,
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
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
                          padding: "12px 14px",
                          borderRadius: 10,
                          border: "1px solid #1e293b",
                          backgroundColor: "#080d19",
                          color: "#f8fafc",
                          fontSize: 14,
                          boxSizing: "border-box",
                          outline: "none",
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
                          padding: "12px 14px",
                          borderRadius: 10,
                          border: "1px solid #1e293b",
                          backgroundColor: "#080d19",
                          color: "#f8fafc",
                          fontSize: 14,
                          boxSizing: "border-box",
                          outline: "none",
                        }}
                      />
                    )}
                  </div>
                ))}
              </>
            )}

            {/* Mensaje Libre */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontWeight: 700,
                  fontSize: 12,
                  marginBottom: 6,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                MENSAJE PARA LOS ANFITRIONES
              </label>
              <textarea
                rows={3}
                placeholder="Escribe un mensaje o felicitación..."
                value={mensajeLibre}
                onChange={(e) => setMensajeLibre(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid #1e293b",
                  backgroundColor: "#080d19",
                  color: "#f8fafc",
                  fontSize: 14,
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "14px 20px",
                backgroundColor: "#f59e0b",
                color: "#000000",
                border: "none",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(245, 158, 11, 0.3)",
              }}
            >
              Confirmar Asistencia (⭐ Plan {planActual})
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}