import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Ruta al archivo local JSON de almacenamiento
const dataFilePath = path.join(process.cwd(), "form-config.json");

// Helper para leer los datos del JSON
function getStoredData() {
  if (!fs.existsSync(dataFilePath)) {
    // Estructura inicial con un evento por defecto
    const initialData = {
      events: {
        "demo": {
          title: "Boda María & Alejandro",
          targetDate: "2026-10-15",
          plan: "plus",
          responses: []
        }
      }
    };
    fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  const fileContent = fs.readFileSync(dataFilePath, "utf8");
  return JSON.parse(fileContent);
}

// Helper para guardar
function saveData(data: any) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

// GET: /api/form-config?event=boda-maria
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventSlug = searchParams.get("event") || "demo";
  const data = getStoredData();

  const eventData = data.events[eventSlug] || null;

  return NextResponse.json({
    eventSlug,
    data: eventData,
    allEvents: Object.keys(data.events || {})
  });
}

// POST: Guarda cambios de un evento o registra una respuesta
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, eventSlug, response, eventConfig } = body;
    const currentSlug = eventSlug || "demo";
    const data = getStoredData();

    if (!data.events) data.events = {};

    // CASO 1: Guardar una respuesta enviada por un invitado
    if (action === "add_response") {
      if (!data.events[currentSlug]) {
        return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
      }
      if (!data.events[currentSlug].responses) {
        data.events[currentSlug].responses = [];
      }
      
      const newResponse = {
        id: `res_${Date.now()}`,
        date: new Date().toISOString(),
        ...response
      };
      
      data.events[currentSlug].responses.push(newResponse);
      saveData(data);
      return NextResponse.json({ success: true, response: newResponse });
    }

    // CASO 2: Crear o actualizar un evento desde el Panel de Admin
    if (action === "save_event") {
      data.events[currentSlug] = {
        ...(data.events[currentSlug] || { responses: [] }),
        ...eventConfig
      };
      saveData(data);
      return NextResponse.json({ success: true, eventSlug: currentSlug });
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}