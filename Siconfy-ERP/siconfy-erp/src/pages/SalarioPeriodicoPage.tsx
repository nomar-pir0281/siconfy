import { InfoSection } from '../components/InfoSection';
import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { calcularNominaMensual } from '../utils/nomina';
import { formatCurrency } from '../utils/formatters';
import { useCurrencyInput } from '../hooks/useCurrencyInput';
import { ReportPreviewModal } from '../components/reports/ReportPreviewModal';
import { StandardReportHeader } from '../components/reports/StandardReportHeader';
import { StandardReportFooter } from '../components/reports/StandardReportFooter';
import { SalaryDistributionChart } from '../components/charts/SalaryDistributionChart';

export const SalarioPeriodicoPage = () => {
    // Estado
    const { value: salario, inputValue: salarioDisplay, setInputValue, handleBlur: handleSalarioBlur, handleFocus: handleSalarioFocus } = useCurrencyInput(0);

    // Función adaptadora para el evento onChange
    const handleSalarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };
    const [frecuencia, setFrecuencia] = useState<'Quincenal' | 'Semanal'>('Quincenal');
    const [nombre, setNombre] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    // Inputs Opcionales
    const [horasExtras, setHorasExtras] = useState(0);
    const [comisiones, setComisiones] = useState(0);
    const [incentivos, setIncentivos] = useState(0);
    const [viaticos, setViaticos] = useState(0);
    const [deducciones, setDeducciones] = useState(0); // Préstamos, etc.

    const [resultado, setResultado] = useState<any>(null);

    const handleCalcular = () => {
        if (!salario) return;

        // CORRECCIÓN: Llamamos a la función con el objeto de opciones
        const res = calcularNominaMensual(salario, {
            horasExtras,
            comisiones,
            incentivos,
            viaticos,
            otrosDeducciones: deducciones,
            frecuencia: frecuencia.toLowerCase() as any
        });

        setResultado(res);
    };

    const handleLimpiar = () => {
        handleSalarioChange({ target: { value: '' } } as any);
        setHorasExtras(0); setComisiones(0); setIncentivos(0); setViaticos(0); setDeducciones(0);
        setResultado(null);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 pb-12 animate-fade-in">
            <Card title="Calculadora de Salario (Quincenal / Semanal)" action={
                <button onClick={handleLimpiar} className="text-xs font-bold text-stone-500 hover:underline">Limpiar</button>
            }>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Formulario */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-600 mb-1">Frecuencia de Pago</label>
                            <div className="flex gap-2">
                                <button onClick={() => setFrecuencia('Quincenal')} className={`flex-1 py-2 rounded text-sm font-bold border ${frecuencia === 'Quincenal' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-stone-600 border-stone-300'}`}>Quincenal</button>
                                <button onClick={() => setFrecuencia('Semanal')} className={`flex-1 py-2 rounded text-sm font-bold border ${frecuencia === 'Semanal' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-stone-600 border-stone-300'}`}>Semanal</button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-600 mb-1">Nombre Colaborador (Opcional)</label>
                            <input className="w-full p-2 border rounded text-sm text-stone-800" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Juan Pérez" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-600 mb-1">Salario Bruto ({frecuencia})</label>
                            <input className="w-full p-2 border rounded font-bold text-lg text-stone-800" value={salarioDisplay} onChange={handleSalarioChange} onBlur={handleSalarioBlur} onFocus={handleSalarioFocus} placeholder="0.00" autoFocus />
                            <p className="text-[10px] text-stone-400 mt-1">* Ingrese el salario pactado por {frecuencia.toLowerCase()}.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 bg-stone-50 p-3 rounded border border-stone-200">
                            <div className="col-span-2 text-xs font-bold text-stone-500 uppercase">Ingresos Adicionales</div>
                            <div>
                                <label className="text-[10px] font-bold block mb-1">Horas Extras (C$)</label>
                                <input type="number" className="w-full p-1 border rounded text-sm" value={horasExtras || ''} onChange={e => setHorasExtras(Number(e.target.value))} placeholder="0" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold block mb-1">Comisiones</label>
                                <input type="number" className="w-full p-1 border rounded text-sm" value={comisiones || ''} onChange={e => setComisiones(Number(e.target.value))} placeholder="0" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold block mb-1">Incentivos</label>
                                <input type="number" className="w-full p-1 border rounded text-sm" value={incentivos || ''} onChange={e => setIncentivos(Number(e.target.value))} placeholder="0" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold block mb-1">Viáticos</label>
                                <input type="number" className="w-full p-1 border rounded text-sm" value={viaticos || ''} onChange={e => setViaticos(Number(e.target.value))} placeholder="0" />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-stone-600 block mb-1">Otras Deducciones (Préstamos, etc.)</label>
                            <input type="number" className="w-full p-2 border rounded" value={deducciones || ''} onChange={e => setDeducciones(Number(e.target.value))} placeholder="0.00" />
                        </div>

                        <button onClick={handleCalcular} className="w-full bg-green-600 text-white font-bold py-3 rounded shadow hover:bg-green-700 transition">Calcular Salario Neto</button>
                    </div>

                    {/* Resultados */}
                    {/* Resultados */}
                    <div className="bg-stone-50 rounded-lg p-6 border border-stone-200 flex flex-col justify-center">
                        {!resultado ? (
                            <div className="text-center text-stone-400"><p className="text-4xl">💰</p><p className="text-sm mt-2">Ingrese monto para calcular</p></div>
                        ) : (
                            <div className="animate-fade-in-up space-y-6">
                                {/* Encabezado Neto */}
                                <div className="text-center border-b border-stone-200 pb-4">
                                    <p className="text-xs font-bold text-stone-500 uppercase">Neto a Recibir</p>
                                    <p className="text-4xl font-black text-green-700">{formatCurrency(resultado.salarioNeto)}</p>
                                    <p className="text-xs text-stone-400 mt-1">{frecuencia}</p>
                                </div>

                                {/* Contenedor Grid: Datos vs Gráfico */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                                    {/* Columna Izquierda: Datos Numéricos */}
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between p-2 rounded bg-white border border-gray-100 shadow-sm">
                                            <span className="text-stone-600 font-bold">Total Ingresos:</span>
                                            <span className="font-bold text-gray-800">{formatCurrency(resultado.totalIngresos)}</span>
                                        </div>
                                        <div className="flex justify-between p-2 rounded bg-red-50 border border-red-100">
                                            <span className="text-red-700">INSS Laboral (7%):</span>
                                            <span className="font-mono font-bold text-red-700">- {formatCurrency(resultado.inssLaboral)}</span>
                                        </div>
                                        <div className="flex justify-between p-2 rounded bg-red-50 border border-red-100">
                                            <span className="text-red-700">IR (Rentas Trabajo):</span>
                                            <span className="font-mono font-bold text-red-700">- {formatCurrency(resultado.ir)}</span>
                                        </div>
                                        {deducciones > 0 && (
                                            <div className="flex justify-between p-2 rounded bg-slate-50 border border-slate-200">
                                                <span className="text-slate-600">Otras Deducciones:</span>
                                                <span className="font-mono font-bold text-slate-600">- {formatCurrency(deducciones)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Columna Derecha: Gráfico Educativo */}
                                    <div className="flex justify-center transform scale-90 sm:scale-100">
                                        <SalaryDistributionChart
                                            salarioBruto={resultado.totalIngresos}
                                            salarioNeto={resultado.salarioNeto}
                                            inssLaboral={resultado.inssLaboral}
                                            ir={resultado.ir}
                                            otrasDeducciones={deducciones}
                                        />
                                    </div>
                                </div>

                                <button onClick={() => setShowPreview(true)} className="w-full mt-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded shadow-lg flex items-center justify-center gap-2 transform active:scale-95 transition-all">
                                    <span>📄</span> Ver Colilla de Pago
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* MODAL DE PREVIEW */}
            <ReportPreviewModal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                title="COMPROBANTE DE PAGO"
                subtitle={`Período: ${frecuencia}`}
            >
                {resultado && (
                    <div className="p-4 border-2 border-slate-800 rounded-lg">
                        <div className="flex justify-between items-center mb-6 border-b border-dashed border-slate-300 pb-4">
                            <div>
                                <h3 className="text-xl font-bold uppercase">{nombre || 'COLABORADOR GENÉRICO'}</h3>
                                <p className="text-xs text-stone-500">Beneficiario</p>
                            </div>
                            <div className="text-right">
                                <h4 className="text-lg font-bold text-slate-700">{formatCurrency(resultado.salarioNeto)}</h4>
                                <p className="text-xs font-bold uppercase text-slate-500">Monto Neto</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 text-sm mb-6">
                            <div>
                                <h5 className="font-bold text-slate-600 uppercase text-xs border-b border-slate-200 mb-2 pb-1">Ingresos</h5>
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span>Salario Base</span>
                                        <span className="font-mono">{formatCurrency(salario)}</span>
                                    </div>
                                    {horasExtras > 0 && <div className="flex justify-between"><span>Horas Extras</span><span className="font-mono">{formatCurrency(horasExtras)}</span></div>}
                                    {comisiones > 0 && <div className="flex justify-between"><span>Comisiones</span><span className="font-mono">{formatCurrency(comisiones)}</span></div>}
                                    {incentivos > 0 && <div className="flex justify-between"><span>Incentivos</span><span className="font-mono">{formatCurrency(incentivos)}</span></div>}
                                    {viaticos > 0 && <div className="flex justify-between"><span>Viáticos</span><span className="font-mono">{formatCurrency(viaticos)}</span></div>}
                                    <div className="flex justify-between font-bold border-t border-slate-200 pt-1 mt-1">
                                        <span>Total Ingresos</span>
                                        <span className="font-mono">{formatCurrency(resultado.totalIngresos)}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h5 className="font-bold text-slate-600 uppercase text-xs border-b border-slate-200 mb-2 pb-1">Deducciones</h5>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-red-700">
                                        <span>INSS Laboral</span>
                                        <span className="font-mono">{formatCurrency(resultado.inssLaboral)}</span>
                                    </div>
                                    <div className="flex justify-between text-red-700">
                                        <span>IR (Rentas)</span>
                                        <span className="font-mono">{formatCurrency(resultado.ir)}</span>
                                    </div>
                                    {deducciones > 0 && (
                                        <div className="flex justify-between text-red-700">
                                            <span>Otras Ded.</span>
                                            <span className="font-mono">{formatCurrency(deducciones)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold border-t border-slate-200 pt-1 mt-1 text-red-800">
                                        <span>Total Deducciones</span>
                                        <span className="font-mono">{formatCurrency(resultado.totalDeducciones)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-between gap-8 pt-8 px-8">
                            <div className="border-t border-black flex-1 text-center text-xs font-bold pt-2">
                                RECIBÍ CONFORME
                            </div>
                            <div className="border-t border-black flex-1 text-center text-xs font-bold pt-2">
                                AUTORIZADO POR
                            </div>
                        </div>
                    </div>
                )}
            </ReportPreviewModal>

            <InfoSection type="neto" />
        </div>
    );
};