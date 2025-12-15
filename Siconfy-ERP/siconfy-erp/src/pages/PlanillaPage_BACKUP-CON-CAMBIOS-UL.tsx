// src/pages/PlanillaPage.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { EmployeeService } from '../utils/dbService';
import { calcularNominaMensual } from '../utils/nomina';
import { formatCurrency, formatCurrencyForTable, formatNumberForDisplay, parseCurrency } from '../utils/formatters';
import type { Employee } from '../types';
import * as XLSX from 'xlsx';
import { saveCalculation } from '../utils/historialService';

export const PlanillaPage = () => {
   const [empleados, setEmpleados] = useState<Employee[]>([]);
   const [inputs, setInputs] = useState<Record<number, any>>({});
   const [cantidadEmpleados, setCantidadEmpleados] = useState<number>(51);
   const [frecuenciaCalculo, setFrecuenciaCalculo] = useState<'Mensual' | 'Quincenal' | 'Semanal'>('Mensual');

   // Estado del Modal Colilla
   const [isPayStubModalOpen, setIsPayStubModalOpen] = useState(false);
   const [selectedEmployeeForStub, setSelectedEmployeeForStub] = useState<any>(null);

   const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  // --- EFECTO PARA CONTROLAR LA IMPRESIÓN EXCLUSIVA DEL MODAL ---
  useEffect(() => {
    if (isPayStubModalOpen) {
      document.body.classList.add('printing-stub');
    } else {
      document.body.classList.remove('printing-stub');
    }
    // Cleanup al desmontar
    return () => document.body.classList.remove('printing-stub');
  }, [isPayStubModalOpen]);

  useEffect(() => {
    const allEmps = EmployeeService.getAll();
    setEmpleados(allEmps.filter(e => e.estado === 'Activo'));
  }, []);

  const handleInputChange = (id: number, field: string, value: number) => {
    setInputs(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const inputsPorFila = 7; 
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextInput = inputsRef.current[index + 1];
      if (nextInput) { nextInput.focus(); nextInput.select(); }
    }
    if (e.key === 'ArrowDown') {
       e.preventDefault();
       const nextRowInput = inputsRef.current[index + inputsPorFila];
       if (nextRowInput) { nextRowInput.focus(); nextRowInput.select(); }
    }
    if (e.key === 'ArrowUp') {
       e.preventDefault();
       const prevRowInput = inputsRef.current[index - inputsPorFila];
       if (prevRowInput) { prevRowInput.focus(); prevRowInput.select(); }
    }
  };

  const planillaCalculada = useMemo(() => {
    return empleados.map(emp => {
      const empInputs = inputs[emp.id] || {};
      let salarioBaseProcesar = emp.salarioBase;
      
      if (frecuenciaCalculo === 'Quincenal') salarioBaseProcesar = emp.salarioBase / 2;
      if (frecuenciaCalculo === 'Semanal') salarioBaseProcesar = emp.salarioBase / 4.3333;

      const comisiones = empInputs.comisiones !== undefined ? empInputs.comisiones : (emp.comisiones || 0);
      const incentivos = empInputs.incentivos !== undefined ? empInputs.incentivos : (emp.incentivos || 0);
      const viaticos = empInputs.viaticos !== undefined ? empInputs.viaticos : (emp.viaticos || 0);
      const diasVacaciones = empInputs.diasVacaciones !== undefined ? empInputs.diasVacaciones : (emp.diasVacaciones || 0);
      const horasExtras = empInputs.horasExtras !== undefined ? empInputs.horasExtras : (emp.horasExtras || 0);

      const calculo = calcularNominaMensual(salarioBaseProcesar, {
        comisiones, incentivos, viaticos, diasVacaciones, horasExtras,
        ingresosNoDeducibles: empInputs.ingresosNoDeducibles || 0,
        optica: empInputs.optica || 0,
        embargoAlimenticio: empInputs.embargoAlimenticio || 0,
        embargoJudicial: empInputs.embargoJudicial || 0,
        otrosDeducciones: (empInputs.otrosDeducciones || 0) + (emp.deducciones || 0),
        frecuencia: frecuenciaCalculo.toLowerCase() as any,
        cantidadEmpleados: cantidadEmpleados
      });

      const baseComputable = calculo.totalIngresos - calculo.viaticos - calculo.ingresosNoDeducibles;
      const provisionVacaciones = baseComputable * 0.0833;
      const provisionIndemnizacion = baseComputable * 0.0833;
      const totalProvisiones = calculo.inssPatronal + calculo.inatec + calculo.provisionAguinaldo + provisionVacaciones + provisionIndemnizacion;
      
      // Calculamos "Otras Deducciones" para cuadrar visualmente
      // Total Deducciones - (INSS + IR) = Todo lo demás (Préstamos, Embargos, etc)
      const otrasDeduccionesReal = calculo.totalDeducciones - (calculo.inssLaboral + calculo.ir);

      return {
          ...emp, ...calculo, salarioBasePeriodo: salarioBaseProcesar, totalProvisiones,
          used: { comisiones, incentivos, viaticos, diasVacaciones, horasExtras },
          otrasDeduccionesReal
      };
    });
  }, [empleados, inputs, cantidadEmpleados, frecuenciaCalculo]);

  const handleExportExcel = () => {
    const dataToExport = planillaCalculada.map(row => ({
      "#": row.id, "Nombre": row.nombre, "INSS": row.noInss, "Salario": row.salarioBasePeriodo,
      "Total Ing.": row.totalIngresos, "INSS Lab": row.inssLaboral, "IR": row.ir,
      "Neto": row.salarioNeto
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Planilla");
    XLSX.writeFile(wb, "Planilla_Siconfy.xlsx");
  };

  const handleExportINSS = () => {
    const dataToExport = planillaCalculada.map(row => ({
      "Cédula": row.cedula, "Nombre": row.nombre, "INSS": row.noInss, "Salario": row.salarioBase,
      "INSS Laboral": row.inssLaboral, "INSS Patronal": row.inssPatronal, "INATEC": row.inatec
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "INSS");
    XLSX.writeFile(wb, "INSS_Siconfy.xlsx");
  };

  const renderInputCell = (empId: number, field: string, globalIndex: number, width: string = "w-20", defaultVal: number = 0) => (
    <input
      ref={el => inputsRef.current[globalIndex] = el} 
      type="text" 
      className={`${width} p-1 text-right border rounded focus:ring-2 focus:ring-blue-500 outline-none text-[11px] h-7 bg-blue-50/30 placeholder-gray-400`}
      placeholder={defaultVal > 0 ? formatNumberForDisplay(defaultVal) : "0.00"}
      onChange={(e) => handleInputChange(empId, field, parseCurrency(e.target.value))}
      onBlur={(e) => {
          const val = parseCurrency(e.target.value);
          if (val > 0) e.target.value = formatNumberForDisplay(val);
      }}
      onFocus={(e) => {
          const val = parseCurrency(e.target.value);
          if (val > 0) e.target.value = val.toString();
          e.target.select();
      }}
      onKeyDown={(e) => handleKeyDown(e, globalIndex)}
    />
  );

  let inputCounter = 0;

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* --- ESTILOS DE IMPRESIÓN AVANZADOS --- */}
      <style>{`
        @media print {
            @page { margin: 0.5cm; }
            
            /* REGLA MAESTRA: Si el body tiene la clase 'printing-stub', ocultamos TODO excepto la colilla */
            body.printing-stub > *:not(#pay-stub-modal-root) {
                display: none !important;
            }

            body.printing-stub #pay-stub-modal-root {
                display: flex !important;
                position: absolute !important;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: white;
                align-items: flex-start;
                justify-content: center;
                z-index: 9999;
            }
            
            /* Ocultar elementos de interfaz dentro del modal al imprimir (botones, selectores) */
            .no-print { display: none !important; }
            
            /* Ajustes para la tabla normal (cuando NO estamos imprimiendo colilla) */
            body:not(.printing-stub) .print-hidden { display: none !important; }
            body:not(.printing-stub) .table-container { overflow: visible !important; display: block !important; }
            body:not(.printing-stub) input { border: none !important; background: transparent !important; padding: 0 !important; text-align: right; }
            body:not(.printing-stub) input::placeholder { color: transparent; }
        }
      `}</style>

      {/* Header General */}
      <div className="mb-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 print-hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-tight">Planilla Salarial V17</h1>
          <div className="flex flex-wrap items-center gap-4 mt-3 bg-white p-3 rounded shadow-sm border border-gray-200">
             <div className="flex flex-col">
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1">Frecuencia</label>
                <select value={frecuenciaCalculo} onChange={(e) => setFrecuenciaCalculo(e.target.value as any)} className="border rounded p-1.5 text-sm"><option value="Mensual">Mensual</option><option value="Quincenal">Quincenal</option><option value="Semanal">Semanal</option></select>
             </div>
             <div className="flex flex-col">
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1">Tamaño Empresa</label>
                <select value={cantidadEmpleados > 50 ? 'gran' : 'pyme'} onChange={(e) => setCantidadEmpleados(e.target.value === 'gran' ? 51 : 10)} className="border rounded p-1.5 text-sm"><option value="pyme">PYME (&lt; 50)</option><option value="gran">Gran (&ge; 50)</option></select>
             </div>
          </div>
        </div>
        <div className="flex gap-2">
            <button onClick={() => window.print()} className="bg-slate-700 text-white px-5 py-2 rounded font-bold hover:bg-slate-800 transition">🖨️ Imprimir Tabla</button>
            <button onClick={handleExportExcel} className="bg-green-600 text-white px-5 py-2 rounded font-bold hover:bg-green-700 transition">📊 Excel</button>
            <button onClick={() => saveCalculation({ tipo: 'planilla', fecha: new Date(), inputs: { frecuencia: frecuenciaCalculo, empleados: cantidadEmpleados }, resultado: planillaCalculada.reduce((sum, emp) => sum + emp.salarioNeto, 0) })} className="bg-orange-600 text-white px-5 py-2 rounded font-bold hover:bg-orange-700 transition">💾 Guardar</button>
            <button onClick={() => { setSelectedEmployeeForStub(planillaCalculada[0]); setIsPayStubModalOpen(true); }} className="bg-blue-600 text-white px-5 py-2 rounded font-bold hover:bg-blue-700 transition shadow-lg">🧾 Colilla de Pago</button>
        </div>
      </div>

      {/* Header Impresión Tabla (Solo visible al imprimir tabla completa) */}
      <div className="hidden print:block text-center mb-4 body:not(.printing-stub)">
        <h1 className="text-2xl font-bold">Siconfy ERP</h1>
        <h2 className="text-lg font-semibold">Planilla Salarial General</h2>
        <p className="text-sm">Fecha: {new Date().toLocaleDateString('es-ES')}</p>
      </div>

      {/* Tabla Principal de Planilla */}
      <div className="table-container bg-white shadow-lg rounded-lg border border-gray-200 overflow-x-auto print:shadow-none print:border-none">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="bg-slate-800 text-white uppercase text-[10px] leading-normal print:bg-gray-200 print:text-black">
            <tr>
              <th className="p-2 border-r border-slate-600 sticky left-0 bg-slate-800 z-10 print:static w-8 text-center">#</th>
              <th className="p-2 border-r border-slate-600 sticky left-8 bg-slate-800 z-10 min-w-[140px] print:static">Nombre</th>
              <th className="p-2 border-r border-slate-600 text-center">INSS</th>
              <th className="p-2 border-r border-slate-600 text-right bg-blue-900">Salario</th>
              <th className="p-2 border-r border-slate-600 bg-emerald-900 text-center print:bg-gray-300">Comis.</th>
              <th className="p-2 border-r border-slate-600 bg-emerald-900 text-center print:bg-gray-300">Incent.</th>
              <th className="p-2 border-r border-slate-600 bg-emerald-900 text-center print:bg-gray-300">Viát.</th>
              <th className="p-2 border-r border-slate-600 bg-emerald-900 text-center print:bg-gray-300">Vac.</th>
              <th className="p-2 border-r border-slate-600 bg-emerald-900 text-center print:bg-gray-300">HE</th>
              <th className="p-2 border-r border-slate-600 bg-emerald-900 text-center print:bg-gray-300">Otros</th>
              <th className="p-2 border-r border-slate-600 font-bold bg-emerald-800 text-right print:bg-gray-400">Total Ing.</th>
              <th className="p-2 border-r border-slate-600 bg-red-900 text-right print:bg-gray-300">INSS</th>
              <th className="p-2 border-r border-slate-600 bg-red-900 text-right print:bg-gray-300">IR</th>
              <th className="p-2 border-r border-slate-600 bg-red-900 text-center print:bg-gray-300">D.Var</th>
              <th className="p-2 border-r border-slate-600 font-bold bg-red-800 text-right print:bg-gray-400">Total Ded.</th>
              <th className="p-2 border-r border-slate-600 font-black bg-blue-800 text-white text-right text-sm print:bg-gray-500 print:text-black">Neto</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {planillaCalculada.map((row, idx) => {
              const empInputs = inputs[row.id] || {};
              return (
              <tr key={row.id} className="hover:bg-blue-50 border-b border-gray-200 print:border-gray-400 transition-colors">
                <td className="p-2 border-r sticky left-0 bg-white font-bold text-center print:static">{idx + 1}</td>
                <td className="p-2 border-r sticky left-8 bg-white font-medium print:static truncate max-w-[140px]">{row.nombre}</td>
                <td className="p-2 border-r font-mono text-[9px] text-center">{row.noInss || '-'}</td>
                <td className="p-2 border-r font-bold text-right text-blue-900 bg-blue-50">{formatCurrencyForTable(row.salarioBasePeriodo)}</td>
                <td className="p-1 border-r print:hidden text-center">{renderInputCell(row.id, 'comisiones', inputCounter++, "w-14", row.used.comisiones)}</td>
                <td className="hidden print:table-cell text-right">{formatCurrencyForTable(row.comisiones)}</td>
                <td className="p-1 border-r print:hidden text-center">{renderInputCell(row.id, 'incentivos', inputCounter++, "w-14", row.used.incentivos)}</td>
                <td className="hidden print:table-cell text-right">{formatCurrencyForTable(row.incentivos)}</td>
                <td className="p-1 border-r print:hidden text-center">{renderInputCell(row.id, 'viaticos', inputCounter++, "w-14", row.used.viaticos)}</td>
                <td className="hidden print:table-cell text-right">{formatCurrencyForTable(row.viaticos)}</td>
                <td className="p-1 border-r print:hidden text-center">{renderInputCell(row.id, 'diasVacaciones', inputCounter++, "w-14", row.used.diasVacaciones)}</td>
                <td className="hidden print:table-cell text-right">{row.diasVacaciones}</td>
                <td className="p-1 border-r print:hidden text-center">{renderInputCell(row.id, 'horasExtras', inputCounter++, "w-10", row.used.horasExtras)}</td>
                <td className="hidden print:table-cell text-right">{row.horasExtras}</td>
                <td className="p-1 border-r print:hidden text-center">{renderInputCell(row.id, 'ingresosNoDeducibles', inputCounter++, "w-14")}</td>
                <td className="hidden print:table-cell text-right">{formatCurrencyForTable(row.ingresosNoDeducibles)}</td>
                <td className="p-2 border-r font-bold text-right text-emerald-700 bg-emerald-50 print:bg-transparent print:text-black">{formatCurrencyForTable(row.totalIngresos)}</td>
                <td className="p-2 border-r text-right text-red-600 bg-red-50/30 print:text-black">{formatCurrencyForTable(row.inssLaboral)}</td>
                <td className="p-2 border-r text-right text-red-600 bg-red-50/30 print:text-black">{formatCurrencyForTable(row.ir)}</td>
                <td className="p-1 border-r print:hidden text-center">{renderInputCell(row.id, 'otrosDeducciones', inputCounter++, "w-14", empInputs.otrosDeducciones || 0)}</td>
                <td className="hidden print:table-cell text-right">{formatCurrencyForTable(row.otrasDeduccionesReal)}</td>
                <td className="p-2 border-r font-bold text-right text-red-700 bg-red-50 print:bg-transparent print:text-black">{formatCurrencyForTable(row.totalDeducciones)}</td>
                <td className="p-2 border-r font-black text-right text-blue-800 bg-blue-100/50 text-sm print:bg-transparent print:text-black">{formatCurrencyForTable(row.salarioNeto)}</td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* --- MODAL COLILLA DE PAGO PROFESIONAL --- */}
      {/* ID Root para aislar impresión */}
      {isPayStubModalOpen && selectedEmployeeForStub && (
        <div id="pay-stub-modal-root" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-3xl rounded-lg shadow-2xl overflow-hidden print:shadow-none print:w-[21cm] print:max-w-none print:border print:border-gray-300">
            
            {/* Header del Modal (Botones) - NO IMPRIMIR */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 no-print">
              <div className="flex items-center gap-3">
                 <h3 className="text-lg font-bold text-gray-800">Vista Previa de Colilla</h3>
                 <select
                  value={selectedEmployeeForStub.id}
                  onChange={(e) => {
                    const emp = planillaCalculada.find(r => r.id === parseInt(e.target.value));
                    if (emp) setSelectedEmployeeForStub(emp);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {planillaCalculada.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => window.print()} 
                  className="bg-gray-800 text-white px-4 py-2 rounded text-sm font-bold hover:bg-black transition flex items-center gap-2"
                >
                  <span>🖨️</span> Imprimir Colilla
                </button>
                <button onClick={() => setIsPayStubModalOpen(false)} className="text-gray-500 hover:text-red-500 font-bold px-3">✕</button>
              </div>
            </div>

            {/* CONTENIDO IMPRIMIBLE DE LA COLILLA */}
            <div className="p-8 print:p-6 bg-white min-h-[500px]">
                
                {/* Encabezado Corporativo */}
                <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
                  <h1 className="text-2xl font-black uppercase tracking-widest text-gray-900">
                    {cantidadEmpleados > 50 ? 'EMPRESA EJEMPLO S.A.' : 'MI NEGOCIO PYME'}
                  </h1>
                  <p className="text-sm font-bold text-gray-500 tracking-wide">RUC: J0310000000000</p>
                  <div className="mt-2 inline-block bg-gray-100 px-4 py-1 rounded-full border border-gray-200">
                      <p className="text-xs font-bold text-gray-700 uppercase">
                          COMPROBANTE DE PAGO - {frecuenciaCalculo.toUpperCase()}
                      </p>
                  </div>
                  <p className="text-xs text-right mt-2 text-gray-400">Fecha de Emisión: {new Date().toLocaleDateString('es-ES')}</p>
                </div>

                {/* Grid de Datos del Empleado */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6 print:bg-transparent print:border-gray-300">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                        <div className="flex justify-between border-b border-gray-300 border-dotted pb-1">
                            <span className="font-bold text-gray-600">COLABORADOR:</span>
                            <span className="font-bold text-gray-900 uppercase">{selectedEmployeeForStub.nombre}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-300 border-dotted pb-1">
                            <span className="font-bold text-gray-600">CÓDIGO:</span>
                            <span className="font-mono text-gray-900">{String(selectedEmployeeForStub.id).padStart(4, '0')}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-300 border-dotted pb-1">
                            <span className="font-bold text-gray-600">CÉDULA:</span>
                            <span className="font-mono text-gray-900">{selectedEmployeeForStub.cedula || '---'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-300 border-dotted pb-1">
                            <span className="font-bold text-gray-600">INSS:</span>
                            <span className="font-mono text-gray-900">{selectedEmployeeForStub.noInss || '---'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-300 border-dotted pb-1">
                            <span className="font-bold text-gray-600">CARGO:</span>
                            <span className="text-gray-900 uppercase">{selectedEmployeeForStub.cargo || 'GENERAL'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-300 border-dotted pb-1">
                            <span className="font-bold text-gray-600">SALARIO BASE:</span>
                            <span className="font-mono font-bold text-gray-900">{formatCurrency(selectedEmployeeForStub.salarioBasePeriodo)}</span>
                        </div>
                    </div>
                </div>

                {/* Cuerpo: Ingresos vs Deducciones */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    {/* Tabla Ingresos */}
                    <div>
                        <div className="bg-gray-200 text-gray-800 px-2 py-1 text-xs font-bold uppercase tracking-wider mb-2 border-l-4 border-gray-800">
                            Detalle de Ingresos
                        </div>
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-gray-100">
                                <tr>
                                    <td className="py-1 text-gray-600">Salario Ordinario</td>
                                    <td className="py-1 text-right font-medium">{formatCurrency(selectedEmployeeForStub.salarioBasePeriodo)}</td>
                                </tr>
                                {selectedEmployeeForStub.comisiones > 0 && (
                                    <tr><td className="py-1 text-gray-600">Comisiones</td><td className="py-1 text-right font-medium">{formatCurrency(selectedEmployeeForStub.comisiones)}</td></tr>
                                )}
                                {selectedEmployeeForStub.incentivos > 0 && (
                                    <tr><td className="py-1 text-gray-600">Incentivos</td><td className="py-1 text-right font-medium">{formatCurrency(selectedEmployeeForStub.incentivos)}</td></tr>
                                )}
                                {selectedEmployeeForStub.viaticos > 0 && (
                                    <tr><td className="py-1 text-gray-600">Viáticos</td><td className="py-1 text-right font-medium">{formatCurrency(selectedEmployeeForStub.viaticos)}</td></tr>
                                )}
                                {selectedEmployeeForStub.montoVacaciones > 0 && (
                                    <tr><td className="py-1 text-gray-600">Vacaciones Descansadas</td><td className="py-1 text-right font-medium">{formatCurrency(selectedEmployeeForStub.montoVacaciones)}</td></tr>
                                )}
                                {selectedEmployeeForStub.montoHorasExtras > 0 && (
                                    <tr><td className="py-1 text-gray-600">Horas Extras</td><td className="py-1 text-right font-medium">{formatCurrency(selectedEmployeeForStub.montoHorasExtras)}</td></tr>
                                )}
                                {selectedEmployeeForStub.ingresosNoDeducibles > 0 && (
                                    <tr><td className="py-1 text-gray-600">Otros Ingresos</td><td className="py-1 text-right font-medium">{formatCurrency(selectedEmployeeForStub.ingresosNoDeducibles)}</td></tr>
                                )}
                            </tbody>
                            <tfoot className="border-t-2 border-gray-800">
                                <tr>
                                    <td className="py-2 font-bold text-gray-900">TOTAL INGRESOS</td>
                                    <td className="py-2 font-bold text-right text-gray-900">{formatCurrency(selectedEmployeeForStub.totalIngresos)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Tabla Deducciones */}
                    <div>
                        <div className="bg-gray-200 text-gray-800 px-2 py-1 text-xs font-bold uppercase tracking-wider mb-2 border-l-4 border-gray-400">
                            Detalle de Deducciones
                        </div>
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-gray-100">
                                <tr>
                                    <td className="py-1 text-gray-600">INSS Laboral (7%)</td>
                                    <td className="py-1 text-right font-medium">{formatCurrency(selectedEmployeeForStub.inssLaboral)}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 text-gray-600">IR Rentas del Trabajo</td>
                                    <td className="py-1 text-right font-medium">{formatCurrency(selectedEmployeeForStub.ir)}</td>
                                </tr>
                                {selectedEmployeeForStub.otrasDeduccionesReal > 0 && (
                                    <tr>
                                        <td className="py-1 text-gray-600">Otras (Préstamos/Judicial)</td>
                                        <td className="py-1 text-right font-medium">{formatCurrency(selectedEmployeeForStub.otrasDeduccionesReal)}</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="border-t-2 border-gray-800">
                                <tr>
                                    <td className="py-2 font-bold text-gray-900">TOTAL DEDUCCIONES</td>
                                    <td className="py-2 font-bold text-right text-gray-900">{formatCurrency(selectedEmployeeForStub.totalDeducciones)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Total Neto */}
                <div className="flex justify-end mb-12">
                    <div className="border-2 border-gray-900 p-3 rounded bg-gray-50 print:bg-transparent min-w-[250px]">
                        <p className="text-xs font-bold text-gray-500 uppercase text-center mb-1">Neto a Recibir</p>
                        <p className="text-2xl font-black text-center text-gray-900">{formatCurrency(selectedEmployeeForStub.salarioNeto)}</p>
                    </div>
                </div>

                {/* Área de Firmas */}
                <div className="flex justify-between px-8 mt-auto pt-8">
                    <div className="text-center w-5/12">
                        <div className="border-t border-black pt-2">
                            <p className="font-bold text-xs uppercase mb-1">Elaborado Por</p>
                            <p className="text-[10px] text-gray-500">Recursos Humanos / Contabilidad</p>
                        </div>
                    </div>
                    <div className="text-center w-5/12">
                        <div className="border-t border-black pt-2">
                            <p className="font-bold text-xs uppercase mb-1">Recibí Conforme</p>
                            <p className="text-[10px] font-bold mt-1 uppercase">{selectedEmployeeForStub.nombre}</p>
                            <p className="text-[10px] text-gray-500">Cédula: {selectedEmployeeForStub.cedula}</p>
                        </div>
                    </div>
                </div>
                
                {/* Pie de Página */}
                <div className="mt-8 text-center border-t border-gray-100 pt-2 print:mt-4">
                    <p className="text-[10px] text-gray-400">Generado por Siconfy ERP</p>
                </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};