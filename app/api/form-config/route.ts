import { NextResponse } from "next/server";

// Almacenamiento dinámico en memoria del servidor
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

    // Buscar el evento en el almacén en memoria
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
// 2. CREAR / ACTUALIZAR EVENTO O GUARDAR RESPUESTAS (POST)
// ----------------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Extraemos todos los posibles formatos enviados desde el cliente
    const { event, eventSlug, config, newResponse, response, action } = body;

    const targetSlug = (event || eventSlug || "").toLowerCase();

    if (!targetSlug) {
      return NextResponse.json(
        { error: "Falta el campo 'event' o 'eventSlug' en el cuerpo de la petición." },
        { status: 400 }
      );
    }

    // Inicializar evento si aún no está registrado en la memoria del servidor
    if (!BASE_DATOS_EVENTOS[targetSlug]) {
      BASE_DATOS_EVENTOS[targetSlug] = {
        slug: targetSlug,
        questions: [],
        responses: [],
      };
    }

    // Caso A: Si el Administrador está guardando configuración/preguntas
    if (config) {
      BASE_DATOS_EVENTOS[targetSlug] = {
        ...BASE_DATOS_EVENTOS[targetSlug],
        ...config,
      };
    }

    // Caso B: Si un invitado está guardando una respuesta
    const respuestaRecibida = response || newResponse;
    if (respuestaRecibida || action === "save_response") {
      const listaRespuestas = BASE_DATOS_EVENTOS[targetSlug].responses || [];
      const datosIncr = respuestaRecibida || body;

      BASE_DATOS_EVENTOS[targetSlug].responses = [
        ...listaRespuestas,
        {
          ...datosIncr,
          createdAt: datosIncr.createdAt || new Date().toISOString(),
        },
      ];
    }

    return NextResponse.json({
      success: true,
      message: "Configuración o respuesta procesada exitosamente.",
      data: BASE_DATOS_EVENTOS[targetSlug],
    });
  } catch (error) {
    console.error("Error en POST /api/form-config:", error);
    return NextResponse.json(
      { error: "Error al guardar los datos en el servidor." },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------------------------
// 3. ELIMINAR EVENTO (DELETE)
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

    if (BASE_DATOS_EVENTOS[slugLower]) {
      delete BASE_DATOS_EVENTOS[slugLower];
    }

    return NextResponse.json({
      success: true,
      message: `El evento '/${slugLower}' ha sido eliminado correctamente.`,
    });
  } catch (error) {
    console.error("Error en DELETE /api/form-config:", error);
    return NextResponse.json(
      { error: "Error al intentar borrar el evento." },
      { status: 500 }
    );
  }
}