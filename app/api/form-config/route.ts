import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    // Lógica para devolver la configuración o respuestas según el slug
    return NextResponse.json({
      success: true,
      slug: slug || "default",
      message: "Configuración obtenida correctamente",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error al obtener la configuración" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, eventSlug, responseData } = body;

    if (action === "add_response") {
      // Aquí puedes conectar tu base de datos o lógica de almacenamiento
      console.log(`Nueva respuesta para el evento [${eventSlug}]:`, responseData);

      return NextResponse.json({
        success: true,
        message: "Respuesta guardada con éxito",
      });
    }

    return NextResponse.json(
      { success: false, error: "Acción no válida" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error interno del servidor al procesar la solicitud" },
      { status: 500 }
    );
  }
}