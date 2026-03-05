import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const MONGODB_URI = process.env.MONGODB_URI!;
  const mongoClient = new MongoClient(MONGODB_URI);
  let mongoConnection;
  
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let stripeEvent;

    try {
      stripeEvent = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    mongoConnection = await mongoClient.connect();
    const db = mongoConnection.db('MID-AI');
    const usersCollection = db.collection('users');

    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object;
        const userEmail = session.customer_email;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (userEmail) {
          await usersCollection.updateOne(
            { email: userEmail },
            {
              $set: {
                subscription: 'premium',
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                updatedAt: new Date()
              }
            }
          );
          console.log(`✅ User ${userEmail} upgraded to premium`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = stripeEvent.data.object;
        
        await usersCollection.updateOne(
          { stripeSubscriptionId: subscription.id },
          {
            $set: {
              subscription: 'free',
              updatedAt: new Date()
            },
            $unset: {
              stripeSubscriptionId: ''
            }
          }
        );
        console.log(`✅ Subscription ${subscription.id} cancelled`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = stripeEvent.data.object;
        
        if (invoice.customer_email) {
          await usersCollection.updateOne(
            { email: invoice.customer_email },
            {
              $set: {
                subscription: 'free',
                updatedAt: new Date()
              }
            }
          );
          console.log(`⚠️ Payment failed for ${invoice.customer_email}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  } finally {
    if (mongoConnection) {
      await mongoConnection.close();
    }
  }
}
