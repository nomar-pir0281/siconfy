import React from 'react';

interface SeleccionInicialPageProps {
  setTabActual: (tab: string) => void;
}

export const SeleccionInicialPage: React.FC<SeleccionInicialPageProps> = ({ setTabActual }) => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-10 text-slate-800">Bienvenido a Siconfy ERP</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Fila 1 */}
        <button
          onClick={() => setTabActual('nomina')}
          className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-left"
        >
          <div className="text-3xl mb-2">💰</div>
          <div className="font-bold text-xl">Calculadora Salario Neto</div>
          <p className="text-blue-100 text-sm mt-1">Deducciones de ley e IR.</p>
        </button>

        <button
          onClick={() => setTabActual('liquidacion')}
          className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-left"
        >
          <div className="text-3xl mb-2">⚖️</div>
          <div className="font-bold text-xl">Finiquito / Liquidación</div>
          <p className="text-green-100 text-sm mt-1">Cálculo final por salida.</p>
        </button>

        <button
          onClick={() => setTabActual('planilla')}
          className="bg-orange-600 hover:bg-orange-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-left"
        >
          <div className="text-3xl mb-2">📊</div>
          <div className="font-bold text-xl">Nómina Maestra</div>
          <p className="text-orange-100 text-sm mt-1">Planilla de empleados.</p>
        </button>

        {/* Fila 2 */}
        <button
          onClick={() => setTabActual('empleados')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-left"
        >
          <div className="text-3xl mb-2">👥</div>
          <div className="font-bold text-xl">Empleados</div>
          <p className="text-indigo-100 text-sm mt-1">Gestión de personal.</p>
        </button>

        <button
          onClick={() => setTabActual('vacaciones')}
          className="bg-teal-600 hover:bg-teal-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-left"
        >
          <div className="text-3xl mb-2">🏖️</div>
          <div className="font-bold text-xl">Vacaciones</div>
          <p className="text-teal-100 text-sm mt-1">Control de días.</p>
        </button>

        <button
          onClick={() => setTabActual('historial')}
          className="bg-pink-600 hover:bg-pink-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-left"
        >
          <div className="text-3xl mb-2">📜</div>
          <div className="font-bold text-xl">Historial</div>
          <p className="text-pink-100 text-sm mt-1">Cálculos guardados.</p>
        </button>
      </div>
    </div>
  );
};