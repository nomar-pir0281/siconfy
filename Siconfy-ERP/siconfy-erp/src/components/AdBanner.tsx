import React from 'react';

interface AdBannerProps {
  slot: 'top' | 'bottom';
}

export const AdBanner: React.FC<AdBannerProps> = ({ slot }) => {
  return (
    <div className="w-full h-24 bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center print:hidden">
      <span className="text-gray-600 text-sm">
        Espacio Publicitario - {slot === 'top' ? 'Superior' : 'Inferior'}
      </span>
    </div>
  );
};