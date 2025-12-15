// src/pages/PlanillaPage.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { EmployeeService } from '../utils/dbService';
import { calcularNominaMensual } from '../utils/nomina';
// IMPORTS DE FORMATO ACTUALIZADOS
import { formatCurrency, formatCurrencyForTable, formatNumberForDisplay, parseCurrency } from '../utils/formatters';
import type { Employee } from '../types';
import * as XLSX from 'xlsx';
import { saveCalculation } from '../utils/historialService';

export const PlanillaPage = () => {
   const [empleados, setEmpleados] = useState<Employee[]>([]);
   const [inputs, setInputs] = useState<Record<number, any>>({});
   const [cantidadEmpleados, setCantidadEmpleados] = useState<number>(51);
   const [frecuenciaCalculo, setFrecuenciaCalculo] = useState<'Mensual' | 'Quincenal' | 'Semanal'>('Mensual');

   // Modal para colilla de pago
   const [isPayStubModalOpen, setIsPayStubModalOpen] = useState(false);
   const [selectedEmployeeForStub, setSelectedEmployeeForStub] = useState<any>(null);

   // Referencia para manejar el foco de todos los inputs de la tabla
   const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

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

  // UX: Lógica de Navegación Matricial (Enter = Derecha, Flechas = Arriba/Abajo)
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    // Definimos 7 columnas editables: Comis, Incent, Viát, Días Vac, HE, OtrosIng, D.Var
    const inputsPorFila = 7; 

    if (e.key === 'Enter') {
      e.preventDefault();
      const nextInput = inputsRef.current[index + 1];
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
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
      
      // Lógica de frecuencia preservada
      if (frecuenciaCalculo === 'Quincenal') salarioBaseProcesar = emp.salarioBase / 2;
      if (frecuenciaCalculo === 'Semanal') salarioBaseProcesar = emp.salarioBase / 4.3333;

      const comisiones = empInputs.comisiones !== undefined ? empInputs.comisiones : (emp.comisiones || 0);
      const incentivos = empInputs.incentivos !== undefined ? empInputs.incentivos : (emp.incentivos || 0);
      const viaticos = empInputs.viaticos !== undefined ? empInputs.viaticos : (emp.viaticos || 0);
      const diasVacaciones = empInputs.diasVacaciones !== undefined ? empInputs.diasVacaciones : (emp.diasVacaciones || 0);
      const horasExtras = empInputs.horasExtras !== undefined ? empInputs.horasExtras : (emp.horasExtras || 0);

      // Cálculo preservando todas las opciones originales
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
      
      return {
          ...emp, ...calculo, salarioBasePeriodo: salarioBaseProcesar, totalProvisiones,
          used: { comisiones, incentivos, viaticos, diasVacaciones, horasExtras },
          // Guardamos el desglose de otras deducciones para la colilla
          detalleOtrasDeducciones: (empInputs.optica || 0) + (empInputs.embargoAlimenticio || 0) + (empInputs.embargoJudicial || 0) + ((empInputs.otrosDeducciones || 0) + (emp.deducciones || 0))
      };
    });
  }, [empleados, inputs, cantidadEmpleados, frecuenciaCalculo]);

  const handleExportExcel = () => {
    const dataToExport = planillaCalculada.map(row => ({
      "#": row.id, "Nombre": row.nombre, "INSS": row.noInss, "Salario": row.salarioBasePeriodo,
      "Comis.": row.comisiones, "Incent.": row.incentivos, "Viát.": row.viaticos, "Vac.": row.montoVacaciones, "HE": row.montoHorasExtras,
      "Otros": row.ingresosNoDeducibles, "Total Ing.": row.totalIngresos, "INSS Lab": row.inssLaboral, "IR": row.ir,
      "D.Var": row.detalleOtrasDeducciones, "Total Ded.": row.totalDeducciones,
      "Neto": row.salarioNeto, "Patronal": row.inssPatronal, "INATEC": row.inatec, "P. Agui.": row.provisionAguinaldo, "P. Total": row.totalProvisiones
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Planilla");
    XLSX.writeFile(wb, "Planilla_Siconfy.xlsx");
  };

  const handleExportINSS = () => {
    const dataToExport = planillaCalculada.map(row => ({
      "Cédula": row.cedula, "Nombre": row.nombre, "INSS": row.noInss, "Salario Mensual": row.salarioBase,
      "INSS Laboral": row.inssLaboral, "INSS Patronal": row.inssPatronal, "INATEC": row.inatec,
      "Aguinaldo": row.provisionAguinaldo, "Vacaciones": row.totalProvisiones - row.inssPatronal - row.inatec - row.provisionAguinaldo
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "INSS");
    XLSX.writeFile(wb, "INSS_Siconfy.xlsx");
  };

  // HELPER MEJORADO: Input "inteligente" (Formato al salir, crudo al editar)
  const renderInputCell = (empId: number, field: string, globalIndex: number, width: string = "w-20", defaultVal: number = 0) => (
    <input
      ref={el => inputsRef.current[globalIndex] = el} 
      type="text" // Usamos text para permitir caracteres de formato (,)
      className={`${width} p-1 text-right border rounded focus:ring-2 focus:ring-blue-500 outline-none text-[11px] h-7 bg-blue-50/30 placeholder-gray-400`}
      placeholder={defaultVal > 0 ? formatNumberForDisplay(defaultVal) : "0.00"}
      
      // Al cambiar, limpiamos y guardamos el número puro
      onChange={(e) => handleInputChange(empId, field, parseCurrency(e.target.value))}
      
      // Al perder foco, mostramos formato bonito (ej: 1,200.00)
      onBlur={(e) => {
          const val = parseCurrency(e.target.value);
          if (val > 0) e.target.value = formatNumberForDisplay(val);
      }}
      
      // Al ganar foco, mostramos número crudo para editar fácil (ej: 1200.00)
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
      <style>{`
        @media print {
            @page { size: landscape; margin: 5mm; }
            body, html { overflow: visible !important; height: auto !important; }
            .print-hidden { display: none !important; }
            .table-container { overflow: visible !important; display: block !important; }
            table { width: 100%; font-size: 8px; }
            th, td { padding: 1px 2px !important; white-space: nowrap; }
            th { font-weight: bold !important; font-size: 9px !important; background-color: #e5e7eb !important; color: black !important; border-bottom: 1px solid #000 !important; }
            thead { display: table-header-group; }
            input { border: none !important; background: transparent !important; padding: 0 !important; text-align: right; }
            input::placeholder { color: transparent; }
        }
      `}</style>

      {/* Header */}
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
            <button onClick={() => window.print()} className="bg-slate-700 text-white px-5 py-2 rounded font-bold">🖨️ Imprimir</button>
            <button onClick={handleExportExcel} className="bg-green-600 text-white px-5 py-2 rounded font-bold">📊 Excel</button>
            <button onClick={() => saveCalculation({ tipo: 'planilla', fecha: new Date(), inputs: { frecuencia: frecuenciaCalculo, empleados: cantidadEmpleados }, resultado: planillaCalculada.reduce((sum, emp) => sum + emp.salarioNeto, 0) })} className="bg-orange-600 text-white px-5 py-2 rounded font-bold">💾 Guardar</button>
            <button onClick={() => { setSelectedEmployeeForStub(planillaCalculada[0]); setIsPayStubModalOpen(true); }} className="bg-blue-600 text-white px-5 py-2 rounded font-bold">🧾 Colilla de Pago</button>
            <button onClick={handleExportINSS} className="bg-purple-600 text-white px-5 py-2 rounded font-bold">📋 INSS</button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block text-center mb-4">
        <h1 className="text-2xl font-bold">Siconfy ERP</h1>
        <h2 className="text-lg font-semibold">Planilla Salarial</h2>
        <p className="text-sm">Fecha: {new Date().toLocaleDateString('es-ES')}</p>
        <p className="text-sm">Frecuencia: {frecuenciaCalculo} | Empresa: {cantidadEmpleados > 50 ? 'Gran Empresa' : 'PYME'}</p>
      </div>

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
              
              <th className="p-2 border-r border-slate-600 bg-gray-700 text-right print:bg-gray-300">Patronal</th>
              <th className="p-2 border-r border-slate-600 bg-gray-700 text-right print:bg-gray-300">INATEC</th>
              <th className="p-2 border-r border-slate-600 bg-gray-800 text-yellow-200 text-right print:bg-gray-300 print:text-black">P. Agui.</th>
              <th className="p-2 border-r border-slate-600 bg-gray-900 text-orange-200 font-bold text-right print:text-black">P. Total</th>
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
                
                {/* SALARIO BASE: Usamos formatCurrencyForTable */}
                <td className="p-2 border-r font-bold text-right text-blue-900 bg-blue-50">{formatCurrencyForTable(row.salarioBasePeriodo)}</td>

                {/* 1. Comisiones */}
                <td className="p-1 border-r print:hidden text-center">{renderInputCell(row.id, 'comisiones', inputCounter++, "w-14", row.used.comisiones)}</td>
                <td className="hidden print:table-cell text-right">{formatCurrencyForTable(row.comisiones)}</td>
                
                {/* 2. Incentivos */}
                <td className="p-1 border-r print:hidden text-center">{renderInputCell(row.id, 'incentivos', inputCounter++, "w-14", row.used.incentivos)}</td>
                <td className="hidden print:table-cell text-right">{formatCurrencyForTable(row.incentivos)}</td>
                
                {/* 3. Viáticos (Unificado a renderInputCell para mantener navegación matricial) */}
                <td className="p-1 border-r print:hidden text-center">{renderInputCell(row.id, 'viaticos', inputCounter++, "w-14", row.used.viaticos)}</td>
                <td className="hidden print:table-cell text-right">{formatCurrencyForTable(row.viaticos)}</td>
                
                {/* 4. Vacaciones */}
                <td className="p-1 border-r print:hidden text-center">{renderInputCell(row.id, 'diasVacaciones', inputCounter++, "w-14", row.used.diasVacaciones)}</td>
                <td className="hidden print:table-cell text-right">{row.diasVacaciones}</td>
                
                {/* 5. HE (Horas Extras - Se mantiene numérico simple) */}
                <td className="p-1 border-r print:hidden text-center">{renderInputCell(row.id, 'horasExtras', inputCounter++, "w-10", row.used.horasExtras)}</td>
                <td className="hidden print:table-cell text-right">{row.horasExtras}</td>
                
                {/* 6. Otros Ingresos */}
                <td className="p-1 border-r print:hidden text-center">{renderInputCell(row.id, 'ingresosNoDeducibles', inputCounter++, "w-14")}</td>
                <td className="hidden print:table-cell text-right">{formatCurrencyForTable(row.ingresosNoDeducibles)}</td>

                {/* TOTAL INGRESOS & DEDUCCIONES DE LEY */}
                <td className="p-2 border-r font-bold text-right text-emerald-700 bg-emerald-50 print:bg-transparent print:text-black">{formatCurrencyForTable(row.totalIngresos)}</td>
                <td className="p-2 border-r text-right text-red-600 bg-red-50/30 print:text-black">{formatCurrencyForTable(row.inssLaboral)}</td>
                <td className="p-2 border-r text-right text-red-600 bg-red-50/30 print:text-black">{formatCurrencyForTable(row.ir)}</td>
                
                {/* 7. Otras Deducciones (D.Var) */}
                <td className="p-1 border-r print:hidden text-center">{renderInputCell(row.id, 'otrosDeducciones', inputCounter++, "w-14", empInputs.otrosDeducciones || 0)}</td>
                <td className="hidden print:table-cell text-right">{formatCurrencyForTable(row.detalleOtrasDeducciones)}</td>
                
                {/* TOTALES FINALES */}
                <td className="p-2 border-r font-bold text-right text-red-700 bg-red-50 print:bg-transparent print:text-black">{formatCurrencyForTable(row.totalDeducciones)}</td>
                <td className="p-2 border-r font-black text-right text-blue-800 bg-blue-100/50 text-sm print:bg-transparent print:text-black">{formatCurrencyForTable(row.salarioNeto)}</td>
                
                {/* APORTES PATRONALES */}
                <td className="p-2 border-r text-right text-gray-500 bg-gray-50">{formatCurrencyForTable(row.inssPatronal)}</td>
                <td className="p-2 border-r text-right text-gray-500 bg-gray-50">{formatCurrencyForTable(row.inatec)}</td>
                <td className="p-2 border-r text-right font-medium text-gray-700 bg-yellow-50">{formatCurrencyForTable(row.provisionAguinaldo)}</td>
                <td className="p-2 border-r text-right font-bold text-orange-700 bg-orange-50 print:bg-transparent print:text-black">{formatCurrencyForTable(row.totalProvisiones)}</td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Colilla de Pago MEJORADO */}
      {isPayStubModalOpen && selectedEmployeeForStub && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 no-print">
          <div className="bg-white w-full max-w-2xl h-[90vh] flex flex-col overflow-hidden rounded shadow-2xl print:shadow-none print:h-auto print:w-full">
            <div className="p-4 border-b flex justify-between items-center no-print">
              <h3 className="text-lg font-bold">Colilla de Pago</h3>
              <div className="flex items-center gap-2">
                <label className="text-sm">Empleado:</label>
                <select
                  value={selectedEmployeeForStub?.id || ''}
                  onChange={(e) => {
                    const emp = planillaCalculada.find(r => r.id === parseInt(e.target.value));
                    if (emp) setSelectedEmployeeForStub(emp);
                  }}
                  className="border rounded p-1 text-sm"
                >
                  {planillaCalculada.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                  ))}
                </select>
                <button onClick={() => setIsPayStubModalOpen(false)} className="text-red-600">✕</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 print:p-0">
              <div id="pay-stub-content" className="bg-white shadow-lg min-h-[20cm] p-8 mx-auto max-w-[21cm] print:shadow-none print:m-0 print:w-full print:p-6 hidden print:block border border-gray-200">
                
                {/* Encabezado Corporativo Estándar */}
                <div className="text-center mb-6 border-b-2 border-gray-800 pb-2">
                  <h1 className="text-2xl font-bold uppercase tracking-widest">{cantidadEmpleados > 50 ? 'GRAN EMPRESA S.A.' : 'MI PYME S.A.'}</h1>
                  <h2 className="text-sm font-semibold text-gray-600">COMPROBANTE DE PAGO DE NÓMINA</h2>
                  <p className="text-xs text-gray-500 mt-1">Período: {frecuenciaCalculo} | Fecha Emisión: {new Date().toLocaleDateString('es-ES')}</p>
                </div>

                {/* Datos del Empleado */}
                <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-2 gap-y-2 gap-x-8 text-sm">
                        <div className="flex justify-between border-b border-gray-200 border-dotted pb-1">
                            <span className="font-bold text-gray-600">Empleado:</span>
                            <span className="font-medium">{selectedEmployeeForStub.nombre}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 border-dotted pb-1">
                            <span className="font-bold text-gray-600">Cargo:</span>
                            <span className="font-medium">{selectedEmployeeForStub.cargo || 'General'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 border-dotted pb-1">
                            <span className="font-bold text-gray-600">INSS:</span>
                            <span className="font-medium font-mono">{selectedEmployeeForStub.noInss || '---'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 border-dotted pb-1">
                            <span className="font-bold text-gray-600">Cédula:</span>
                            <span className="font-medium font-mono">{selectedEmployeeForStub.cedula || '---'}</span>
                        </div>
                        <div className="flex justify-between col-span-2 pt-1">
                            <span className="font-bold text-gray-600">Salario Base Mensual:</span>
                            <span className="font-medium">{formatCurrency(selectedEmployeeForStub.salarioBase)}</span>
                        </div>
                    </div>
                </div>

                {/* Grid de Conceptos (Ingresos vs Deducciones) */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Columna Ingresos */}
                    <div>
                        <div className="bg-emerald-100 text-emerald-800 font-bold text-center py-1 text-xs uppercase mb-2 border border-emerald-200">Ingresos</div>
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-gray-100">
                                <tr>
                                    <td className="py-1">Salario Básico</td>
                                    <td className="text-right py-1">{formatCurrency(selectedEmployeeForStub.salarioBasePeriodo)}</td>
                                </tr>
                                {selectedEmployeeForStub.comisiones > 0 && (
                                    <tr><td className="py-1">Comisiones</td><td className="text-right py-1">{formatCurrency(selectedEmployeeForStub.comisiones)}</td></tr>
                                )}
                                {selectedEmployeeForStub.incentivos > 0 && (
                                    <tr><td className="py-1">Incentivos</td><td className="text-right py-1">{formatCurrency(selectedEmployeeForStub.incentivos)}</td></tr>
                                )}
                                {selectedEmployeeForStub.viaticos > 0 && (
                                    <tr><td className="py-1">Viáticos</td><td className="text-right py-1">{formatCurrency(selectedEmployeeForStub.viaticos)}</td></tr>
                                )}
                                {selectedEmployeeForStub.montoVacaciones > 0 && (
                                    <tr><td className="py-1">Vacaciones</td><td className="text-right py-1">{formatCurrency(selectedEmployeeForStub.montoVacaciones)}</td></tr>
                                )}
                                {selectedEmployeeForStub.montoHorasExtras > 0 && (
                                    <tr><td className="py-1">Horas Extras</td><td className="text-right py-1">{formatCurrency(selectedEmployeeForStub.montoHorasExtras)}</td></tr>
                                )}
                                {selectedEmployeeForStub.ingresosNoDeducibles > 0 && (
                                    <tr><td className="py-1">Otros Ingresos</td><td className="text-right py-1">{formatCurrency(selectedEmployeeForStub.ingresosNoDeducibles)}</td></tr>
                                )}
                            </tbody>
                            <tfoot className="border-t-2 border-gray-300">
                                <tr>
                                    <td className="py-2 font-bold">TOTAL DEVENGADO</td>
                                    <td className="py-2 font-bold text-right">{formatCurrency(selectedEmployeeForStub.totalIngresos)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Columna Deducciones */}
                    <div>
                        <div className="bg-red-100 text-red-800 font-bold text-center py-1 text-xs uppercase mb-2 border border-red-200">Deducciones</div>
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-gray-100">
                                <tr>
                                    <td className="py-1">INSS Laboral</td>
                                    <td className="text-right py-1">{formatCurrency(selectedEmployeeForStub.inssLaboral)}</td>
                                </tr>
                                <tr>
                                    <td className="py-1">IR (Rentas del Trabajo)</td>
                                    <td className="text-right py-1">{formatCurrency(selectedEmployeeForStub.ir)}</td>
                                </tr>
                                {/* Desglose de Otras Deducciones para cuadrar el Total */}
                                {selectedEmployeeForStub.detalleOtrasDeducciones > 0 && (
                                    <tr>
                                        <td className="py-1 text-gray-600 italic">Otras (Préstamos/Emb.)</td>
                                        <td className="text-right py-1">{formatCurrency(selectedEmployeeForStub.detalleOtrasDeducciones)}</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="border-t-2 border-gray-300">
                                <tr>
                                    <td className="py-2 font-bold">TOTAL DEDUCCIONES</td>
                                    <td className="py-2 font-bold text-right">{formatCurrency(selectedEmployeeForStub.totalDeducciones)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Neto a Recibir */}
                <div className="border-2 border-gray-800 rounded p-4 bg-gray-50 flex justify-between items-center mb-12">
                    <span className="font-bold text-lg uppercase">Neto a Recibir:</span>
                    <span className="font-black text-xl">{formatCurrency(selectedEmployeeForStub.salarioNeto)}</span>
                </div>

                {/* Firmas */}
                <div className="flex justify-between px-4 mt-8">
                    <div className="text-center border-t border-black w-5/12 pt-2">
                        <p className="font-bold text-xs mb-8">ELABORADO POR</p>
                    </div>
                    <div className="text-center border-t border-black w-5/12 pt-2">
                        <p className="font-bold text-xs">RECIBÍ CONFORME</p>
                        <p className="text-[10px] mt-1">{selectedEmployeeForStub.nombre}</p>
                        <p className="text-[10px]">Cédula: {selectedEmployeeForStub.cedula}</p>
                    </div>
                </div>

              </div>
            </div>
            <div className="p-4 border-t no-print bg-gray-50 flex justify-end gap-2">
              <button onClick={() => setIsPayStubModalOpen(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded">Cerrar</button>
              <button onClick={() => { setIsPayStubModalOpen(false); setTimeout(() => window.print(), 300); }} className="bg-blue-600 text-white px-4 py-2 rounded font-bold shadow hover:bg-blue-700">🖨️ Imprimir Colilla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};