'use client';

import { useState, useEffect } from 'react';
import { 
  signInWithRedirect, 
  signOut, 
  getCurrentUser,
  fetchAuthSession,
  fetchUserAttributes
} from 'aws-amplify/auth';

interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  subscription: 'free' | 'premium' | 'enterprise';
  subscriptionEnds?: Date;
  designsCount: number;
  role: 'user' | 'admin';
}

export function useCognitoAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isPremium = user?.subscription === 'premium' || user?.subscription === 'enterprise';
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      
      if (currentUser) {
        const attributes = await fetchUserAttributes();
        const session = await fetchAuthSession();
        
        const userData: User = {
          id: currentUser.userId,
          email: attributes.email || '',
          name: attributes.name || attributes['custom:name'] || '',
          picture: attributes.picture || attributes['custom:picture'] || '',
          subscription: (attributes['custom:subscription'] as any) || 'free',
          subscriptionEnds: attributes['custom:subscriptionEnds'] 
            ? new Date(attributes['custom:subscriptionEnds']) 
            : undefined,
          designsCount: parseInt(attributes['custom:designsCount'] || '0'),
          role: session.tokens?.idToken?.payload['cognito:groups']?.includes('admin') 
            ? 'admin' 
            : 'user'
        };

        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setError('Error checking authentication status');
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (provider: 'google' | 'facebook') => {
    try {
      setError(null);
      await signInWithRedirect({ 
        provider: {
          target: provider
        }
      });
    } catch (error) {
      console.error('Sign in error:', error);
      setError(`Error signing in with ${provider}`);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      // Implement email/password sign in
      // await signIn({ username: email, password });
      // After successful sign in, call checkAuthStatus()
    } catch (error) {
      console.error('Email sign in error:', error);
      setError('Invalid email or password');
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      // Implement sign up
      // await signUp({ username: email, password, attributes: { name } });
      // After successful sign up, call checkAuthStatus()
    } catch (error) {
      console.error('Sign up error:', error);
      setError('Error creating account');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      setError('Error signing out');
    }
  };

  const canCreateDesign = () => {
    if (isPremium) return true;
    if (user?.subscription === 'free') {
      return user.designsCount < 3;
    }
    return false;
  };

  const remainingDesigns = () => {
    if (isPremium) return '∞';
    if (user?.subscription === 'free') {
      return Math.max(0, 3 - user.designsCount);
    }
    return 0;
  };

  return {
    user,
    isLoading,
    error,
    isPremium,
    isAdmin,
    canCreateDesign: canCreateDesign(),
    remainingDesigns: remainingDesigns(),
    signIn,
    signInWithEmail,
    signUp,
    signOut: handleSignOut,
    checkAuthStatus
  };
}