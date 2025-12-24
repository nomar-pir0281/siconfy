import React from 'react';
// Importamos los datos centralizados
import { EDUCATIONAL_DATA } from '../constants/educationalContent';

// Definimos que el "type" solo puede ser una de las claves válidas
type InfoType = keyof typeof EDUCATIONAL_DATA;

interface InfoSectionProps {
  type: InfoType;
}

export const InfoSection: React.FC<InfoSectionProps> = ({ type }) => {
  const data = EDUCATIONAL_DATA[type];

  // Si no hay datos para ese tipo, no renderizamos nada para evitar errores
  if (!data) return null;

  return (
    <div className="mt-8 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden print:hidden animate-fade-in">
      {/* Encabezado con icono y título */}
      <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex items-start sm:items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-sm sm:text-base">{data.title}</h3>
          <p className="text-xs text-gray-500">{data.description}</p>
        </div>
      </div>

      {/* Grid de contenido */}
      <div className="p-6 grid gap-4 sm:grid-cols-2">
        {data.details.map((item, index) => (
          <div 
            key={index} 
            className={`p-3 rounded-md border text-sm ${
              item.isWarning 
                ? 'bg-amber-50 border-amber-200' // Estilo amarillo para advertencias
                : 'bg-gray-50 border-gray-100'   // Estilo gris para info normal
            }`}
          >
            <p className={`font-bold mb-1 text-xs uppercase tracking-wide ${
              item.isWarning ? 'text-amber-700' : 'text-gray-600'
            }`}>
              {item.isWarning && '⚠️ '} {item.label}
            </p>
            <p className="text-gray-700 leading-relaxed text-xs sm:text-sm">
              {item.text}
            </p>
          </div>
        ))}
      </div>

      {/* Pie de página con fuente legal */}
      <div className="bg-gray-50 px-6 py-2 border-t border-gray-100 text-right">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          {data.legalSource}
        </span>
      </div>
    </div>
  );
};