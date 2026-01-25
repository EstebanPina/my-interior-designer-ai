import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';

// Solo autenticación con Cognito - el backend REST permanece en Next.js
const backend = defineBackend({
  auth
});

export default backend;