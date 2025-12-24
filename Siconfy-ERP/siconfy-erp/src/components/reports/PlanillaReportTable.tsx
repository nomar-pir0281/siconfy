import React from 'react';
import { formatCurrencyForTable } from '../../utils/formatters';

interface PlanillaRow {
    id: number;
    cedula: string;
    nombre: string;
    cargo: string;
    salarioBasePeriodo: number;
    totalIngresos: number;
    inssLaboral: number;
    ir: number;
    detalleOtrasDeducciones: number;
    totalDeducciones: number;
    salarioNeto: number;
    // Others used in map but not in table interface explicity for now or handled via generic
}

interface PlanillaReportTableProps {
    data: any[];
}

export const PlanillaReportTable = ({ data }: PlanillaReportTableProps) => {
    return (
        <table className="w-full text-[9px] text-left border-collapse">
            <thead className="bg-gray-100 border-b-2 border-gray-300 uppercase">
                <tr>
                    <th className="p-1 border-r text-center w-6">No</th>
                    <th className="p-1 border-r text-center w-20">Cédula</th>
                    <th className="p-1 border-r w-40">Nombre</th>
                    <th className="p-1 border-r text-right">Salario Base</th>
                    <th className="p-1 border-r text-right">Comis.</th>
                    <th className="p-1 border-r text-right">Incent.</th>
                    <th className="p-1 border-r text-right">Viáticos</th>
                    <th className="p-1 border-r text-right">Vacac.</th>
                    <th className="p-1 border-r text-right">H.Ext.</th>
                    <th className="p-1 border-r text-right">Otros</th>
                    <th className="p-1 border-r text-right font-bold bg-green-50">T.Ingresos</th>
                    <th className="p-1 border-r text-right">INSS P.</th>
                    <th className="p-1 border-r text-right">IR</th>
                    <th className="p-1 border-r text-right">Otras Ded.</th>
                    <th className="p-1 border-r text-right font-bold bg-red-50">T.Deduc.</th>
                    <th className="p-1 border-r text-right font-black bg-blue-50">Neto</th>
                    <th className="p-1 text-center bg-gray-50 text-gray-400 italic w-16">Firma</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {data.map((row, idx) => (
                    <tr key={row.id || idx}>
                        <td className="p-1 border-r text-center">{idx + 1}</td>
                        <td className="p-1 border-r text-center font-mono text-[8px] whitespace-nowrap">{row.cedula || '---'}</td>
                        <td className="p-1 border-r truncate max-w-[120px] font-medium">{row.nombre || 'Empleado'}</td>
                        <td className="p-1 border-r text-right font-mono">{formatCurrencyForTable(row.salarioBasePeriodo || 0)}</td>
                        <td className="p-1 border-r text-right font-mono">{formatCurrencyForTable(row.comisiones || 0)}</td>
                        <td className="p-1 border-r text-right font-mono">{formatCurrencyForTable(row.incentivos || 0)}</td>
                        <td className="p-1 border-r text-right font-mono">{formatCurrencyForTable(row.viaticos || 0)}</td>
                        <td className="p-1 border-r text-right font-mono">{formatCurrencyForTable(row.montoVacaciones || 0)}</td>
                        <td className="p-1 border-r text-right font-mono">{formatCurrencyForTable(row.montoHorasExtras || 0)}</td>
                        <td className="p-1 border-r text-right font-mono">{formatCurrencyForTable(row.ingresosNoDeducibles || 0)}</td>
                        <td className="p-1 border-r text-right font-mono text-emerald-700 font-bold bg-green-50/30">{formatCurrencyForTable(row.totalIngresos || 0)}</td>
                        <td className="p-1 border-r text-right font-mono text-red-600">{formatCurrencyForTable(row.inssLaboral || 0)}</td>
                        <td className="p-1 border-r text-right font-mono text-red-600">{formatCurrencyForTable(row.ir || 0)}</td>
                        <td className="p-1 border-r text-right font-mono text-gray-600">{formatCurrencyForTable(row.detalleOtrasDeducciones || 0)}</td>
                        <td className="p-1 border-r text-right font-mono text-red-700 font-bold bg-red-50/30">{formatCurrencyForTable(row.totalDeducciones || 0)}</td>
                        <td className="p-1 border-r text-right font-mono font-black bg-blue-50/30">{formatCurrencyForTable(row.salarioNeto || 0)}</td>
                        <td className="p-1 border-b border-gray-200"></td>
                    </tr>
                ))}
            </tbody>
            <tfoot className="border-t-2 border-gray-400 font-bold bg-gray-50 text-[10px]">
                <tr>
                    <td colSpan={3} className="p-1 text-right">TOTALES:</td>
                    <td className="p-1 text-right">{formatCurrencyForTable(data.reduce((sum, r) => sum + (r.salarioBasePeriodo || 0), 0))}</td>
                    <td className="p-1 text-right">{formatCurrencyForTable(data.reduce((sum, r) => sum + (r.comisiones || 0), 0))}</td>
                    <td className="p-1 text-right">{formatCurrencyForTable(data.reduce((sum, r) => sum + (r.incentivos || 0), 0))}</td>
                    <td className="p-1 text-right">{formatCurrencyForTable(data.reduce((sum, r) => sum + (r.viaticos || 0), 0))}</td>
                    <td className="p-1 text-right">{formatCurrencyForTable(data.reduce((sum, r) => sum + (r.montoVacaciones || 0), 0))}</td>
                    <td className="p-1 text-right">{formatCurrencyForTable(data.reduce((sum, r) => sum + (r.montoHorasExtras || 0), 0))}</td>
                    <td className="p-1 text-right">{formatCurrencyForTable(data.reduce((sum, r) => sum + (r.ingresosNoDeducibles || 0), 0))}</td>
                    <td className="p-1 text-right">{formatCurrencyForTable(data.reduce((sum, r) => sum + (r.totalIngresos || 0), 0))}</td>
                    <td className="p-1 text-right">{formatCurrencyForTable(data.reduce((sum, r) => sum + (r.inssLaboral || 0), 0))}</td>
                    <td className="p-1 text-right">{formatCurrencyForTable(data.reduce((sum, r) => sum + (r.ir || 0), 0))}</td>
                    <td className="p-1 text-right">{formatCurrencyForTable(data.reduce((sum, r) => sum + (r.detalleOtrasDeducciones || 0), 0))}</td>
                    <td className="p-1 text-right">{formatCurrencyForTable(data.reduce((sum, r) => sum + (r.totalDeducciones || 0), 0))}</td>
                    <td className="p-1 text-right font-black">{formatCurrencyForTable(data.reduce((sum, r) => sum + (r.salarioNeto || 0), 0))}</td>
                    <td></td>
                </tr>
            </tfoot>
        </table>
    );
};
