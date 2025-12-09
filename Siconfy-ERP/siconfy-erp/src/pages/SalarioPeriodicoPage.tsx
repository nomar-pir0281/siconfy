import React, { useState, useRef } from 'react';
import { calcularNominaMensual } from '../utils/nomina';
import { formatCurrency, parseCurrency, formatNumberForDisplay } from '../utils/formatters';
import * as historialService from '../utils/historialService';

interface SalarioPeriodicoPageProps {
  setTabActual: (tab: string) => void;
}

export const SalarioPeriodicoPage: React.FC<SalarioPeriodicoPageProps> = ({ setTabActual }) => {
  const [salario, setSalario] = useState<number>(0);
  const [viaticos, setViaticos] = useState<number>(0);
  const [horasExtras, setHorasExtras] = useState<number>(0);
  const [comisiones, setComisiones] = useState<number>(0);
  const [incentivos, setIncentivos] = useState<number>(0);
  const [deducciones, setDeducciones] = useState<number>(0);
  const [frecuencia, setFrecuencia] = useState<'mensual' | 'quincenal' | 'semanal'>('mensual');
  const containerRef = useRef<HTMLDivElement>(null);

  // Raw input values for better UX
  const [salarioInput, setSalarioInput] = useState<string>('');
  const [viaticosInput, setViaticosInput] = useState<string>('');
  const [comisionesInput, setComisionesInput] = useState<string>('');
  const [incentivosInput, setIncentivosInput] = useState<string>('');
  const [deduccionesInput, setDeduccionesInput] = useState<string>('');

  // State for calculation result
  const [result, setResult] = useState<any>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const inputs = containerRef.current?.querySelectorAll('input, select, button');
      if (inputs) {
        const arr = Array.from(inputs) as HTMLElement[];
        const index = arr.indexOf(e.currentTarget);
        if (index > -1 && index < arr.length - 1) arr[index + 1].focus();
      }
    }
  };

  const handleCalcular = () => {
    if (salario > 0) {
      const res = calcularNominaMensual(salario, horasExtras, comisiones, incentivos, deducciones, viaticos, frecuencia);
      setResult(res);
      if (res) {
        historialService.saveCalculation({
          tipo: 'salario-periodico',
          fecha: new Date(),
          inputs: { salario, viaticos, frecuencia, horasExtras, comisiones, incentivos, deducciones },
          resultado: res
        });
      }
    }
  };

  const handleLimpiar = () => {
    setSalario(0); setViaticos(0); setHorasExtras(0); setComisiones(0); setIncentivos(0); setDeducciones(0);
    setSalarioInput(''); setViaticosInput(''); setComisionesInput(''); setIncentivosInput(''); setDeduccionesInput('');
    setResult(null);
  };

  // Blur handlers for formatting
  const handleSalarioBlur = () => {
    const numValue = parseCurrency(salarioInput);
    setSalario(numValue);
    setSalarioInput(numValue > 0 ? formatNumberForDisplay(numValue) : '');
  };

  const handleViaticosBlur = () => {
    const numValue = parseCurrency(viaticosInput);
    setViaticos(numValue);
    setViaticosInput(numValue > 0 ? formatNumberForDisplay(numValue) : '');
  };

  const handleComisionesBlur = () => {
    const numValue = parseCurrency(comisionesInput);
    setComisiones(numValue);
    setComisionesInput(numValue > 0 ? formatNumberForDisplay(numValue) : '');
  };

  const handleIncentivosBlur = () => {
    const numValue = parseCurrency(incentivosInput);
    setIncentivos(numValue);
    setIncentivosInput(numValue > 0 ? formatNumberForDisplay(numValue) : '');
  };

  const handleDeduccionesBlur = () => {
    const numValue = parseCurrency(deduccionesInput);
    setDeducciones(numValue);
    setDeduccionesInput(numValue > 0 ? formatNumberForDisplay(numValue) : '');
  };

  // Focus handlers for raw input
  const handleSalarioFocus = () => {
    setSalarioInput(salarioInput.replace(/,/g, ''));
  };

  const handleViaticosFocus = () => {
    setViaticosInput(viaticosInput.replace(/,/g, ''));
  };

  const handleComisionesFocus = () => {
    setComisionesInput(comisionesInput.replace(/,/g, ''));
  };

  const handleIncentivosFocus = () => {
    setIncentivosInput(incentivosInput.replace(/,/g, ''));
  };

  const handleDeduccionesFocus = () => {
    setDeduccionesInput(deduccionesInput.replace(/,/g, ''));
  };

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto">
      <div className="print:hidden bg-[#F9F6F0] rounded-xl shadow-lg p-8 border border-stone-200 mt-4">
        <div className="flex justify-between items-center mb-6 border-b border-stone-300 pb-4">
          <h2 className="text-xl font-bold text-stone-800 uppercase tracking-wide">Cálculo de Salario Periódico</h2>
          <div className="space-x-2">
            <button onClick={handleCalcular} className="px-4 py-1.5 text-xs font-bold text-stone-600 bg-stone-200 hover:bg-stone-300 rounded transition">
              CALCULAR
            </button>
            <button onClick={handleLimpiar} className="px-4 py-1.5 text-xs font-bold text-stone-600 bg-stone-200 hover:bg-stone-300 rounded transition">
              LIMPIAR
            </button>
            <button onClick={() => setTabActual('seleccionInicial')} className="px-4 py-1.5 text-xs font-bold text-stone-600 bg-stone-200 hover:bg-stone-300 rounded transition">
              VOLVER
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-blue-700 border-b pb-1">DATOS BASE</h3>
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase">Salario Base</label>
              <input type="text" value={salarioInput} onChange={(e) => setSalarioInput(e.target.value)} onFocus={handleSalarioFocus} onBlur={handleSalarioBlur} onKeyDown={handleKeyDown}
                className="w-48 border-stone-300 rounded bg-white p-2 shadow-sm text-stone-800 font-semibold focus:ring-1 focus:ring-blue-500 outline-none" placeholder="0.00" autoFocus />
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase">Viáticos</label>
              <input type="text" value={viaticosInput} onChange={(e) => setViaticosInput(e.target.value)} onFocus={handleViaticosFocus} onBlur={handleViaticosBlur} onKeyDown={handleKeyDown}
                className="w-48 border-stone-300 rounded bg-white p-2 shadow-sm text-stone-800 font-semibold focus:ring-1 focus:ring-blue-500 outline-none" placeholder="0.00" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase">Frecuencia</label>
              <select value={frecuencia} onChange={(e) => setFrecuencia(e.target.value as 'mensual' | 'quincenal' | 'semanal')} onKeyDown={handleKeyDown}
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
                <input type="text" value={comisionesInput} onChange={(e) => setComisionesInput(e.target.value)} onFocus={handleComisionesFocus} onBlur={handleComisionesBlur} onKeyDown={handleKeyDown}
                  className="w-40 border-stone-300 rounded bg-white p-2 shadow-sm text-sm" placeholder="0.00" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase">Incentivos</label>
              <input type="text" value={incentivosInput} onChange={(e) => setIncentivosInput(e.target.value)} onFocus={handleIncentivosFocus} onBlur={handleIncentivosBlur} onKeyDown={handleKeyDown}
                className="w-40 border-stone-300 rounded bg-white p-2 shadow-sm text-sm" placeholder="0.00" />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-red-700 border-b pb-1">DEDUCCIONES</h3>
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase">Préstamos / Otros</label>
              <input type="text" value={deduccionesInput} onChange={(e) => setDeduccionesInput(e.target.value)} onFocus={handleDeduccionesFocus} onBlur={handleDeduccionesBlur} onKeyDown={handleKeyDown}
                className="w-40 border-stone-300 rounded bg-white p-2 shadow-sm text-sm" placeholder="0.00" />
            </div>
          </div>
        </div>

        {/* RESULTADOS EN PANTALLA */}
        {result && (
          <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden border border-stone-200">
            <div className="bg-green-700 text-white text-center py-2 font-bold uppercase tracking-wider text-sm">
              Resultados del Periodo ({frecuencia})
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center leading-loose">
              <div>
                <p className="text-xs text-stone-500 font-bold uppercase">Total Ingresos</p>
                <p className="text-xl font-bold text-stone-800">{formatCurrency(result.totalIngresos)}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 font-bold uppercase">Total Deducciones</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(result.totalDeducciones)}</p>
              </div>
              <div className="bg-green-50 rounded-lg border border-green-100 py-2">
                <p className="text-xs text-green-800 font-bold uppercase">Neto a Recibir</p>
                <p className="text-2xl font-extrabold text-green-700">{formatCurrency(result.salarioNeto)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* REPORTE DE IMPRESIÓN */}
      {result && (
        <div className="hidden print:block p-8 bg-white text-black font-serif leading-relaxed">
          <div className="text-center mb-8 border-b-2 border-black pb-4">
            <h1 className="text-2xl font-bold uppercase">Comprobante de Pago ({frecuencia})</h1>
            <p className="text-sm">Fecha: {new Date().toLocaleDateString('es-NI')}</p>
          </div>

          <table className="w-full text-left text-sm mb-6">
            <thead><tr className="bg-gray-100 border-b border-black"><th className="py-2 px-2">Concepto</th><th className="py-2 px-2 text-right">Monto</th></tr></thead>
            <tbody>
              <tr><td className="py-1 px-2">Salario Base</td><td className="py-1 px-2 text-right">{formatCurrency(result.salarioBase)}</td></tr>
              {result.viaticos > 0 && <tr><td className="py-1 px-2">Viáticos</td><td className="py-1 px-2 text-right">{formatCurrency(result.viaticos)}</td></tr>}
              {result.montoHorasExtras > 0 && <tr><td className="py-1 px-2">Horas Extras</td><td className="py-1 px-2 text-right">{formatCurrency(result.montoHorasExtras)}</td></tr>}
              {result.comisiones > 0 && <tr><td className="py-1 px-2">Comisiones</td><td className="py-1 px-2 text-right">{formatCurrency(result.comisiones)}</td></tr>}
              {result.incentivos > 0 && <tr><td className="py-1 px-2">Incentivos</td><td className="py-1 px-2 text-right">{formatCurrency(result.incentivos)}</td></tr>}
              <tr className="font-bold bg-gray-50"><td className="py-2 px-2 border-t border-black">TOTAL INGRESOS</td><td className="py-2 px-2 text-right border-t border-black">{formatCurrency(result.totalIngresos)}</td></tr>

              <tr><td className="py-1 px-2 pt-4 text-red-800">INSS Laboral (7%)</td><td className="py-1 px-2 pt-4 text-right text-red-800">-{formatCurrency(result.inssLaboral)}</td></tr>
              <tr><td className="py-1 px-2 text-red-800">IR (Renta)</td><td className="py-1 px-2 text-right text-red-800">-{formatCurrency(result.ir)}</td></tr>
              <tr><td className="py-1 px-2 text-red-800">Otras Deducciones</td><td className="py-1 px-2 text-right text-red-800">-{formatCurrency(result.deducciones)}</td></tr>

              <tr className="font-bold text-lg border-t-2 border-black bg-green-50"><td className="py-4 px-2">NETO A RECIBIR</td><td className="py-4 px-2 text-right">{formatCurrency(result.salarioNeto)}</td></tr>
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