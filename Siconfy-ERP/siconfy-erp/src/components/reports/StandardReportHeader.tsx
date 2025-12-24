import React from 'react';

export const StandardReportHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => {
    // Intentamos recuperar info de la empresa, sino usamos defaults
    const companyInfo = JSON.parse(localStorage.getItem('siconfy_company_info') || '{}');
    const companyName = companyInfo.razonSocial || 'Siconfy S.A.';
    const companyRuc = companyInfo.ruc || '';

    return (
        <div className="border-b-2 border-slate-800 pb-4 mb-6">
            <div className="flex justify-between items-center">
                {/* Logo / Nombre Empresa */}
                <div>
                    <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900">{companyName}</h1>
                    <p className="text-xs text-slate-500 font-medium">RUC: {companyRuc}</p>
                    <p className="text-xs text-slate-500">Generado el: {new Date().toLocaleDateString('es-NI')} {new Date().toLocaleTimeString('es-NI')}</p>
                </div>

                {/* Título del Reporte */}
                <div className="text-right">
                    <h2 className="text-2xl font-black text-slate-800 uppercase">{title}</h2>
                    {subtitle && <p className="text-sm font-bold text-slate-500 uppercase mt-1">{subtitle}</p>}
                </div>
            </div>
        </div>
    );
};
