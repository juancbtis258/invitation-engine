import { NextResponse } from "next/server";

// Base de datos en memoria para guardar las configuraciones y respuestas
const eventosDB: Record<string, any> = {
  demo: {
    title: "Boda María & Alejandro",
    slug: "demo",
    targetDate: "2026-10-15",
    plan: "PLUS",
    active: true,
    whatsappPhone: "5218115591681",
    pasesAsignados: 2,
    questions: [],
    responses: [],
  },
  "yunnie-y-juan": {
    title: "yunnie y juan",
    slug: "yunnie-y-juan",
    targetDate: "1996-09-21",
    plan: "PREMIUM",
    active: true,
    whatsappPhone: "5218115591681",
    pasesAsignados: 4,
    questions: [],
    responses: [],
  },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("event") || "demo";

  const evento = eventosDB[slug] || {
    title: slug.replace(/-/g, " ").toUpperCase(),
    slug: slug,
    whatsappPhone: "5218115591681",
    plan: "PLUS",
    active: true,
    pasesAsignados: 2,
    questions: [],
    responses: [],
  };

  return NextResponse.json({ success: true, data: evento });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, event, eventSlug, config, response } = body;

    const slug = event || eventSlug;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Falta el identificador del evento (slug)" },
        { status: 400 }
      );
    }

    if (!eventosDB[slug]) {
      eventosDB[slug] = {
        title: slug.replace(/-/g, " ").toUpperCase(),
        slug: slug,
        whatsappPhone: "5218115591681",
        questions: [],
        responses: [],
      };
    }

    // Actualizar configuración desde Admin
    if (config) {
      eventosDB[slug] = {
        ...eventosDB[slug],
        ...config,
      };
      return NextResponse.json({ success: true, data: eventosDB[slug] });
    }

    // Guardar respuesta del cliente estandarizando los nombres
    if (response || action === "save_response") {
      if (!eventosDB[slug].responses) {
        eventosDB[slug].responses = [];
      }

      const raw = response || {};

      // Normalizar la respuesta para que la entienda cualquier vista
      const nuevaRespuesta = {
        name: raw.name || raw.nombreInvitado || "Anónimo",
        attending: raw.attending !== undefined ? Boolean(raw.attending) : Boolean(raw.asistira),
        pasesConfirmados: Number(raw.pasesConfirmados || raw.pasesSeleccionados || (raw.asistira ? 1 : 0)),
        phone: raw.phone || raw.telefonoWhatsapp || "",
        asistentes: raw.asistentes || [],
        mensaje: raw.mensaje || raw.mensajeDeseos || "",
        customAnswers: raw.customAnswers || raw.preguntasAdicionales || {},
        createdAt: raw.createdAt || raw.fechaRespuesta || new Date().toISOString(),
      };

      eventosDB[slug].responses.unshift(nuevaRespuesta);

      return NextResponse.json({ success: true, data: eventosDB[slug] });
    }

    return NextResponse.json({ success: true, data: eventosDB[slug] });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}