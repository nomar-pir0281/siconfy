// src/pages/HistorialPage.tsx
import React, { useState, useEffect } from 'react';
import { getAllCalculations, clearHistory, deleteCalculation } from '../utils/historialService';
import type { CalculationHistory } from '../utils/historialService';
import { formatCurrency } from '../utils/formatters';

interface HistorialPageProps {
  setTabActual: (tab: string) => void;
}

export const HistorialPage: React.FC<HistorialPageProps> = ({ setTabActual }) => {
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
      // Mostrar lo más reciente primero
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

  // --- NUEVA FUNCIÓN: IR AL MÓDULO ---
  const handleGoToTool = (tipo: string) => {
      // Mapeo simple de los tipos de cálculo a los nombres de tus Tabs
      // Ajusta los strings de la derecha según como se llamen tus tabs en App.tsx
      const tabMap: Record<string, string> = {
          'planilla': 'Planilla',
          'liquidacion': 'Liquidación',
          'indemnizacion': 'Indemnización',
          'vacaciones': 'Vacaciones',
          'aguinaldo': 'Aguinaldo',
          'salario': 'Salario'
      };

      const targetTab = tabMap[tipo.toLowerCase()] || 'Inicio';
      setTabActual(targetTab);
  };

  // --- NUEVA FUNCIÓN: IMPRIMIR ---
  const handlePrint = () => {
      window.print();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-NI', {
      year: 'numeric', month: 'long', day: 'numeric',
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

  // Renderizado del contenido del modal
  const renderDetallesContenido = (calc: CalculationHistory) => {
    const isPlanilla = calc.tipo === 'planilla';
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:block">
        {/* Sección de Entradas */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 print:border-none print:p-0 print:mb-4">
          <h4 className="font-bold text-gray-700 mb-3 border-b pb-2 uppercase text-xs tracking-wider">Parámetros de Entrada</h4>
          <ul className="text-sm space-y-2">
            {Object.entries(calc.inputs).map(([key, value]) => {
               if (typeof value === 'object') return null; 
               return (
                 <li key={key} className="flex justify-between border-b border-gray-100 pb-1 last:border-0">
                   <span className="capitalize text-gray-600">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                   <span className="font-medium text-gray-900">{String(value)}</span>
                 </li>
               )
            })}
             {isPlanilla && (
                <li className="flex justify-between border-b border-gray-100 pb-1">
                   <span className="text-gray-600">Total Empleados:</span>
                   <span className="font-medium text-gray-900">{calc.inputs.empleados || 'N/A'}</span>
                </li>
             )}
          </ul>
        </div>

        {/* Sección de Resultados */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 print:bg-white print:border-2 print:border-black">
          <h4 className="font-bold text-blue-800 mb-3 border-b border-blue-200 pb-2 uppercase text-xs tracking-wider print:text-black print:border-black">Resultado Registrado</h4>
          
          <div className="text-center py-6">
             <p className="text-xs font-bold text-blue-500 uppercase mb-1 print:text-black">Monto Total</p>
             <p className="text-4xl font-black text-blue-900 tracking-tight print:text-black">
                {typeof calc.resultado === 'number' 
                   ? formatCurrency(calc.resultado) 
                   : 'Ver Detalle'}
             </p>
          </div>

          {!isPlanilla && typeof calc.resultado === 'object' && (
             <div className="mt-4 text-xs text-gray-600 bg-white p-3 rounded border border-gray-200 print:border-none font-mono overflow-x-auto">
                {/* Renderizado simple de objetos complejos */}
                {Object.entries(calc.resultado).map(([k, v]) => {
                    if(typeof v !== 'number' && typeof v !== 'string') return null;
                    return (
                        <div key={k} className="flex justify-between py-1">
                            <span className="capitalize">{k}:</span>
                            <span className="font-bold">{String(v)}</span>
                        </div>
                    )
                })}
             </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 animate-fade-in print:p-0 print:max-w-none">
      
      {/* Estilos para impresión: Ocultar todo excepto el modal */}
      <style>{`
        @media print {
            body > *:not(.print-visible-modal) {
                display: none !important;
            }
            .print-visible-modal {
                display: flex !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: auto !important;
                background: white !important;
                z-index: 9999 !important;
            }
            .no-print {
                display: none !important;
            }
        }
      `}</style>

      <div className="flex justify-between items-center mb-6 print:hidden">
          <h1 className="text-2xl font-bold text-gray-800">Historial de Operaciones</h1>
          {calculations.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-red-500 hover:text-red-700 text-sm font-semibold hover:underline bg-red-50 px-3 py-1 rounded transition"
            >
              🗑️ Limpiar Historial
            </button>
          )}
      </div>

      {calculations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 print:hidden">
          <p className="text-gray-400 text-lg">No hay cálculos recientes.</p>
          <p className="text-sm text-gray-400">Tus nóminas y liquidaciones guardadas aparecerán aquí.</p>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100 print:hidden">
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
                  <tr key={index} className="hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => handleViewDetails(calc)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            calc.tipo === 'planilla' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                            {calc.tipo}
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
                        onClick={(e) => { e.stopPropagation(); handleViewDetails(calc); }}
                        className="text-blue-600 hover:text-blue-900 mr-4 font-bold"
                      >
                        Ver Detalle
                      </button>
                      <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if(window.confirm('¿Eliminar este registro?')) {
                                deleteCalculation(calculations.length - 1 - index);
                                loadCalculations();
                            }
                        }}
                        className="text-red-400 hover:text-red-600 font-bold"
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

      {/* MODAL DETALLES MEJORADO */}
      {/* Agregamos la clase 'print-visible-modal' para que sea lo único visible al imprimir */}
      {isModalOpen && selectedCalculation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 print-visible-modal print:bg-white print:p-0 print:items-start">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden transform transition-all print:shadow-none print:w-full print:max-w-none print:rounded-none" onClick={e => e.stopPropagation()}>
            
            {/* Header del Modal */}
            <div className="bg-gray-800 px-6 py-4 flex justify-between items-center print:bg-white print:border-b-2 print:border-black print:px-0 print:mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-2xl print:hidden">📝</span>
                    <div>
                        <h3 className="text-white font-bold text-lg print:text-black print:text-2xl print:uppercase">Detalle de Operación</h3>
                        <p className="text-gray-400 text-xs print:text-gray-600">ID Ref: {selectedCalculation.fecha.getTime().toString().slice(-6)}</p>
                    </div>
                </div>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-white text-xl print:hidden">✕</button>
            </div>
            
            <div className="p-6 print:p-0">
                {/* Info General */}
                <div className="mb-6 flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-100 print:bg-transparent print:border-none print:mb-8">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase font-bold">Fecha de Creación</span>
                        <span className="text-gray-900 font-medium">{formatDate(selectedCalculation.fecha)}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500 uppercase font-bold">Tipo de Cálculo</span>
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-200 text-gray-700 uppercase print:border print:border-black print:bg-transparent">
                            {selectedCalculation.tipo}
                        </span>
                    </div>
                </div>
                
                {renderDetallesContenido(selectedCalculation)}
                
                {/* Footer de Acciones (Oculto al imprimir) */}
                <div className="mt-8 flex justify-between items-center pt-4 border-t border-gray-100 no-print">
                    <button
                        onClick={() => handleGoToTool(selectedCalculation.tipo)}
                        className="flex items-center gap-2 text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded transition"
                        title="Ir a la calculadora correspondiente"
                    >
                        <span>🚀</span> Ir a Calculadora
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-800 transition shadow-sm"
                        >
                            <span>🖨️</span> Imprimir
                        </button>
                        <button
                            onClick={handleCloseModal}
                            className="px-5 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>

                {/* Footer solo para Impresión */}
                <div className="hidden print:block mt-12 pt-8 border-t-2 border-black text-center text-xs">
                    <p>Documento generado por Siconfy ERP</p>
                    <p>{new Date().toLocaleString()}</p>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};