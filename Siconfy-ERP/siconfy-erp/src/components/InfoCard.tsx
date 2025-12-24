import React from 'react';
// 1. Importamos la constante correcta desde el archivo de constantes
import { EDUCATIONAL_DATA } from '../constants/educationalContent';

// 2. Usamos EDUCATIONAL_DATA en lugar de EDUCATIONAL_CONTENT
export const InfoCard: React.FC<{ type: keyof typeof EDUCATIONAL_DATA }> = ({ type }) => {
  const info = EDUCATIONAL_DATA[type];
  
  // Validación de seguridad por si el tipo no existe
  if (!info) return null;

  return (
    <div className="mt-8 space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-3">{info.title}</h3>
        
        <div className="space-y-3">
          {/* Mapeamos los detalles dinámicamente si existen */}
          {info.details && info.details.map((item, index) => (
             <p key={index} className="text-sm text-gray-600">
               <span className={`font-bold ${item.isWarning ? 'text-red-500' : 'text-blue-600'}`}>
                 {item.isWarning ? '⚠️ ' : '📘 '}{item.label}:
               </span> {item.text}
             </p>
          ))}

          {/* Renderizado condicional para advertencias y tips si existen en tu data */}
          {info.description && (
             <div className="bg-yellow-50 p-3 rounded border border-yellow-100 mt-2">
                <p className="text-sm text-yellow-800"><span className="font-bold">💡 Nota:</span> {info.description}</p>
             </div>
          )}
        </div>
        
        <p className="text-[10px] text-gray-400 mt-4 text-right uppercase tracking-widest">{info.legalSource}</p>
      </div>
    </div>
  );
};