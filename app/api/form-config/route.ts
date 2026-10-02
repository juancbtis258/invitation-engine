import { NextResponse } from "next/server";

// Memoria global persistente en el servidor para evitar reinicios durante desarrollo / HMR
const globalForEvents = global as unknown as {
  BASE_DATOS_EVENTOS?: Record<string, any>;
};

if (!globalForEvents.BASE_DATOS_EVENTOS) {
  globalForEvents.BASE_DATOS_EVENTOS = {};
}

const BASE_DATOS_EVENTOS = globalForEvents.BASE_DATOS_EVENTOS;

// ----------------------------------------------------------------------
// 1. OBTENER INFORMACIÓN DEL EVENTO O SUS RESPUESTAS (GET)
// ----------------------------------------------------------------------
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventSlug =
      searchParams.get("event") ||
      searchParams.get("slug") ||
      searchParams.get("eventSlug");

    if (!eventSlug) {
      return NextResponse.json({
        success: true,
        data: BASE_DATOS_EVENTOS,
      });
    }

    const slugLower = eventSlug.toLowerCase().trim();

    // Obtener la información almacenada
    const eventData = BASE_DATOS_EVENTOS[slugLower] || {
      slug: slugLower,
      questions: [],
      responses: [],
    };

    return NextResponse.json({
      success: true,
      data: eventData,
      responses: eventData.responses || [],
    });
  } catch (error) {
    console.error("Error en GET /api/form-config:", error);
    return NextResponse.json(
      { error: "Error al obtener la configuración o respuestas del evento." },
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

    const { event, eventSlug, slug, config, newResponse, response, action } = body;

    const rawSlug = event || eventSlug || slug || "";
    const targetSlug = rawSlug.toString().toLowerCase().trim();

    if (!targetSlug) {
      return NextResponse.json(
        { error: "Falta el identificador del evento (slug)." },
        { status: 400 }
      );
    }

    // Inicializar evento si no existe
    if (!BASE_DATOS_EVENTOS[targetSlug]) {
      BASE_DATOS_EVENTOS[targetSlug] = {
        slug: targetSlug,
        questions: [],
        responses: [],
      };
    }

    // A. Actualizar configuración/preguntas desde el Administrador
    if (config) {
      BASE_DATOS_EVENTOS[targetSlug] = {
        ...BASE_DATOS_EVENTOS[targetSlug],
        ...config,
      };
    }

    // B. Guardar respuesta recibida desde el formulario público
    const respuestaEntrante = response || newResponse;
    if (respuestaEntrante || action === "save_response") {
      const dataAInsertar = respuestaEntrante || body;

      const nuevaRespuesta = {
        id: dataAInsertar.id || Date.now().toString(),
        name: dataAInsertar.name || dataAInsertar.nombreCompleto || dataAInsertar.nombre || "Invitado",
        phone: dataAInsertar.phone || dataAInsertar.whatsapp || "",
        attending: dataAInsertar.attending ?? dataAInsertar.asistira ?? true,
        pasesConfirmados: dataAInsertar.pasesConfirmados ?? dataAInsertar.pases ?? 1,
        asistentes: dataAInsertar.asistentes || dataAInsertar.nombresAcompanantes || [],
        customAnswers: dataAInsertar.customAnswers || dataAInsertar.respuestasPreguntas || {},
        mensaje: dataAInsertar.mensaje || "",
        createdAt: dataAInsertar.createdAt || new Date().toISOString(),
      };

      if (!BASE_DATOS_EVENTOS[targetSlug].responses) {
        BASE_DATOS_EVENTOS[targetSlug].responses = [];
      }

      BASE_DATOS_EVENTOS[targetSlug].responses.push(nuevaRespuesta);
    }

    return NextResponse.json({
      success: true,
      message: "Operación realizada exitosamente.",
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

    const slugLower = eventSlug.toLowerCase().trim();

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