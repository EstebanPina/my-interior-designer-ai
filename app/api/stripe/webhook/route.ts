import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { CognitoIdentityProviderClient, AdminUpdateUserAttributesCommand } from '@aws-cognito-identity-provider';

// Initialize MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI!;
const mongoClient = new MongoClient(MONGODB_URI);

// Initialize AWS Cognito client
const cognitoClient = new CognitoIdentityProviderClient({});

// Initialize Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  let mongoConnection;
  
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    
    let stripeEvent;
    try {
      stripeEvent = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
    } catch (err: any) {
      console.log(`Webhook signature verification failed.`, err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Connect to MongoDB
    mongoConnection = await mongoClient.connect();
    const db = mongoConnection.db('MID-AI');
    
    // Handle event
    let userId = '';
    
    switch (stripeEvent.type) {
      case 'invoice.payment_succeeded':
        userId = await handleSubscriptionRenewed(stripeEvent.data.object as any, db);
        break;
        
      case 'customer.subscription.deleted':
        userId = await handleSubscriptionCancelled(stripeEvent.data.object as any, db);
        break;
        
      case 'invoice.payment_failed':
        userId = await handlePaymentFailed(stripeEvent.data.object as any, db);
        break;
        
      case 'checkout.session.completed':
        userId = await handleNewSubscription(stripeEvent.data.object as any, db);
        break;
        
      default:
        console.log(`Unhandled event type ${stripeEvent.type}`);
    }

    return NextResponse.json({ received: true, userId });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (mongoConnection) {
      await mongoConnection.close();
    }
  }
}

async function handleNewSubscription(session: any, db: any) {
  const customerId = session.customer;
  const subscriptionId = session.subscription;
  const userId = session.client_reference_id; // Set this when creating checkout session

  if (!userId) {
    console.error('No user ID in checkout session');
    return '';
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
    try {
      const command = new AdminUpdateUserAttributesCommand({
        UserPoolId: process.env.AWS_USER_POOL_ID!,
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
    } catch (cognitoError) {
      console.error('Error updating Cognito:', cognitoError);
    }

    console.log(`User ${userId} upgraded to premium`);
    return userId;

  } catch (error) {
    console.error('Error updating user subscription:', error);
    return '';
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
      try {
        const command = new AdminUpdateUserAttributesCommand({
          UserPoolId: process.env.AWS_USER_POOL_ID!,
          Username: userId,
          UserAttributes: [
            {
              Name: 'custom:subscriptionEnds',
              Value: new Date(subscription.current_period_end * 1000).toISOString()
            }
          ]
        });

        await cognitoClient.send(command);
      } catch (cognitoError) {
        console.error('Error updating Cognito:', cognitoError);
      }

      console.log(`User ${userId} subscription renewed`);
      return userId;
    }
  } catch (error) {
    console.error('Error renewing subscription:', error);
    return '';
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
      try {
        const command = new AdminUpdateUserAttributesCommand({
          UserPoolId: process.env.AWS_USER_POOL_ID!,
          Username: userId,
          UserAttributes: [
            {
              Name: 'custom:subscription',
              Value: 'free'
            }
          ]
        });

        await cognitoClient.send(command);
      } catch (cognitoError) {
        console.error('Error updating Cognito:', cognitoError);
      }

      console.log(`User ${userId} subscription cancelled`);
      return userId;
    }
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return '';
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
      return userId;
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
    return '';
  }
}