import React, { useState, useRef } from 'react';
import { calcularIndemnizacion } from '../utils/nomina';
import type { ResultadoIndemnizacion } from '../utils/nomina';
import { formatCurrency, parseCurrency, formatNumberForDisplay } from '../utils/formatters';
import * as historialService from '../utils/historialService';

interface IndemnizacionPageProps {
  setTabActual: (tab: string) => void;
}

export const IndemnizacionPage: React.FC<IndemnizacionPageProps> = ({ setTabActual }) => {
  const [fechaCese, setFechaCese] = useState<string>('');
  const [motivoCese, setMotivoCese] = useState<string>('Despido Injustificado / Sin Causa Justa');
  const [tipoSalario, setTipoSalario] = useState<'Fijo' | 'Variable'>('Fijo');
  const [antiguedad, setAntiguedad] = useState<number>(0);
  const [salarioBase, setSalarioBase] = useState<number>(0);
  const [salariosMes, setSalariosMes] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Raw input values
  const [antiguedadInput, setAntiguedadInput] = useState<string>('');
  const [salarioBaseInput, setSalarioBaseInput] = useState<string>('');
  const [salariosMesInputs, setSalariosMesInputs] = useState<string[]>(['', '', '', '', '', '']);

  const [res, setRes] = useState<ResultadoIndemnizacion | null>(null);

  const handleCalcular = () => {
    if (antiguedad > 0 && ((tipoSalario === 'Fijo' && salarioBase > 0) || (tipoSalario === 'Variable' && salariosMes.some(s => s > 0)))) {
      const resultado = calcularIndemnizacion(motivoCese, tipoSalario, salarioBase, salariosMes, antiguedad);
      setRes(resultado);
      if (resultado) {
        const inputs = {
          fechaCese,
          motivo: motivoCese,
          tipoSalario,
          antiguedad,
          ...(tipoSalario === 'Fijo' ? { salarioBase } : { salarios: salariosMes })
        };
        historialService.saveCalculation({
          tipo: 'indemnizacion',
          fecha: new Date(),
          inputs,
          resultado
        });
      }
    } else {
      setRes(null);
    }
  };

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

  const handleLimpiar = () => {
    setFechaCese('');
    setMotivoCese('Despido Injustificado / Sin Causa Justa');
    setTipoSalario('Fijo');
    setAntiguedad(0);
    setSalarioBase(0);
    setSalariosMes([0, 0, 0, 0, 0, 0]);
    setAntiguedadInput('');
    setSalarioBaseInput('');
    setSalariosMesInputs(['', '', '', '', '', '']);
    setRes(null);
  };

  // Blur handlers
  const handleAntiguedadBlur = () => {
    const numValue = parseFloat(antiguedadInput) || 0;
    setAntiguedad(numValue);
    setAntiguedadInput(numValue > 0 ? numValue.toString() : '');
  };

  const handleSalarioBaseBlur = () => {
    const numValue = parseCurrency(salarioBaseInput);
    setSalarioBase(numValue);
    setSalarioBaseInput(numValue > 0 ? formatNumberForDisplay(numValue) : '');
  };

  const handleSalariosMesBlur = (index: number) => {
    const numValue = parseCurrency(salariosMesInputs[index]);
    const newSalarios = [...salariosMes];
    newSalarios[index] = numValue;
    setSalariosMes(newSalarios);
    const newInputs = [...salariosMesInputs];
    newInputs[index] = numValue > 0 ? formatNumberForDisplay(numValue) : '';
    setSalariosMesInputs(newInputs);
  };

  // Focus handlers
  const handleAntiguedadFocus = () => {
    setAntiguedadInput(antiguedadInput.replace(/,/g, ''));
  };

  const handleSalarioBaseFocus = () => {
    setSalarioBaseInput(salarioBaseInput.replace(/,/g, ''));
  };

  const handleSalariosMesFocus = (index: number) => {
    const newInputs = [...salariosMesInputs];
    newInputs[index] = newInputs[index].replace(/,/g, '');
    setSalariosMesInputs(newInputs);
  };

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto">
      <div className="print:hidden bg-[#F9F6F0] rounded-xl shadow-lg p-8 border border-stone-200 mt-4">
        <div className="flex justify-between items-center mb-6 border-b border-stone-300 pb-4">
          <h2 className="text-xl font-bold text-stone-800 uppercase tracking-wide">Cálculo de Indemnización / Liquidación</h2>
          <div className="space-x-2">
            <button onClick={handleCalcular} className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded transition">
              CALCULAR INDEMNIZACIÓN
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
            <h3 className="text-sm font-bold text-blue-700 border-b pb-1">DATOS GENERALES</h3>
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase">Fecha de Cese</label>
              <input type="date" value={fechaCese} onChange={(e) => setFechaCese(e.target.value)} onKeyDown={handleKeyDown}
                className="w-full border-stone-300 rounded bg-white p-2 shadow-sm text-stone-800" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase">Motivo de Cese</label>
              <select value={motivoCese} onChange={(e) => setMotivoCese(e.target.value)} onKeyDown={handleKeyDown}
                className="w-full border-stone-300 rounded bg-white p-2 shadow-sm text-stone-800">
                <option value="Despido Injustificado / Sin Causa Justa">Despido Injustificado / Sin Causa Justa</option>
                <option value="Renuncia (con preaviso)">Renuncia (con preaviso)</option>
                <option value="Renuncia (sin preaviso)">Renuncia (sin preaviso)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase">Tipo de Salario</label>
              <div className="space-y-1">
                <label className="flex items-center">
                  <input type="radio" value="Fijo" checked={tipoSalario === 'Fijo'} onChange={() => setTipoSalario('Fijo')}
                    className="mr-2" />
                  Fijo
                </label>
                <label className="flex items-center">
                  <input type="radio" value="Variable" checked={tipoSalario === 'Variable'} onChange={() => setTipoSalario('Variable')}
                    className="mr-2" />
                  Variable
                </label>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase">Años de Servicio</label>
              <input type="number" value={antiguedadInput} onChange={(e) => setAntiguedadInput(e.target.value)} onFocus={handleAntiguedadFocus} onBlur={handleAntiguedadBlur} onKeyDown={handleKeyDown}
                className="w-48 border-stone-300 rounded bg-white p-2 shadow-sm text-stone-800 font-semibold focus:ring-1 focus:ring-blue-500 outline-none" placeholder="0" autoFocus />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-green-700 border-b pb-1">SALARIO</h3>
            {tipoSalario === 'Fijo' ? (
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase">Salario Base</label>
                <input type="text" value={salarioBaseInput} onChange={(e) => setSalarioBaseInput(e.target.value)} onFocus={handleSalarioBaseFocus} onBlur={handleSalarioBaseBlur} onKeyDown={handleKeyDown}
                  className="w-48 border-stone-300 rounded bg-white p-2 shadow-sm text-stone-800 font-semibold focus:ring-1 focus:ring-blue-500 outline-none" placeholder="0.00" />
              </div>
            ) : (
              <div className="space-y-2">
                {salariosMesInputs.map((input, index) => (
                  <div key={index}>
                    <label className="text-[10px] font-bold text-stone-500 uppercase">Salario Mes {index + 1}</label>
                    <input type="text" value={input} onChange={(e) => {
                      const newInputs = [...salariosMesInputs];
                      newInputs[index] = e.target.value;
                      setSalariosMesInputs(newInputs);
                    }} onFocus={() => handleSalariosMesFocus(index)} onBlur={() => handleSalariosMesBlur(index)} onKeyDown={handleKeyDown}
                      className="w-40 border-stone-300 rounded bg-white p-2 shadow-sm text-sm focus:ring-1 focus:ring-blue-500 outline-none" placeholder="0.00" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {/* Placeholder for future additions */}
          </div>
        </div>

        {/* RESULTADOS */}
        {res && (
          <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden border border-stone-200">
            <div className="bg-green-700 text-white text-center py-2 font-bold uppercase tracking-wider text-sm">
              Resultado de Indemnización
            </div>
            <div className="p-6 text-center leading-loose">
              <div className="bg-green-50 rounded-lg border border-green-100 py-4">
                <p className="text-xs text-green-800 font-bold uppercase">Indemnización</p>
                <p className="text-2xl font-extrabold text-green-700">{formatCurrency(res.indemnizacion)}</p>
                <p className="text-sm text-stone-600 mt-2">{res.detalle}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};