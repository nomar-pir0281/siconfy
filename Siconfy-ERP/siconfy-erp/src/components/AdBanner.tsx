import React from 'react';

interface AdBannerProps {
  slot: 'top' | 'bottom' | 'vertical-left' | 'vertical-right';
}

export const AdBanner: React.FC<AdBannerProps> = ({ slot }) => {
  const isVertical = slot.includes('vertical');

  return (
    <div className={`print:hidden ${isVertical ? 'hidden lg:flex w-[160px] flex-shrink-0' : 'w-full max-w-6xl mx-auto my-4'}`}>
      <div className={`bg-gray-50 border border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 
          ${isVertical ? 'h-[600px] w-full sticky top-4' : 'h-24 w-full'}`}>
        <span className="font-semibold text-[10px] uppercase tracking-wider mb-1">Ads ({slot})</span>
        <span className="text-xs text-center px-2">{isVertical ? '160x600' : 'Banner'}</span>
      </div>
    </div>
  );
};