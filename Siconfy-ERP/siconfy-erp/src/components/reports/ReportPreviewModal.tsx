import React from 'react';
import { StandardReportHeader } from './StandardReportHeader';
import { StandardReportFooter } from './StandardReportFooter';

interface ReportPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    orientation?: 'portrait' | 'landscape';
}

export const ReportPreviewModal = ({ isOpen, onClose, title, subtitle, children, orientation = 'portrait' }: ReportPreviewModalProps) => {
    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    const isLandscape = orientation === 'landscape';
    const width = isLandscape ? '27.94cm' : '21.59cm';
    const minHeight = isLandscape ? '21.59cm' : '27.94cm';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white print:static print:block">
            {/* CONTROLES (Ocultos al imprimir) */}
            <div className="absolute top-4 right-4 flex gap-2 print:hidden z-50">
                <button
                    onClick={handlePrint}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg transition flex items-center gap-2"
                >
                    🖨️ IMPRIMIR
                </button>
                <button
                    onClick={onClose}
                    className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-bold shadow-lg transition"
                >
                    CERRAR ESC
                </button>
            </div>

            {/* DOCUMENTO (Papel) */}
            <div className="w-full h-full md:p-8 overflow-y-auto print:overflow-visible print:h-auto print:p-0">
                <div id="printable-area"
                    className="mx-auto bg-white shadow-2xl p-[1.5cm] md:transform md:scale-95 origin-top transition-transform print:shadow-none print:transform-none print:!w-full print:!max-w-none print:!p-0 print:!min-w-0"
                    style={{ width, minHeight }}
                >

                    {/* Estructura del Documento */}
                    <div className="flex flex-col h-full justify-between">
                        <div>
                            <StandardReportHeader title={title} subtitle={subtitle} />

                            {/* CONTENIDO DEL REPORTE */}
                            <div className="text-sm">
                                {children}
                            </div>
                        </div>

                        {/* PIE DE PÁGINA (Siempre al final) */}
                        <StandardReportFooter />
                    </div>

                </div>
            </div>

            {/* ESTILOS DINÁMICOS DE IMPRESIÓN */}
            <style>{`
                @media print {
                    @page { size: ${orientation}; margin: 5mm; }
                    body { -webkit-print-color-adjust: exact; }
                }
            `}</style>

            {/* CERRAR AL HACER CLIC FUERA */}
            <div className="absolute inset-0 -z-10 print:hidden" onClick={onClose}></div>
        </div>
    );
};
