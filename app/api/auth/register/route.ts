import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Base de datos simulada (en producción usar una base de datos real)
const USERS_FILE = join(process.cwd(), 'data', 'users.json');

interface User {
  id: string;
  email: string;
  password: string; // En producción usar hash
  name: string;
  createdAt: string;
}

// Asegurar que el directorio data exista
function ensureDataDir() {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    require('fs').mkdirSync(dataDir, { recursive: true });
  }
}

// Leer usuarios
function getUsers(): User[] {
  ensureDataDir();
  if (!existsSync(USERS_FILE)) {
    return [];
  }
  try {
    const data = readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Guardar usuarios
function saveUsers(users: User[]) {
  ensureDataDir();
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// POST - Registro de usuario
export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validar contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    const users = getUsers();

    // Verificar si el usuario ya existe
    if (users.find(user => user.email === email)) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 409 }
      );
    }

    // Crear nuevo usuario
    const newUser: User = {
      id: Date.now().toString(),
      email,
      password, // En producción usar hash
      name,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    // Retornar usuario sin contraseña
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: 'Usuario creado exitosamente'
    });

  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}

// GET - Obtener información del usuario (requiere autenticación)
export async function GET(request: NextRequest) {
  try {
    // Aquí iría la lógica de verificación de token
    // Por ahora, solo retornamos un mensaje
    return NextResponse.json({
      message: 'Endpoint para obtener información del usuario',
      note: 'Requiere implementación de autenticación con JWT'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener información del usuario' },
      { status: 500 }
    );
  }
}