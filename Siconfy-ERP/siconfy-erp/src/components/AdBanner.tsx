import React from 'react';

interface AdBannerProps {
  slot: 'top' | 'bottom';
}

export const AdBanner: React.FC<AdBannerProps> = ({ slot }) => {
  return (
    // La clase 'print:hidden' asegura que NO salga en la impresión
    <div className="w-full max-w-6xl mx-auto my-4 print:hidden">
      <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 h-24">
        <span className="font-semibold text-xs uppercase tracking-wider">Publicidad ({slot})</span>
        <span className="text-sm">Espacio disponible para Banner</span>
      </div>
    </div>
  );
};