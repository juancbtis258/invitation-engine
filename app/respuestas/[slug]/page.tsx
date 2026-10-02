"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface ResponseItem {
  id: string;
  eventSlug?: string;
  name?: string;
  nombre?: string;
  phone?: string;
  whatsapp?: string;
  attending?: boolean;
  asistira?: boolean;
  pasesConfirmados?: number;
  asistentes?: string[];
  customAnswers?: Record<string, string>;
  mensaje?: string;
  createdAt?: string;
}

export default function RespuestasSlugPage() {
  const params = useParams();
  const slugParam = (params?.slug as string) || "asdasd";

  const [loading, setLoading] = useState(true);
  const [respuestas, setRespuestas] = useState<ResponseItem[]>([]);

  useEffect(() => {
    if (!slugParam) return;

    const cargarRespuestas = async () => {
      let combinadas: ResponseItem[] = [];

      // 1. Cargar desde localStorage
      try {
        const local = localStorage.getItem("app_respuestas_lista");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            combinadas = parsed.filter(
              (r) => r.eventSlug?.toLowerCase() === slugParam.toLowerCase()
            );
          }
        }
      } catch (e) {}

      // 2. Cargar desde la API del servidor
      try {
        const res = await fetch(`/api/form-config?event=${slugParam}`);
        const data = await res.json();

        const serverResponses =
          data?.data?.responses || data?.responses || data?.data?.respuestas || [];

        if (Array.isArray(serverResponses) && serverResponses.length > 0) {
          const idsExistentes = new Set(combinadas.map((c) => c.id));
          serverResponses.forEach((sr: ResponseItem) => {
            if (!idsExistentes.has(sr.id)) {
              combinadas.push(sr);
            }
          });
        }
      } catch (e) {}

      setRespuestas(combinadas);
      setLoading(false);
    };

    cargarRespuestas();
  }, [slugParam]);

  // Métricas
  const totalEnvios = respuestas.length;
  const confirmados = respuestas.filter((r) => r.attending ?? r.asistira ?? true);
  const cancelados = respuestas.filter((r) => !(r.attending ?? r.asistira ?? true));
  const totalPersonasAsistentes = confirmados.reduce(
    (acc, r) => acc + (r.pasesConfirmados || 1),
    0
  );

  const exportarCSV = () => {
    if (respuestas.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Nombre,WhatsApp,Asistira,Pases,Acompañantes,Mensaje,Fecha\n";

    respuestas.forEach((r) => {
      const nombre = `"${r.name || r.nombre || ""}"`;
      const phone = `"${r.phone || r.whatsapp || ""}"`;
      const asiste = (r.attending ?? r.asistira) ? "SI" : "NO";
      const pases = r.pasesConfirmados || (asiste === "SI" ? 1 : 0);
      const acomp = `"${(r.asistentes || []).join(", ")}"`;
      const msg = `"${(r.mensaje || "").replace(/"/g, '""')}"`;
      const fecha = `"${r.createdAt || ""}"`;

      csvContent += `${nombre},${phone},${asiste},${pases},${acomp},${msg},${fecha}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `respuestas_${slugParam}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      style={{
        backgroundColor: "#080d19",
        minHeight: "100vh",
        padding: "30px 20px",
        color: "#f8fafc",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Cabecera */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#f59e0b" }}>
              📊 RESPUESTAS DEL EVENTO: {slugParam.toUpperCase()}
            </h1>
            <p style={{ color: "#94a3b8", fontSize: 13, margin: "4px 0 0 0" }}>
              Enlace de respuestas: /{slugParam}
            </p>
          </div>

          <button
            onClick={exportarCSV}
            style={{
              backgroundColor: "#10b981",
              color: "#ffffff",
              border: "none",
              padding: "10px 18px",
              borderRadius: 10,
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            📥 Descargar Excel (CSV)
          </button>
        </div>

        {/* Tarjetas de Métricas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              backgroundColor: "#0f172a",
              padding: 20,
              borderRadius: 12,
              border: "1px solid #1e293b",
            }}
          >
            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700 }}>
              TOTAL ENVÍOS
            </span>
            <p style={{ fontSize: 28, fontWeight: 800, margin: "6px 0 0 0" }}>
              {totalEnvios}
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#0f172a",
              padding: 20,
              borderRadius: 12,
              border: "1px solid #1e293b",
            }}
          >
            <span style={{ fontSize: 12, color: "#10b981", fontWeight: 700 }}>
              CONFIRMADOS
            </span>
            <p style={{ fontSize: 28, fontWeight: 800, margin: "6px 0 0 0", color: "#10b981" }}>
              {confirmados.length}
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#0f172a",
              padding: 20,
              borderRadius: 12,
              border: "1px solid #1e293b",
            }}
          >
            <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 700 }}>
              CANCELADOS
            </span>
            <p style={{ fontSize: 28, fontWeight: 800, margin: "6px 0 0 0", color: "#ef4444" }}>
              {cancelados.length}
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#0f172a",
              padding: 20,
              borderRadius: 12,
              border: "1px solid #1e293b",
            }}
          >
            <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700 }}>
              PERSONAS TOTALES
            </span>
            <p style={{ fontSize: 28, fontWeight: 800, margin: "6px 0 0 0", color: "#f59e0b" }}>
              {totalPersonasAsistentes} asist.
            </p>
          </div>
        </div>

        {/* Tabla de Registros */}
        <div
          style={{
            backgroundColor: "#0f172a",
            borderRadius: 16,
            border: "1px solid #1e293b",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <p style={{ padding: 20, textAlign: "center", color: "#94a3b8" }}>
              Cargando lista de respuestas...
            </p>
          ) : respuestas.length === 0 ? (
            <p style={{ padding: 30, textAlign: "center", color: "#94a3b8" }}>
              Aún no hay respuestas registradas para este evento.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "#1e293b", color: "#94a3b8", fontSize: 12 }}>
                    <th style={{ padding: "12px 16px" }}>NOMBRE</th>
                    <th style={{ padding: "12px 16px" }}>WHATSAPP</th>
                    <th style={{ padding: "12px 16px" }}>ASISTENCIA</th>
                    <th style={{ padding: "12px 16px" }}>PASES</th>
                    <th style={{ padding: "12px 16px" }}>ACOMPAÑANTES</th>
                    <th style={{ padding: "12px 16px" }}>MENSAJE</th>
                  </tr>
                </thead>
                <tbody>
                  {respuestas.map((r, idx) => {
                    const asiste = r.attending ?? r.asistira ?? true;
                    return (
                      <tr
                        key={r.id || idx}
                        style={{ borderBottom: "1px solid #1e293b", fontSize: 14 }}
                      >
                        <td style={{ padding: "14px 16px", fontWeight: 700 }}>
                          {r.name || r.nombre || "Sin Nombre"}
                        </td>
                        <td style={{ padding: "14px 16px", color: "#94a3b8" }}>
                          {r.phone || r.whatsapp || "-"}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              backgroundColor: asiste
                                ? "rgba(16, 185, 129, 0.15)"
                                : "rgba(239, 68, 68, 0.15)",
                              color: asiste ? "#10b981" : "#ef4444",
                              padding: "4px 8px",
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {asiste ? "¡Sí asistirá!" : "No asistirá"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", fontWeight: 700, color: "#f59e0b" }}>
                          {asiste ? r.pasesConfirmados || 1 : 0}
                        </td>
                        <td style={{ padding: "14px 16px", color: "#94a3b8", fontSize: 13 }}>
                          {(r.asistentes || []).length > 0
                            ? r.asistentes?.join(", ")
                            : "Ninguno"}
                        </td>
                        <td style={{ padding: "14px 16px", color: "#94a3b8", fontSize: 13 }}>
                          {r.mensaje || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}