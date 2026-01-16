import React from 'react'
import Image from 'next/image';

export default function Navbar() {
  return (
    <div className="flex justify-between items-center sticky top-0 bg-white z-50 px-8 py-4 border-b border-gray-200 shadow-sm">
      <Image
        src="/MID LOGO.png"
        alt="My Interior Designer AI Logo"
        width={150}
        height={50}
        className="object-contain"
      />
      <div className="flex space-x-6 items-center">
        <a href="#features" className="text-gray-800 hover:text-blue-600 transition-colors">
          Características
        </a>
        <a href="#how-it-works" className="text-gray-800 hover:text-blue-600 transition-colors">
          Cómo funciona
        </a>
        <a href="#" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Crear cuenta
        </a>
      </div>
    </div>
  )
}