import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;
const mongoClient = new MongoClient(MONGODB_URI);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.redirect('/login?error=missing_code');
  }

  try {
    // Exchange code for Google access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Google token error:', tokenData.error);
      return NextResponse.redirect('/login?error=token_failed');
    }

    // Get user info from Google
    const userResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const userData = await userResponse.json();

    // Connect to MongoDB
    await mongoClient.connect();
    const db = mongoClient.db('MID-AI');
    const usersCollection = db.collection('users');

    // Check if user exists
    let user = await usersCollection.findOne({ email: userData.email });

    if (!user) {
      // Create new user
      const newUser = {
        userId: userData.id, // Use Google ID as userId
        email: userData.email,
        name: userData.name,
        avatar: userData.picture,
        subscription: 'free',
        designsCount: 0,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
        authProvider: 'google',
        googleId: userData.id,
      };

      await usersCollection.insertOne(newUser);
      user = newUser;
    } else {
      // Update existing user
      await usersCollection.updateOne(
        { email: userData.email },
        {
          $set: {
            name: userData.name,
            avatar: userData.picture,
            updatedAt: new Date(),
            lastLoginAt: new Date(),
          }
        }
      );
    }

    // Create JWT token (simple implementation)
    const token = Buffer.from(
      JSON.stringify({
        userId: user.userId,
        email: user.email,
        subscription: user.subscription,
      })
    ).toString('base64');

    // Redirect to frontend with token
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify({
      userId: user.userId,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      subscription: user.subscription,
      designsCount: user.designsCount,
    }))}`;

    await mongoClient.close();

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect('/login?error=oauth_failed');
  }
}