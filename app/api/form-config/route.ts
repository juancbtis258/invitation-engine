import { NextResponse } from "next/server";

const defaultEventData = {
  title: "Boda María & Alejandro",
  targetDate: "2026-10-15",
  plan: "plus",
  responses: []
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventSlug = searchParams.get("event") || "demo";

  return NextResponse.json({
    eventSlug,
    data: defaultEventData,
    allEvents: [eventSlug]
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}