import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "form-config.json");

// Datos base por defecto si no hay JSON
const defaultEventData = {
  title: "Boda María & Alejandro",
  targetDate: "2026-10-15",
  plan: "plus",
  responses: []
};

function getStoredData() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return { events: { "demo": defaultEventData } };
    }
    const fileContent = fs.readFileSync(dataFilePath, "utf8");
    return JSON.parse(fileContent);
  } catch (e) {
    return { events: { "demo": defaultEventData } };
  }
}

function saveData(data: any) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error guardando en archivo local:", e);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventSlug = searchParams.get("event") || "demo";
  const data = getStoredData();

  // Si se busca "demo" o un evento no registrado, devuelve los datos base para que no marque "Evento no encontrado"
  const eventData = data.events?.[eventSlug] || defaultEventData;

  return NextResponse.json({
    eventSlug,
    data: eventData,
    allEvents: Object.keys(data.events || { demo: true })
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, eventSlug, response, eventConfig } = body;
    const currentSlug = eventSlug || "demo";
    const data = getStoredData();

    if (!data.events) data.events = {};

    if (action === "add_response") {
      if (!data.events[currentSlug]) {
        data.events[currentSlug] = { ...defaultEventData, responses: [] };
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