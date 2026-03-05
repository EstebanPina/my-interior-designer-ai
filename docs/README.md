# My Interior Designer AI - Documentación

## Descripción del Proyecto
Aplicación web para redesignar interiores de habitaciones usando IA. Los usuarios pueden subir una foto de su habitación y transformarla a diferentes estilos de diseño interior.

## Tecnologías
- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de datos**: MongoDB Atlas
- **IA**: OpenAI (GPT-4o, gpt-image-1), Replicate (Stable Diffusion)
- **Autenticación**: Google OAuth

## Estructura del Proyecto

```
├── app/
│   ├── api/                    # API Routes
│   │   ├── auth/              # Autenticación
│   │   │   ├── google/        # Login con Google
│   │   │   ├── login/         # Login email/password
│   │   │   └── register/      # Registro
│   │   └── design-optimized/  # Generación de diseños
│   ├── chat/                  # Página de chat/diseño
│   ├── dashboard/             # Dashboard del usuario
│   ├── login/                 # Página de login
│   └── auth/callback/         # Callback de OAuth
├── components/               # Componentes React
├── hooks/                    # Custom hooks (useAuth)
├── const/                    # Constantes (DesignStyles)
└── amplify/                  # Backend AWS Amplify
```

## API Endpoints

### Autenticación

#### POST /api/auth/login
Login con email y contraseña.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "userId": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "subscription": "free",
    "designsCount": 0
  }
}
```

#### GET /api/auth/google/callback
Callback de OAuth con Google. Redirige a /auth/callback con token.

### Diseño

#### GET /api/design-optimized
Obtiene los estilos de diseño disponibles.

**Response:**
```json
{
  "success": true,
  "styles": ["minimalista", "industrial", "scandinavo"],
  "categories": {
    "Moderno": [
      { "slug": "minimalista", "name": "Minimalista", "description": "..." }
    ]
  }
}
```

#### POST /api/design-optimized
Genera un diseño transformado.

**Content-Type:** multipart/form-data

**Parámetros:**
- `image`: Archivo de imagen (opcional)
- `style`: Nombre del estilo (required)

**Response:**
```json
{
  "success": true,
  "style": "Minimalista",
  "generatedImage": "data:image/png;base64,...",
  "originalImage": "data:image/png;base64,...",
  "recommendations": [
    {
      "name": "Sofá Minimalista",
      "description": "Sofá moderno de 3 plazas",
      "category": "furniture",
      "priceRange": "$500-$1000",
      "amazonUrl": "https://amazon.com/..."
    }
  ]
}
```

## Estilos de Diseño Disponibles

### Moderno
- **Minimalista**: Espacios limpios, colores neutros, muebles simples
- **Escandinavo**: Cálido, funcional, materiales naturales
- **Contemporáneo**: Líneas limpias, materiales actuales

### Clásico
- **Clásico**: Elegancia tradicional, muebles ornamentados
- **Rústico**: Materiales naturales, acabados orgánicos
- **Bohemio**: Colores vibrantes, patrones eclectic

### Industrial
- **Industrial**: Exposición de materiales, metal y ladrillo
- **Urban**: Mezcla de estilos urbanos modernos

## Variables de Entorno

```env
# Base de datos
MONGODB_URI=mongodb+srv://...

# OpenAI
OPENAI_API_KEY=sk-...

# Replicate (opcional)
REPLICATE_API_TOKEN=r8_...

# OAuth Google
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# AWS Amplify
NEXT_PUBLIC_AWS_USER_POOL_ID=...
```

## Flujo de Usuario

1. **Registro/Login**: Usuario se autentica con Google o email/password
2. **Dashboard**: Ve sus diseños y estadísticas
3. **Nuevo Diseño**: Navega a /chat
4. **Selección de Estilo**: Elige un estilo de la lista
5. **Subir Imagen**: Sube foto de su habitación
6. **Transformación**: La IA transforma la imagen
7. **Resultados**: Ve la imagen generada y recomendaciones de productos

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Ejecutar en desarrollo
npm run dev
```

## Despliegue

### Vercel (recomendado)
```bash
npm install -g vercel
vercel deploy
```

### AWS Amplify
```bash
npm run amplify:deploy
```
