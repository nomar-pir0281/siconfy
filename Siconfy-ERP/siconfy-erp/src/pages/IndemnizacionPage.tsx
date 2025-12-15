// src/pages/IndemnizacionPage.tsx
import React, { useState, useRef } from 'react';
import { calcularIndemnizacionManual, type ResultadoIndemnizacion } from '../utils/liquidacion';
// IMPORTANTE: Usamos las nuevas funciones centralizadas para garantizar C$
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
  
  // Estado dual: Valor numérico (para cálculo) y Texto (para input formateado)
  const [salarioBase, setSalarioBase] = useState<number>(0);
  const [salarioBaseInput, setSalarioBaseInput] = useState<string>('');

  const [salariosMes, setSalariosMes] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [salariosMesInputs, setSalariosMesInputs] = useState<string[]>(['', '', '', '', '', '']);
  
  const [antiguedadInput, setAntiguedadInput] = useState<string>('');
  const [res, setRes] = useState<ResultadoIndemnizacion | null>(null);
  
  // Referencias para navegación con Enter
  const inputsRef = useRef<Array<HTMLInputElement | HTMLSelectElement | HTMLButtonElement | null>>([]);

  const handleCalcular = () => {
    // Validación de seguridad para no perder datos al calcular
    if (antiguedad > 0 && ((tipoSalario === 'Fijo' && salarioBase > 0) || (tipoSalario === 'Variable' && salariosMes.some(s => s > 0)))) {
      const resultado = calcularIndemnizacionManual(
        motivoCese, 
        tipoSalario, 
        salarioBase, 
        salariosMes, 
        antiguedad
      );
      
      setRes(resultado);
      
      // GUARDA EN HISTORIAL (Funcionalidad Preservada)
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
      alert("Por favor revise los datos ingresados (Antigüedad y Salarios).");
    }
  };

  const handleLimpiar = () => {
    setFechaCese('');
    setMotivoCese('Despido Injustificado / Sin Causa Justa');
    setTipoSalario('Fijo');
    setAntiguedad(0);
    setSalarioBase(0);
    setSalariosMes([0, 0, 0, 0, 0, 0]);
    // Limpiar inputs visuales
    setAntiguedadInput('');
    setSalarioBaseInput('');
    setSalariosMesInputs(['', '', '', '', '', '']);
    setRes(null);
    // Retornar foco al inicio
    if(inputsRef.current[0]) inputsRef.current[0].focus();
  };

  // --- MANEJO DE INPUTS (Visual vs Lógico) ---

  const handleAntiguedadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setAntiguedadInput(e.target.value);
      setAntiguedad(parseFloat(e.target.value) || 0);
  };

  // Manejo Salario Base (Fijo)
  const handleSalarioBaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSalarioBaseInput(val); // El usuario ve lo que escribe
    setSalarioBase(parseCurrency(val)); // El sistema guarda el número limpio
  };
  const handleSalarioBaseBlur = () => {
    if (salarioBase > 0) setSalarioBaseInput(formatNumberForDisplay(salarioBase)); // Formato bonito al salir
  };
  const handleSalarioBaseFocus = () => {
    if (salarioBase > 0) setSalarioBaseInput(salarioBase.toString()); // Formato crudo al editar
  };

  // Manejo Salarios Variables (Matriz)
  const handleSalarioMesChange = (index: number, val: string) => {
    const newInputs = [...salariosMesInputs];
    newInputs[index] = val;
    setSalariosMesInputs(newInputs);

    const newValues = [...salariosMes];
    newValues[index] = parseCurrency(val);
    setSalariosMes(newValues);
  };
  const handleSalarioMesBlur = (index: number) => {
    const val = salariosMes[index];
    if (val > 0) {
        const newInputs = [...salariosMesInputs];
        newInputs[index] = formatNumberForDisplay(val);
        setSalariosMesInputs(newInputs);
    }
  };
  const handleSalarioMesFocus = (index: number) => {
    const val = salariosMes[index];
    if (val > 0) {
        const newInputs = [...salariosMesInputs];
        newInputs[index] = val.toString();
        setSalariosMesInputs(newInputs);
    }
  };

  // UX: Navegación con Enter
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextInput = inputsRef.current[index + 1];
      if (nextInput) {
        nextInput.focus();
        if (nextInput instanceof HTMLInputElement) nextInput.select();
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="print:hidden bg-[#F9F6F0] rounded-xl shadow-lg p-8 border border-stone-200 mt-4">
        <div className="flex justify-between items-center mb-6 border-b border-stone-300 pb-4">
          <h2 className="text-xl font-bold text-stone-800 uppercase tracking-wide">Cálculo de Indemnización / Liquidación</h2>
          <div className="space-x-2">
            {/* Index 20 asegura que sea el último en la secuencia de Tab */}
            <button 
                ref={el => inputsRef.current[20] = el} 
                onClick={handleCalcular} 
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded transition"
            >
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
            <h3 className="text-sm font-bold text-blue-700 border-b pb-1">DATOS GENERALES</h3>
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase">Fecha de Cese</label>
              <input 
                type="date" 
                ref={el => inputsRef.current[0] = el} 
                onKeyDown={e => handleKeyDown(e, 0)}
                value={fechaCese} 
                onChange={(e) => setFechaCese(e.target.value)}
                className="w-full border-stone-300 rounded bg-white p-2 shadow-sm text-stone-800" 
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase">Motivo de Cese</label>
              <select 
                ref={el => inputsRef.current[1] = el} 
                onKeyDown={e => handleKeyDown(e, 1)}
                value={motivoCese} 
                onChange={(e) => setMotivoCese(e.target.value)}
                className="w-full border-stone-300 rounded bg-white p-2 shadow-sm text-stone-800"
              >
                <option value="Despido Injustificado / Sin Causa Justa">Despido Injustificado</option>
                <option value="Renuncia">Renuncia</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase">Tipo de Salario</label>
              <div className="space-y-1">
                <label className="flex items-center">
                  <input type="radio" value="Fijo" checked={tipoSalario === 'Fijo'} onChange={() => setTipoSalario('Fijo')} className="mr-2" />
                  Fijo
                </label>
                <label className="flex items-center">
                  <input type="radio" value="Variable" checked={tipoSalario === 'Variable'} onChange={() => setTipoSalario('Variable')} className="mr-2" />
                  Variable
                </label>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase">Años de Servicio (Antigüedad)</label>
              <input 
                type="number" 
                ref={el => inputsRef.current[2] = el} 
                onKeyDown={e => handleKeyDown(e, 2)}
                value={antiguedadInput} 
                onChange={handleAntiguedadChange}
                className="w-48 border-stone-300 rounded bg-white p-2 shadow-sm text-stone-800 font-semibold focus:ring-1 focus:ring-blue-500 outline-none" 
                placeholder="0" 
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-green-700 border-b pb-1">SALARIO</h3>
            {tipoSalario === 'Fijo' ? (
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase">Salario Base</label>
                <input 
                    type="text" 
                    ref={el => inputsRef.current[3] = el} 
                    onKeyDown={e => handleKeyDown(e, 3)}
                    value={salarioBaseInput} 
                    onChange={handleSalarioBaseChange} 
                    onFocus={handleSalarioBaseFocus} 
                    onBlur={handleSalarioBaseBlur}
                    className="w-48 border-stone-300 rounded bg-white p-2 shadow-sm text-stone-800 font-semibold focus:ring-1 focus:ring-blue-500 outline-none" 
                    placeholder="0.00" 
                />
              </div>
            ) : (
              <div className="space-y-2">
                {salariosMesInputs.map((input, index) => (
                  <div key={index}>
                    <label className="text-[10px] font-bold text-stone-500 uppercase">Mes {index + 1}</label>
                    <input 
                        type="text" 
                        ref={el => inputsRef.current[3 + index] = el} 
                        onKeyDown={e => handleKeyDown(e, 3 + index)}
                        value={input} 
                        onChange={(e) => handleSalarioMesChange(index, e.target.value)} 
                        onFocus={() => handleSalarioMesFocus(index)} 
                        onBlur={() => handleSalarioMesBlur(index)}
                        className="w-40 border-stone-300 rounded bg-white p-2 shadow-sm text-sm focus:ring-1 focus:ring-blue-500 outline-none" 
                        placeholder="0.00" 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RESULTADOS */}
        {res && (
          <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden border border-stone-200">
            <div className="bg-green-700 text-white text-center py-2 font-bold uppercase tracking-wider text-sm">
              Resultado
            </div>
            <div className="p-6 text-center leading-loose">
              <div className="bg-green-50 rounded-lg border border-green-100 py-4">
                <p className="text-xs text-green-800 font-bold uppercase">Indemnización (Art. 45)</p>
                {/* AQUI SE GARANTIZA EL SÍMBOLO C$ */}
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