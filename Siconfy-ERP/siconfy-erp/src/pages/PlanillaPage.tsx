import React, { useState, useEffect, useCallback, memo } from 'react';
import type { PayrollRecord } from '../types';
import { EmployeeService } from '../utils/dbService';
import { calcularNominaMensual, DetalleIR } from '../utils/nomina'; // Importar DetalleIR

// Extender PayrollRecord para incluir el detalle (solo en memoria)
interface ExtendedPayrollRecord extends PayrollRecord {
  detalleIR?: DetalleIR;
}

const PlanillaPageComponent: React.FC = () => {
  const [payrollRecords, setPayrollRecords] = useState<ExtendedPayrollRecord[]>([]);
  const [selectedIR, setSelectedIR] = useState<DetalleIR | null>(null); // Estado para el modal

  const generatePayroll = useCallback(() => {
    const employees = EmployeeService.getAll();
    const records: ExtendedPayrollRecord[] = employees.map(emp => {
      const result = calcularNominaMensual(
        emp.salarioBase,
        emp.horasExtras,
        emp.comisiones,
        emp.incentivos,
        emp.deducciones,
        emp.frecuencia === 'quincenal' ? 0 : 0, // viaticos placeholder si no están en empleado
        emp.frecuencia
      );

      return {
        nombre: emp.nombre,
        cedula: emp.cedula,
        salarioBase: result.salarioBase,
        montoHorasExtras: result.montoHorasExtras,
        comisiones: result.comisiones,
        incentivos: result.incentivos,
        totalIngresos: result.totalIngresos,
        inssLaboral: result.inssLaboral,
        ir: result.ir,
        detalleIR: result.detalleIR, // Guardar detalle
        deducciones: result.deducciones,
        totalDeducciones: result.totalDeducciones,
        salarioNeto: result.salarioNeto,
        inssPatronal: result.inssPatronal,
        inatec: result.inatec,
        costoTotalEmpleador: result.costoTotalEmpleador
      };
    });

    setPayrollRecords(records);
  }, []);

  useEffect(() => {
    generatePayroll();
  }, [generatePayroll]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO' }).format(amount);
  };

  const handleShowIRDetail = (detalle?: DetalleIR) => {
    if (detalle) setSelectedIR(detalle);
  };

  // Totales
  const totalBruto = payrollRecords.reduce((sum, rec) => sum + rec.totalIngresos, 0);
  const totalDeducciones = payrollRecords.reduce((sum, rec) => sum + rec.totalDeducciones, 0);
  const totalNeto = payrollRecords.reduce((sum, rec) => sum + rec.salarioNeto, 0);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Nómina Maestra</h1>

      <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
        <table className="w-full table-auto text-sm whitespace-nowrap">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-xs leading-normal">
              <th className="py-3 px-2 text-left">Empleado</th>
              <th className="py-3 px-2 text-right">Ingresos Totales</th>
              <th className="py-3 px-2 text-right">INSS (7%)</th>
              <th className="py-3 px-2 text-right text-blue-600 cursor-help" title="Clic para ver detalle">IR (Ver)</th>
              <th className="py-3 px-2 text-right">Otras Ded.</th>
              <th className="py-3 px-2 text-right font-bold text-gray-800">Neto a Pagar</th>
              <th className="py-3 px-2 text-right text-gray-500">INSS Patronal</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {payrollRecords.map((rec) => (
              <tr key={rec.cedula} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-2 text-left font-medium">
                  <div>{rec.nombre}</div>
                  <div className="text-xs text-gray-500">{rec.cedula}</div>
                </td>
                <td className="py-3 px-2 text-right font-bold">{formatCurrency(rec.totalIngresos)}</td>
                <td className="py-3 px-2 text-right text-red-500">-{formatCurrency(rec.inssLaboral)}</td>
                <td 
                  className="py-3 px-2 text-right text-blue-600 font-semibold cursor-pointer hover:underline"
                  onClick={() => handleShowIRDetail(rec.detalleIR)}
                >
                  -{formatCurrency(rec.ir)}
                </td>
                <td className="py-3 px-2 text-right">-{formatCurrency(rec.deducciones)}</td>
                <td className="py-3 px-2 text-right font-bold text-green-600 text-base">{formatCurrency(rec.salarioNeto)}</td>
                <td className="py-3 px-2 text-right text-xs">{formatCurrency(rec.inssPatronal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center mt-6">
        <button onClick={() => window.print()} className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 print:hidden">
          🖨️ Imprimir Planilla
        </button>
      </div>

      {/* MODAL DETALLE IR */}
      {selectedIR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={() => setSelectedIR(null)}>
          <div className="bg-white p-6 rounded-lg shadow-xl w-96" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4 text-blue-800 border-b pb-2">Desglose de Cálculo IR</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Salario Anual Proyectado:</span>
                <span className="font-bold">{formatCurrency(selectedIR.salarioAnual)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>(-) Sobre Exceso:</span>
                <span>{formatCurrency(selectedIR.sobreExceso)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>(=) Base Imponible:</span>
                <span>{formatCurrency(selectedIR.salarioAnual - selectedIR.sobreExceso)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>(x) Porcentaje Aplicable:</span>
                <span>{selectedIR.porcentaje * 100}%</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>(+) Impuesto Base:</span>
                <span>{formatCurrency(selectedIR.impuestoBase)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold text-red-600 text-lg">
                <span>IR Anual:</span>
                <span>{formatCurrency(selectedIR.irAnual)}</span>
              </div>
              <p className="text-xs text-center text-gray-400 mt-2">* Este monto se divide entre los periodos del año</p>
            </div>
            <button 
              onClick={() => setSelectedIR(null)}
              className="mt-6 w-full bg-slate-200 text-slate-800 py-2 rounded hover:bg-slate-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const PlanillaPage = memo(PlanillaPageComponent);