import React from 'react';

interface SeleccionInicialPageProps {
  setTabActual: (tab: string) => void;
}

export const SeleccionInicialPage: React.FC<SeleccionInicialPageProps> = ({ setTabActual }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-8">Selección de Tipo de Cálculo</h2>
      <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
        <button
          onClick={() => setTabActual('nomina')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 text-lg w-full md:w-auto"
        >
          💰 CÁLCULO DE SALARIO NETO
        </button>
        <button
          onClick={() => setTabActual('indemnizacion')}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 text-lg w-full md:w-auto"
        >
          ⚖️ CÁLCULO DE INDEMNIZACIÓN / LIQUIDACIÓN
        </button>
      </div>
    </div>
  );
};