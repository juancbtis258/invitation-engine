import { NextResponse } from "next/server";

// Simulación de almacenamiento en memoria o base de datos.
// Si estás usando una Base de Datos real (ej. Supabase, Prisma, Vercel KV), sustituye esta parte con las consultas de tu DB.
let BASE_DATOS_EVENTOS: Record<string, any> = {};

// ----------------------------------------------------------------------
// 1. OBTENER INFORMACIÓN DEL EVENTO (GET)
// ----------------------------------------------------------------------
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventSlug = searchParams.get("event");

    if (!eventSlug) {
      return NextResponse.json(
        { error: "Se requiere el parámetro 'event' (slug) en la URL." },
        { status: 400 }
      );
    }

    // Buscar la configuración del evento
    const eventData = BASE_DATOS_EVENTOS[eventSlug] || {
      slug: eventSlug,
      questions: [],
      responses: [],
    };

    return NextResponse.json({
      success: true,
      data: eventData,
    });
  } catch (error) {
    console.error("Error en GET /api/form-config:", error);
    return NextResponse.json(
      { error: "Error al obtener la configuración del evento." },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------------------------
// 2. CREAR O ACTUALIZAR UN EVENTO / RESPUESTAS (POST)
// ----------------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event, config, newResponse } = body;

    if (!event) {
      return NextResponse.json(
        { error: "Falta el campo 'event' en el cuerpo de la petición." },
        { status: 400 }
      );
    }

    // Inicializar evento si no existe en la base de datos
    if (!BASE_DATOS_EVENTOS[event]) {
      BASE_DATOS_EVENTOS[event] = {
        slug: event,
        questions: [],
        responses: [],
      };
    }

    // Si enviaron una nueva configuración de evento o preguntas
    if (config) {
      BASE_DATOS_EVENTOS[event] = {
        ...BASE_DATOS_EVENTOS[event],
        ...config,
      };
    }

    // Si un invitado envió una respuesta
    if (newResponse) {
      const listaRespuestas = BASE_DATOS_EVENTOS[event].responses || [];
      BASE_DATOS_EVENTOS[event].responses = [
        ...listaRespuestas,
        {
          ...newResponse,
          createdAt: new Date().toISOString(),
        },
      ];
    }

    return NextResponse.json({
      success: true,
      message: "Configuración o respuesta guardada correctamente.",
      data: BASE_DATOS_EVENTOS[event],
    });
  } catch (error) {
    console.error("Error en POST /api/form-config:", error);
    return NextResponse.json(
      { error: "Error al guardar los datos del evento." },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------------------------
// 3. ELIMINAR DEFINITIVAMENTE UN EVENTO (DELETE)
// ----------------------------------------------------------------------
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventSlug = searchParams.get("event");

    if (!eventSlug) {
      return NextResponse.json(
        { error: "Se requiere el parámetro 'event' (slug) para eliminar." },
        { status: 400 }
      );
    }

    // Borrar de la base de datos o almacenamiento en memoria
    if (BASE_DATOS_EVENTOS[eventSlug]) {
      delete BASE_DATOS_EVENTOS[eventSlug];
    }

    // NOTA: Si usas Supabase / Prisma / Vercel KV, sustituye la línea anterior por tu comando de borrado:
    // await db.event.delete({ where: { slug: eventSlug } });

    return NextResponse.json({
      success: true,
      message: `El evento '/${eventSlug}' ha sido eliminado permanentemente del servidor.`,
    });
  } catch (error) {
    console.error("Error en DELETE /api/form-config:", error);
    return NextResponse.json(
      { error: "Error al intentar borrar el evento en el servidor." },
      { status: 500 }
    );
  }
}