'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserMenu } from '@/components/auth/UserMenu';

export default function Navbar() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center sticky top-0 bg-white z-50 px-8 py-4 border-b border-gray-200 shadow-sm">
        <Link href="/" className="flex items-center">
          <Image
            src="/MID LOGO.png"
            alt="My Interior Designer AI Logo"
            width={150}
            height={50}
            className="object-contain"
          />
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link href="#features" className="text-gray-800 hover:text-blue-600 transition-colors">
            Características
          </Link>
          <Link href="#how-it-works" className="text-gray-800 hover:text-blue-600 transition-colors">
            Cómo funciona
          </Link>
          <Link href="#pricing" className="text-gray-800 hover:text-blue-600 transition-colors">
            Precios
          </Link>
          <UserMenu />
        </div>
      </div>

      {/* AuthModal will be handled globally */}
    </>
  );
}