import React, { useState, useEffect, useMemo } from 'react';
import { EmployeeService } from '../utils/dbService';
import { calcularLiquidacion } from '../utils/liquidacion';
import { formatCurrency } from '../utils/formatters';
import type { Employee } from '../types';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportPreviewModal } from '../components/reports/ReportPreviewModal';

export const ProvisionesPage = () => {
    const [activeTab, setActiveTab] = useState<'vacaciones' | 'indemnizacion' | 'aguinaldo' | 'resumen'>('resumen');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        setEmployees(EmployeeService.getAll().filter(e => e.estado === 'Activo'));
    }, []);

    // --- CÁLCULOS CENTRALIZADOS ---
    const reportData = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];

        return employees.map(emp => {
            const liquidacion = calcularLiquidacion(
                emp.fechaIngreso,
                today,
                emp.salarioBase,
                emp.diasVacacionesAcumulados || 0,
                0,
                'renuncia'
            );

            return {
                ...emp,
                liq: liquidacion,
                antiguedadTexto: `${liquidacion.antiguedadAños} años, ${liquidacion.antiguedadMeses} meses`
            };
        });
    }, [employees]);

    // --- TOTALES ---
    const totalVacaciones = reportData.reduce((sum, item) => sum + item.liq.montoVacaciones, 0);
    const totalIndemnizacion = reportData.reduce((sum, item) => sum + item.liq.montoIndemnizacion, 0);
    const totalAguinaldo = reportData.reduce((sum, item) => sum + item.liq.montoAguinaldo, 0);
    const granTotal = totalVacaciones + totalIndemnizacion + totalAguinaldo;

    // --- EXPORT HANDLERS ---
    const handleExportExcel = () => {
        let data: any[] = [];
        let fileName = `Reporte_${activeTab}_${new Date().toISOString().split('T')[0]}`;

        if (activeTab === 'resumen') {
            data = reportData.map(r => ({
                "Empleado": r.nombre,
                "Vacaciones": r.liq.montoVacaciones,
                "Indemnización": r.liq.montoIndemnizacion,
                "Aguinaldo": r.liq.montoAguinaldo,
                "Total Pasivo": r.liq.netoRecibir
            }));
            // Agregar fila de totales
            data.push({
                "Empleado": "TOTALES",
                "Vacaciones": totalVacaciones,
                "Indemnización": totalIndemnizacion,
                "Aguinaldo": totalAguinaldo,
                "Total Pasivo": granTotal
            });
        } else if (activeTab === 'vacaciones') {
            data = reportData.map(r => ({
                "Empleado": r.nombre,
                "Días Acumulados": r.diasVacacionesAcumulados?.toFixed(2),
                "Salario Diario": r.liq.salarioDiario,
                "Monto (C$)": r.liq.montoVacaciones
            }));
        } else if (activeTab === 'indemnizacion') {
            data = reportData.map(r => ({
                "Empleado": r.nombre,
                "Fecha Ingreso": r.fechaIngreso,
                "Antigüedad": r.antiguedadTexto,
                "Salario Mensual": r.salarioBase,
                "Monto (C$)": r.liq.montoIndemnizacion
            }));
        } else if (activeTab === 'aguinaldo') {
            data = reportData.map(r => ({
                "Empleado": r.nombre,
                "Fecha Corte": new Date().toLocaleDateString(),
                "Aguinaldo Acumulado": r.liq.montoAguinaldo
            }));
        }

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, activeTab.toUpperCase());
        XLSX.writeFile(wb, `${fileName}.xlsx`);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const title = `Reporte de ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`;

        doc.setFontSize(18);
        doc.text(title, 14, 15);

        doc.setFontSize(10);
        doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, 14, 22);

        // Totales en encabezado si es resumen
        if (activeTab === 'resumen') {
            doc.setFontSize(12);
            doc.text(`Total Pasivo Laboral: ${formatCurrency(granTotal)}`, 14, 30);
        }

        let head: any[] = [];
        let body: any[] = [];

        if (activeTab === 'resumen') {
            head = [['Empleado', 'Vacaciones', 'Indemnización', 'Aguinaldo', 'Total']];
            body = reportData.map(r => [
                r.nombre,
                formatCurrency(r.liq.montoVacaciones),
                formatCurrency(r.liq.montoIndemnizacion),
                formatCurrency(r.liq.montoAguinaldo),
                formatCurrency(r.liq.netoRecibir)
            ]);
        } else if (activeTab === 'vacaciones') {
            head = [['Empleado', 'Días Acum.', 'Salario Diario', 'Monto']];
            body = reportData.map(r => [
                r.nombre,
                r.diasVacacionesAcumulados?.toFixed(2),
                formatCurrency(r.liq.salarioDiario),
                formatCurrency(r.liq.montoVacaciones)
            ]);
        } else if (activeTab === 'indemnizacion') {
            head = [['Empleado', 'Ingresó', 'Antigüedad', 'Salario', 'Monto']];
            body = reportData.map(r => [
                r.nombre,
                r.fechaIngreso,
                r.antiguedadTexto,
                formatCurrency(r.salarioBase),
                formatCurrency(r.liq.montoIndemnizacion)
            ]);
        } else if (activeTab === 'aguinaldo') {
            head = [['Empleado', 'Fecha Corte', 'Monto Acumulado']];
            body = reportData.map(r => [
                r.nombre,
                new Date().toLocaleDateString(),
                formatCurrency(r.liq.montoAguinaldo)
            ]);
        }

        autoTable(doc, {
            startY: activeTab === 'resumen' ? 35 : 25,
            head: head,
            body: body,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185] },
        });

        doc.save(`Reporte_${activeTab}.pdf`);
    };

    // --- CONTENIDO DEL REPORTE PARA VISTA/PREVIEW ---
    const renderReportContent = () => (
        <>
            {/* TAB: RESUMEN */}
            {activeTab === 'resumen' && (
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 print:grid-cols-2 print:gap-4">
                        <div className="p-4 bg-emerald-50 rounded border border-emerald-100 print:border-black">
                            <h3 className="text-emerald-800 text-xs font-bold uppercase mb-1 print:text-black">Vacaciones Acumuladas</h3>
                            <p className="text-2xl font-mono font-bold text-emerald-700 print:text-black">{formatCurrency(totalVacaciones)}</p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded border border-orange-100 print:border-black">
                            <h3 className="text-orange-800 text-xs font-bold uppercase mb-1 print:text-black">Indemnización (Antigüedad)</h3>
                            <p className="text-2xl font-mono font-bold text-orange-700 print:text-black">{formatCurrency(totalIndemnizacion)}</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded border border-purple-100 print:border-black">
                            <h3 className="text-purple-800 text-xs font-bold uppercase mb-1 print:text-black">Aguinaldo Proporcional</h3>
                            <p className="text-2xl font-mono font-bold text-purple-700 print:text-black">{formatCurrency(totalAguinaldo)}</p>
                        </div>
                        <div className="p-4 bg-slate-800 rounded border border-slate-700 print:bg-white print:border-black">
                            <h3 className="text-slate-300 text-xs font-bold uppercase mb-1 print:text-black">Pasivo Laboral Total</h3>
                            <p className="text-2xl font-mono font-bold text-white print:text-black">{formatCurrency(granTotal)}</p>
                        </div>
                    </div>

                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 text-xs uppercase text-gray-500 print:bg-white print:text-black print:border-b">
                            <tr>
                                <th className="p-3">Empleado</th>
                                <th className="p-3 text-right">Vacaciones</th>
                                <th className="p-3 text-right">Indemnización</th>
                                <th className="p-3 text-right">Aguinaldo</th>
                                <th className="p-3 text-right font-bold">Total Pasivo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                            {reportData.map(row => (
                                <tr key={row.id} className="hover:bg-gray-50 print:hover:bg-transparent">
                                    <td className="p-3 font-medium text-gray-700 print:text-black">{row.nombre}</td>
                                    <td className="p-3 text-right font-mono text-emerald-600 print:text-black">{formatCurrency(row.liq.montoVacaciones)}</td>
                                    <td className="p-3 text-right font-mono text-orange-600 print:text-black">{formatCurrency(row.liq.montoIndemnizacion)}</td>
                                    <td className="p-3 text-right font-mono text-purple-600 print:text-black">{formatCurrency(row.liq.montoAguinaldo)}</td>
                                    <td className="p-3 text-right font-mono font-bold text-slate-700 print:text-black">{formatCurrency(row.liq.netoRecibir)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TAB: VACACIONES */}
            {activeTab === 'vacaciones' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-emerald-50 text-emerald-800 text-xs uppercase print:bg-white print:text-black print:border-b">
                            <tr>
                                <th className="p-3">Empleado</th>
                                <th className="p-3 text-center">Días Acumulados</th>
                                <th className="p-3 text-right">Salario Diario</th>
                                <th className="p-3 text-right">Monto (C$)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                            {reportData.map(row => (
                                <tr key={row.id}>
                                    <td className="p-3 font-medium">{row.nombre}</td>
                                    <td className="p-3 text-center">{row.diasVacacionesAcumulados?.toFixed(2) || '0.00'}</td>
                                    <td className="p-3 text-right font-mono text-gray-500 print:text-black">{formatCurrency(row.liq.salarioDiario)}</td>
                                    <td className="p-3 text-right font-mono font-bold text-emerald-600 print:text-black">{formatCurrency(row.liq.montoVacaciones)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-emerald-50 text-emerald-800 font-bold print:bg-gray-100 print:text-black border-t-2 border-emerald-100">
                            <tr>
                                <td className="p-3 text-right" colSpan={3}>TOTAL GENERAL:</td>
                                <td className="p-3 text-right font-mono text-lg">{formatCurrency(totalVacaciones)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}

            {/* TAB: INDEMNIZACION */}
            {activeTab === 'indemnizacion' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-orange-50 text-orange-800 text-xs uppercase print:bg-white print:text-black print:border-b">
                            <tr>
                                <th className="p-3">Empleado</th>
                                <th className="p-3">Fecha Ingreso</th>
                                <th className="p-3">Antigüedad</th>
                                <th className="p-3 text-right">Salario Mensual</th>
                                <th className="p-3 text-right">Monto (C$)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                            {reportData.map(row => (
                                <tr key={row.id}>
                                    <td className="p-3 font-medium">{row.nombre}</td>
                                    <td className="p-3 text-gray-500 print:text-black">{row.fechaIngreso}</td>
                                    <td className="p-3 text-gray-500 print:text-black">{row.antiguedadTexto}</td>
                                    <td className="p-3 text-right font-mono text-gray-500 print:text-black">{formatCurrency(row.salarioBase)}</td>
                                    <td className="p-3 text-right font-mono font-bold text-orange-600 print:text-black">{formatCurrency(row.liq.montoIndemnizacion)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-orange-50 text-orange-800 font-bold print:bg-gray-100 print:text-black border-t-2 border-orange-100">
                            <tr>
                                <td className="p-3 text-right" colSpan={4}>TOTAL GENERAL:</td>
                                <td className="p-3 text-right font-mono text-lg">{formatCurrency(totalIndemnizacion)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}

            {/* TAB: AGUINALDO */}
            {activeTab === 'aguinaldo' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-purple-50 text-purple-800 text-xs uppercase print:bg-white print:text-black print:border-b">
                            <tr>
                                <th className="p-3">Empleado</th>
                                <th className="p-3">Fecha Corte</th>
                                <th className="p-3 text-right">Aguinaldo Acumulado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                            {reportData.map(row => (
                                <tr key={row.id}>
                                    <td className="p-3 font-medium">{row.nombre}</td>
                                    <td className="p-3 text-gray-500 print:text-black">{new Date().toLocaleDateString()}</td>
                                    <td className="p-3 text-right font-mono font-bold text-purple-600 print:text-black">{formatCurrency(row.liq.montoAguinaldo)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-purple-50 text-purple-800 font-bold print:bg-gray-100 print:text-black border-t-2 border-purple-100">
                            <tr>
                                <td className="p-3 text-right" colSpan={2}>TOTAL GENERAL:</td>
                                <td className="p-3 text-right font-mono text-lg">{formatCurrency(totalAguinaldo)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
        </>
    );

    return (
        <div className="p-4 md:p-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Reporte de Provisiones</h1>

                {/* BOTONES DE EXPORTACIÓN */}
                <div className="flex gap-2">
                    <button onClick={() => setShowPreview(true)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg shadow transition-all font-bold text-xs uppercase">
                        <span>👁️</span> Vista Previa
                    </button>
                    <button onClick={handleExportExcel} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg shadow transition-all font-bold text-xs uppercase">
                        <span>📊</span> Excel
                    </button>
                    <button onClick={handleExportPDF} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg shadow transition-all font-bold text-xs uppercase">
                        <span>📄</span> PDF
                    </button>
                    <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg shadow transition-all font-bold text-xs uppercase">
                        <span>🖨️</span> Imprimir
                    </button>
                </div>
            </div>

            {/* TABS */}
            <div className="flex space-x-1 mb-6 border-b border-gray-200 overflow-x-auto print:hidden">
                <button onClick={() => setActiveTab('resumen')} className={`px-4 py-2 text-sm font-bold uppercase transition-colors ${activeTab === 'resumen' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Resumen General</button>
                <button onClick={() => setActiveTab('vacaciones')} className={`px-4 py-2 text-sm font-bold uppercase transition-colors ${activeTab === 'vacaciones' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}>Vacaciones</button>
                <button onClick={() => setActiveTab('indemnizacion')} className={`px-4 py-2 text-sm font-bold uppercase transition-colors ${activeTab === 'indemnizacion' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}>Indemnización</button>
                <button onClick={() => setActiveTab('aguinaldo')} className={`px-4 py-2 text-sm font-bold uppercase transition-colors ${activeTab === 'aguinaldo' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>Aguinaldo</button>
            </div>

            {/* CONTENIDO (RENDERIZADO) */}
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden print:shadow-none print:border-none">
                {renderReportContent()}
            </div>

            {/* MODAL DE VISTA PREVIA */}
            <ReportPreviewModal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                title={`Reporte de ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
            >
                {renderReportContent()}
            </ReportPreviewModal>
            {/* ESTILOS DE IMPRESIÓN */}
            <style>{`
                @media print {
                    @page { size: portrait; margin: 5mm; }
                    .print\\:hidden { display: none !important; }
                    body { -webkit-print-color-adjust: exact; }
                }
            `}</style>
        </div>
    );
};
