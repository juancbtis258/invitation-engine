import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "app/data/form-config.json");

export async function GET() {
  try {
    const fileData = fs.readFileSync(filePath, "utf8");
    return NextResponse.json(JSON.parse(fileData));
  } catch (error) {
    return NextResponse.json({ error: "Error al leer la configuración" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2), "utf8");
    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    return NextResponse.json({ error: "Error al guardar la configuración" }, { status: 500 });
  }
}