import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "app", "data", "form-config.json");

// Datos por defecto si el archivo aún no existe
const defaultEventData = {
  title: "Boda María & Alejandro",
  targetDate: "2026-10-15",
  plan: "plus",
  active: true,
  questions: [
    { id: "q1", label: "Ingresa tu nombre", type: "text" },
    { id: "q2", label: "Ingresa tu número de WhatsApp", type: "text" },
    { id: "q3", label: "¿Asistirás al evento?", type: "choice", options: ["Sí", "No"] }
  ],
  responses: []
};

function getStoredData() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      const initialData = { events: { demo: defaultEventData } };
      fs.mkdirSync(path.dirname(dataFilePath), { recursive: true });
      fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2), "utf-8");
      return initialData;
    }
    const fileContent = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error leyendo archivo JSON:", error);
    return { events: { demo: defaultEventData } };
  }
}

function saveData(data: any) {
  try {
    fs.mkdirSync(path.dirname(dataFilePath), { recursive: true });
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error guardando en archivo JSON:", error);
  }
}

// GET: Obtener configuración de un evento o la lista completa
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const eventSlug = searchParams.get("event") || "demo";

  const data = getStoredData();

  if (action === "get_all_events") {
    return NextResponse.json({ success: true, data: data.events || {} });
  }

  const eventConfig = data.events?.[eventSlug] || defaultEventData;
  return NextResponse.json({ success: true, data: eventConfig });
}

// POST: Guardar evento, actualizar o registrar respuesta de un invitado
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, eventSlug, eventConfig, responseData } = body;
    const currentSlug = eventSlug || "demo";

    const data = getStoredData();
    if (!data.events) data.events = {};

    // Guardar / Duplicar / Actualizar evento
    if (action === "save_event" || eventConfig) {
      const existing = data.events[currentSlug] || defaultEventData;
      data.events[currentSlug] = {
        ...existing,
        ...eventConfig,
      };
      saveData(data);
      return NextResponse.json({ success: true, message: "Evento guardado con éxito" });
    }

    // Registrar respuesta del invitado
    if (responseData) {
      if (!data.events[currentSlug]) {
        data.events[currentSlug] = { ...defaultEventData, responses: [] };
      }
      if (!data.events[currentSlug].responses) {
        data.events[currentSlug].responses = [];
      }

      const newResponse = {
        id: `resp_${Date.now()}`,
        date: new Date().toISOString(),
        ...responseData,
      };

      data.events[currentSlug].responses.push(newResponse);
      saveData(data);

      return NextResponse.json({ success: true, message: "Respuesta registrada" });
    }

    return NextResponse.json({ success: false, error: "Acción no reconocida" }, { status: 400 });
  } catch (error) {
    console.error("Error en POST API:", error);
    return NextResponse.json({ success: false, error: "Error de servidor" }, { status: 500 });
  }
}