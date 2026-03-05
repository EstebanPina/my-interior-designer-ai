'use client';

import { useState } from 'react';
import Image from 'next/image';

interface BeforeAfterItem {
  id: number;
  before: string;
  after: string;
  title: string;
  style: string;
}

const beforeAfterItems: BeforeAfterItem[] = [
  {
    id: 1,
    before: '/before_image.jpg',
    after: '/after_image.png',
    title: 'Habitacion Minimalista',
    style: 'Maximalista'
  }
];

export default function BeforeAfterCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const current = beforeAfterItems[currentIndex];

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % beforeAfterItems.length);
    setSliderPosition(50);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + beforeAfterItems.length) % beforeAfterItems.length);
    setSliderPosition(50);
  };

  const handleSliderMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    let clientX: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(percentage, 0), 100));
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Transforma tu espacio
          </h2>
          <p className="text-xl text-gray-600">
            Descubre el potencial de tu hogar con nuestros diseños generados por IA
          </p>
        </div>

        {/* Carousel */}
        <div className="max-w-4xl mx-auto">
          {/* Before/After Image */}
          <div 
            className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl cursor-ew-resize"
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onMouseMove={handleSliderMove}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            onTouchMove={handleSliderMove}
          >
            {/* Before Image (full) */}
            
            <Image
              src={current.after}
              alt="Después"
              fill
              className="object-cover"
              priority
            />
            {/* After Image (clipped) */}
            <div 
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <Image
                src={current.before}
                alt="Antes"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Slider Handle */}
            <div 
              className="absolute inset-y-0 w-1 bg-white cursor-ew-resize"
              style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </div>
            </div>

            {/* Labels */}
            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
              Antes
            </div>
            <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              Después
            </div>
          </div>

          {/* Info */}
          <div className="text-center mt-6">
            <h3 className="text-2xl font-bold text-gray-900">{current.title}</h3>
            <p className="text-gray-600">Estilo: {current.style}</p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex gap-2">
              {beforeAfterItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setSliderPosition(50);
                  }}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
