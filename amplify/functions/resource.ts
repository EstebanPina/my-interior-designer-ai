import { defineFunction, secret } from '@aws-amplify/backend';
import { auth } from '../auth/resource.js';
import { data } from '../data/resource.js';

// Función para manejo de suscripciones con Stripe
export const stripeWebhook = defineFunction({
  name: 'stripeWebhook',
  entry: './stripe-webhook/handler.ts',
  environment: {
    STRIPE_SECRET_KEY: secret('STRIPE_SECRET_KEY'),
    STRIPE_WEBHOOK_SECRET: secret('STRIPE_WEBHOOK_SECRET'),
    COGNITO_USER_POOL_ID: auth.resources.userPool.userPoolId,
    AWS_REGION: process.env.AWS_REGION || 'us-east-1'
  }
});

// Función para generar diseños con IA
export const generateDesign = defineFunction({
  name: 'generateDesign',
  entry: './generate-design/handler.ts',
  environment: {
    OPENAI_API_KEY: secret('OPENAI_API_KEY'),
    S3_BUCKET_NAME: secret('S3_BUCKET_NAME'),
    COGNITO_USER_POOL_ID: auth.resources.userPool.userPoolId
  }
});

// Función para procesar imágenes
export const processImage = defineFunction({
  name: 'processImage',
  entry: './process-image/handler.ts',
  environment: {
    S3_BUCKET_NAME: secret('S3_BUCKET_NAME'),
    AWS_REGION: process.env.AWS_REGION || 'us-east-1'
  }
});

// Función para enviar emails
export const sendEmail = defineFunction({
  name: 'sendEmail',
  entry: './send-email/handler.ts',
  environment: {
    SES_REGION: process.env.AWS_REGION || 'us-east-1',
    FROM_EMAIL: secret('FROM_EMAIL')
  }
});