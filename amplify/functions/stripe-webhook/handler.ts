import { MongoClient } from 'mongodb';
import { CognitoIdentityProviderClient, AdminUpdateUserAttributesCommand } from '@aws-cognito-identity-provider';

// Initialize MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI!;
const mongoClient = new MongoClient(MONGODB_URI);

// Initialize AWS Cognito client
const cognitoClient = new CognitoIdentityProviderClient({});

// Initialize Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY!);

type Event = {
  headers: { [key: string]: string };
  body: string;
};

type HandlerResponse = {
  statusCode: number;
  headers: { [key: string]: string };
  body: string;
};

export const handler = async (event: Event): Promise<HandlerResponse> => {
  let mongoConnection;
  
  try {
    const sig = event.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    
    let stripeEvent;
    try {
      stripeEvent = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
    } catch (err) {
      console.log(`Webhook signature verification failed.`, err);
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid signature' })
      };
    }

    // Connect to MongoDB
    mongoConnection = await mongoClient.connect();
    const db = mongoConnection.db('MID-AI');
    
    // Handle event
    switch (stripeEvent.type) {
      case 'invoice.payment_succeeded':
        await handleSubscriptionRenewed(stripeEvent.data.object as any, db);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(stripeEvent.data.object as any, db);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(stripeEvent.data.object as any, db);
        break;
        
      case 'checkout.session.completed':
        await handleNewSubscription(stripeEvent.data.object as any, db);
        break;
        
      default:
        console.log(`Unhandled event type ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ received: true })
    };

  } catch (error) {
    console.error('Webhook handler error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  } finally {
    if (mongoConnection) {
      await mongoConnection.close();
    }
  }
};

async function handleNewSubscription(session: any, db: any) {
  const customerId = session.customer;
  const subscriptionId = session.subscription;
  const userId = session.client_reference_id; // Set this when creating checkout session

  if (!userId) {
    console.error('No user ID in checkout session');
    return;
  }

  try {
    // Update MongoDB User subscription
    const usersCollection = db.collection('users');
    await usersCollection.updateOne(
      { userId: userId },
      {
        $set: {
          subscription: 'premium',
          subscriptionEnds: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        }
      }
    );

    // Create subscription record in MongoDB
    const subscriptionsCollection = db.collection('subscriptions');
    await subscriptionsCollection.insertOne({
      userId: userId,
      plan: 'premium',
      status: 'active',
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: customerId,
      periodStart: new Date(),
      periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      autoRenew: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Update Cognito user attributes for auth layer
    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID!,
      Username: userId,
      UserAttributes: [
        {
          Name: 'custom:subscription',
          Value: 'premium'
        },
        {
          Name: 'custom:subscriptionEnds',
          Value: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    });

    await cognitoClient.send(command);
    console.log(`User ${userId} upgraded to premium`);

  } catch (error) {
    console.error('Error updating user subscription:', error);
  }
}

async function handleSubscriptionRenewed(invoice: any, db: any) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const customerId = subscription.customer;

  try {
    // Get customer metadata to find user ID
    const customer = await stripe.customers.retrieve(customerId);
    const userId = (customer as any).metadata?.cognitoUserId;

    if (userId) {
      // Update MongoDB subscription
      const subscriptionsCollection = db.collection('subscriptions');
      await subscriptionsCollection.updateOne(
        { userId: userId, status: 'active' },
        {
          $set: {
            periodEnd: new Date(subscription.current_period_end * 1000),
            updatedAt: new Date()
          }
        }
      );

      // Update MongoDB user
      const usersCollection = db.collection('users');
      await usersCollection.updateOne(
        { userId: userId },
        {
          $set: {
            subscriptionEnds: new Date(subscription.current_period_end * 1000),
            updatedAt: new Date()
          }
        }
      );

      // Update Cognito attributes
      const command = new AdminUpdateUserAttributesCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID!,
        Username: userId,
        UserAttributes: [
          {
            Name: 'custom:subscriptionEnds',
            Value: new Date(subscription.current_period_end * 1000).toISOString()
          }
        ]
      });

      await cognitoClient.send(command);
      console.log(`User ${userId} subscription renewed`);
    }
  } catch (error) {
    console.error('Error renewing subscription:', error);
  }
}

async function handleSubscriptionCancelled(subscription: any, db: any) {
  const customerId = subscription.customer;

  try {
    const customer = await stripe.customers.retrieve(customerId);
    const userId = (customer as any).metadata?.cognitoUserId;

    if (userId) {
      // Update MongoDB subscription
      const subscriptionsCollection = db.collection('subscriptions');
      await subscriptionsCollection.updateOne(
        { userId: userId, status: 'active' },
        {
          $set: {
            status: 'cancelled',
            autoRenew: false,
            updatedAt: new Date()
          }
        }
      );

      // Update MongoDB user
      const usersCollection = db.collection('users');
      await usersCollection.updateOne(
        { userId: userId },
        {
          $set: {
            subscription: 'free',
            updatedAt: new Date()
          }
        }
      );

      // Update Cognito attributes
      const command = new AdminUpdateUserAttributesCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID!,
        Username: userId,
        UserAttributes: [
          {
            Name: 'custom:subscription',
            Value: 'free'
          }
        ]
      });

      await cognitoClient.send(command);
      console.log(`User ${userId} subscription cancelled`);
    }
  } catch (error) {
    console.error('Error cancelling subscription:', error);
  }
}

async function handlePaymentFailed(invoice: any, db: any) {
  const customerId = invoice.customer;
  
  try {
    const customer = await stripe.customers.retrieve(customerId);
    const userId = (customer as any).metadata?.cognitoUserId;

    if (userId) {
      // Log payment failure in MongoDB
      const paymentFailuresCollection = db.collection('paymentfailures');
      await paymentFailuresCollection.insertOne({
        userId: userId,
        customerId: customerId,
        invoiceId: invoice.id,
        amount: invoice.amount,
        currency: invoice.currency,
        failureReason: invoice.last_finalization_error?.message,
        createdAt: new Date()
      });

      console.log(`Payment failed for user ${userId}`);
      // TODO: Implement email notification via Lambda function
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

    // Handle the event
    switch (stripeEvent.type) {
      case 'invoice.payment_succeeded':
        await handleSubscriptionRenewed(stripeEvent.data.object as any);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(stripeEvent.data.object as any);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(stripeEvent.data.object as any);
        break;
        
      case 'checkout.session.completed':
        await handleNewSubscription(stripeEvent.data.object as any);
        break;
        
      default:
        console.log(`Unhandled event type ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ received: true })
    };

  } catch (error) {
    console.error('Webhook handler error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

async function handleNewSubscription(session: any) {
  const customerId = session.customer;
  const subscriptionId = session.subscription;
  const userId = session.client_reference_id; // Set this when creating checkout session

  if (!userId) {
    console.error('No user ID in checkout session');
    return;
  }

  try {
    // Update Cognito user attributes
    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID!,
      Username: userId,
      UserAttributes: [
        {
          Name: 'custom:subscription',
          Value: 'premium'
        },
        {
          Name: 'custom:subscriptionEnds',
          Value: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        }
      ]
    });

    await cognitoClient.send(command);
    console.log(`User ${userId} upgraded to premium`);

  } catch (error) {
    console.error('Error updating user subscription:', error);
  }
}

async function handleSubscriptionRenewed(invoice: any) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const customerId = subscription.customer;

  try {
    // Get customer metadata to find user ID
    const customer = await stripe.customers.retrieve(customerId);
    const userId = (customer as any).metadata?.cognitoUserId;

    if (userId) {
      const command = new AdminUpdateUserAttributesCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID!,
        Username: userId,
        UserAttributes: [
          {
            Name: 'custom:subscriptionEnds',
            Value: new Date(subscription.current_period_end * 1000).toISOString()
          }
        ]
      });

      await cognitoClient.send(command);
      console.log(`User ${userId} subscription renewed`);
    }
  } catch (error) {
    console.error('Error renewing subscription:', error);
  }
}

async function handleSubscriptionCancelled(subscription: any) {
  const customerId = subscription.customer;

  try {
    const customer = await stripe.customers.retrieve(customerId);
    const userId = (customer as any).metadata?.cognitoUserId;

    if (userId) {
      const command = new AdminUpdateUserAttributesCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID!,
        Username: userId,
        UserAttributes: [
          {
            Name: 'custom:subscription',
            Value: 'free'
          }
        ]
      });

      await cognitoClient.send(command);
      console.log(`User ${userId} subscription cancelled`);
    }
  } catch (error) {
    console.error('Error cancelling subscription:', error);
  }
}

async function handlePaymentFailed(invoice: any) {
  const customerId = invoice.customer;
  
  try {
    const customer = await stripe.customers.retrieve(customerId);
    const userId = (customer as any).metadata?.cognitoUserId;

    if (userId) {
      // Here you could send an email notification about payment failure
      console.log(`Payment failed for user ${userId}`);
      // TODO: Implement email notification
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}