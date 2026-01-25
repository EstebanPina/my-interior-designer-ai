# My Interior Designer AI - AWS Amplify Version

Aplicación de diseño interior con Inteligencia Artificial desplegada en AWS Amplify, con autenticación social y sistema de suscripciones.

## 🚀 Arquitectura Amplify

```
AWS Amplify (Backend)
├── AWS Cognito (Autenticación)
│   ├── Social Login (Google, Facebook)
│   ├── User Groups (admin, premium, free)
│   └── Custom Attributes (subscription, designsCount)
├── AWS AppSync (GraphQL API)
│   ├── User Model
│   ├── Design Model  
│   ├── Subscription Model
│   └── DesignStyle Model
├── AWS Lambda (Serverless Functions)
│   ├── stripeWebhook (Procesamiento de pagos)
│   ├── generateDesign (Generación con IA)
│   ├── processImage (Procesamiento de imágenes)
│   └── sendEmail (Notificaciones)
├── AWS S3 (Storage)
│   ├── Uploads bucket
│   ├── Generated designs
│   └── Thumbnails
└── AWS SES (Email Service)
```

## 📋 Características

### 🔐 Autenticación Avanzada
- ✅ Social login (Google, Facebook)
- ✅ Email/Password tradicional
- ✅ User groups con roles
- ✅ MFA opcional
- ✅ Password policy robusta

### 💳 Sistema de Suscripciones
- ✅ Free: 3 diseños/mes, 15 estilos básicos
- ✅ Premium: Diseños ilimitados, todos los estilos
- ✅ Enterprise: API access, diseño personalizado
- ✅ Integración con Stripe
- ✅ Webhooks automáticos

### 🎨 Generación de Diseños
- ✅ 34 estilos de diseño (9 categorías)
- ✅ OpenAI DALL-E 3 + GPT-4
- ✅ Recomendaciones Amazon
- ✅ Procesamiento con AWS Rekognition
- ✅ Almacenamiento en S3

## 🛠️ Configuración

### Prerrequisitos
- Node.js 18+
- AWS CLI configurado
- Amplify CLI instalado
- Cuentas de desarrollador:
  - Google Cloud Console
  - Facebook Developers
  - Stripe
  - OpenAI

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd my-interior-designer-ai
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar Amplify Backend**
```bash
amplify init
amplify add auth
amplify add api
amplify add function
amplify push --y
```

4. **Configurar variables de entorno**
```bash
cp .env.amplify .env.local
# Editar .env.local con tus credenciales
```

5. **Iniciar desarrollo**
```bash
npm run amplify:generate
npm run dev
```

## 📊 Modelos de Datos

### User
```typescript
interface User {
  userId: string;
  email: string;
  name?: string;
  avatar?: string;
  subscription: 'free' | 'premium' | 'enterprise';
  subscriptionEnds?: Date;
  designsCount: number;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}
```

### Design
```typescript
interface Design {
  userId: string;
  originalImage: string;
  generatedImage: string;
  style: string;
  styleCategory: string;
  recommendations: ProductRecommendation[];
  isPublic: boolean;
  likes: number;
  createdAt: Date;
}
```

### Subscription
```typescript
interface Subscription {
  userId: string;
  plan: 'free' | 'premium' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired';
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  periodStart: Date;
  periodEnd: Date;
  autoRenew: boolean;
}
```

## 🎯 Planes de Suscripción

| Característica | Free | Premium ($9.99/mes) | Enterprise ($29.99/mes) |
|---------------|-------|----------------------|-------------------------|
| Diseños/mes | 3 | ♾️ | ♾️ |
| Estilos disponibles | 15 (básicos) | 34 (todos) | 34 + personalizados |
| Recomendaciones Amazon | ❌ | ✅ | ✅ Premium |
| Descargas HD | ❌ | ✅ | ✅ |
| API Access | ❌ | ❌ | ✅ |
| Diseño personalizado | ❌ | ❌ | ✅ |
| Soporte | Básico | Prioritario | Enterprise |

## 🔗 Integraciones Externas

### Stripe (Pagos)
- Webhooks para renovaciones
- Cancelaciones automáticas
- Manejo de fallos de pago

### Social Providers
- **Google**: OAuth 2.0 con profile y email
- **Facebook**: Login con permissions extendidas

### OpenAI
- **DALL-E 3**: Generación de imágenes
- **GPT-4**: Recomendaciones de productos
- **Rate limiting**: Control de costos

### AWS Services
- **S3**: Almacenamiento de imágenes
- **Rekognition**: Análisis de imágenes
- **SES**: Emails transaccionales
- **Lambda**: Functions serverless

## 🚀 Scripts Disponibles

```bash
npm run amplify:sandbox     # Entorno de desarrollo Amplify
npm run amplify:generate    # Generar tipos GraphQL
npm run amplify:push        # Deploy backend
npm run dev                # Servidor de desarrollo
npm run build              # Build para producción
npm run type-check         # Verificación TypeScript
```

## 📈 Costos AWS Estimados

| Servicio | Costo Mensual (1,000 usuarios) |
|----------|------------------------------|
| Cognito | $55 (MAU) |
| AppSync | $25 (Queries) |
| Lambda | $15 (Invocaciones) |
| S3 | $10 (Storage) |
| SES | $5 (Emails) |
| **Total** | **~$110/mes** |

## 🔒 Seguridad

- ✅ JWT tokens con Cognito
- ✅ CORS configurado
- ✅ Variables de entorno en Secrets Manager
- ✅ Validación de inputs
- ✅ Rate limiting en APIs
- ✅ IAM roles con mínimo privilegio

## 📱 Deployment

### Amplify Hosting
```bash
# Build y deploy
amplify add hosting
amplify publish

# O despliegue manual
npm run build
amplify publish --prod
```

### Environment Variables
Las variables se configuran en:
1. Console AWS -> Amplify -> App Settings -> Environment Variables
2. O a través de CLI: `amplify update function`

## 🧪 Testing

```bash
# Unit tests
npm run test

# Integration tests con Amplify Mock
npm run test:integration

# E2E tests
npm run test:e2e
```

## 📝 Monitorización

- **Amplify Console**: Métricas en tiempo real
- **CloudWatch**: Logs y alertas
- **X-Ray**: Tracing de solicitudes
- **Health Check**: Monitoreo de servicios

## 🔄 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Amplify
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npx amplify publish --prod
```

## 🚨 Troubleshooting

### Common Issues

**Auth redirects not working**
- Verificar Cognito callbacks URLs
- Checar allowed origins

**Stripe webhooks failing**
- Validar webhook secret
- Check endpoint accessibility

**Lambda timeouts**
- Aumentar timeout en function config
- Optimizar código o aumentar memoria

## 📚 Documentación Adicional

- [AWS Amplify Docs](https://docs.amplify.aws/)
- [Cognito User Pools](https://docs.aws.amazon.com/cognito/)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [OpenAI API](https://platform.openai.com/docs)

## 🤝 Contribución

1. Fork del proyecto
2. Crear feature branch
3. Push y crear Pull Request
4. Tests automatizados en CI/CD

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.