// src/pages/DocumentosPage.tsx
import React, { useState, useEffect } from 'react';
import { EmployeeService } from '../utils/dbService';
import type { Employee } from '../types';
import { formatCurrency } from '../utils/formatters';

export const DocumentosPage = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [docType, setDocType] = useState<'contrato' | 'constancia' | 'renuncia' | 'despido' | 'carta'>('constancia');

    useEffect(() => {
        setEmployees(EmployeeService.getAll());
    }, []);

    const handlePrint = () => window.print();

    // --- TEXTOS LEGALES COMPLETOS RESTAURADOS ---
    const renderDocumentContent = () => {
        if (!selectedEmployee) return <div className="text-gray-500 text-center py-10">Seleccione un empleado para visualizar el documento.</div>;

        const date = new Date().toLocaleDateString('es-NI', { year: 'numeric', month: 'long', day: 'numeric' });
        const companyName = "Jodidos Pero Contentos S.A";

        return (
            <div className="font-serif text-black leading-relaxed text-justify">
                {/* 1. CONSTANCIA SALARIAL */}
                {docType === 'constancia' && (
                    <>
                        <div className="text-right mb-12">
                            <p>Managua, {date}</p>
                        </div>
                        <h2 className="text-center font-bold text-xl mb-12 uppercase underline">CONSTANCIA SALARIAL</h2>
                        <p className="mb-6 font-bold">A QUIEN INTERESE:</p>
                        <p className="mb-6">
                            Por medio de la presente hacemos constar que el Sr(a). <strong>{selectedEmployee.nombre}</strong>, 
                            identificado con cédula de identidad No. <strong>{selectedEmployee.cedula}</strong> y No. INSS <strong>{selectedEmployee.noInss || 'N/A'}</strong>, 
                            labora para nuestra empresa <strong>{companyName}</strong> desde el <strong>{selectedEmployee.fechaIngreso}</strong>, 
                            desempeñando el cargo de <strong>{selectedEmployee.cargo}</strong>.
                        </p>
                        <p className="mb-6">
                            Hacemos constar que su ingreso mensual bruto es de <strong>{formatCurrency(selectedEmployee.salarioBase)}</strong> ({selectedEmployee.frecuenciaPago}).
                        </p>
                        <p className="mb-12">
                            Se extiende la presente solicitud del interesado para los fines que estime convenientes.
                        </p>
                        <div className="mt-32 pt-4 border-t border-black w-64 text-center mx-auto">
                            <p className="font-bold">Recursos Humanos</p>
                            <p>{companyName}</p>
                        </div>
                    </>
                )}

                {/* 2. CARTA DE RENUNCIA */}
                {docType === 'renuncia' && (
                    <>
                        <div className="text-right mb-10">
                            <p className="font-bold">Managua, {date}</p>
                        </div>
                        <p className="mb-2 font-bold">Señores</p>
                        <p className="mb-2 font-bold">Recursos Humanos</p>
                        <p className="mb-8 font-bold">{companyName}</p>
                        <p className="mb-6">Estimados señores:</p>
                        <p className="mb-6">
                            Yo, <strong>{selectedEmployee.nombre}</strong>, identificado con cédula de identidad No. <strong>{selectedEmployee.cedula}</strong>, 
                            por este medio presento mi <strong>RENUNCIA IRREVOCABLE</strong> al cargo de <strong>{selectedEmployee.cargo}</strong> que he venido desempeñando en esta empresa.
                        </p>
                        <p className="mb-6">
                            Esta renuncia será efectiva a partir del día [FECHA EFECTIVA], cumpliendo con el preaviso de ley correspondiente.
                        </p>
                        <p className="mb-6">
                            Agradezco la oportunidad que se me brindó de formar parte de su equipo de trabajo y el apoyo recibido durante mi gestión.
                        </p>
                        <p className="mb-12">Atentamente,</p>
                        <div className="mt-24 pt-4 border-t border-black w-64">
                            <p className="font-bold">{selectedEmployee.nombre}</p>
                            <p>Cédula: {selectedEmployee.cedula}</p>
                        </div>
                    </>
                )}

                {/* 3. CONTRATO LABORAL */}
                {docType === 'contrato' && (
                    <div className="text-sm">
                        <h2 className="text-center font-bold text-lg mb-8 uppercase">CONTRATO INDIVIDUAL DE TRABAJO</h2>
                        <p className="mb-6">
                            Nosotros: <strong>{companyName}</strong>, sociedad constituida bajo las leyes de la República de Nicaragua, denominada en adelante EL EMPLEADOR; 
                            y <strong>{selectedEmployee.nombre}</strong>, mayor de edad, con cédula No. <strong>{selectedEmployee.cedula}</strong>, denominado en adelante EL TRABAJADOR, 
                            hemos convenido celebrar el presente Contrato de Trabajo:
                        </p>
                        <ol className="list-decimal pl-8 space-y-4 mb-8">
                            <li><strong>DEL OBJETO:</strong> El Trabajador se obliga a prestar sus servicios personales bajo la dependencia directa del Empleador en el cargo de <strong>{selectedEmployee.cargo}</strong>.</li>
                            <li><strong>DE LA JORNADA:</strong> La jornada de trabajo será de 48 horas semanales, distribuidas según las necesidades de la empresa.</li>
                            <li><strong>DEL SALARIO:</strong> El Empleador pagará al Trabajador un salario de <strong>{formatCurrency(selectedEmployee.salarioBase)}</strong> pagaderos de forma {selectedEmployee.frecuenciaPago}, sujeto a las deducciones de Ley (INSS e IR).</li>
                            <li><strong>VIGENCIA:</strong> Este contrato surte efecto a partir del <strong>{selectedEmployee.fechaIngreso}</strong> y es por tiempo Indeterminado.</li>
                            <li><strong>OBLIGACIONES:</strong> Ambas partes se someten a las disposiciones del Código del Trabajo vigente.</li>
                        </ol>
                        <p className="mb-12">
                            En fe de lo cual firmamos en dos ejemplares de un mismo tenor, en la ciudad de Managua, el {date}.
                        </p>
                        <div className="flex justify-between mt-24 px-8">
                            <div className="border-t border-black w-48 text-center pt-2">
                                <p className="font-bold">EL EMPLEADOR</p>
                                <p className="text-xs">{companyName}</p>
                            </div>
                            <div className="border-t border-black w-48 text-center pt-2">
                                <p className="font-bold">EL TRABAJADOR</p>
                                <p className="text-xs">{selectedEmployee.nombre}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. CARTA DE DESPIDO (ART 45) */}
                {docType === 'despido' && (
                    <>
                        <h2 className="text-center font-bold text-xl mb-12 uppercase">NOTIFICACIÓN DE TERMINACIÓN DE CONTRATO</h2>
                        <div className="text-right mb-10">
                            <p>Managua, {date}</p>
                        </div>
                        <p className="mb-4">Señor(a): <strong>{selectedEmployee.nombre}</strong></p>
                        <p className="mb-8">Cargo: {selectedEmployee.cargo}</p>
                        <p className="mb-6">Estimado(a) Señor(a):</p>
                        <p className="mb-6">
                            Por este medio le notificamos que la Dirección de la Empresa ha decidido dar por terminado su contrato de trabajo, 
                            con efectos a partir del día de hoy, haciendo uso de la facultad que le confiere el <strong>Artículo 45</strong> del Código del Trabajo vigente.
                        </p>
                        <p className="mb-6">
                            Le agradecemos presentarse al departamento de Recursos Humanos para realizar los trámites correspondientes a su liquidación final y pago de prestaciones sociales de ley.
                        </p>
                        <p className="mb-6">Sin otro particular a que hacer referencia.</p>
                        <div className="mt-32 pt-4 border-t border-black w-64">
                            <p className="font-bold">Gerencia General</p>
                            <p>{companyName}</p>
                        </div>
                    </>
                )}

                {/* 5. CARTA DE RECOMENDACIÓN */}
                {docType === 'carta' && (
                    <>
                        <h2 className="text-center font-bold text-xl mb-12 uppercase underline">CARTA DE RECOMENDACIÓN</h2>
                        <p className="mb-8 font-bold">A QUIEN CORRESPONDA:</p>
                        <p className="mb-6">
                            Suscribo la presente para certificar que el Sr(a). <strong>{selectedEmployee.nombre}</strong>, 
                            identificado con cédula No. <strong>{selectedEmployee.cedula}</strong>, laboró bajo mi supervisión en 
                            <strong> {companyName}</strong>, desempeñando el cargo de <strong>{selectedEmployee.cargo}</strong>.
                        </p>
                        <p className="mb-6">
                            Durante el tiempo que laboró con nosotros, desde el <strong>{selectedEmployee.fechaIngreso}</strong>, 
                            demostró ser una persona honesta, eficiente, responsable y con gran espíritu de colaboración.
                        </p>
                        <p className="mb-6">
                            Por sus méritos personales y profesionales, no tengo inconveniente en recomendarlo ampliamente para cualquier cargo que desee aplicar.
                        </p>
                        <p className="mb-12">
                            Dado en la ciudad de Managua, a los {date}.
                        </p>
                        <div className="mt-32 pt-4 border-t border-black w-64">
                            <p className="font-bold">Gerente General</p>
                            <p>{companyName}</p>
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto p-4">
            {/* PANEL DE CONTROL (Oculto al imprimir) */}
            <div className="print:hidden flex flex-col md:flex-row gap-6 mb-8">
                <div className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h2 className="text-lg font-bold mb-4 text-gray-700">Generar Documento</h2>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2">1. Seleccionar Empleado</label>
                        <select className="w-full border p-2 rounded bg-gray-50" onChange={e => setSelectedEmployee(employees.find(x => x.id === parseInt(e.target.value)) || null)}>
                            <option value="">-- Seleccionar --</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                        </select>
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-sm font-bold mb-2">2. Tipo de Documento</label>
                        <div className="space-y-2">
                            {[
                                {id: 'constancia', label: '📄 Constancia Salarial'},
                                {id: 'contrato', label: '📝 Contrato Laboral'},
                                {id: 'renuncia', label: '👋 Carta de Renuncia'},
                                {id: 'despido', label: '🚫 Despido (Art 45)'},
                                {id: 'carta', label: '🤝 Carta Recomendación'}
                            ].map((doc) => (
                                <button key={doc.id} onClick={() => setDocType(doc.id as any)} 
                                    className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition ${docType === doc.id ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                                    {doc.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button onClick={handlePrint} disabled={!selectedEmployee} className="w-full bg-slate-800 text-white py-3 rounded font-bold hover:bg-slate-900 disabled:opacity-50 transition shadow-lg">
                        🖨️ IMPRIMIR DOCUMENTO
                    </button>
                </div>

                {/* VISTA PREVIA (Pantalla) */}
                <div className="w-full md:w-2/3 bg-gray-200 p-8 rounded border flex justify-center overflow-y-auto max-h-[800px]">
                    <div className="bg-white shadow-xl w-[21.59cm] min-h-[27.94cm] p-[2.5cm] origin-top transform scale-90">
                        {renderDocumentContent()}
                    </div>
                </div>
            </div>

            {/* ESTILOS DE IMPRESIÓN */}
            <style>{`
                @media print {
                    @page {
                        size: letter;
                        margin: 2.5cm;
                    }
                    body * { visibility: hidden; }
                    #printable-area, #printable-area * { visibility: visible; }
                    #printable-area {
                        position: absolute;
                        left: 0; top: 0; width: 100%;
                    }
                }
            `}</style>

            {/* ÁREA IMPRIMIBLE */}
            <div id="printable-area" className="hidden print:block bg-white text-black">
                {renderDocumentContent()}
            </div>
        </div>
    );
};