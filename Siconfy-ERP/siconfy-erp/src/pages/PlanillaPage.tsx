import React, { useState, useEffect, useCallback, memo } from 'react';
import type { PayrollRecord } from '../types';
import { EmployeeService } from '../utils/dbService';
import { calcularNominaMensual } from '../utils/nomina';

const PlanillaPageComponent: React.FC = () => {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);

  const generatePayroll = useCallback(() => {
    const employees = EmployeeService.getAll();
    const records: PayrollRecord[] = employees.map(emp => {
      const result = calcularNominaMensual(
        emp.salarioBase,
        emp.horasExtras,
        emp.comisiones,
        emp.incentivos,
        emp.deducciones,
        0, // viaticos
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

  const totalBruto = payrollRecords.reduce((sum, rec) => sum + rec.totalIngresos, 0);
  const totalDeducciones = payrollRecords.reduce((sum, rec) => sum + rec.totalDeducciones, 0);
  const totalNeto = payrollRecords.reduce((sum, rec) => sum + rec.salarioNeto, 0);
  const totalPatronal = payrollRecords.reduce((sum, rec) => sum + rec.inssPatronal + rec.inatec, 0);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Nómina Maestra</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-2 py-2 text-left">Nombre</th>
                <th className="px-2 py-2 text-left">Cédula</th>
                <th className="px-2 py-2 text-right">Salario Base</th>
                <th className="px-2 py-2 text-right">Horas Extras</th>
                <th className="px-2 py-2 text-right">Comisiones</th>
                <th className="px-2 py-2 text-right">Incentivos</th>
                <th className="px-2 py-2 text-right">Total Bruto</th>
                <th className="px-2 py-2 text-right">INSS Laboral</th>
                <th className="px-2 py-2 text-right">IR</th>
                <th className="px-2 py-2 text-right">Otras Ded.</th>
                <th className="px-2 py-2 text-right">Total Ded.</th>
                <th className="px-2 py-2 text-right">Salario Neto</th>
                <th className="px-2 py-2 text-right">INSS Pat.</th>
                <th className="px-2 py-2 text-right">INATEC</th>
                <th className="px-2 py-2 text-right">Costo Total</th>
              </tr>
            </thead>
            <tbody>
              {payrollRecords.map((rec) => (
                <tr key={rec.cedula} className="border-t">
                  <td className="px-2 py-2">{rec.nombre}</td>
                  <td className="px-2 py-2">{rec.cedula}</td>
                  <td className="px-2 py-2 text-right">{formatCurrency(rec.salarioBase)}</td>
                  <td className="px-2 py-2 text-right">{formatCurrency(rec.montoHorasExtras)}</td>
                  <td className="px-2 py-2 text-right">{formatCurrency(rec.comisiones)}</td>
                  <td className="px-2 py-2 text-right">{formatCurrency(rec.incentivos)}</td>
                  <td className="px-2 py-2 text-right font-semibold">{formatCurrency(rec.totalIngresos)}</td>
                  <td className="px-2 py-2 text-right">{formatCurrency(rec.inssLaboral)}</td>
                  <td className="px-2 py-2 text-right">{formatCurrency(rec.ir)}</td>
                  <td className="px-2 py-2 text-right">{formatCurrency(rec.deducciones)}</td>
                  <td className="px-2 py-2 text-right">{formatCurrency(rec.totalDeducciones)}</td>
                  <td className="px-2 py-2 text-right font-semibold text-green-600">{formatCurrency(rec.salarioNeto)}</td>
                  <td className="px-2 py-2 text-right">{formatCurrency(rec.inssPatronal)}</td>
                  <td className="px-2 py-2 text-right">{formatCurrency(rec.inatec)}</td>
                  <td className="px-2 py-2 text-right font-semibold text-blue-600">{formatCurrency(rec.costoTotalEmpleador)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td className="px-2 py-2" colSpan={6}>TOTALES</td>
                <td className="px-2 py-2 text-right">{formatCurrency(totalBruto)}</td>
                <td className="px-2 py-2 text-right" colSpan={4}>{formatCurrency(totalDeducciones)}</td>
                <td className="px-2 py-2 text-right text-green-600">{formatCurrency(totalNeto)}</td>
                <td className="px-2 py-2 text-right" colSpan={2}>{formatCurrency(totalPatronal)}</td>
                <td className="px-2 py-2 text-right text-blue-600">{formatCurrency(totalBruto + totalPatronal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        {payrollRecords.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No hay empleados registrados para generar nómina</p>
        )}
      </div>

      {/* Botón de Imprimir */}
      <div className="text-center mt-6">
        <button
          onClick={() => window.print()}
          className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 print:hidden"
        >
          🖨️ Imprimir Planilla
        </button>
      </div>

      {/* Layout de Impresión - Planilla Horizontal */}
      <div className="hidden print:block bg-white text-black font-sans text-xs">
        <style>
          {`
            @page {
              size: A4 landscape;
              margin: 0.5cm;
            }
            .print-landscape {
              transform: rotate(0deg);
              transform-origin: center;
            }
          `}
        </style>
        <div className="p-2">
          <div className="text-center mb-4">
            <h1 className="text-lg font-bold">PLANILLA DE SALARIOS - {new Date().toLocaleDateString('es-NI')}</h1>
            <p className="text-sm">Siconfy ERP - Nómina Maestra</p>
          </div>

          <table className="w-full border-collapse border border-black text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black px-1 py-1 text-left">Nombre</th>
                <th className="border border-black px-1 py-1 text-left">Cédula</th>
                <th className="border border-black px-1 py-1 text-right">Salario Base</th>
                <th className="border border-black px-1 py-1 text-right">Horas Extras</th>
                <th className="border border-black px-1 py-1 text-right">Comisiones</th>
                <th className="border border-black px-1 py-1 text-right">Incentivos</th>
                <th className="border border-black px-1 py-1 text-right">Total Bruto</th>
                <th className="border border-black px-1 py-1 text-right">INSS Lab.</th>
                <th className="border border-black px-1 py-1 text-right">IR</th>
                <th className="border border-black px-1 py-1 text-right">Otras Ded.</th>
                <th className="border border-black px-1 py-1 text-right">Total Ded.</th>
                <th className="border border-black px-1 py-1 text-right">Salario Neto</th>
                <th className="border border-black px-1 py-1 text-right">INSS Pat.</th>
                <th className="border border-black px-1 py-1 text-right">INATEC</th>
                <th className="border border-black px-1 py-1 text-right">Costo Total</th>
              </tr>
            </thead>
            <tbody>
              {payrollRecords.map((rec) => (
                <tr key={rec.cedula}>
                  <td className="border border-black px-1 py-1">{rec.nombre}</td>
                  <td className="border border-black px-1 py-1">{rec.cedula}</td>
                  <td className="border border-black px-1 py-1 text-right">{formatCurrency(rec.salarioBase)}</td>
                  <td className="border border-black px-1 py-1 text-right">{formatCurrency(rec.montoHorasExtras)}</td>
                  <td className="border border-black px-1 py-1 text-right">{formatCurrency(rec.comisiones)}</td>
                  <td className="border border-black px-1 py-1 text-right">{formatCurrency(rec.incentivos)}</td>
                  <td className="border border-black px-1 py-1 text-right font-semibold">{formatCurrency(rec.totalIngresos)}</td>
                  <td className="border border-black px-1 py-1 text-right">{formatCurrency(rec.inssLaboral)}</td>
                  <td className="border border-black px-1 py-1 text-right">{formatCurrency(rec.ir)}</td>
                  <td className="border border-black px-1 py-1 text-right">{formatCurrency(rec.deducciones)}</td>
                  <td className="border border-black px-1 py-1 text-right">{formatCurrency(rec.totalDeducciones)}</td>
                  <td className="border border-black px-1 py-1 text-right font-semibold">{formatCurrency(rec.salarioNeto)}</td>
                  <td className="border border-black px-1 py-1 text-right">{formatCurrency(rec.inssPatronal)}</td>
                  <td className="border border-black px-1 py-1 text-right">{formatCurrency(rec.inatec)}</td>
                  <td className="border border-black px-1 py-1 text-right font-semibold">{formatCurrency(rec.costoTotalEmpleador)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td className="border border-black px-1 py-1" colSpan={6}>TOTALES</td>
                <td className="border border-black px-1 py-1 text-right">{formatCurrency(totalBruto)}</td>
                <td className="border border-black px-1 py-1 text-right" colSpan={4}>{formatCurrency(totalDeducciones)}</td>
                <td className="border border-black px-1 py-1 text-right">{formatCurrency(totalNeto)}</td>
                <td className="border border-black px-1 py-1 text-right" colSpan={2}>{formatCurrency(totalPatronal)}</td>
                <td className="border border-black px-1 py-1 text-right">{formatCurrency(totalBruto + totalPatronal)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="text-center text-xs text-gray-500 mt-4">
            <p>Generado por Siconfy ERP © 2025. Sistema de Gestión Empresarial</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PlanillaPage = memo(PlanillaPageComponent);