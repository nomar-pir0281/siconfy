import { InfoSection } from "./components/InfoSection";
import React, { useState, useRef, useMemo, useCallback } from 'react';
import { calcularNominaMensual } from './utils/nomina';
import { formatNumberForDisplay, parseCurrency } from './utils/formatters';

// --- COMPONENTE EDUCATIVO (ADSENSE STRATEGY) ---
const InfoLegalSalario: React.FC = () => (
    <div className="mt-8 mb-6 p-6 bg-white rounded-lg border border-stone-200 shadow-sm animate-fade-in print:hidden">
        <h3 className="text-lg font-bold text-stone-800 mb-3 border-b border-stone-100 pb-2">
            Entendiendo sus Deducciones de Ley
        </h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-stone-600">
            <div>
                <h4 className="font-semibold text-primary-700 mb-1">INSS Laboral (7%)</h4>
                <p className="mb-2">
                    Deducción obligatoria para la seguridad social que financia atención médica,
                    subsidios y pensiones. Se calcula sobre el total de ingresos brutos
                    (menos viáticos y otros ingresos no constitutivos de renta).
                </p>
            </div>
            <div>
                <h4 className="font-semibold text-primary-700 mb-1">IR (Impuesto sobre la Renta)</h4>
                <p className="mb-2">
                    Impuesto progresivo anual aplicable a ingresos netos anuales superiores a C$ 100,000.00.
                    Nuestro sistema proyecta sus ingresos anuales para aplicar la alícuota correcta
                    (del 15% al 30%) según el Art. 23 de la LCT.
                </p>
            </div>
        </div>
    </div>
);

// --- COMPONENTE PRINCIPAL ---
export const CalculadoraSalario: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    // ESTADOS PARA INPUTS (TEXTO)
    const [horasExtras, setHorasExtras] = useState<number>(0);
    const [frecuencia, setFrecuencia] = useState<'mensual' | 'quincenal' | 'semanal'>('mensual');

    // Inputs monetarios como strings para mejor UX
    const [salarioInput, setSalarioInput] = useState<string>('');
    const [comisionesInput, setComisionesInput] = useState<string>('');
    const [incentivosInput, setIncentivosInput] = useState<string>('');
    const [viaticosInput, setViaticosInput] = useState<string>('');
    const [deduccionesInput, setDeduccionesInput] = useState<string>(''); // Otros
    const [nombreTrabajador, setNombreTrabajador] = useState<string>('');
    const [nombreEmpleador, setNombreEmpleador] = useState<string>('');

    // HELPERS DE FORMATO
    const clean = (val: string) => val.replace(/,/g, '');
    const fmt = (val: string) => {
        const num = parseCurrency(val);
        return num > 0 ? formatNumberForDisplay(num) : '';
    };

    // HANDLERS OPTIMIZADOS
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const inputs = containerRef.current?.querySelectorAll('input, select, button');
            if (inputs) {
                const arr = Array.from(inputs) as HTMLElement[];
                const index = arr.indexOf(e.currentTarget as HTMLElement);
                if (index > -1 && index < arr.length - 1) {
                    arr[index + 1].focus();
                }
            }
        }
    }, []);

    const handleChange = useCallback((
        setter: React.Dispatch<React.SetStateAction<string>>
    ) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value);
    }, []);

    const handleFocus = useCallback((
        val: string,
        setter: React.Dispatch<React.SetStateAction<string>>
    ) => () => {
        setter(clean(val));
    }, []);

    const handleBlur = useCallback((
        val: string,
        setter: React.Dispatch<React.SetStateAction<string>>
    ) => () => {
        setter(fmt(val));
    }, []);

    const handleLimpiar = () => {
        setSalarioInput('');
        setComisionesInput('');
        setIncentivosInput('');
        setViaticosInput('');
        setDeduccionesInput('');
        setHorasExtras(0);
        setNombreTrabajador('');
        setNombreEmpleador('');
        setFrecuencia('mensual');
    };

    const handlePrint = () => {
        window.print();
    };

    // LÓGICA DE CÁLCULO MEMOIZADA
    const valoresNumericos = useMemo(() => ({
        salario: parseCurrency(salarioInput),
        comisiones: parseCurrency(comisionesInput),
        incentivos: parseCurrency(incentivosInput),
        viaticos: parseCurrency(viaticosInput),
        otros: parseCurrency(deduccionesInput)
    }), [salarioInput, comisionesInput, incentivosInput, viaticosInput, deduccionesInput]);

    const res = useMemo(() => {
        if (valoresNumericos.salario <= 0) return null;

        return calcularNominaMensual(valoresNumericos.salario, {
            horasExtras,
            comisiones: valoresNumericos.comisiones,
            incentivos: valoresNumericos.incentivos,
            viaticos: valoresNumericos.viaticos,
            otrosDeducciones: valoresNumericos.otros,
            frecuencia
        });
    }, [valoresNumericos, horasExtras, frecuencia]);

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8" ref={containerRef}>

            {/* ENCABEZADO */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 print:hidden">
                <h2 className="text-2xl font-black text-stone-800 uppercase tracking-tight">
                    <span className="text-primary-600">Calculadora</span> de Salario Neto
                </h2>
                <div className="space-x-2">
                    <button
                        onClick={handleLimpiar}
                        className="px-3 py-1.5 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition"
                    >
                        LIMPIAR
                    </button>
                    <button
                        onClick={handlePrint}
                        disabled={!res}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-stone-800 hover:bg-stone-900 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                    >
                        <span>🖨️</span> IMPRIMIR
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* PANEL DE ENTRADA DE DATOS */}
                <div className="lg:col-span-4 space-y-6 print:hidden">

                    {/* Tarjeta 1: Datos Base */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-stone-200">
                        <h3 className="text-xs font-black text-stone-400 uppercase tracking-wider mb-4">Datos Base</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-600 mb-1 uppercase">Nombre del Trabajador <span className="text-stone-400 font-normal normal-case">(Opcional)</span></label>
                                <input
                                    type="text"
                                    value={nombreTrabajador}
                                    onChange={handleChange(setNombreTrabajador)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full p-2 border border-stone-300 rounded-lg text-sm text-stone-800 focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="Ej. Juan Pérez"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-600 mb-1 uppercase">Nombre del Empleador / Empresa <span className="text-stone-400 font-normal normal-case">(Opcional)</span></label>
                                <input
                                    type="text"
                                    value={nombreEmpleador}
                                    onChange={handleChange(setNombreEmpleador)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full p-2 border border-stone-300 rounded-lg text-sm text-stone-800 focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="Ej. Siconfy S.A."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-600 mb-1 uppercase">Salario Base Mensual</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-stone-400 font-bold">C$</span>
                                    <input
                                        type="text"
                                        value={salarioInput}
                                        onChange={handleChange(setSalarioInput)}
                                        onFocus={handleFocus(salarioInput, setSalarioInput)}
                                        onBlur={handleBlur(salarioInput, setSalarioInput)}
                                        onKeyDown={handleKeyDown}
                                        className="w-full pl-9 p-2 border border-stone-300 rounded-lg font-bold text-stone-800 focus:ring-2 focus:ring-primary-500 outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-600 mb-1 uppercase">Frecuencia de Pago</label>
                                <select
                                    value={frecuencia}
                                    onChange={(e) => setFrecuencia(e.target.value as any)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                >
                                    <option value="mensual">Mensual</option>
                                    <option value="quincenal">Quincenal</option>
                                    <option value="semanal">Semanal</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Tarjeta 2: Variables */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-stone-200">
                        <h3 className="text-xs font-black text-stone-400 uppercase tracking-wider mb-4">Variables del Mes</h3>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-stone-500 mb-1 uppercase">Comisiones</label>
                                    <input type="text" value={comisionesInput} onChange={handleChange(setComisionesInput)} onFocus={handleFocus(comisionesInput, setComisionesInput)} onBlur={handleBlur(comisionesInput, setComisionesInput)} onKeyDown={handleKeyDown} className="w-full p-2 text-sm border border-stone-200 rounded-lg" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-stone-500 mb-1 uppercase">Incentivos</label>
                                    <input type="text" value={incentivosInput} onChange={handleChange(setIncentivosInput)} onFocus={handleFocus(incentivosInput, setIncentivosInput)} onBlur={handleBlur(incentivosInput, setIncentivosInput)} onKeyDown={handleKeyDown} className="w-full p-2 text-sm border border-stone-200 rounded-lg" placeholder="0.00" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-stone-500 mb-1 uppercase">Viáticos</label>
                                    <input type="text" value={viaticosInput} onChange={handleChange(setViaticosInput)} onFocus={handleFocus(viaticosInput, setViaticosInput)} onBlur={handleBlur(viaticosInput, setViaticosInput)} onKeyDown={handleKeyDown} className="w-full p-2 text-sm border border-stone-200 rounded-lg" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-stone-500 mb-1 uppercase">Horas Extras</label>
                                    <input type="number" value={horasExtras || ''} onChange={(e) => setHorasExtras(parseFloat(e.target.value) || 0)} onKeyDown={handleKeyDown} className="w-full p-2 text-sm border border-stone-200 rounded-lg" placeholder="0" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-stone-500 mb-1 uppercase">Otras Deducciones</label>
                                <input type="text" value={deduccionesInput} onChange={handleChange(setDeduccionesInput)} onFocus={handleFocus(deduccionesInput, setDeduccionesInput)} onBlur={handleBlur(deduccionesInput, setDeduccionesInput)} onKeyDown={handleKeyDown} className="w-full p-2 text-sm border border-stone-200 rounded-lg" placeholder="0.00" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* PANEL DE RESULTADOS */}
                <div className="lg:col-span-8">
                    {res ? (
                        <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden animate-fade-in-up">
                            {/* Header del Ticket */}
                            <div className="bg-stone-800 text-white p-6 flex justify-between items-center relative">
                                <div>
                                    {nombreEmpleador && (
                                        <p className="text-xs text-stone-400 uppercase tracking-widest mb-1 print:text-stone-500 font-bold">{nombreEmpleador}</p>
                                    )}
                                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Neto a Recibir</p>
                                    <p className="text-3xl font-black tracking-tight font-mono mt-1">
                                        C$ {formatNumberForDisplay(res.salarioNeto)}
                                    </p>
                                    {nombreTrabajador && (
                                        <p className="text-xs text-stone-400 mt-2 print:text-stone-600">
                                            <span className="opacity-70">Colaborador:</span> <strong className="uppercase text-white print:text-black">{nombreTrabajador}</strong>
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="bg-stone-700 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider text-stone-300">
                                        {frecuencia}
                                    </div>
                                    <p className="text-[10px] text-stone-500 mt-1 hidden print:block">
                                        {new Date().toLocaleDateString('es-NI')}
                                    </p>
                                </div>
                            </div>

                            {/* Cuerpo del Ticket */}
                            <div className="p-6 grid md:grid-cols-2 gap-8 text-sm">

                                {/* Columna Ingresos */}
                                <div>
                                    <h4 className="font-bold text-green-700 uppercase border-b border-green-100 pb-2 mb-3 text-xs">Ingresos</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-stone-600">Salario Ordinario</span>
                                            <span className="font-mono">{formatNumberForDisplay(res.salarioBase)}</span>
                                        </div>
                                        {res.comisiones > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-stone-600">Comisiones</span>
                                                <span className="font-mono">{formatNumberForDisplay(res.comisiones)}</span>
                                            </div>
                                        )}
                                        {res.montoHorasExtras > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-stone-600">Horas Extras ({res.horasExtras})</span>
                                                <span className="font-mono">{formatNumberForDisplay(res.montoHorasExtras)}</span>
                                            </div>
                                        )}
                                        {res.viaticos > 0 && (
                                            <div className="flex justify-between text-stone-400">
                                                <span>Viáticos (No Deducible)</span>
                                                <span className="font-mono">{formatNumberForDisplay(res.viaticos)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between pt-2 border-t border-dashed border-stone-200 font-bold text-stone-800">
                                            <span>Total Ingresos</span>
                                            <span className="font-mono">{formatNumberForDisplay(res.totalIngresos)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Columna Deducciones */}
                                <div>
                                    <h4 className="font-bold text-red-700 uppercase border-b border-red-100 pb-2 mb-3 text-xs">Deducciones</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-stone-700">
                                            <span>INSS Laboral (7%)</span>
                                            <span className="font-mono text-red-600">- {formatNumberForDisplay(res.inssLaboral)}</span>
                                        </div>
                                        <div className="flex justify-between text-stone-700">
                                            <span>IR (Renta)</span>
                                            <span className="font-mono text-red-600">- {formatNumberForDisplay(res.ir)}</span>
                                        </div>
                                        {res.otrosDeducciones > 0 && (
                                            <div className="flex justify-between text-stone-700">
                                                <span>Otras Deducciones</span>
                                                <span className="font-mono text-red-600">- {formatNumberForDisplay(res.otrosDeducciones)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between pt-2 border-t border-dashed border-stone-200 font-bold text-stone-800">
                                            <span>Total Deducciones</span>
                                            <span className="font-mono text-red-700">- {formatNumberForDisplay(res.totalDeducciones)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECCIÓN DE FIRMAS (Sólo visible al imprimir) */}
                            <div className="hidden print:flex justify-between px-8 pb-8 mt-12 bg-white">
                                <div className="text-center w-5/12 border-t border-black pt-2">
                                    <p className="font-bold text-xs uppercase text-black">Recibí Conforme</p>
                                    <p className="text-[10px] text-stone-600 mt-1 uppercase">{nombreTrabajador || 'Firma del Colaborador'}</p>
                                </div>
                                <div className="text-center w-5/12 border-t border-black pt-2">
                                    <p className="font-bold text-xs uppercase text-black">Entregué Conforme</p>
                                    <p className="text-[10px] text-stone-600 mt-1 uppercase">{nombreEmpleador || 'Firma del Empleador'}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center p-12 bg-stone-50 rounded-xl border-2 border-dashed border-stone-200 text-stone-400">
                            <p className="text-center">Ingrese un salario base para ver el cálculo detallado</p>
                        </div>
                    )}
                </div>
            </div>

            {/* INYECCIÓN DE CONTENIDO PARA ADSENSE */}
            {res && <InfoLegalSalario />}

            <div className="mt-8">
                <InfoSection type="salario" />
            </div>
        </div>
    );
};