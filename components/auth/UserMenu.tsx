'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function UserMenu() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    logout();
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center space-x-4">
        <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <p className="text-sm font-medium w-32 overflow-x-hidden text-wrap text-gray-900">
            {user.name || user.email}
          </p>
          <p className="text-xs text-gray-500">
            {user.subscription === 'premium' ? '🔥 Premium' : `Plan: ${user.subscription}`}
          </p>
        </div>
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name || user.email}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium">
              {(user.name || user.email)?.[0]?.toUpperCase()}
            </span>
          </div>
        )}
      </div>
      
      <div className="relative group">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <Link
            href="/dashboard"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Dashboard
          </Link>
          <Link
            href="/chat"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Nuevo Diseño
          </Link>
          {user.subscription !== 'premium' && (
            <Link
              href="/pricing"
              className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium"
            >
              Actualizar a Premium 🔥
            </Link>
          )}
          <div className="border-t border-gray-200 my-2"></div>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
