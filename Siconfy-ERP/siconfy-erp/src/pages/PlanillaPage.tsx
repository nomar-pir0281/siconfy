// src/pages/PlanillaPage.tsx
import { InfoSection } from '../components/InfoSection';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { EmployeeService } from '../utils/dbService';
import { calcularNominaMensual, FACTOR_MENSUAL } from '../utils/nomina';
// IMPORTS DE FORMATO ACTUALIZADOS
import { formatCurrency, formatCurrencyForTable, formatNumberForDisplay, parseCurrency } from '../utils/formatters';
import type { Employee } from '../types';
import type { PlanillaInputs } from '../types/planilla';
import * as XLSX from 'xlsx';
import { saveCalculation } from '../utils/historialService';
import { generatePlanillaCSV } from '../utils/inssGenerator';
import { ReportPreviewModal } from '../components/reports/ReportPreviewModal';
import { PlanillaReportTable } from '../components/reports/PlanillaReportTable';
import { StandardReportHeader } from '../components/reports/StandardReportHeader';
import { StandardReportFooter } from '../components/reports/StandardReportFooter';


export const PlanillaPage = () => {
  const [empleados, setEmpleados] = useState<Employee[]>([]);
  const [inputs, setInputs] = useState<Record<number, PlanillaInputs>>({});
  const [cantidadEmpleados, setCantidadEmpleados] = useState<number>(51);
  const [frecuenciaCalculo, setFrecuenciaCalculo] = useState<'Mensual' | 'Quincenal' | 'Semanal'>('Mensual');

  // Datos de la Empresa (Estado local para la planilla)
  // Datos de la Empresa (Persistente)
  const [empresaInfo, setEmpresaInfo] = useState(() => {
    const saved = localStorage.getItem('siconfy_company_info');
    return saved ? JSON.parse(saved) : {
      nombre: 'Siconfy S.A.',
      ruc: 'J0310000000000',
      direccion: 'Managua, Nicaragua',
      razonSocial: 'Soluciones Integrales Contables'
    };
  });

  // Guardar cambios de empresa en localStorage
  useEffect(() => {
    localStorage.setItem('siconfy_company_info', JSON.stringify(empresaInfo));
  }, [empresaInfo]);

  // Modal para colilla de pago
  const [isPayStubModalOpen, setIsPayStubModalOpen] = useState(false);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [selectedEmployeeForStub, setSelectedEmployeeForStub] = useState<any>(null);

  // Referencia para manejar el foco de todos los inputs de la tabla
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  // Referencia para el iframe de impresión
  const printIframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const allEmps = EmployeeService.getAll();
    setEmpleados(allEmps.filter(e => e.estado === 'Activo')); // Filter out inactive employees
  }, []);

  const handleInputChange = (id: number, field: keyof PlanillaInputs, value: number) => {
    setInputs(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  // UX: Lógica de Navegación Matricial (Enter = Derecha, Flechas = Arriba/Abajo)
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    // Definimos columnas editables: Dias, Comis, Incent, Viát, HE, OtrosIng, D.Var -> 7 columnas
    // Se agregó 'diasTrabajados' como primera columna editable de números
    const inputsPorFila = 7; // Ajustar según columnas reales

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
      const empInputs = (inputs[emp.id] || {}) as Partial<PlanillaInputs>;
      let salarioBaseProcesar = emp.salarioBase;

      // Lógica de frecuencia preservada
      if (frecuenciaCalculo === 'Quincenal') salarioBaseProcesar = emp.salarioBase / 2;
      if (frecuenciaCalculo === 'Semanal') salarioBaseProcesar = emp.salarioBase / 4.3333;

      const comisiones = empInputs.comisiones ?? (emp.comisiones || 0);
      const incentivos = empInputs.incentivos ?? (emp.incentivos || 0);
      const viaticos = empInputs.viaticos ?? (emp.viaticos || 0);
      const diasVacaciones = empInputs.diasVacaciones ?? (emp.diasVacaciones || 0);
      const horasExtras = empInputs.horasExtras ?? (emp.horasExtras || 0);
      const diasTrabajados = empInputs.diasTrabajados; // Puede ser undefined

      // Cálculo preservando todas las opciones originales
      const calculo = calcularNominaMensual(salarioBaseProcesar, {
        comisiones, incentivos, viaticos, diasVacaciones, horasExtras,
        ingresosNoDeducibles: empInputs.ingresosNoDeducibles || 0,
        optica: empInputs.optica || 0,
        embargoAlimenticio: empInputs.embargoAlimenticio || 0,
        embargoJudicial: empInputs.embargoJudicial || 0,
        otrosDeducciones: (empInputs.otrosDeducciones || 0) + (emp.deducciones || 0),
        frecuencia: frecuenciaCalculo.toLowerCase() as any,
        cantidadEmpleados: cantidadEmpleados,
        diasTrabajados: diasTrabajados
      });

      const baseComputable = calculo.totalIngresos - calculo.viaticos - calculo.ingresosNoDeducibles;
      const provisionVacaciones = baseComputable * FACTOR_MENSUAL;
      const provisionIndemnizacion = baseComputable * FACTOR_MENSUAL;
      const totalProvisiones = calculo.inssPatronal + calculo.inatec + calculo.provisionAguinaldo + provisionVacaciones + provisionIndemnizacion;

      return {
        ...emp, ...calculo, salarioBasePeriodo: salarioBaseProcesar, totalProvisiones,
        used: { comisiones, incentivos, viaticos, diasVacaciones, horasExtras, diasTrabajados: calculo.diasTrabajados },
        // Guardamos el desglose de otras deducciones para la colilla
        detalleOtrasDeducciones: (empInputs.optica || 0) + (empInputs.embargoAlimenticio || 0) + (empInputs.embargoJudicial || 0) + ((empInputs.otrosDeducciones || 0) + (emp.deducciones || 0))
      };
    });
  }, [empleados, inputs, cantidadEmpleados, frecuenciaCalculo]);

  const printStub = () => {
    const iframe = printIframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    const stubElement = document.getElementById('printable-stub-area');
    if (!stubElement) return;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Colilla de Pago</title>
        <style>
          @media print {
            @page { size: A4; margin: 5mm; }
            body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
          }
          .bg-white { background-color: white; }
          .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
          .min-h-[20cm] { min-height: 20cm; }
          .p-8 { padding: 2rem; }
          .mx-auto { margin-left: auto; margin-right: auto; }
          .max-w-[21cm] { max-width: 21cm; }
          .print\\:shadow-none { box-shadow: none; }
          .print\\:m-0 { margin: 0; }
          .print\\:w-full { width: 100%; }
          .print\\:p-6 { padding: 1.5rem; }
          .border { border: 1px solid #e5e7eb; }
          .border-gray-200 { border-color: #e5e7eb; }
          .text-center { text-align: center; }
          .mb-6 { margin-bottom: 1.5rem; }
          .border-b-2 { border-bottom-width: 2px; }
          .border-gray-800 { border-color: #1f2937; }
          .pb-2 { padding-bottom: 0.5rem; }
          .text-2xl { font-size: 1.5rem; line-height: 2rem; }
          .font-bold { font-weight: 700; }
          .uppercase { text-transform: uppercase; }
          .tracking-widest { letter-spacing: 0.25em; }
          .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
          .font-semibold { font-weight: 600; }
          .text-gray-600 { color: #4b5563; }
          .text-xs { font-size: 0.75rem; line-height: 1rem; }
          .text-gray-500 { color: #6b7280; }
          .mt-1 { margin-top: 0.25rem; }
          .bg-gray-50 { background-color: #f9fafb; }
          .p-4 { padding: 1rem; }
          .rounded-lg { border-radius: 0.5rem; }
          .grid { display: grid; }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .gap-y-2 { row-gap: 0.5rem; }
          .gap-x-8 { column-gap: 2rem; }
          .flex { display: flex; }
          .justify-between { justify-content: space-between; }
          .border-b { border-bottom-width: 1px; }
          .border-dotted { border-style: dotted; }
          .pb-1 { padding-bottom: 0.25rem; }
          .font-medium { font-weight: 500; }
          .col-span-2 { grid-column: span 2 / span 2; }
          .pt-1 { padding-top: 0.25rem; }
          .gap-6 { gap: 1.5rem; }
          .bg-emerald-100 { background-color: #d1fae5; }
          .text-emerald-800 { color: #065f46; }
          .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
          .border-emerald-200 { border-color: #a7f3d0; }
          .w-full { width: 100%; }
          .divide-y > * + * { border-top-width: 1px; border-bottom-width: 1px; }
          .divide-gray-100 > * + * { border-color: #f3f4f6; }
          .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
          .text-right { text-align: right; }
          .border-t-2 { border-top-width: 2px; }
          .border-gray-300 { border-color: #d1d5db; }
          .bg-red-100 { background-color: #fee2e2; }
          .text-red-800 { color: #991b1b; }
          .border-red-200 { border-color: #fecaca; }
          .text-gray-600 { color: #4b5563; }
          .italic { font-style: italic; }
          .border-2 { border-width: 2px; }
          .rounded { border-radius: 0.25rem; }
          .items-center { align-items: center; }
          .mb-12 { margin-bottom: 3rem; }
          .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
          .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
          .px-4 { padding-left: 1rem; padding-right: 1rem; }
          .mt-8 { margin-top: 2rem; }
          .w-5\\/12 { width: 41.666667%; }
          .border-t { border-top-width: 1px; }
          .border-black { border-color: black; }
          .pt-2 { padding-top: 0.5rem; }
          .mb-8 { margin-bottom: 2rem; }
          .text-\\[10px\\] { font-size: 10px; }
          .font-mono { font-family: ui-monospace, SFMono-Regular, monospace; }
        </style>
      </head>
      <body>
        ${stubElement.innerHTML}
      </body>
      </html>
    `);
    doc.close();
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
  };

  const handleExportExcel = () => {
    // Preparar datos con la estructura exacta de la tabla y los inputs de la empresa
    const dataToExport = planillaCalculada.map((row, idx) => ({
      "#": idx + 1,
      "Nombre del Trabajador": row.nombre,
      "No. Trab.": row.noTrabajador || '-',
      "Contrato": row.contrato || 'Fijo',
      "Fecha Ingreso": row.fechaIngreso,
      "Periodo": row.frecuenciaPago,
      "Días": row.diasTrabajados || 30, // Default visual
      "Moneda": row.moneda || 'C$',
      "Salario Base": row.salarioBasePeriodo,

      // Ingresos Variables (Usamos 'used' para reflejar lo que realmente se calculó)
      "Comis.": row.used.comisiones,
      "Incent.": row.used.incentivos,
      "Viát.": row.used.viaticos,
      "Vac.": row.montoVacaciones,
      "HE (Cant)": row.used.horasExtras, // Cantidad
      "HE (Monto)": row.montoHorasExtras, // Monto
      "Otros": row.ingresosNoDeducibles,
      "Total Ing.": row.totalIngresos,

      // Deducciones
      "INSS Lab": row.inssLaboral,
      "IR": row.ir,
      "Otras Ded.": row.detalleOtrasDeducciones, // D.Var
      "Total Ded.": row.totalDeducciones,

      "Neto a Recibir": row.salarioNeto,

      // Aportes Patronales (Opcional en reporte interno, pero útil)
      "Patronal": row.inssPatronal,
      "INATEC": row.inatec,
      "P. Agui.": row.provisionAguinaldo,
      "P. Total": row.totalProvisiones
    }));

    // Agregar fila de encabezado con info de empresa al principio es complejo con json_to_sheet directo,
    // pero podemos personalizar el nombre del archivo o hoja.
    // O mejor, usamos un array de arrays para tener control total.

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Planilla");
    const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const safeCompanyName = (empresaInfo.razonSocial || 'Empresa').replace(/[^a-zA-Z0-9]/g, '_');
    XLSX.writeFile(wb, `Planilla_${safeCompanyName}_${dateStr}.xlsx`);
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

  const handleExportTXTINSS = () => {
    const csv = generatePlanillaCSV(planillaCalculada);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `Planilla_INSS_${dateStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // HELPER MEJORADO: Input "inteligente" (Formato al salir, crudo al editar)
  const renderInputCell = (empId: number, field: keyof PlanillaInputs, globalIndex: number, width: string = "w-20", defaultVal: number = 0) => (
    <input
      ref={el => { inputsRef.current[globalIndex] = el; }}
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
    <div className={`p-4 bg-gray-50 min-h-screen ${isPayStubModalOpen ? 'print:hidden' : ''}`}>
      <style>{`
        @media print {
            /* Idealmente 'Legal landscape', pero para compatibilidad máxima usamos landscape y el usuario elige papel */
            @page { size: landscape; margin: 4mm; }
            body, html, #root { width: 100% !important; height: auto !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; }
            .print-hidden, button, nav, aside { display: none !important; }
            
            /* Reset main container */
            .p-4 { padding: 0 !important; background: white !important; }
            .min-h-screen { min-height: auto !important; }
            
            /* Table Styling - Force Full Width */
            .table-container { 
                overflow: visible !important; 
                display: block !important; 
                width: 100% !important; 
                border: none !important; 
                box-shadow: none !important;
                margin: 0 !important;
            }
            
            table { 
                width: 100% !important; 
                min-width: 100% !important;
                font-size: 11px !important; 
                border-collapse: collapse !important; 
                table-layout: auto !important;
            }
            
            th, td { 
                padding: 4px 5px !important; 
                white-space: nowrap; 
                border: 1px solid #999 !important; 
            }
            
            th { 
                font-weight: 800 !important; 
                font-size: 11px !important; 
                background-color: #f3f4f6 !important; 
                color: #000 !important; 
                border-bottom: 2px solid #000 !important; 
                text-transform: uppercase;
            }
            
            thead { display: table-header-group; }
            tr { page-break-inside: avoid; }
            
            /* Inputs inside table */
            input { 
                border: none !important; 
                background: transparent !important; 
                padding: 0 !important; 
                text-align: right; 
                width: auto !important;
                font-weight: 600;
                color: #000 !important;
                min-width: 20px;
            }
            input::placeholder { color: transparent; }
            
            /* Header adjustments */
            h1 { font-size: 18px !important; margin-bottom: 5px !important; }
            .uppercase { text-transform: uppercase; }

            /* Ensure sticky headers are static in print to avoid overlap/cut-off */
            th.sticky, td.sticky { 
                position: static !important; 
                border: 1px solid #999 !important;
                background: transparent !important;
            }
            
            /* Show hidden print cells */
            .hidden.print\\:table-cell { display: table-cell !important; }
            .print\\:hidden { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div className="mb-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 print-hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-tight">Planilla Salarial</h1>

          {/* Inputs de la Empresa */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4 bg-white p-3 rounded shadow-sm border border-gray-200">
            <div className="md:col-span-2 lg:col-span-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Razón Social</label>
              <input type="text" value={empresaInfo.razonSocial} onChange={e => setEmpresaInfo({ ...empresaInfo, razonSocial: e.target.value })} className="w-full border rounded p-1.5 text-sm" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">RUC</label>
              <input type="text" value={empresaInfo.ruc} onChange={e => setEmpresaInfo({ ...empresaInfo, ruc: e.target.value })} className="w-full border rounded p-1.5 text-sm" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Dirección</label>
              <input type="text" value={empresaInfo.direccion} onChange={e => setEmpresaInfo({ ...empresaInfo, direccion: e.target.value })} className="w-full border rounded p-1.5 text-sm" />
            </div>
          </div>

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
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowReportPreview(true)} className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-900 transition-colors shadow-sm">👁️ Vista Previa</button>
          <button onClick={() => window.print()} className="bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">🖨️ Imprimir</button>
          <button onClick={handleExportExcel} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">📊 Excel</button>
          <button onClick={handleExportTXTINSS} className="bg-cyan-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">📄 Exportar TXT INSS</button>
          <button onClick={() => saveCalculation({ tipo: 'planilla', fecha: new Date(), inputs: { frecuencia: frecuenciaCalculo, empleados: cantidadEmpleados }, resultado: planillaCalculada.reduce((sum, emp) => sum + emp.salarioNeto, 0), detalles: planillaCalculada })} className="bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">💾 Guardar</button>
          <button onClick={() => { setSelectedEmployeeForStub(planillaCalculada[0]); setIsPayStubModalOpen(true); }} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">🧾 Colilla de Pago</button>
          <button onClick={handleExportINSS} className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">📋 INSS</button>
        </div>
      </div>

      {/* CONTENEDOR DE IMPRESIÓN OFICIAL (Visible solo al imprimir Y si no hay modales abiertos) */}
      <div className={`hidden ${!showReportPreview && !isPayStubModalOpen ? 'print:block' : ''} bg-white p-0`}>
        <StandardReportHeader
          title="PLANILLA DE PAGO"
          subtitle={`Período: ${frecuenciaCalculo} | Moneda: C$ (Córdobas) | Fecha: ${new Date().toLocaleDateString('es-NI')}`}
        />
        <div className="mt-4">
          <PlanillaReportTable data={planillaCalculada} />
        </div>
        <StandardReportFooter />
      </div>

      {/* CONTENEDOR DE PANTALLA (Oculto al imprimir) */}
      <div className="table-container bg-white shadow-lg rounded-lg border border-gray-200 overflow-x-auto print:hidden">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="bg-slate-800 text-white uppercase text-[9px] leading-normal print:bg-gray-200 print:text-black print:border-b-2 print:border-black">
            <tr>
              <th className="p-2 border-r border-slate-600 sticky left-0 bg-slate-800 z-10 print:hidden w-8 text-center">#</th>
              <th className="p-1 border-r border-slate-600 text-center min-w-[50px]">Estado</th>
              <th className="p-1 border-r border-slate-600 text-center min-w-[80px]">Cédula</th>
              <th className="p-2 border-r border-slate-600 sticky left-8 bg-slate-800 z-10 min-w-[140px] print:static print:bg-transparent print:text-left">Nombre del Trabajador</th>
              <th className="p-1 border-r border-slate-600 text-center min-w-[60px]">No. INSS</th>
              <th className="p-1 border-r border-slate-600 text-center min-w-[80px]">Cargo</th>
              <th className="p-1 border-r border-slate-600 text-center min-w-[60px]">Contrato</th>
              <th className="p-1 border-r border-slate-600 text-center min-w-[70px]">Fecha Ingreso</th>
              <th className="p-1 border-r border-slate-600 text-center min-w-[60px]">Periodo</th>
              <th className="p-1 border-r border-slate-600 text-center min-w-[40px] bg-slate-700">Días</th>
              <th className="p-1 border-r border-slate-600 text-center min-w-[40px]">Moneda</th>

              <th className="p-2 border-r border-slate-600 text-right bg-blue-900">Salario Base</th>

              <th className="p-1 border-r border-slate-600 bg-emerald-900 text-center print:bg-gray-100">Comis.</th>
              <th className="p-1 border-r border-slate-600 bg-emerald-900 text-center print:bg-gray-100">Incent.</th>
              <th className="p-1 border-r border-slate-600 bg-emerald-900 text-center print:bg-gray-100">Viát.</th>
              {/* Vacaciones se movió a ingreso por ley, aquí dejamos columna de pago de vac. */}
              <th className="p-1 border-r border-slate-600 bg-emerald-900 text-center print:bg-gray-100">Vac.</th>
              <th className="p-1 border-r border-slate-600 bg-emerald-900 text-center print:bg-gray-100">HE (Cant)</th>
              <th className="p-1 border-r border-slate-600 bg-emerald-900 text-center print:bg-gray-100">HE (Monto)</th>
              <th className="p-1 border-r border-slate-600 bg-emerald-900 text-center print:bg-gray-100">Otros</th>
              <th className="p-2 border-r border-slate-600 font-bold bg-emerald-800 text-right print:bg-emerald-50">Total Ing.</th>

              <th className="p-2 border-r border-slate-600 bg-red-900 text-right print:bg-gray-100">INSS Lab</th>
              <th className="p-2 border-r border-slate-600 bg-red-900 text-right print:bg-gray-100">IR</th>
              <th className="p-1 border-r border-slate-600 bg-red-900 text-center print:bg-gray-100">Otros</th>
              <th className="p-2 border-r border-slate-600 font-bold bg-red-800 text-right print:bg-red-50">Total Ded.</th>

              <th className="p-2 border-r border-slate-600 font-black bg-blue-800 text-white text-right text-sm print:bg-gray-200 print:text-black">Neto a Recibir</th>

              <th className="p-2 border-r border-slate-600 text-center min-w-[100px] print:table-cell hidden">Firma</th>
            </tr>
          </thead>
          <tbody className="text-[10px]">
            {planillaCalculada.map((row, idx) => {
              const empInputs = (inputs[row.id] || {}) as Partial<PlanillaInputs>;
              return (
                <tr key={row.id} className="hover:bg-blue-50 border-b border-gray-200 print:border-gray-400 transition-colors">
                  <td className="p-2 border-r sticky left-0 bg-white font-bold text-center print:hidden text-[9px]">{row.id}</td>
                  <td className="p-2 border-r text-center text-[9px] font-bold text-gray-500 bg-gray-50">{row.estado ? row.estado.substring(0, 3).toUpperCase() : 'ACT'}</td>
                  <td className="p-2 border-r text-center font-mono text-[9px]">{row.cedula}</td>
                  <td className="p-2 border-r sticky left-8 bg-white font-medium print:static truncate max-w-[140px] uppercase text-[9px]">{row.nombre}</td>
                  <td className="p-1 border-r text-center font-mono text-[9px]">{row.noInss || '---'}</td>
                  <td className="p-1 border-r text-center text-[9px] truncate max-w-[80px]" title={row.cargo}>{row.cargo}</td>
                  <td className="p-1 border-r text-center text-[9px]">{row.contrato || 'Fijo'}</td>
                  <td className="p-1 border-r text-center text-[9px]">{row.fechaIngreso || '-'}</td>
                  <td className="p-1 border-r text-center text-[9px]">{row.frecuenciaPago || 'Mensual'}</td>

                  {/* Días a Pagar (Input Editable) */}
                  <td className="p-1 border-r text-center print:hidden">{renderInputCell(row.id, 'diasTrabajados', inputCounter++, "w-10", row.diasTrabajados)}</td>
                  <td className="hidden print:table-cell text-center">{row.diasTrabajados}</td>

                  <td className="p-1 border-r text-center">C$</td>


                  {/* SALARIO BASE */}
                  <td className="p-2 border-r font-bold text-right text-blue-900 bg-blue-50/50 print:bg-transparent">{formatCurrencyForTable(row.salarioBasePeriodo)}</td>

                  {/* 1. Comisiones */}
                  <td className="p-1 border-r print:hidden text-center">{renderInputCell(row.id, 'comisiones', inputCounter++, "w-14", row.used.comisiones)}</td>
                  <td className="hidden print:table-cell text-right">{formatCurrencyForTable(row.comisiones)}</td>

                  {/* 2. Incentivos */}
                  <td className="p-1 border-r print:hidden text-center">{renderInputCell(row.id, 'incentivos', inputCounter++, "w-14", row.used.incentivos)}</td>
                  <td className="hidden print:table-cell text-right">{formatCurrencyForTable(row.incentivos)}</td>

                  {/* 3. Viáticos */}
                  <td className="p-1 border-r print:hidden text-center">{renderInputCell(row.id, 'viaticos', inputCounter++, "w-14", row.used.viaticos)}</td>
                  <td className="hidden print:table-cell text-right">{formatCurrencyForTable(row.viaticos)}</td>

                  {/* 4. Vacaciones */}
                  <td className="p-1 border-r print:hidden text-center">{renderInputCell(row.id, 'diasVacaciones', inputCounter++, "w-14", row.used.diasVacaciones)}</td>
                  <td className="hidden print:table-cell text-right">{formatCurrencyForTable(row.montoVacaciones)}</td>

                  {/* 5. HE (Horas Extras Cantidad) */}
                  <td className="p-1 border-r print:hidden text-center">{renderInputCell(row.id, 'horasExtras', inputCounter++, "w-10", row.used.horasExtras)}</td>
                  <td className="hidden print:table-cell text-center">{row.horasExtras}</td>

                  {/* HE Monto (Calculado) */}
                  <td className="p-1 border-r text-right bg-emerald-50/30 print:bg-transparent">{formatCurrencyForTable(row.montoHorasExtras)}</td>

                  {/* 6. Otros Ingresos */}
                  <td className="p-1 border-r print:hidden text-center">{renderInputCell(row.id, 'ingresosNoDeducibles', inputCounter++, "w-14", row.ingresosNoDeducibles)}</td>
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
                  <td className="p-2 border-r font-black text-right text-blue-800 bg-blue-100/50 text-xs print:bg-transparent print:text-black print:border-black print:border-l-2 print:border-r-2">{formatCurrencyForTable(row.salarioNeto)}</td>

                  {/* Firma Space */}
                  <td className="p-2 border-r min-w-[100px] hidden print:table-cell border-b border-gray-400"></td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Colilla de Pago MEJORADO */}
      {isPayStubModalOpen && selectedEmployeeForStub && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 print:bg-transparent">
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
              <div id="printable-stub-area" className="bg-white shadow-lg min-h-[20cm] p-8 mx-auto max-w-[21cm] print:shadow-none print:m-0 print:w-full print:p-6 border border-gray-200">

                {/* Encabezado Corporativo Estándar */}
                <div className="text-center mb-6 border-b-2 border-gray-800 pb-2">
                  <h1 className="text-2xl font-bold uppercase tracking-widest">{empresaInfo.razonSocial || (cantidadEmpleados > 50 ? 'GRAN EMPRESA S.A.' : 'MI PYME S.A.')}</h1>
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
              <button onClick={printStub} className="bg-blue-600 text-white px-4 py-2 rounded font-bold shadow hover:bg-blue-700">🖨️ Imprimir Colilla</button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden iframe for printing pay stub */}
      <iframe ref={printIframeRef} style={{ display: 'none' }}></iframe>

      {/* MODAL DE VISTA PREVIA GLOBAL */}
      <ReportPreviewModal
        isOpen={showReportPreview}
        onClose={() => setShowReportPreview(false)}
        title="PLANILLA DE PAGO"
        subtitle={`Período: ${frecuenciaCalculo} | Moneda: C$`}
        orientation="landscape"
      >
        <PlanillaReportTable data={planillaCalculada} />
      </ReportPreviewModal>

      <InfoSection type="planilla" />
    </div>
  );
};