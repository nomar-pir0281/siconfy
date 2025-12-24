import React, { useEffect, useRef } from 'react';

// IDs de tus bloques de anuncios (Obtenlos en tu panel de AdSense)
const ADS_CONFIG = {
  CLIENT_ID: "ca-pub-3106903897086497",
  SLOT_HORIZONTAL: "7189903842", // Para 'top' y 'bottom'
  SLOT_VERTICAL: "3447660450"    // Para 'vertical-left' y 'vertical-right'
};

interface AdBannerProps {
  slot: 'top' | 'bottom' | 'vertical-left' | 'vertical-right';
}

export const AdBanner: React.FC<AdBannerProps> = ({ slot }) => {
  const isVertical = slot.includes('vertical');
  const adRan = useRef(false);

  useEffect(() => {
    // Evita doble ejecución en desarrollo
    if (adRan.current) return;
    
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      adRan.current = true;
    } catch (e) {
      // No mostramos error al usuario, simplemente no carga el anuncio
    }
  }, []);

  // Seleccionamos el ID de bloque según el tipo de slot
  const currentSlotId = isVertical ? ADS_CONFIG.SLOT_VERTICAL : ADS_CONFIG.SLOT_HORIZONTAL;

  return (
    <div className={`print:hidden ${isVertical ? 'hidden lg:flex w-[160px] flex-shrink-0' : 'w-full max-w-6xl mx-auto my-4'}`}>
      <div className={`bg-gray-50 border border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 
          ${isVertical ? 'h-[600px] w-full sticky top-4' : 'h-24 w-full'} overflow-hidden`}>
        
        {/* Etiqueta de debug (se oculta cuando carga el anuncio) */}
        <span className="absolute font-semibold text-[10px] uppercase tracking-wider opacity-20">
          Ads ({slot})
        </span>

        {/* Bloque de AdSense */}
        <ins className="adsbygoogle"
             style={{ display: 'block', width: '100%', height: '100%' }}
             data-ad-client={ADS_CONFIG.CLIENT_ID}
             data-ad-slot={currentSlotId}
             data-ad-format={isVertical ? 'vertical' : 'horizontal'}
             data-full-width-responsive="true"></ins>
      </div>
    </div>
  );
};