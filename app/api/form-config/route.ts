import { NextResponse } from "next/server";

// Base de datos en memoria para guardar configuración y respuestas recibidas
let database: Record<string, { config: any; responses: any[] }> = {
  demo: {
    config: {
      title: "Boda María & Alejandro",
      targetDate: "2026-10-15",
      whatsappPhone: "5218112345678",
      active: true,
      questions: [],
    },
    responses: [],
  },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventSlug = searchParams.get("event") || "demo";

    if (!database[eventSlug]) {
      database[eventSlug] = {
        config: {
          title: "Mi Evento Especial",
          targetDate: "2026-10-15",
          whatsappPhone: "",
          active: true,
          questions: [],
        },
        responses: [],
      };
    }

    return NextResponse.json({
      data: {
        ...database[eventSlug].config,
        responses: database[eventSlug].responses,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener datos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === "save_config") {
      const { eventSlug, config } = body;

      if (!database[eventSlug]) {
        database[eventSlug] = { config: {}, responses: [] };
      }

      database[eventSlug].config = {
        ...database[eventSlug].config,
        ...config,
      };

      return NextResponse.json({
        success: true,
        config: database[eventSlug].config,
      });
    }

    if (body.action === "save_response") {
      const { eventSlug, response } = body;

      if (!database[eventSlug]) {
        database[eventSlug] = { config: {}, responses: [] };
      }

      database[eventSlug].responses.unshift({
        id: Date.now().toString(),
        ...response,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}