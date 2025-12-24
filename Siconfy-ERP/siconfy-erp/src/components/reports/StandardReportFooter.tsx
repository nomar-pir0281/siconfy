import React from 'react';

export const StandardReportFooter = () => {
    return (
        <div className="mt-12 pt-8 border-t border-slate-300">
            <div className="flex justify-between gap-8 px-8">
                <div className="flex-1 text-center">
                    <div className="border-t border-black w-3/4 mx-auto pt-2">
                        <p className="text-xs font-bold uppercase">Elaborado Por</p>
                    </div>
                </div>
                <div className="flex-1 text-center">
                    <div className="border-t border-black w-3/4 mx-auto pt-2">
                        <p className="text-xs font-bold uppercase">Revisado Por</p>
                    </div>
                </div>
                <div className="flex-1 text-center">
                    <div className="border-t border-black w-3/4 mx-auto pt-2">
                        <p className="text-xs font-bold uppercase">Autorizado Por</p>
                    </div>
                </div>
            </div>
            <div className="text-center mt-8">
                <p className="text-[10px] text-slate-400">Generado automáticamente por Siconfy ERP v1.1.13</p>
            </div>
        </div>
    );
};
