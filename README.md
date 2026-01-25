# My Interior Designer AI

Aplicación de diseño interior con Inteligencia Artificial que permite a los usuarios transformar sus espacios mediante el análisis de imágenes y generación de diseños personalizados.

## Características

- 🎨 **Múltiples estilos de diseño**: Minimalista, gótico, rústico, industrial, escandinavo, bohemio y moderno
- 🤖 **Procesamiento con IA**: Integración con OpenAI (DALL-E 3 y GPT-4)
- 🛒 **Recomendaciones de compra**: Productos de Amazon para complementar el diseño
- 👤 **Sistema de autenticación**: Registro y login de usuarios
- 📱 **Interfaz responsiva**: Diseño moderno con Tailwind CSS

## Requisitos Previos

- Node.js 18 o superior
- npm o yarn
- API Key de OpenAI

## Configuración

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd my-interior-designer-ai
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crear el archivo `.env.local` en la raíz del proyecto:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   NODE_ENV=development
   ```

   Para obtener una API Key de OpenAI:
   - Visita [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Crea una nueva cuenta o inicia sesión
   - Genera una nueva API Key
   - Copia la key en el archivo `.env.local`

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
my-interior-designer-ai/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts      # API de login
│   │   │   └── register/route.ts   # API de registro
│   │   └── design/route.ts         # API de generación de diseños
│   ├── globals.css                 # Estilos globales
│   ├── layout.tsx                  # Layout principal
│   └── page.tsx                    # Landing page
├── components/
│   └── general/
│       └── navbar.tsx              # Barra de navegación
├── hooks/
│   └── use-app.ts                  # Hooks personalizados
├── lib/
│   └── api-client.ts               # Cliente API
├── public/                         # Archivos estáticos
└── data/                          # Base de datos simulada
```

## API Endpoints

### Autenticación

#### POST `/api/auth/register`
Registra un nuevo usuario.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Nombre Usuario"
}
```

#### POST `/api/auth/login`
Inicia sesión de usuario.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Diseño

#### GET `/api/design`
Obtiene los estilos de diseño disponibles desde MongoDB.

**Response:**
```json
{
  "styles": ["classic", "modern", "scandinavian"],
  "descriptions": {
    "classic": "Inspirado en grecia y roma antiguas...",
    "modern": "Basado en la funcionalidad y las líneas limpias..."
  },
  "categories": {
    "Estilos clasicos": [
      {
        "slug": "classic",
        "name": "Clásico",
        "description": "Inspirado en grecia y roma antiguas..."
      }
    ],
    "Estilos modernos y contemporáneos": [...]
  }
}
```

#### POST `/api/design`
Genera un diseño de interior basado en una imagen y estilo.

**Body (FormData):**
- `image`: Archivo de imagen
- `style`: Estilo de diseño

**Response:**
```json
{
  "success": true,
  "generatedImage": "data:image/png;base64,...",
  "recommendations": [
    {
      "name": "Producto",
      "description": "Descripción",
      "category": "muebles",
      "priceRange": "$100-$200",
      "amazonUrl": "https://amazon.com/..."
    }
  ],
  "style": "minimalista",
  "originalImage": "data:image/jpeg;base64,..."
}
```

## Estilos de Diseño Disponibles

La aplicación cuenta con **34 estilos de diseño** organizados en 9 categorías:

### Estilos Clásicos (5 estilos)
- **Clásico**: Inspirado en grecia y roma antiguas, con muebles elegantes
- **Neoclásico**: Inspirado en el estilo clásico pero con elementos más modernos
- **Victoriano**: Caracterizado por muebles ornamentados, colores ricos
- **Tradicional**: Enfocado en la comodidad y elegancia atemporal
- **Colonial**: Combinación de influencias europeas y latinoamericanas

### Estilos Modernos y Contemporáneos (4 estilos)
- **Moderno**: Basado en la funcionalidad y las líneas limpias
- **Contemporáneo**: Refleja las tendencias actuales
- **Minimalista**: Enfocado en la simplicidad extrema
- **High Tech**: Estilo tecnológico e industrial

### Estilos Naturales y Escandinavos (4 estilos)
- **Escandinavo**: Luminoso, funcional y acogedor
- **Japandi**: Fusión del minimalismo japonés y diseño escandinavo
- **Wabi-Sabi**: Celebración de la imperfección y lo natural
- **Biofílico**: Busca conectar el interior con la naturaleza

### Y 5 categorías más:
- **Estilos Industriales y Urbanos** (3 estilos)
- **Estilos Rústicos y Campestres** (4 estilos)
- **Estilos Expresivos y Artísticos** (4 estilos)
- **Estilos Culturales y Étnicos** (4 estilos)
- **Estilos Retro y Vintage** (3 estilos)
- **Estilos Lujosos y Sofisticados** (3 estilos)

## Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia servidor de producción
- `npm run lint` - Ejecuta ESLint
- `npm run type-check` - Verifica tipos de TypeScript
- `npm run seed:styles` - Poblar MongoDB con los 34 estilos de diseño desde `/const/DesignStyles.ts`

## Tecnologías Utilizadas

- **Frontend**: Next.js 16, React 19, TypeScript
- **Estilos**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de Datos**: MongoDB con Mongoose
- **IA**: OpenAI (DALL-E 3, GPT-4)
- **Manejo de imágenes**: Multer, Axios
- **Estado**: React Hooks personalizados
- **Configuración**: TypeScript, ts-node, dotenv

## Notas Importantes

- La base de datos actual es simulada (archivos JSON). En producción se recomienda usar una base de datos real como PostgreSQL o MongoDB.
- La autenticación usa tokens simulados. En producción implementar JWT con refresh tokens.
- Las imágenes se procesan en tiempo real. Para alto tráfico, considerar usar un servicio de colas.
- Los precios de los productos son aproximados. Se puede integrar con la API de Amazon para obtener precios en tiempo real.

## Contribución

1. Fork del proyecto
2. Crear una rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit de los cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crear un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.
