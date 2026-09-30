import { NextResponse } from "next/server";

// Base de datos en memoria para guardar las configuraciones de cada evento de forma dinámica
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

// GET: Obtener la configuración del evento por su slug
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

// POST: Actualizar configuración desde Admin O guardar respuesta del cliente
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

    // Asegurar que el evento exista en la BD
    if (!eventosDB[slug]) {
      eventosDB[slug] = {
        title: slug.replace(/-/g, " ").toUpperCase(),
        slug: slug,
        whatsappPhone: "5218115591681",
        questions: [],
        responses: [],
      };
    }

    // CASO 1: Guardar cambios desde el Panel de Administración (Número de WhatsApp, Título, Preguntas)
    if (config) {
      eventosDB[slug] = {
        ...eventosDB[slug],
        ...config, // Aquí se sobrescribe whatsappPhone con el número que pusiste en la casilla
      };
      return NextResponse.json({ success: true, data: eventosDB[slug] });
    }

    // CASO 2: Guardar respuesta enviada por un invitado desde la invitación
    if (response || action === "save_response") {
      if (!eventosDB[slug].responses) {
        eventosDB[slug].responses = [];
      }
      const nuevaRespuesta = response;
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