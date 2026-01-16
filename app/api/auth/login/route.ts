import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Base de datos simulada
const USERS_FILE = join(process.cwd(), 'data', 'users.json');

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
}

// Leer usuarios
function getUsers(): User[] {
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

// POST - Login de usuario
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Retornar usuario sin contraseña
    const { password: _, ...userWithoutPassword } = user;

    // En producción, aquí se generaría un token JWT
    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token: 'mock-jwt-token', // Token simulado
      message: 'Login exitoso'
    });

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error al procesar login' },
      { status: 500 }
    );
  }
}