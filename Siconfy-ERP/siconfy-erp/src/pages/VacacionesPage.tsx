import React, { useState, useEffect, useCallback, memo } from 'react';
import type { Employee } from '../types';
import { EmployeeService } from '../utils/dbService';
import { formatCurrency } from '../utils/formatters';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const VacacionesPageComponent: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date()); 
  
  // Estado para Modal
  const [selectedForUsage, setSelectedForUsage] = useState<Employee | null>(null);
  const [diasUsados, setDiasUsados] = useState<string>(''); // Cambiado a string para mejor manejo de inputs vacíos
  const [motivo, setMotivo] = useState('');

  const loadEmployees = useCallback(() => {
    const emps = EmployeeService.getAll();
    setEmployees(emps);
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // --- LÓGICA DE CÁLCULO (Regla: 30 días anuales) ---
  const calcularProporcionalHoy = (fechaIngreso: string) => {
    const start = new Date(fechaIngreso);
    const now = new Date();

    if (isNaN(start.getTime())) return 0;

    const diffTime = now.getTime() - start.getTime();
    if (diffTime < 0) return 0;

    // (Días Trabajados / 360) * 30 - Año comercial de 360 días
    const diasTrabajados = diffTime / (1000 * 60 * 60 * 24);
    return (diasTrabajados / 360) * 30;
  };

  const handleRegisterVacation = () => {
    const dias = parseFloat(diasUsados);
    if (!selectedForUsage || isNaN(dias) || dias <= 0) {
        alert("Por favor ingrese una cantidad de días válida.");
        return;
    }

    try {
        // 1. Sincronizar el acumulado real calculado dinámicamente con el objeto empleado
        // Esto es necesario porque dbService valida contra el valor guardado, que podría estar desactualizado.
        const acumuladoReal = calcularProporcionalHoy(selectedForUsage.fechaIngreso);
        
        // Actualizamos temporalmente el acumulado total en el objeto antes de procesar la resta
        const empleadoActualizado = { ...selectedForUsage, diasVacacionesAcumulados: acumuladoReal };
        EmployeeService.update(empleadoActualizado);

        // 2. Registrar el uso (dbService restará los días usados al acumuladoReal)
        EmployeeService.registerVacationUsage(selectedForUsage.cedula, dias, motivo || 'Vacaciones');
        
        // 3. Limpieza y recarga
        alert('Movimiento registrado exitosamente');
        setSelectedForUsage(null);
        setDiasUsados('');
        setMotivo('');
        loadEmployees();
    } catch (error) {
        alert(`Error al registrar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleUpdateBalances = () => {
    setLastUpdate(new Date());
    loadEmployees();
    alert(`Saldos recalculados al corte: ${new Date().toLocaleDateString()}`);
  };

  // --- EXPORTACIÓN ---
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Vacaciones - Siconfy ERP", 14, 10);
    doc.text(`Generado: ${new Date().toLocaleDateString()}`, 14, 16);
    
    const tableColumn = ["Empleado", "Ingreso", "Acumulado Total", "Usado", "Saldo Actual", "Valor Monetario"];
    const tableRows: any[] = [];

    employees.forEach(emp => {
        const acumulado = calcularProporcionalHoy(emp.fechaIngreso);
        const usados = emp.historialVacaciones?.reduce((s, r) => s + r.diasUsados, 0) || 0;
        const saldo = Math.max(0, acumulado - usados);
        const valor = (emp.salarioBase / 30) * saldo;

        tableRows.push([
            emp.nombre,
            emp.fechaIngreso,
            acumulado.toFixed(2),
            usados.toFixed(2),
            saldo.toFixed(2),
            formatCurrency(valor)
        ]);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
    });
    doc.save("Reporte_Vacaciones.pdf");
  };

  const exportToExcel = () => {
    const data = employees.map(emp => {
        const acumulado = calcularProporcionalHoy(emp.fechaIngreso);
        const usados = emp.historialVacaciones?.reduce((s, r) => s + r.diasUsados, 0) || 0;
        const saldo = Math.max(0, acumulado - usados);
        
        return {
            "Cédula": emp.cedula,
            "Nombre": emp.nombre,
            "Fecha Ingreso": emp.fechaIngreso,
            "Fecha Corte": new Date().toLocaleDateString(),
            "Días Acumulados (Total)": parseFloat(acumulado.toFixed(2)),
            "Días Usados": parseFloat(usados.toFixed(2)),
            "Saldo Disponible": parseFloat(saldo.toFixed(2)),
            "Valor Monetario": (emp.salarioBase/30) * saldo
        };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vacaciones");
    XLSX.writeFile(wb, "Reporte_Vacaciones.xlsx");
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      
      {/* Header y Controles */}
      <div className="print:hidden mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Control de Vacaciones</h1>
            <p className="text-sm text-gray-500">Cálculo proporcional (Base 30 días/año)</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
            <button onClick={handleUpdateBalances} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded text-sm font-bold flex items-center gap-2 transition">
                ⚡ Actualizar Saldos
            </button>
            <div className="flex bg-gray-200 rounded p-1 gap-1">
                <button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-bold transition">
                   Excel
                </button>
                <button onClick={exportToPDF} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-bold transition">
                   PDF
                </button>
            </div>
            <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 transition">
              🖨️ Imprimir
            </button>
        </div>
      </div>

      {/* DOCUMENTO DE REPORTE */}
      <div className="document-print-container bg-white p-4 md:p-6 shadow-lg print:shadow-none print:p-0 rounded-lg">
        
        <div className="hidden print:block text-center mb-8 border-b-2 border-black pb-2">
            <h2 className="text-2xl font-serif font-bold uppercase">Reporte General de Vacaciones</h2>
            <p className="text-sm">Corte al: {lastUpdate.toLocaleDateString('es-NI')}</p>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-gray-300">
            <thead className="bg-slate-800 text-white print:bg-gray-200 print:text-black">
                <tr>
                <th className="border border-slate-600 p-2 text-left">EMPLEADO</th>
                <th className="border border-slate-600 p-2 text-center">F. INGRESO</th>
                <th className="border border-slate-600 p-2 text-center bg-blue-50/10">F. CORTE</th>
                <th className="border border-slate-600 p-2 text-center">ACUMULADO</th>
                <th className="border border-slate-600 p-2 text-center">USADO</th>
                <th className="border border-slate-600 p-2 text-center bg-green-50/10 font-bold">DISPONIBLE</th>
                <th className="border border-slate-600 p-2 text-right">VALOR C$</th>
                <th className="border border-slate-600 p-2 text-center print:hidden">GESTIÓN</th>
                </tr>
            </thead>
            <tbody>
                {employees.map((emp) => {
                // Cálculo en tiempo real para visualización
                const diasAcumTotal = calcularProporcionalHoy(emp.fechaIngreso);
                const diasUsadosTotal = emp.historialVacaciones?.reduce((s, r) => s + r.diasUsados, 0) || 0;
                const saldo = Math.max(0, diasAcumTotal - diasUsadosTotal);
                const salarioDiario = emp.salarioBase / 30;
                const valorMonetario = saldo * salarioDiario;
                
                const isAlert = saldo > 30;
                const rowClass = isAlert ? "bg-red-50" : "hover:bg-gray-50";

                return (
                    <tr key={emp.cedula} className={`border-b border-gray-300 ${rowClass}`}>
                        <td className="p-2 border-r font-medium">
                            <div className="text-gray-900">{emp.nombre}</div>
                            <div className="text-xs text-gray-500 font-mono">{emp.cedula}</div>
                        </td>
                        <td className="p-2 border-r text-center text-xs">{emp.fechaIngreso}</td>
                        <td className="p-2 border-r text-center text-xs text-gray-500">{new Date().toLocaleDateString()}</td>
                        
                        <td className="p-2 border-r text-center font-mono text-blue-700 font-bold bg-blue-50">
                            {diasAcumTotal.toFixed(2)}
                        </td>
                        <td className="p-2 border-r text-center font-mono text-gray-600">
                            {diasUsadosTotal.toFixed(2)}
                        </td>
                        <td className={`p-2 border-r text-center font-bold font-mono text-base ${isAlert ? 'text-red-600' : 'text-green-700 bg-green-50'}`}>
                            {saldo.toFixed(2)}
                        </td>
                        <td className="p-2 border-r text-right font-mono text-gray-800">
                            {formatCurrency(valorMonetario)}
                        </td>
                        <td className="p-2 text-center print:hidden">
                            <button 
                                onClick={() => setSelectedForUsage(emp)} 
                                className="text-xs bg-slate-700 text-white hover:bg-slate-800 px-3 py-1 rounded shadow transition"
                            >
                                Registrar
                            </button>
                        </td>
                    </tr>
                );
                })}
            </tbody>
            </table>
        </div>
        
        {/* Pie de página reporte */}
        <div className="mt-4 text-xs text-gray-500 italic print:block hidden">
            * Cálculo basado en 30 días anuales (2.5 por mes). La columna "Acumulado" incluye la parte proporcional hasta el día de hoy.
        </div>
      </div>

      {/* Modal Simple */}
      {selectedForUsage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 print:hidden">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-96 border-t-4 border-blue-600 animate-in fade-in zoom-in duration-200">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Registrar Vacaciones</h3>
                <p className="text-sm text-gray-600 mb-4">Empleado: <span className="font-bold">{selectedForUsage.nombre}</span></p>
                
                <label className="block text-xs font-bold text-gray-500 mb-1">Días a tomar</label>
                <input 
                    type="number" 
                    className="w-full border rounded p-2 mb-3 focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={diasUsados} 
                    onChange={e=>setDiasUsados(e.target.value)}
                    placeholder="0"
                />
                
                <label className="block text-xs font-bold text-gray-500 mb-1">Motivo / Notas</label>
                <input 
                    type="text" 
                    className="w-full border rounded p-2 mb-6 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="Ej: Vacaciones anuales" 
                    value={motivo} 
                    onChange={e=>setMotivo(e.target.value)} 
                />
                
                <div className="flex justify-end gap-3">
                    <button onClick={() => {
                        setSelectedForUsage(null);
                        setDiasUsados('');
                    }} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-medium transition">Cancelar</button>
                    <button onClick={handleRegisterVacation} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold shadow transition">Guardar</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export const VacacionesPage = memo(VacacionesPageComponent);