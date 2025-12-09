// src/CalculadoraLiquidacion.tsx
import React, { useState, useRef } from 'react';
import { calcularLiquidacion, type ResultadoLiquidacion } from './utils/liquidacion';

// Componente extraído fuera del render para evitar recreación
const TablaResultadosFiniquito: React.FC<{ data: ResultadoLiquidacion, isPrint?: boolean, nombre: string, cedula: string, cargo: string, motivo: string, fechaInicio: string, fechaFin: string, salario: number, vacaciones: number, diasPendientes: number }> = ({
  data,
  isPrint = false,
  nombre,
  cedula,
  cargo,
  motivo,
  fechaInicio,
  fechaFin,
  salario,
  vacaciones,
  diasPendientes
}) => {
  // 2. UTILIDADES DE FORMATO (CORREGIDAS: Manual NIO C$ y Comas)
  const fmt = (num: number) => {
    return 'C$ ' + num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const fmtDec = (num: number) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className={`bg-white p-6 ${!isPrint ? 'rounded-xl shadow-lg border border-stone-200 mt-6 bg-[#F9F6F0]' : ''} text-black font-sans text-xs leading-tight`}>

      {isPrint && (
        <div className="flex justify-between border-b-2 border-black pb-1 mb-4">
          <div className="font-bold text-sm">FINIQUITO DE PRESTACIONES LABORALES</div>
          <div>FECHA: {new Date().toLocaleDateString('es-NI')}</div>
        </div>
      )}

      {/* Datos Personales */}
      <div className="grid grid-cols-4 gap-y-2 mb-6 text-stone-800">
        <div className="font-bold">NOMBRE:</div><div className="col-span-3 border-b border-stone-300">{nombre.toUpperCase() || '---'}</div>
        <div className="font-bold">CEDULA:</div><div className="border-b border-stone-300">{cedula.toUpperCase() || '---'}</div>
        <div className="font-bold text-right pr-2">CARGO:</div><div className="border-b border-stone-300">{cargo.toUpperCase() || '---'}</div>
        <div className="font-bold">MOTIVO:</div><div className="col-span-3 border-b border-stone-300 uppercase">{motivo}</div>
      </div>

      {/* Salarios Info */}
      <div className="flex justify-between bg-stone-100 p-2 font-bold border-y border-stone-400 mb-4 text-stone-800">
        <span>SALARIO MENSUAL: {fmt(salario)}</span>
        <span>DIARIO: {fmt(data.salarioDiario)}</span>
      </div>

      {/* Tabla */}
      <table className="w-full mb-6 text-stone-800">
        <thead>
          <tr className={`border-b-2 ${isPrint ? 'border-black' : 'border-stone-400'} bg-stone-50`}>
            <th className="text-left py-2 px-1">CONCEPTO</th>
            <th className="text-center px-1">PERIODO/DETALLE</th>
            <th className="text-center px-1">DIAS</th>
            <th className="text-right px-1">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {data.montoSalarioPendiente > 0 && (
            <tr className="border-b border-stone-200">
              <td className="py-2 px-1">SUELDO PENDIENTE</td>
              <td className="text-center px-1 text-[10px]">-</td>
              <td className="text-center px-1">{diasPendientes}</td>
              <td className="text-right px-1 font-bold">{fmt(data.montoSalarioPendiente)}</td>
            </tr>
          )}
          <tr className="border-b border-stone-200">
            <td className="py-2 px-1">AGUINALDO PROPORCIONAL</td>
            <td className="text-center px-1 text-[10px]">Dic - {fechaFin}</td>
            <td className="text-center px-1">-</td>
            <td className="text-right px-1">{fmt(data.montoAguinaldo)}</td>
          </tr>
          <tr className="border-b border-stone-200">
            <td className="py-2 px-1">VACACIONES PROPORCIONALES</td>
            <td className="text-center px-1 text-[10px]">{fechaInicio} - {fechaFin}</td>
            <td className="text-center px-1">{fmtDec(vacaciones)}</td>
            <td className="text-right px-1">{fmt(data.montoVacaciones)}</td>
          </tr>
          <tr className={`border-b ${isPrint ? 'border-black' : 'border-stone-400'}`}>
            <td className="py-2 px-1">INDEMNIZACIÓN (ANTIGÜEDAD)</td>
            <td className="text-center px-1 text-[10px]">{data.antiguedadAños} Años, {data.antiguedadMeses} Meses</td>
            <td className="text-center px-1">-</td>
            <td className="text-right px-1">{fmt(data.montoIndemnizacion)}</td>
          </tr>
        </tbody>
      </table>

      {/* Totales */}
      <div className="flex justify-end mb-8">
        <div className={`w-1/2 ${!isPrint ? 'bg-stone-50 p-4 rounded' : ''}`}>
          <div className="flex justify-between py-1 border-b border-stone-300 text-stone-800"><span>TOTAL INGRESOS:</span> <span className="font-bold">{fmt(data.totalIngresos)}</span></div>
          <div className="flex justify-between py-1 text-red-700"><span>(-) INSS LABORAL:</span> <span>{fmt(data.inss)}</span></div>
          <div className="flex justify-between py-1 text-red-700 border-b border-stone-300"><span>(-) IR RENTAS:</span> <span>{fmt(data.ir)}</span></div>
          <div className={`flex justify-between py-2 border-b-2 ${isPrint ? 'border-black' : 'border-green-700'} text-lg font-bold mt-1 text-stone-900`}>
            <span>NETO A RECIBIR:</span>
            <span className={!isPrint ? 'text-green-700' : ''}>{fmt(data.netoRecibir)}</span>
          </div>
        </div>
      </div>

      {/* Firmas Impresión */}
      {isPrint && (
        <div className="flex justify-between px-10 mt-auto pt-20 text-black">
          <div className="text-center border-t border-black w-5/12 pt-1">
            <p className="font-bold text-sm">RECIBÍ CONFORME</p>
            <p>TRABAJADOR</p>
          </div>
          <div className="text-center border-t border-black w-5/12 pt-1">
            <p className="font-bold text-sm">ENTREGUÉ CONFORME</p>
            <p>EMPLEADOR</p>
          </div>
        </div>
      )}
    </div>
  );
};

export const CalculadoraLiquidacion = () => {
    // 1. ESTADOS
    const [nombre, setNombre] = useState('');
    const [cedula, setCedula] = useState('');
    const [cargo, setCargo] = useState('');
    const [motivo, setMotivo] = useState<'despido' | 'renuncia' | 'mutuo'>('mutuo');
    
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [salario, setSalario] = useState(0);
    const [vacaciones, setVacaciones] = useState(0);
    const [diasPendientes, setDiasPendientes] = useState(0);
    
    const [res, setRes] = useState<ResultadoLiquidacion | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // 2. LOGICA
    const handleCalcular = () => {
        if (!fechaInicio || !fechaFin || !salario) { alert("Por favor ingresa fechas y salario."); return; }
        const resultado = calcularLiquidacion(fechaInicio, fechaFin, salario, vacaciones, diasPendientes, motivo);
        setRes(resultado);
    };

    const handleLimpiar = () => {
        setNombre(''); setCedula(''); setCargo(''); setSalario(0); setVacaciones(0); setDiasPendientes(0);
        setFechaInicio(''); setFechaFin(''); setRes(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const inputs = containerRef.current?.querySelectorAll('input, select, button');
            if (inputs) {
                const arr = Array.from(inputs) as HTMLElement[];
                const idx = arr.indexOf(e.currentTarget);
                if (idx > -1 && idx < arr.length - 1) arr[idx + 1].focus();
            }
        }
    };

    return (
        <div ref={containerRef} className="max-w-5xl mx-auto pb-10">
            {/* Formulario en Pantalla */}
            <div className="print:hidden bg-[#F9F6F0] rounded-xl shadow-lg p-8 border border-stone-200 mt-4">
                <div className="flex justify-between items-center mb-6 border-b border-stone-300 pb-4">
                    <h2 className="text-xl font-bold text-stone-800 uppercase tracking-wide">Datos de Liquidación</h2>
                    <div className="space-x-2">
                        <button onClick={handleLimpiar} className="px-4 py-1.5 text-xs font-bold text-stone-600 bg-stone-200 hover:bg-stone-300 rounded">LIMPIAR</button>
                        <button onClick={() => window.print()} disabled={!res} className="px-4 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded disabled:opacity-50">IMPRIMIR</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-blue-700 border-b pb-1">EMPLEADO</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div><label className="text-[10px] font-bold text-stone-500 uppercase">Nombre</label><input className="w-full border-stone-300 rounded bg-white p-2 shadow-sm text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={nombre} onChange={e=>setNombre(e.target.value)} onKeyDown={handleKeyDown}/></div>
                            <div><label className="text-[10px] font-bold text-stone-500 uppercase">Cédula</label><input className="w-full border-stone-300 rounded bg-white p-2 shadow-sm text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={cedula} onChange={e=>setCedula(e.target.value)} onKeyDown={handleKeyDown}/></div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div><label className="text-[10px] font-bold text-stone-500 uppercase">Cargo</label><input className="w-full border-stone-300 rounded bg-white p-2 shadow-sm text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={cargo} onChange={e=>setCargo(e.target.value)} onKeyDown={handleKeyDown}/></div>
                            <div><label className="text-[10px] font-bold text-stone-500 uppercase">Motivo</label>
                                <select className="w-full border-stone-300 rounded bg-white p-2 shadow-sm text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={motivo} onChange={e=>setMotivo(e.target.value as 'despido' | 'renuncia' | 'mutuo')} onKeyDown={handleKeyDown}>
                                    <option value="mutuo">Mutuo Acuerdo</option><option value="despido">Despido (Art. 45)</option><option value="renuncia">Renuncia</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-green-700 border-b pb-1">DATOS ECONÓMICOS</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div><label className="text-[10px] font-bold text-stone-500 uppercase">F. Ingreso</label><input type="date" className="w-full border-stone-300 rounded bg-white p-2 shadow-sm text-sm focus:ring-1 focus:ring-green-500 outline-none" value={fechaInicio} onChange={e=>setFechaInicio(e.target.value)} onKeyDown={handleKeyDown}/></div>
                            <div><label className="text-[10px] font-bold text-stone-500 uppercase">F. Salida</label><input type="date" className="w-full border-stone-300 rounded bg-white p-2 shadow-sm text-sm focus:ring-1 focus:ring-green-500 outline-none" value={fechaFin} onChange={e=>setFechaFin(e.target.value)} onKeyDown={handleKeyDown}/></div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div><label className="text-[10px] font-bold text-stone-500 uppercase">Salario</label><input type="number" className="w-full border-stone-300 rounded bg-white p-2 shadow-sm text-sm font-bold focus:ring-1 focus:ring-green-500 outline-none" value={salario||''} onChange={e=>setSalario(Number(e.target.value))} onKeyDown={handleKeyDown} placeholder="0.00"/></div>
                            <div><label className="text-[10px] font-bold text-stone-500 uppercase">Vacaciones</label><input type="number" className="w-full border-stone-300 rounded bg-white p-2 shadow-sm text-sm focus:ring-1 focus:ring-green-500 outline-none" value={vacaciones||''} onChange={e=>setVacaciones(Number(e.target.value))} onKeyDown={handleKeyDown} placeholder="Días"/></div>
                            <div><label className="text-[10px] font-bold text-stone-500 uppercase">Pendientes</label><input type="number" className="w-full border-stone-300 rounded bg-white p-2 shadow-sm text-sm focus:ring-1 focus:ring-green-500 outline-none" value={diasPendientes||''} onChange={e=>setDiasPendientes(Number(e.target.value))} onKeyDown={handleKeyDown} placeholder="Días"/></div>
                        </div>
                        <div className="pt-2"><button onClick={handleCalcular} className="w-auto px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow text-sm transition">CALCULAR PRESTACIONES</button></div>
                    </div>
                </div>
            </div>

            {res && <div className="print:hidden"><TablaResultadosFiniquito data={res} isPrint={false} nombre={nombre} cedula={cedula} cargo={cargo} motivo={motivo} fechaInicio={fechaInicio} fechaFin={fechaFin} salario={salario} vacaciones={vacaciones} diasPendientes={diasPendientes} /></div>}
            {res && <div className="hidden print:block h-screen bg-white"><TablaResultadosFiniquito data={res} isPrint={true} nombre={nombre} cedula={cedula} cargo={cargo} motivo={motivo} fechaInicio={fechaInicio} fechaFin={fechaFin} salario={salario} vacaciones={vacaciones} diasPendientes={diasPendientes} /></div>}
        </div>
    );
};