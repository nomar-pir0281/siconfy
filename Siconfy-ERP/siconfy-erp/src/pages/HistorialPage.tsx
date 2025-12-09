import React, { useState, useEffect } from 'react';
import { getAllCalculations, clearHistory, deleteCalculation } from '../utils/historialService';
import type { CalculationHistory } from '../utils/historialService';

interface HistorialPageProps {
  setTabActual: (tab: string) => void;
}

export const HistorialPage: React.FC<HistorialPageProps> = ({ setTabActual: _setTabActual }) => {
  const [calculations, setCalculations] = useState<CalculationHistory[]>([]);
  const [selectedCalculation, setSelectedCalculation] = useState<CalculationHistory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadCalculations();
  }, []);

  const loadCalculations = () => {
    const history = getAllCalculations();
    setCalculations(history);
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
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-NI', {
      style: 'currency',
      currency: 'NIO'
    }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Historial de Cálculos</h1>

      {calculations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No hay cálculos guardados en el historial.</p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-end">
            <button
              onClick={handleClearHistory}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              LIMPIAR HISTORIAL
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Resultado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calculations.map((calc, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{calc.tipo}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(calc.fecha)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {typeof calc.resultado === 'number' ? formatCurrency(calc.resultado) : calc.resultado}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(calc)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Ver Detalles
                      </button>
                      <button
                        onClick={() => {
                          deleteCalculation(index);
                          loadCalculations();
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal for details */}
      {isModalOpen && selectedCalculation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={handleCloseModal}>
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" onClick={e => e.stopPropagation()}>
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Detalles del Cálculo</h3>
              <div className="space-y-3">
                <div>
                  <strong>Tipo:</strong> {selectedCalculation.tipo}
                </div>
                <div>
                  <strong>Fecha:</strong> {formatDate(selectedCalculation.fecha)}
                </div>
                <div>
                  <strong>Resultado:</strong> {typeof selectedCalculation.resultado === 'number' ? formatCurrency(selectedCalculation.resultado) : selectedCalculation.resultado}
                </div>
                <div>
                  <strong>Entradas:</strong>
                  <pre className="bg-gray-100 p-2 rounded mt-1 text-sm overflow-x-auto">
                    {JSON.stringify(selectedCalculation.inputs, null, 2)}
                  </pre>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
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