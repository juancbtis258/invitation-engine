import { NextResponse } from "next/server";

// Base de datos temporal en memoria
let eventConfigs: Record<string, any> = {
  demo: {
    title: "Boda María & Alejandro",
    targetDate: "2026-10-15",
    whatsappPhone: "5218112345678",
    active: true,
    questions: [],
  },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventSlug = searchParams.get("event") || "demo";
    const config = eventConfigs[eventSlug] || null;

    return NextResponse.json({ data: config });
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener configuración" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === "save_config") {
      const { eventSlug, config } = body;
      
      eventConfigs[eventSlug] = {
        ...eventConfigs[eventSlug],
        ...config,
      };

      return NextResponse.json({ 
        success: true, 
        config: eventConfigs[eventSlug] 
      });
    }

    if (body.action === "save_response") {
      // Guardar la respuesta recibida del invitado
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}