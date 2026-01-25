import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID!,
      identityPoolId: process.env.NEXT_PUBLIC_AWS_IDENTITY_POOL_ID!,
      allowGuestAccess: true,
      userPoolRegion: process.env.NEXT_PUBLIC_AWS_REGION!,
      identityPoolRegion: process.env.NEXT_PUBLIC_AWS_REGION!
    }
  },
  API: {
    GraphQL: {
      endpoint: process.env.NEXT_PUBLIC_AWS_GRAPHQL_ENDPOINT!,
      region: process.env.NEXT_PUBLIC_AWS_REGION!,
      apiKey: process.env.NEXT_PUBLIC_AWS_GRAPHQL_API_KEY!,
      defaultAuthMode: 'userPool'
    },
    REST: {
      endpoints: [
        {
          name: 'api',
          endpoint: process.env.NEXT_PUBLIC_API_ENDPOINT!,
          region: process.env.NEXT_PUBLIC_AWS_REGION!
        }
      ]
    }
  },
  Storage: {
    S3: {
      bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET!,
      region: process.env.NEXT_PUBLIC_AWS_REGION!
    }
  }
});

export default Amplify;