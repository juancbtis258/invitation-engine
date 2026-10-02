import { NextResponse } from "next/server";

// Almacenamiento en memoria global
let BASE_DATOS_EVENTOS: Record<string, any> = {};

// ----------------------------------------------------------------------
// 1. OBTENER INFORMACIÓN DEL EVENTO (GET)
// ----------------------------------------------------------------------
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventSlug = searchParams.get("event") || searchParams.get("slug") || searchParams.get("eventSlug");

    if (!eventSlug) {
      return NextResponse.json({
        success: true,
        data: BASE_DATOS_EVENTOS,
      });
    }

    const slugLower = eventSlug.toLowerCase();

    // Buscar la configuración del evento
    const eventData = BASE_DATOS_EVENTOS[slugLower] || {
      slug: slugLower,
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
    
    // Extrae todos los campos posibles recibidos de app/[slug]/page.tsx o de la administración
    const { event, eventSlug, config, newResponse, response, action } = body;

    const targetSlug = (event || eventSlug || "").toLowerCase();

    if (!targetSlug) {
      return NextResponse.json(
        { error: "Falta el campo 'event' (slug) en el cuerpo de la petición." },
        { status: 400 }
      );
    }

    // Inicializar evento si no existe en la base de datos en memoria
    if (!BASE_DATOS_EVENTOS[targetSlug]) {
      BASE_DATOS_EVENTOS[targetSlug] = {
        slug: targetSlug,
        questions: [],
        responses: [],
      };
    }

    // Si enviaron una nueva configuración de evento desde el panel de administración
    if (config) {
      BASE_DATOS_EVENTOS[targetSlug] = {
        ...BASE_DATOS_EVENTOS[targetSlug],
        ...config,
      };
    }

    // Si un invitado envió una respuesta (soporta `response`, `newResponse` o la acción `save_response`)
    const respuestaEntrante = response || newResponse;
    if (respuestaEntrante || action === "save_response") {
      const listaRespuestas = BASE_DATOS_EVENTOS[targetSlug].responses || [];
      const dataAInsertar = respuestaEntrante || body;

      BASE_DATOS_EVENTOS[targetSlug].responses = [
        ...listaRespuestas,
        {
          ...dataAInsertar,
          createdAt: dataAInsertar.createdAt || new Date().toISOString(),
        },
      ];
    }

    return NextResponse.json({
      success: true,
      message: "Configuración o respuesta guardada correctamente.",
      data: BASE_DATOS_EVENTOS[targetSlug],
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
    const eventSlug = searchParams.get("event") || searchParams.get("slug");

    if (!eventSlug) {
      return NextResponse.json(
        { error: "Se requiere el parámetro 'event' (slug) para eliminar." },
        { status: 400 }
      );
    }

    const slugLower = eventSlug.toLowerCase();

    // Borrar de la base de datos en memoria
    if (BASE_DATOS_EVENTOS[slugLower]) {
      delete BASE_DATOS_EVENTOS[slugLower];
    }

    return NextResponse.json({
      success: true,
      message: `El evento '/${slugLower}' ha sido eliminado permanentemente del servidor.`,
    });
  } catch (error) {
    console.error("Error en DELETE /api/form-config:", error);
    return NextResponse.json(
      { error: "Error al intentar borrar el evento en el servidor." },
      { status: 500 }
    );
  }
}