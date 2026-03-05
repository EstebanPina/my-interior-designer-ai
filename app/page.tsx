import Navbar from "@/components/general/navbar";
import BeforeAfterCarousel from "@/components/home/BeforeAfterCarousel";
import Link from "next/link";
import { BiBuilding } from "react-icons/bi";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:w-1/2 mb-12 lg:mb-0">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Transforma tu espacio con
              <span className="text-blue-600"> IA</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Sube una foto de tu habitación y descubre cómo se vería con diferentes estilos de diseño interior. 
              Obtén recomendaciones personalizadas y enlaces de compra para decorar tu espacio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/login" className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-center">
                Comenzar Gratis
              </a>
              <a href="#transformations" className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-center">
                Ver Transformaciones
              </a>
            </div>
          </div>
          <div className="lg:w-1/2 lg:pl-12">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-200 rounded-lg transform rotate-3"></div>
              <div className="relative bg-white rounded-lg shadow-xl p-2">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">🏠✨</div>
                    <p className="text-gray-600 font-medium">Transforma tu habitación</p>
                    <p className="text-blue-600 font-bold">Arrastra para ver el antes y después</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Carousel Section */}
      <section id="transformations">
        <BeforeAfterCarousel />
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="bg-white py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            ¿Cómo funciona?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-black">Crea tu cuenta</h3>
              <p className="text-gray-600">
                Regístrate gratuitamente para acceder a todas las funcionalidades de diseño.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-black">Sube tu imagen</h3>
              <p className="text-gray-600">
                Carga una foto de la habitación que quieres rediseñar.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-black">Elige tu estilo</h3>
              <p className="text-gray-600">
                Selecciona entre minimalista, gótico, rústico y muchos más estilos de diseño.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Características principales
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-black">Diseño con IA</h3>
              <p className="text-gray-600">
                Nuestra IA analiza tu espacio y genera diseños realistas adaptados a tus preferencias.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-black">Múltiples estilos</h3>
              <p className="text-gray-600">
                Minimalista, gótico, rústico, industrial, escandinavo y muchos más estilos disponibles.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-black">Recomendaciones de compra</h3>
              <p className="text-gray-600">
                Obtén enlaces de Amazon para comprar los muebles y accesorios que necesitas.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BiBuilding className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-black">Herramientas para profesionales</h3>
              <p className="text-gray-600">
                Personaliza la solicitud del rediseño, ajusta parámetros avanzados y descarga imágenes de alta resolución para tus proyectos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿Listo para transformar tu espacio?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Únete a miles de usuarios que ya están descubriendo nuevas posibilidades para sus hogares.
          </p>
          <Link href="/login" className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
            Crear cuenta gratuita
          </Link>
        </div>
      </section>
    </div>
  );
}
