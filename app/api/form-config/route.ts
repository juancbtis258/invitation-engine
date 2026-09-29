import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/data/form-config.json');

// Función aux para obtener la ruta correcta del JSON
function getJsonPath() {
  const possiblePaths = [
    path.join(process.cwd(), 'src/data/form-config.json'),
    path.join(process.cwd(), 'data/form-config.json'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return possiblePaths[0];
}

export async function GET() {
  try {
    const jsonPath = getJsonPath();
    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 });
    }
    const fileData = fs.readFileSync(jsonPath, 'utf8');
    return NextResponse.json(JSON.parse(fileData));
  } catch (error) {
    return NextResponse.json({ error: 'Error al leer la configuración' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const jsonPath = getJsonPath();
    
    // Guardamos los cambios dinámicos
    fs.writeFileSync(jsonPath, JSON.stringify(body, null, 2), 'utf8');
    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar la configuración' }, { status: 500 });
  }
}