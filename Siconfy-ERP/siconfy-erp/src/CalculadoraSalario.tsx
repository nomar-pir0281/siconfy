// src/CalculadoraSalario.tsx
import React, { useState, useRef, useMemo } from 'react';
import { calcularNominaMensual } from './utils/nomina';
// IMPORTANTE: Usamos las nuevas funciones
import { formatCurrency, formatNumberForDisplay, parseCurrency } from './utils/formatters';

export const CalculadoraSalario = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    // UX: Navegación Enter para inputs y selects
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const inputs = containerRef.current?.querySelectorAll('input, select, button');
            if (inputs) {
                const arr = Array.from(inputs) as HTMLElement[];
                const index = arr.indexOf(e.currentTarget);
                // Saltar al siguiente elemento si existe
                if (index > -1 && index < arr.length - 1) arr[index + 1].focus();
            }
        }
    };

    const [horasExtras, setHorasExtras] = useState<number>(0);
    const [frecuencia, setFrecuencia] = useState<'mensual' | 'quincenal' | 'semanal'>('mensual');

    // ESTADOS PARA INPUTS (TEXTO)
    // Usamos strings para permitir que el usuario escriba puntos/comas libremente
    const [salarioInput, setSalarioInput] = useState<string>('');
    const [comisionesInput, setComisionesInput] = useState<string>('');
    const [incentivosInput, setIncentivosInput] = useState<string>('');
    const [viaticosInput, setViaticosInput] = useState<string>('');
    const [deduccionesInput, setDeduccionesInput] = useState<string>('');

    // VALORES NUMÉRICOS (PARSEADOS) PARA CÁLCULO
    const salario = parseCurrency(salarioInput);
    const comisiones = parseCurrency(comisionesInput);
    const incentivos = parseCurrency(incentivosInput);
    const viaticos = parseCurrency(viaticosInput);
    const deducciones = parseCurrency(deduccionesInput);

    // HELPERS PARA LIMPIAR/FORMATEAR VISUALMENTE
    const clean = (val: string) => val.replace(/,/g, ''); // Quitar comas al editar
    const fmt = (val: string) => {
        const num = parseCurrency(val);
        return num > 0 ? formatNumberForDisplay(num) : ''; // Agregar comas al salir
    };

    // LÓGICA DE CÁLCULO PRESERVADA
    const res = useMemo(() => {
        if (salario > 0) {
            return calcularNominaMensual(salario, {
                horasExtras,
                comisiones,
                incentivos,
                viaticos,
                otrosDeducciones: deducciones, // Mapeo correcto preservado
                frecuencia
            });
        }
        return null;
    }, [salario, horasExtras, comisiones, incentivos, viaticos, deducciones, frecuencia]);

    const handleLimpiar = () => {
      setHorasExtras(0);
      setSalarioInput('');
      setComisionesInput('');
      setIncentivosInput('');
      setViaticosInput('');
      setDeduccionesInput('');
    };

    return (
        <div ref={containerRef} className="max-w-6xl mx-auto">
            <div className="print:hidden bg-[#F9F6F0] rounded-xl shadow-lg p-8 border border-stone-200 mt-4">
                <div className="flex justify-between items-center mb-6 border-b border-stone-300 pb-4">
                    <h2 className="text-xl font-bold text-stone-800 uppercase tracking-wide">Calculadora de Salario Neto</h2>
                    <div className="space-x-2">
                        <button onClick={handleLimpiar} className="px-4 py-1.5 text-xs font-bold text-stone-600 bg-stone-200 hover:bg-stone-300 rounded transition">
                            LIMPIAR
                        </button>
                        <button onClick={() => window.print()} disabled={!res} className="px-4 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded transition disabled:opacity-50">
                            IMPRIMIR
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-blue-700 border-b pb-1">DATOS BASE</h3>
                        <div>
                            <label className="text-[10px] font-bold text-stone-500 uppercase">Salario Base</label>
                            <input type="text" 
                                value={salarioInput} 
                                onChange={(e) => setSalarioInput(e.target.value)} 
                                onFocus={() => setSalarioInput(clean(salarioInput))} 
                                onBlur={() => setSalarioInput(fmt(salarioInput))} 
                                onKeyDown={handleKeyDown}
                                className="w-48 border-stone-300 rounded bg-white p-2 shadow-sm text-stone-800 font-semibold focus:ring-1 focus:ring-blue-500 outline-none" 
                                placeholder="0.00" autoFocus 
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-stone-500 uppercase">Frecuencia</label>
                            <select value={frecuencia} onChange={(e) => setFrecuencia(e.target.value as any)} onKeyDown={handleKeyDown}
                                className="w-full border-stone-300 rounded bg-white p-2 shadow-sm text-stone-800">
                                <option value="mensual">Mensual</option>
                                <option value="quincenal">Quincenal</option>
                                <option value="semanal">Semanal</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-green-700 border-b pb-1">VARIABLES</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] font-bold text-stone-500 uppercase">Horas Extras</label>
                                <input type="number" value={horasExtras || ''} onChange={(e) => setHorasExtras(Number(e.target.value))} onKeyDown={handleKeyDown}
                                    className="w-32 border-stone-300 rounded bg-white p-2 shadow-sm text-sm" placeholder="Cant" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-stone-500 uppercase">Comisiones</label>
                                <input type="text" 
                                    value={comisionesInput} 
                                    onChange={(e) => setComisionesInput(e.target.value)} 
                                    onFocus={() => setComisionesInput(clean(comisionesInput))} 
                                    onBlur={() => setComisionesInput(fmt(comisionesInput))} 
                                    onKeyDown={handleKeyDown}
                                    className="w-40 border-stone-300 rounded bg-white p-2 shadow-sm text-sm" placeholder="0.00" 
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] font-bold text-stone-500 uppercase">Viáticos</label>
                                <input type="text" 
                                    value={viaticosInput} 
                                    onChange={(e) => setViaticosInput(e.target.value)} 
                                    onFocus={() => setViaticosInput(clean(viaticosInput))} 
                                    onBlur={() => setViaticosInput(fmt(viaticosInput))} 
                                    onKeyDown={handleKeyDown}
                                    className="w-40 border-stone-300 rounded bg-white p-2 shadow-sm text-sm" placeholder="0.00" 
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-stone-500 uppercase">Incentivos</label>
                                <input type="text" 
                                    value={incentivosInput} 
                                    onChange={(e) => setIncentivosInput(e.target.value)} 
                                    onFocus={() => setIncentivosInput(clean(incentivosInput))} 
                                    onBlur={() => setIncentivosInput(fmt(incentivosInput))} 
                                    onKeyDown={handleKeyDown}
                                    className="w-40 border-stone-300 rounded bg-white p-2 shadow-sm text-sm" placeholder="0.00" 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-red-700 border-b pb-1">DEDUCCIONES</h3>
                        <div>
                            <label className="text-[10px] font-bold text-stone-500 uppercase">Préstamos / Otros</label>
                            <input type="text" 
                                value={deduccionesInput} 
                                onChange={(e) => setDeduccionesInput(e.target.value)} 
                                onFocus={() => setDeduccionesInput(clean(deduccionesInput))} 
                                onBlur={() => setDeduccionesInput(fmt(deduccionesInput))} 
                                onKeyDown={handleKeyDown}
                                className="w-40 border-stone-300 rounded bg-white p-2 shadow-sm text-sm" placeholder="0.00" 
                            />
                        </div>
                    </div>
                </div>

                {/* RESULTADOS EN PANTALLA: C$ Manual Asegurado */}
                {res && (
                    <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden border border-stone-200">
                        <div className="bg-green-700 text-white text-center py-2 font-bold uppercase tracking-wider text-sm">
                            Resultados del Periodo ({frecuencia})
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center leading-loose">
                            <div>
                                <p className="text-xs text-stone-500 font-bold uppercase">Total Ingresos</p>
                                <p className="text-xl font-bold text-stone-800">{formatCurrency(res.totalIngresos)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-stone-500 font-bold uppercase">Total Deducciones</p>
                                <p className="text-xl font-bold text-red-600">{formatCurrency(res.totalDeducciones)}</p>
                            </div>
                            <div className="bg-green-50 rounded-lg border border-green-100 py-2">
                                <p className="text-xs text-green-800 font-bold uppercase">Neto a Recibir</p>
                                <p className="text-2xl font-extrabold text-green-700">{formatCurrency(res.salarioNeto)}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* REPORTE DE IMPRESIÓN (Preservado y corregido formato) */}
            {res && (
                <div className="hidden print:block p-8 bg-white text-black font-serif leading-relaxed">
                    <div className="text-center mb-8 border-b-2 border-black pb-4">
                        <h1 className="text-2xl font-bold uppercase">Comprobante de Pago ({frecuencia})</h1>
                        <p className="text-sm">Fecha: {new Date().toLocaleDateString('es-NI')}</p>
                    </div>

                    <table className="w-full text-left text-sm mb-6">
                        <thead><tr className="bg-gray-100 border-b border-black"><th className="py-2 px-2">Concepto</th><th className="py-2 px-2 text-right">Monto</th></tr></thead>
                        <tbody>
                            <tr><td className="py-1 px-2">Salario Base</td><td className="py-1 px-2 text-right">{formatCurrency(res.salarioBase)}</td></tr>
                            {res.montoHorasExtras > 0 && <tr><td className="py-1 px-2">Horas Extras</td><td className="py-1 px-2 text-right">{formatCurrency(res.montoHorasExtras)}</td></tr>}
                            {res.comisiones > 0 && <tr><td className="py-1 px-2">Comisiones</td><td className="py-1 px-2 text-right">{formatCurrency(res.comisiones)}</td></tr>}
                            {res.viaticos > 0 && <tr><td className="py-1 px-2">Viáticos</td><td className="py-1 px-2 text-right">{formatCurrency(res.viaticos)}</td></tr>}
                            {res.incentivos > 0 && <tr><td className="py-1 px-2">Incentivos</td><td className="py-1 px-2 text-right">{formatCurrency(res.incentivos)}</td></tr>}
                            <tr className="font-bold bg-gray-50"><td className="py-2 px-2 border-t border-black">TOTAL INGRESOS</td><td className="py-2 px-2 text-right border-t border-black">{formatCurrency(res.totalIngresos)}</td></tr>

                            <tr><td className="py-1 px-2 pt-4 text-red-800">INSS Laboral (7%)</td><td className="py-1 px-2 pt-4 text-right text-red-800">-{formatCurrency(res.inssLaboral)}</td></tr>
                            <tr><td className="py-1 px-2 text-red-800">IR (Renta)</td><td className="py-1 px-2 text-right text-red-800">-{formatCurrency(res.ir)}</td></tr>
                            <tr><td className="py-1 px-2 text-red-800">Otras Deducciones</td><td className="py-1 px-2 text-right text-red-800">-{formatCurrency(res.otrosDeducciones)}</td></tr>

                            <tr className="font-bold text-lg border-t-2 border-black bg-green-50"><td className="py-4 px-2">NETO A RECIBIR</td><td className="py-4 px-2 text-right">{formatCurrency(res.salarioNeto)}</td></tr>
                        </tbody>
                    </table>
                    <div className="text-center text-xs text-gray-500 mt-8">
                        <p>Recibí conforme el importe neto detallado en este comprobante.</p>
                        <div className="mt-12 border-t border-black w-64 mx-auto pt-2 font-bold">Firma del Colaborador</div>
                    </div>
                </div>
            )}
        </div>
    );
};