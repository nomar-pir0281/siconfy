// src/pages/DocumentosPage.tsx
import React, { useState, useEffect } from 'react';
import { EmployeeService } from '../utils/dbService';
import type { Employee } from '../types';
import { formatCurrency } from '../utils/formatters';

export const DocumentosPage = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [docType, setDocType] = useState<'contrato' | 'constancia' | 'renuncia' | 'despido' | 'carta'>('constancia');

    const [companyName, setCompanyName] = useState(() => {
        const saved = localStorage.getItem('siconfy_company_info');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return parsed.razonSocial || 'Siconfy S.A.';
            } catch {
                return 'Siconfy S.A.';
            }
        }
        return 'Siconfy S.A.';
    });

    // Estados para entrada manual
    const [manualName, setManualName] = useState('');
    const [manualCedula, setManualCedula] = useState('');
    const [manualCargo, setManualCargo] = useState('');

    useEffect(() => {
        setEmployees(EmployeeService.getAll());
    }, []);

    const handlePrint = () => window.print();

    // Determinar qué datos usar (Seleccionado vs Manual)
    const activeEmployee = selectedEmployee || (manualName ? {
        id: 0,
        nombre: manualName,
        cedula: manualCedula || '___-______-____L',
        cargo: manualCargo || '__________________',
        noInss: '___________',
        fechaIngreso: new Date().toLocaleDateString('es-NI'),
        salarioBase: 0,
        frecuenciaPago: 'Mensual',
        estado: 'Activo'
    } as Employee : null);

    // --- RENDERIZADO POR PÁGINAS ---
    const getDocumentPages = (): React.ReactElement[] => {
        if (!activeEmployee) return [<div className="text-gray-500 text-center py-10">Seleccione un empleado o ingrese los datos manualmente.</div>];

        const date = new Date().toLocaleDateString('es-NI', { year: 'numeric', month: 'long', day: 'numeric' });

        // ESTILOS COMUNES
        const containerClass = "font-serif text-black leading-relaxed text-justify h-full flex flex-col";

        // 1. CONSTANCIA SALARIAL (1 Página)
        if (docType === 'constancia') {
            return [(
                <div className={containerClass}>
                    <div className="text-right mb-12"><p>Managua, {date}</p></div>
                    <h2 className="text-center font-bold text-xl mb-12 uppercase underline">CONSTANCIA SALARIAL</h2>
                    <p className="mb-6 font-bold">A QUIEN INTERESE:</p>
                    <p className="mb-6">Por medio de la presente hacemos constar que el Sr(a). <strong>{activeEmployee.nombre}</strong>, identificado con cédula de identidad No. <strong>{activeEmployee.cedula}</strong> y No. INSS <strong>{activeEmployee.noInss || 'N/A'}</strong>, labora para nuestra empresa <strong>{companyName}</strong> desde el <strong>{activeEmployee.fechaIngreso}</strong>, desempeñando el cargo de <strong>{activeEmployee.cargo}</strong>.</p>
                    <p className="mb-6">Hacemos constar que su ingreso mensual bruto es de <strong>{formatCurrency(activeEmployee.salarioBase)}</strong> ({activeEmployee.frecuenciaPago}).</p>
                    <p className="mb-12">Se extiende la presente solicitud del interesado para los fines que estime convenientes.</p>
                    <div className="mt-auto pt-4 border-t border-black w-64 text-center mx-auto mb-20">
                        <p className="font-bold">Recursos Humanos</p>
                        <p>{companyName}</p>
                    </div>
                </div>
            )];
        }

        // 2. CARTA DE RENUNCIA (1 Página)
        if (docType === 'renuncia') {
            return [(
                <div className={containerClass}>
                    <div className="text-right mb-10"><p className="font-bold">Managua, {date}</p></div>
                    <p className="mb-2 font-bold">Señores</p>
                    <p className="mb-2 font-bold">Recursos Humanos</p>
                    <p className="mb-8 font-bold">{companyName}</p>
                    <p className="mb-6">Estimados señores:</p>
                    <p className="mb-6">Yo, <strong>{activeEmployee.nombre}</strong>, identificado con cédula de identidad No. <strong>{activeEmployee.cedula}</strong>, por este medio presento mi <strong>RENUNCIA IRREVOCABLE</strong> al cargo de <strong>{activeEmployee.cargo}</strong> que he venido desempeñando en esta empresa.</p>
                    <p className="mb-6">Esta renuncia será efectiva a partir del día [FECHA EFECTIVA], cumpliendo con el preaviso de ley correspondiente.</p>
                    <p className="mb-6">Agradezco la oportunidad que se me brindó de formar parte de su equipo de trabajo y el apoyo recibido durante mi gestión.</p>
                    <p className="mb-12">Atentamente,</p>
                    <div className="mt-auto pt-4 border-t border-black w-64 mb-20">
                        <p className="font-bold">{activeEmployee.nombre}</p>
                        <p>Cédula: {activeEmployee.cedula}</p>
                    </div>
                </div>
            )];
        }

        // 3. CONTRATO LABORAL (2 Páginas)
        if (docType === 'contrato') {
            // PÁGINA 1
            const page1 = (
                <div className={`${containerClass} text-sm`}>
                    <h2 className="text-center font-bold text-lg mb-6 uppercase border-b-2 border-black pb-1 inline-block">CONTRATO INDIVIDUAL DE TRABAJO</h2>
                    <p className="mb-6 indent-8">En la ciudad de Managua, a los <strong>{new Date().toLocaleDateString('es-NI', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>. Nosotros: <strong>{companyName}</strong>, sociedad anónima constituida bajo las leyes de la República de Nicaragua, representada en este acto por Recursos Humanos, denominada en adelante <strong>EL EMPLEADOR</strong>; y <strong>{activeEmployee.nombre}</strong>, mayor de edad, identificado con cédula de identidad No. <strong>{activeEmployee.cedula}</strong>, denominado en adelante <strong>EL TRABAJADOR</strong>, hemos convenido celebrar el presente Contrato de Trabajo:</p>

                    <div className="space-y-4 text-justify">
                        <p><strong>PRIMERA (DEL OBJETO Y CARGO):</strong> EL TRABAJADOR se obliga a prestar sus servicios personales bajo la dependencia directa y subordinación de EL EMPLEADOR, desempeñando el cargo de <strong>{activeEmployee.cargo.toUpperCase()}</strong>, realizando las funciones inherentes a su puesto con la mayor eficiencia y lealtad.</p>
                        <p><strong>SEGUNDA (LUGAR DE TRABAJO):</strong> El trabajo se realizará en las instalaciones de EL EMPLEADOR ubicadas en Managua, sin perjuicio de que, por la naturaleza de sus funciones, pueda ser trasladado temporal o permanentemente a otros centros de trabajo de la empresa.</p>
                        <p><strong>TERCERA (JORNADA LABORAL):</strong> La jornada ordinaria de trabajo será de cuarenta y ocho (48) horas semanales, distribuidas según las necesidades operativas de la empresa, respetando siempre los límites y descansos establecidos en el Código del Trabajo.</p>
                        <p><strong>CUARTA (DEL SALARIO):</strong> EL EMPLEADOR pagará a EL TRABAJADOR un salario mensual bruto de <strong>{formatCurrency(activeEmployee.salarioBase)}</strong> ({activeEmployee.frecuenciaPago}), el cual será abonado en moneda nacional. Deducciones de Ley aplicables.</p>
                        <p><strong>QUINTA (VIGENCIA):</strong> El presente contrato surte efectos a partir del <strong>{activeEmployee.fechaIngreso}</strong> y se pacta por tiempo <strong>{activeEmployee.contrato || 'INDETERMINADO'}</strong>.</p>
                    </div>
                    <div className="text-center mt-auto text-xs text-gray-400">Página 1 de 2</div>
                </div>
            );

            // PÁGINA 2
            const page2 = (
                <div className={`${containerClass} text-sm`}>
                    <div className="space-y-4 text-justify mt-8">
                        <p><strong>SEXTA (OBLIGACIONES DE EL EMPLEADOR):</strong> Son obligaciones de EL EMPLEADOR, conforme al Art. 17 del Código del Trabajo:
                            <ul className="list-disc pl-8 mt-1 space-y-1">
                                <li>Pagar el salario en la forma y fecha convenida.</li>
                                <li>Respetar la dignidad personal de EL TRABAJADOR.</li>
                                <li>Proporcionar los instrumentos y materiales necesarios para la ejecución del trabajo.</li>
                                <li>Conceder los descansos y vacaciones establecidos por la ley.</li>
                            </ul>
                        </p>

                        <p><strong>SÉPTIMA (OBLIGACIONES DE EL TRABAJADOR):</strong> Son obligaciones de EL TRABAJADOR, conforme al Art. 18 del Código del Trabajo:
                            <ul className="list-disc pl-8 mt-1 space-y-1">
                                <li>Realizar el trabajo con la eficiencia, cuidado y esmero apropiados.</li>
                                <li>Acatar las instrucciones y órdenes de EL EMPLEADOR o sus representantes.</li>
                                <li>Guardar rigurosa confidencialidad sobre los secretos técnicos, comerciales o de fabricación de la empresa.</li>
                                <li>Observar las medidas preventivas de higiene y seguridad ocupacional.</li>
                            </ul>
                        </p>

                        <p><strong>OCTAVA (TERMINACIÓN):</strong> El presente contrato podrá darse por terminado por las causas establecidas en el Art. 48 del Código del Trabajo, o unilateralmente por cualquiera de las partes de conformidad con el Art. 45 del mismo cuerpo legal.</p>

                        <p><strong>NOVENA (LEGISLACIÓN APLICABLE):</strong> En lo no previsto en este contrato, ambas partes se someten a las disposiciones del Código del Trabajo de la República de Nicaragua y demás leyes laborales vigentes.</p>
                    </div>

                    <p className="mt-8 mb-12">Leído que fue el presente contrato y encontrándolo conformes, firmamos en dos ejemplares de un mismo tenor y efecto.</p>

                    <div className="flex justify-between mt-auto px-4 gap-8 mb-20">
                        <div className="border-t border-black w-1/2 text-center pt-2">
                            <p className="font-bold">EL EMPLEADOR</p>
                            <p className="text-xs uppercase">{companyName}</p>
                        </div>
                        <div className="border-t border-black w-1/2 text-center pt-2">
                            <p className="font-bold">EL TRABAJADOR</p>
                            <p className="text-xs uppercase">{activeEmployee.nombre}</p>
                            <p className="text-[10px]">Cédula: {activeEmployee.cedula}</p>
                        </div>
                    </div>
                    <div className="text-center text-xs text-gray-400">Página 2 de 2</div>
                </div>
            );

            return [page1, page2];
        }

        // 4. DESPIDO (1 Página)
        if (docType === 'despido') {
            return [(
                <div className={containerClass}>
                    <h2 className="text-center font-bold text-xl mb-12 uppercase">NOTIFICACIÓN DE TERMINACIÓN</h2>
                    <div className="text-right mb-10"><p>Managua, {date}</p></div>
                    <p className="mb-4">Señor(a): <strong>{activeEmployee.nombre}</strong></p>
                    <p className="mb-8">Cargo: {activeEmployee.cargo}</p>
                    <p className="mb-6">Estimado(a) Señor(a):</p>
                    <p className="mb-6">Por este medio le notificamos que la Dirección de la Empresa ha decidido dar por terminado su contrato de trabajo, con efectos a partir del día de hoy, haciendo uso de la facultad que le confiere el <strong>Artículo 45</strong> del Código del Trabajo vigente.</p>
                    <p className="mb-6">Le agradecemos presentarse a Recursos Humanos para su liquidación final.</p>
                    <div className="mt-auto pt-4 border-t border-black w-64 mb-20">
                        <p className="font-bold">Gerencia General</p>
                        <p>{companyName}</p>
                    </div>
                </div>
            )];
        }

        // 5. CARTA RECOMENDACIÓN (1 Página)
        if (docType === 'carta') {
            return [(
                <div className={containerClass}>
                    <h2 className="text-center font-bold text-xl mb-12 uppercase underline">CARTA DE RECOMENDACIÓN</h2>
                    <p className="mb-8 font-bold">A QUIEN CORRESPONDA:</p>
                    <p className="mb-6">Suscribo la presente para certificar que el Sr(a). <strong>{activeEmployee.nombre}</strong>, identificado con cédula No. <strong>{activeEmployee.cedula}</strong>, laboró bajo mi supervisión en <strong> {companyName}</strong>, desempeñando el cargo de <strong>{activeEmployee.cargo}</strong>.</p>
                    <p className="mb-6">Durante el tiempo que laboró con nosotros (desde {activeEmployee.fechaIngreso}), demostró ser una persona honesta, eficiente y responsable.</p>
                    <p className="mb-6">No tengo inconveniente en recomendarlo ampliamente.</p>
                    <p className="mb-12">Dado en la ciudad de Managua, a los {date}.</p>
                    <div className="mt-auto pt-4 border-t border-black w-64 mb-20">
                        <p className="font-bold">Gerente General</p>
                        <p>{companyName}</p>
                    </div>
                </div>
            )];
        }

        return [];
    };

    const pages = getDocumentPages();

    return (
        <div className="max-w-7xl mx-auto p-4">
            {/* PANEL DE CONTROL (Oculto al imprimir) */}
            <div className="print:hidden flex flex-col md:flex-row gap-6 mb-8">
                <div className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow-md border border-gray-200 h-fit sticky top-4">
                    <h2 className="text-lg font-bold mb-4 text-gray-700">Generar Documento</h2>

                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2">1. Seleccionar Empleado</label>
                        <select
                            className="w-full border p-2 rounded bg-gray-50 mb-2"
                            onChange={e => {
                                const emp = employees.find(x => x.id === parseInt(e.target.value));
                                setSelectedEmployee(emp || null);
                                if (emp) {
                                    setManualName('');
                                    setManualCedula('');
                                    setManualCargo('');
                                }
                            }}
                        >
                            <option value="">-- Seleccionar o Usar Manual --</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                        </select>

                        {/* INPUTS MANUALES */}
                        {!selectedEmployee && (
                            <div className="mt-2 bg-gray-50 p-3 rounded border border-gray-200 animate-fade-in">
                                <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Entrada Manual</p>
                                <input
                                    type="text"
                                    placeholder="Nombre Completo"
                                    className="w-full border p-2 rounded bg-white mb-2 text-sm"
                                    value={manualName}
                                    onChange={e => setManualName(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="No. Cédula"
                                    className="w-full border p-2 rounded bg-white mb-2 text-sm"
                                    value={manualCedula}
                                    onChange={e => setManualCedula(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Cargo (Opcional)"
                                    className="w-full border p-2 rounded bg-white text-sm"
                                    value={manualCargo}
                                    onChange={e => setManualCargo(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2">2. Nombre de la Empresa</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded bg-gray-50"
                            value={companyName}
                            onChange={e => setCompanyName(e.target.value)}
                            placeholder="Ingrese nombre de la empresa"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-bold mb-2">3. Tipo de Documento</label>
                        <div className="space-y-2">
                            {[
                                { id: 'constancia', label: '📄 Constancia Salarial' },
                                { id: 'contrato', label: '📝 Contrato Laboral' },
                                { id: 'renuncia', label: '👋 Carta de Renuncia' },
                                { id: 'despido', label: '🚫 Despido (Art 45)' },
                                { id: 'carta', label: '🤝 Carta Recomendación' }
                            ].map((doc) => (
                                <button key={doc.id} onClick={() => setDocType(doc.id as any)}
                                    className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition ${docType === doc.id ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                                    {doc.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button onClick={handlePrint} disabled={!activeEmployee} className="w-full bg-slate-800 text-white py-2 rounded font-bold hover:bg-slate-900 disabled:opacity-50 transition shadow-lg text-sm uppercase">
                        🖨️ IMPRIMIR DOCUMENTO
                    </button>
                </div>

                {/* VISTA PREVIA (Pantalla) */}
                <div className="w-full md:w-2/3 bg-gray-200 p-8 rounded border flex flex-col items-center gap-8 overflow-y-auto max-h-[800px]">
                    {pages.map((pageContent, idx) => (
                        <div key={idx} className="bg-white shadow-xl min-w-[21.59cm] w-[21.59cm] min-h-[27.94cm] h-[27.94cm] p-[2.5cm] origin-top transform md:scale-95 scale-75">
                            {pageContent}
                        </div>
                    ))}
                </div>
            </div>

            {/* ESTILOS DE IMPRESIÓN */}
            <style>{`
                @media print {
                    @page {
                        size: letter;
                        margin: 0; 
                    }
                    body * { visibility: hidden; }
                    #printable-area, #printable-area * { visibility: visible; }
                    #printable-area {
                        position: absolute;
                        left: 0; top: 0; width: 100%;
                    }
                    .print-page {
                        width: 21.59cm;
                        height: 27.94cm;
                        padding: 2.5cm;
                        page-break-after: always;
                        position: relative;
                    }
                    .print-page:last-child {
                        page-break-after: auto;
                    }
                }
            `}</style>

            {/* ÁREA IMPRIMIBLE (Limpio para PDF/Print) */}
            <div id="printable-area" className="hidden print:block bg-white text-black">
                {pages.map((pageContent, idx) => (
                    <div key={idx} className="print-page">
                        {pageContent}
                    </div>
                ))}
            </div>
        </div>
    );
};