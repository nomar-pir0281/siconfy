import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const getTabClass = (path: string, activeColorClass: string) => {
    const isActive = location.pathname === path;
    const baseClass = "px-3 py-1.5 rounded-md text-xs font-bold transition shadow-sm hover:shadow-md";

    // Si está activo, usa el color vibrante. Si no, un gris oscuro elegante.
    return isActive
      ? `${baseClass} ${activeColorClass} text-white ring-2 ring-white/20`
      : `${baseClass} bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white`;
  };

  return (
    <nav className="bg-slate-800 text-white p-4 shadow-md print:hidden z-50 relative">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row justify-between items-center gap-4">
        <Link
          to="/"
          className="text-xl font-bold flex items-center gap-2 cursor-pointer hover:text-blue-300 transition"
        >
          <img src="/logo.jpg" alt="Siconfy ERP Logo" className="h-14 w-auto rounded-full border-2 border-white/20" />
          Siconfy ERP
        </Link>

        {/* Botonera con colores condicionales */}
        <div className="flex flex-wrap justify-center gap-1 md:gap-2">
          <Link to="/" className={getTabClass('/', 'bg-red-600 hover:bg-red-700')}>🏠 INICIO</Link>
          <Link to="/nomina" className={getTabClass('/nomina', 'bg-orange-500 hover:bg-orange-600')}>💰 NETO</Link>
          <Link to="/planilla" className={getTabClass('/planilla', 'bg-blue-600 hover:bg-blue-700')}>📊 PLANILLA</Link>
          <Link to="/liquidacion" className={getTabClass('/liquidacion', 'bg-green-600 hover:bg-green-700')}>⚖️ FINIQUITO</Link>
          <Link to="/empleados" className={getTabClass('/empleados', 'bg-purple-600 hover:bg-purple-700')}>👥 EMPLEADOS</Link>
          <Link to="/vacaciones" className={getTabClass('/vacaciones', 'bg-yellow-500 text-black hover:bg-yellow-600')}>🏖️ VACACIONES</Link>
          <Link to="/historial" className={getTabClass('/historial', 'bg-amber-700 hover:bg-amber-800')}>📜 HISTORIAL</Link>
          <Link to="/provisiones" className={getTabClass('/provisiones', 'bg-teal-600 hover:bg-teal-700')}>📈 REPORTES</Link>

          {/* Docs & Manual */}
          <Link to="/documentos" className={getTabClass('/documentos', 'bg-amber-500 text-black hover:bg-amber-600')}>📂 DOCS</Link>
          <Link to="/manual" className={getTabClass('/manual', 'bg-indigo-600 hover:bg-indigo-700')}>📖 MANUAL</Link>
          <Link to="/ayuda" className={getTabClass('/ayuda', 'bg-sky-600 hover:bg-sky-700')}>ℹ️ AYUDA</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;