import { defineData, type ClientSchema } from '@aws-amplify/backend';
import { a } from '@aws-amplify/backend';

// Schema mínimo solo para datos que no están en MongoDB
const schema = a.schema({
  // Solo para mantener sincronización con MongoDB si es necesario
  SyncStatus: a
    .model({
      userId: a.string().required(),
      lastSyncAt: a.datetime().required(),
      syncType: a.enum(['auth', 'subscription', 'design']).required(),
      mongoId: a.string(),
      status: a.enum(['pending', 'synced', 'failed']).default('pending'),
      createdAt: a.datetime().required()
    })
    .authorization([
      a.allow.owner(),
      a.allow.groups(['admin'])
    ]),

  // Cache temporal para datos frecuentes de MongoDB
  CacheEntry: a
    .model({
      key: a.string().required(),
      value: a.string().required(),
      ttl: a.integer().required(), // Time to live in seconds
      createdAt: a.datetime().required(),
      expiresAt: a.datetime().required()
    })
    .authorization([
      a.allow.guest().to(['read']),
      a.allow.groups(['admin'])
    ])
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
      description: 'API key for guest access'
    }
  }
});