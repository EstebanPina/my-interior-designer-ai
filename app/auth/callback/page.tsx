'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      try {
        localStorage.setItem('token', token);
        localStorage.setItem('user', userStr);

        const user = JSON.parse(decodeURIComponent(userStr));
        
        router.push('/dashboard');
      } catch (error) {
        console.error('Error processing auth callback:', error);
        router.push('/login?error=callback_failed');
      }
    } else {
      router.push('/login?error=missing_data');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900">Procesando autenticación...</h2>
        <p className="text-gray-600 mt-2">Por favor espera mientras verificamos tu información.</p>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900">Cargando...</h2>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<Loading />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
