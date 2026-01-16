// Cliente API para comunicarse con el backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface DesignRequest {
  image: File;
  style: string;
}

export interface DesignResponse {
  success: boolean;
  generatedImage: string;
  recommendations: ProductRecommendation[];
  style: string;
  originalImage: string;
}

export interface ProductRecommendation {
  name: string;
  description: string;
  category: string;
  priceRange: string;
  amazonUrl: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
  message: string;
}

// API de Diseño
export const designAPI = {
  // Obtener estilos disponibles
  async getStyles() {
    const response = await fetch(`${API_BASE_URL}/api/design`);
    if (!response.ok) {
      throw new Error('Error al obtener estilos');
    }
    return response.json();
  },

  // Generar diseño
  async generateDesign(request: DesignRequest): Promise<DesignResponse> {
    const formData = new FormData();
    formData.append('image', request.image);
    formData.append('style', request.style);

    const response = await fetch(`${API_BASE_URL}/api/design`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al generar diseño');
    }

    return response.json();
  },
};

// API de Autenticación
export const authAPI = {
  // Registro
  async register(userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al registrar usuario');
    }

    return response.json();
  },

  // Login
  async login(credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al iniciar sesión');
    }

    return response.json();
  },
};

// Utilidades para manejo de errores
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Wrapper para manejar errores de API
export async function handleAPICall<T>(
  apiCall: () => Promise<T>
): Promise<{ data: T | null; error: APIError | null }> {
  try {
    const data = await apiCall();
    return { data, error: null };
  } catch (error) {
    if (error instanceof APIError) {
      return { data: null, error };
    }
    
    if (error instanceof Error) {
      return { 
        data: null, 
        error: new APIError(error.message) 
      };
    }
    
    return { 
      data: null, 
      error: new APIError('Error desconocido') 
    };
  }
}