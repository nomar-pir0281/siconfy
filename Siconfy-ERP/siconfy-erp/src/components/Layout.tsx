import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdBanner } from './AdBanner';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 flex flex-col">
      <Navbar />

      {/* ÁREA PRINCIPAL CON PUBLICIDAD */}
      <div className="flex flex-grow justify-center w-full max-w-[1600px] mx-auto pt-4">
        <div className="hidden lg:block mr-4">
          <AdBanner slot="vertical-left" />
        </div>

        <div className="flex flex-col w-full max-w-6xl px-2 md:px-0">
          <AdBanner slot="top" />

          <main className="flex-grow bg-white md:bg-transparent shadow-sm md:shadow-none rounded-lg md:rounded-none overflow-hidden min-h-[60vh]">
            <Outlet />
          </main>

          <AdBanner slot="bottom" />
        </div>

        <div className="hidden lg:block ml-4">
          <AdBanner slot="vertical-right" />
        </div>
      </div>

      {/* FOOTER ORIGINAL */}
      <footer className="bg-slate-900 text-gray-400 py-6 mt-auto print:hidden text-center text-xs md:text-sm border-t border-slate-700 z-50 relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center items-center gap-6 mb-4">
            <a href="https://wa.me/50587662961" className="flex items-center gap-2 text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full transition-all font-bold no-underline" target="_blank" rel="noopener noreferrer">
              <span>📱</span> WhatsApp
            </a>
            <a href="https://facebook.com" className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full transition-all font-bold no-underline" target="_blank" rel="noopener noreferrer">
              <span>f</span> Facebook
            </a>
          </div>
          <div className="flex justify-center items-center space-x-4 mb-2 text-gray-500">
            <a href="/Politica.html" className="hover:text-white transition underline">Política de Privacidad</a>
            <span>|</span>
            <a href="/Terminos.html" className="hover:text-white transition underline">Términos de Uso</a>
          </div>
          <p>Siconfy ERP © 2025. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;