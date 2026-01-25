import { defineAuth } from '@aws-amplify/backend-auth';

export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        scopes: ['email', 'profile', 'openid'],
        attributeMapping: {
          email: 'email',
          name: 'name',
          picture: 'picture'
        }
      },
      facebook: {
        clientId: process.env.FACEBOOK_CLIENT_ID!,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        scopes: ['email', 'public_profile'],
        attributeMapping: {
          email: 'email',
          name: 'name',
          picture: 'picture'
        }
      }
    }
  },
  groups: ['admin', 'premium', 'free'],
  userAttributes: {
    email: {
      required: true,
      mutable: true
    },
    name: {
      required: false,
      mutable: true
    },
    picture: {
      required: false,
      mutable: true
    },
    'custom:subscription': {
      dataType: 'String',
      mutable: true,
      maxLen: 50,
      default: 'free'
    },
    'custom:subscriptionEnds': {
      dataType: 'String',
      mutable: true,
      maxLen: 50
    },
    'custom:designsCount': {
      dataType: 'Number',
      mutable: true,
      default: 0
    }
  },
  passwordPolicy: {
    minLength: 8,
    requireNumbers: true,
    requireSpecialCharacters: true,
    requireUppercase: true
  },
  accountRecovery: 'EMAIL_ONLY'
});