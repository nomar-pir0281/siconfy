// src/pages/HistorialPage.tsx
import React, { useState, useEffect } from 'react';
import { getAllCalculations, clearHistory, deleteCalculation } from '../utils/historialService';
import type { CalculationHistory } from '../utils/historialService';
import { formatCurrency } from '../utils/formatters';

interface HistorialPageProps {
  setTabActual: (tab: string) => void;
}

export const HistorialPage: React.FC<HistorialPageProps> = ({ setTabActual: _setTabActual }) => {
  const [calculations, setCalculations] = useState<CalculationHistory[]>([]);
  const [selectedCalculation, setSelectedCalculation] = useState<CalculationHistory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCalculations();
  }, []);

  const loadCalculations = () => {
    try {
      const history = getAllCalculations();
      // MEJORA: Mostrar lo más reciente primero
      setCalculations(history.reverse());
    } catch (error) {
      console.error("Error al cargar el historial:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar todo el historial?')) {
      clearHistory();
      setCalculations([]);
    }
  };

  const handleViewDetails = (calculation: CalculationHistory) => {
    setSelectedCalculation(calculation);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCalculation(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 text-center py-20">
        <p className="text-xl text-blue-600 animate-pulse">Cargando historial...</p>
      </div>
    );
  }

  // Helper para renderizar detalles de forma amigable (NO JSON CRUDO)
  const renderDetallesContenido = (calc: CalculationHistory) => {
    const isPlanilla = calc.tipo === 'planilla';
    
    // Si es planilla, inputs suele tener { frecuencia, empleados }
    // Si es liquidación, inputs suele tener { fechaInicio, salario... }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sección de Entradas */}
        <div className="bg-gray-50 p-3 rounded border">
          <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Datos de Entrada</h4>
          <ul className="text-sm space-y-1">
            {Object.entries(calc.inputs).map(([key, value]) => {
               // Filtramos datos muy grandes o irrelevantes
               if (typeof value === 'object') return null; 
               return (
                 <li key={key} className="flex justify-between">
                   <span className="capitalize text-gray-600">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                   <span className="font-medium text-gray-900">{String(value)}</span>
                 </li>
               )
            })}
             {/* Casos especiales */}
             {isPlanilla && (
                <li className="flex justify-between">
                   <span className="text-gray-600">Total Empleados:</span>
                   <span className="font-medium text-gray-900">{calc.inputs.empleados || 'N/A'}</span>
                </li>
             )}
          </ul>
        </div>

        {/* Sección de Resultados */}
        <div className="bg-blue-50 p-3 rounded border border-blue-100">
          <h4 className="font-bold text-blue-800 mb-2 border-b border-blue-200 pb-1">Resultado del Cálculo</h4>
          <div className="text-center py-4">
             <p className="text-sm text-blue-600 mb-1">Monto Total Calculado</p>
             <p className="text-3xl font-black text-blue-900">
                {typeof calc.resultado === 'number' 
                   ? formatCurrency(calc.resultado) 
                   : 'Ver Detalle'}
             </p>
          </div>
          {!isPlanilla && typeof calc.resultado === 'object' && (
             <div className="mt-2 text-xs text-gray-500 overflow-auto max-h-32 bg-white p-2 rounded">
                <pre>{JSON.stringify(calc.resultado, null, 2)}</pre>
             </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Historial de Operaciones</h1>
          {calculations.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-red-500 hover:text-red-700 text-sm font-semibold hover:underline"
            >
              🗑️ Limpiar Historial
            </button>
          )}
      </div>

      {calculations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-gray-400 text-lg">No hay cálculos recientes.</p>
          <p className="text-sm text-gray-400">Tus nóminas y liquidaciones guardadas aparecerán aquí.</p>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calculations.map((calc, index) => (
                  <tr key={index} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            calc.tipo === 'planilla' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                            {calc.tipo.toUpperCase()}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(calc.fecha)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right font-mono">
                      {typeof calc.resultado === 'number' ? formatCurrency(calc.resultado) : '---'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(calc)}
                        className="text-blue-600 hover:text-blue-900 mr-4 font-semibold"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => {
                            if(window.confirm('¿Eliminar este registro?')) {
                                deleteCalculation(calculations.length - 1 - index); // Ajuste por reverse
                                loadCalculations();
                            }
                        }}
                        className="text-red-400 hover:text-red-600"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}

      {/* Modal Detalles Mejorado */}
      {isModalOpen && selectedCalculation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden transform transition-all" onClick={e => e.stopPropagation()}>
            <div className="bg-gray-800 px-4 py-3 flex justify-between items-center">
                <h3 className="text-white font-bold text-lg">Detalle del Cálculo</h3>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            <div className="p-6">
                <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                    <span>📅 {formatDate(selectedCalculation.fecha)}</span>
                    <span>•</span>
                    <span className="uppercase font-bold">{selectedCalculation.tipo}</span>
                </div>
                
                {renderDetallesContenido(selectedCalculation)}
                
                <div className="mt-6 flex justify-end">
                    <button
                    onClick={handleCloseModal}
                    className="px-5 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition"
                    >
                    Cerrar
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};