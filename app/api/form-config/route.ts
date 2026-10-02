import { NextResponse } from "next/server";

// Estructura global en memoria para simular persistencia
const globalForEvents = global as unknown as {
  BASE_DATOS_EVENTOS: Record<
    string,
    {
      questions: any[];
      responses: any[];
    }
  >;
};

if (!globalForEvents.BASE_DATOS_EVENTOS) {
  globalForEvents.BASE_DATOS_EVENTOS = {};
}

const db = globalForEvents.BASE_DATOS_EVENTOS;

// GET: Obtener configuración y respuestas de un evento
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventSlug = searchParams.get("event");

  if (!eventSlug) {
    return NextResponse.json(
      { error: "Se requiere el parámetro 'event'" },
      { status: 400 }
    );
  }

  const data = db[eventSlug] || { questions: [], responses: [] };

  return NextResponse.json({ success: true, data });
}

// POST: Guardar configuración o enviar respuestas
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventSlug, questions, responseData } = body;

    if (!eventSlug) {
      return NextResponse.json(
        { error: "Se requiere 'eventSlug'" },
        { status: 400 }
      );
    }

    if (!db[eventSlug]) {
      db[eventSlug] = { questions: [], responses: [] };
    }

    // Caso A: Guardar Preguntas
    if (questions && Array.isArray(questions)) {
      db[eventSlug].questions = questions;
    }

    // Caso B: Registrar Respuesta de un Formulario
    if (responseData) {
      db[eventSlug].responses.push({
        id: `resp-${Date.now()}`,
        eventoSlug: eventSlug,
        fecha: new Date().toISOString(),
        datos: responseData,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Datos guardados correctamente en el servidor",
      data: db[eventSlug],
    });
  } catch (error) {
    console.error("Error en /api/form-config:", error);
    return NextResponse.json(
      { error: "Error procesando la petición" },
      { status: 500 }
    );
  }
}