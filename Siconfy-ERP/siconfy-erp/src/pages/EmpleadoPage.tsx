// src/pages/EmpleadoPage.tsx
import React, { useState, useEffect } from 'react';
import { EmployeeService } from '../utils/dbService';
import type { Employee } from '../types';
import { formatCurrency } from '../utils/formatters';
import * as XLSX from 'xlsx';
import { downloadExcel } from '../utils/downloadHelper';

export const EmpleadoPage = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);

    // Modales
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedEmployeeForPrint, setSelectedEmployeeForPrint] = useState<Employee | null>(null);
    const [printDocType, setPrintDocType] = useState<'constancia' | 'contrato' | 'renuncia' | 'despido' | 'carta'>('constancia');

    // Form State
    const [nombre, setNombre] = useState('');
    const [cedula, setCedula] = useState('');
    const [noInss, setNoInss] = useState('');
    const [cargo, setCargo] = useState('');
    const [salario, setSalario] = useState('');
    const [contrato, setContrato] = useState('Indeterminado');
    const [fechaIngreso, setFechaIngreso] = useState('');
    const [estado, setEstado] = useState<'Activo' | 'Inactivo'>('Activo');
    const [frecuencia, setFrecuencia] = useState<'Mensual' | 'Quincenal' | 'Semanal'>('Mensual');

    // Inputs Fijos
    const [comisiones, setComisiones] = useState('');
    const [incentivos, setIncentivos] = useState('');
    const [viaticos, setViaticos] = useState('');
    const [diasVacaciones, setDiasVacaciones] = useState('');
    const [horasExtras, setHorasExtras] = useState('');
    const [deducciones, setDeducciones] = useState('');

    // Validation State
    const [errors, setErrors] = useState<{ cedula?: string; salario?: string }>({});

    useEffect(() => { loadEmployees(); }, []);
    const loadEmployees = () => { setEmployees(EmployeeService.getAll()); };

    // --- EFECTO: Control de clase para impresión exclusiva ---
    useEffect(() => {
        if (isPrintModalOpen) {
            document.body.classList.add('printing-doc');
        } else {
            document.body.classList.remove('printing-doc');
        }
        return () => document.body.classList.remove('printing-doc');
    }, [isPrintModalOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const newErrors: { cedula?: string; salario?: string } = {};
        if (!cedula.trim()) {
            newErrors.cedula = 'La Cédula es requerida';
        }
        const salarioValue = parseFloat(salario);
        if (isNaN(salarioValue) || salarioValue <= 0) {
            newErrors.salario = 'El Salario Base debe ser un número positivo';
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            return; // Stop submission if there are errors
        }

        const empData = {
            id: 0,
            nombre, cedula, noInss, cargo, salarioBase: salarioValue,
            comisiones: parseFloat(comisiones) || 0,
            incentivos: parseFloat(incentivos) || 0,
            viaticos: parseFloat(viaticos) || 0,
            diasVacaciones: parseFloat(diasVacaciones) || 0,
            horasExtras: parseFloat(horasExtras) || 0,
            deducciones: parseFloat(deducciones) || 0,
            fechaIngreso, estado, frecuenciaPago: frecuencia,
            contrato, moneda: 'C$', diasVacacionesAcumulados: 0, historialVacaciones: []
        };

        if (editingId) {
            const existing = employees.find(e => e.id === editingId);
            if (existing) EmployeeService.update({ ...existing, ...empData, id: existing.id });
        } else {
            EmployeeService.save(empData);
        }
        setIsEditModalOpen(false);
        resetForm();
        loadEmployees();
    };

    const handleEdit = (emp: Employee) => {
        setEditingId(emp.id);
        setNombre(emp.nombre); setCedula(emp.cedula); setNoInss(emp.noInss || '');
        setCargo(emp.cargo); setSalario(emp.salarioBase.toString());
        setComisiones(emp.comisiones?.toString() || ''); setIncentivos(emp.incentivos?.toString() || '');
        setViaticos(emp.viaticos?.toString() || ''); setDiasVacaciones(emp.diasVacaciones?.toString() || '');
        setHorasExtras(emp.horasExtras?.toString() || ''); setDeducciones(emp.deducciones?.toString() || '');
        setFechaIngreso(emp.fechaIngreso); setFrecuencia(emp.frecuenciaPago);
        setEstado(emp.estado);
        setContrato((emp as any).contrato || 'Indeterminado');
        setIsEditModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Borrar empleado?')) { EmployeeService.delete(id); loadEmployees(); }
    };

    const resetForm = () => {
        setEditingId(null); setNombre(''); setCedula(''); setNoInss(''); setCargo(''); setSalario('');
        setComisiones(''); setIncentivos(''); setViaticos(''); setDiasVacaciones(''); setHorasExtras(''); setDeducciones('');
        setFechaIngreso(''); setEstado('Activo'); setFrecuencia('Mensual');
        setContrato('Indeterminado');
        setErrors({});
    };

    const openPrintModal = (emp: Employee) => {
        setSelectedEmployeeForPrint(emp);
        setIsPrintModalOpen(true);
    };

    const handlePrint = () => window.print();

    const handleExportExcel = () => {
        const dataToExport = employees.map(emp => ({
            ID: emp.id,
            Estado: emp.estado,
            Cédula: emp.cedula,
            'No INSS': emp.noInss || '-',
            Nombre: emp.nombre,
            Cargo: emp.cargo,
            Frecuencia: emp.frecuenciaPago,
            Salario: emp.salarioBase,
            Comisiones: emp.comisiones || 0,
            Incentivos: emp.incentivos || 0,
            Viáticos: emp.viaticos || 0,
            'Días Vacaciones': emp.diasVacaciones || 0,
            'Horas Extras': emp.horasExtras || 0,
            Deducciones: emp.deducciones || 0,
            'Fecha Ingreso': emp.fechaIngreso,
            Contrato: (emp as any).contrato || 'Indeterminado'
        }));
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Empleados");
        downloadExcel(wb, "Empleados_Siconfy.xlsx");
    };

    // --- DOCUMENTOS ---
    const renderDocumentContent = () => {
        if (!selectedEmployeeForPrint) return null;
        const emp = selectedEmployeeForPrint;
        const date = new Date().toLocaleDateString('es-NI', { year: 'numeric', month: 'long', day: 'numeric' });
        const companyName = "Jodidos Pero Contentos S.A";

        return (
            <div className="font-serif text-black leading-snug text-justify text-sm">
                {printDocType === 'constancia' && (
                    <>
                        <div className="text-right mb-6">Managua, {date}</div>
                        <h2 className="text-center font-bold text-lg mb-6 uppercase underline">CONSTANCIA SALARIAL</h2>
                        <p className="mb-3"><strong>A QUIEN INTERESE:</strong></p>
                        <p className="mb-3">Por medio de la presente, la Gerencia de Recursos Humanos de <strong>{companyName}</strong>, HACE CONSTAR que el Sr(a). <strong>{emp.nombre}</strong>, identificado con Cédula No. <strong>{emp.cedula}</strong> y No. INSS <strong>{emp.noInss || 'En trámite'}</strong>, labora para nuestra institución desde el <strong>{emp.fechaIngreso}</strong>.</p>
                        <p className="mb-3">Actualmente desempeña el cargo de <strong>{emp.cargo}</strong>, bajo contratación <strong>{emp.contrato || 'Indeterminado'}</strong>, con una jornada laboral de 48 horas semanales distribuidas de lunes a sábado.</p>
                        <p className="mb-3">Percibe un salario bruto mensual de <strong>{formatCurrency(emp.salarioBase)}</strong>, pagaderos <strong>{emp.frecuenciaPago}</strong>, más beneficios adicionales como comisiones, incentivos y horas extras según corresponda.</p>
                        <p className="mb-3">Durante su período laboral, ha demostrado compromiso y dedicación en sus funciones, contribuyendo al crecimiento y desarrollo de la empresa.</p>
                        <p className="mb-3">Se expide la presente constancia a solicitud del interesado para los fines que estime convenientes.</p>
                        <div className="mt-12 border-t border-black w-48 text-center mx-auto pt-2"><p className="font-bold">Recursos Humanos</p><p className="text-xs">{companyName}</p></div>
                    </>
                )}
                {printDocType === 'contrato' && (
                    <div className="text-xs leading-relaxed">
                        <h2 className="text-center font-bold text-base mb-4 uppercase">CONTRATO INDIVIDUAL DE TRABAJO</h2>
                        <p className="mb-2">En Managua, República de Nicaragua, a los {date}, comparecen de una parte <strong>{companyName}</strong>, con domicilio en Managua, representada por su Gerente General, en adelante "EL EMPLEADOR"; y de la otra parte el Sr(a). <strong>{emp.nombre}</strong>, mayor de edad, identificado con Cédula de Identidad No. <strong>{emp.cedula}</strong>, con domicilio en Managua, en adelante "EL TRABAJADOR", quienes convienen en celebrar el presente CONTRATO INDIVIDUAL DE TRABAJO, sujetándose a las disposiciones del Código del Trabajo de Nicaragua y las leyes laborales vigentes.</p>

                        <h3 className="font-bold mt-4 mb-2">CLÁUSULA PRIMERA: OBJETO DEL CONTRATO</h3>
                        <p className="mb-2">EL EMPLEADOR contrata los servicios de EL TRABAJADOR para que desempeñe el cargo de <strong>{emp.cargo}</strong>, realizando las funciones inherentes al mismo, con dedicación exclusiva y sujeción a las órdenes e instrucciones del EMPLEADOR.</p>

                        <h3 className="font-bold mt-4 mb-2">CLÁUSULA SEGUNDA: DURACIÓN DEL CONTRATO</h3>
                        <p className="mb-2">El presente contrato es por tiempo <strong>{emp.contrato || 'Indeterminado'}</strong>, iniciándose el día <strong>{emp.fechaIngreso}</strong>. En caso de contrato determinado, finalizará automáticamente sin necesidad de preaviso.</p>

                        <h3 className="font-bold mt-4 mb-2">CLÁUSULA TERCERA: JORNADA DE TRABAJO</h3>
                        <p className="mb-2">La jornada laboral será de 48 horas semanales, distribuidas de lunes a sábado, con un horario de 8:00 AM a 5:00 PM, incluyendo una hora de almuerzo. EL TRABAJADOR tendrá derecho a descanso dominical obligatorio.</p>

                        <h3 className="font-bold mt-4 mb-2">CLÁUSULA CUARTA: REMUNERACIÓN</h3>
                        <p className="mb-2">EL TRABAJADOR percibirá un salario mensual de <strong>{formatCurrency(emp.salarioBase)}</strong>, pagadero por períodos <strong>{emp.frecuenciaPago}</strong>. Este salario podrá ser incrementado por comisiones, incentivos, horas extras y otros beneficios según las políticas de la empresa.</p>

                        <h3 className="font-bold mt-4 mb-2">CLÁUSULA QUINTA: OBLIGACIONES DEL TRABAJADOR</h3>
                        <p className="mb-2">EL TRABAJADOR se obliga a: 1) Cumplir con sus funciones con diligencia y eficiencia; 2) Guardar confidencialidad sobre información de la empresa; 3) Acatar las normas internas y políticas de la empresa; 4) Notificar ausencias justificadas con anticipación; 5) Mantener una conducta ética y profesional.</p>

                        <h3 className="font-bold mt-4 mb-2">CLÁUSULA SEXTA: OBLIGACIONES DEL EMPLEADOR</h3>
                        <p className="mb-2">EL EMPLEADOR se obliga a: 1) Pagar puntualmente la remuneración convenida; 2) Proporcionar las herramientas y condiciones de trabajo adecuadas; 3) Cumplir con las disposiciones legales en materia laboral; 4) Respetar los derechos del trabajador según el Código del Trabajo; 5) Proporcionar capacitación cuando sea necesario.</p>

                        <h3 className="font-bold mt-4 mb-2">CLÁUSULA SÉPTIMA: VACACIONES Y DESCANSOS</h3>
                        <p className="mb-2">EL TRABAJADOR tendrá derecho a 15 días de vacaciones pagadas por cada 6 meses de trabajo continuo. Las vacaciones serán acumulables hasta un máximo de 2 años. El pago de vacaciones se calculará sobre el salario promedio de los últimos 6 meses.</p>

                        <h3 className="font-bold mt-4 mb-2">CLÁUSULA OCTAVA: SEGURIDAD SOCIAL</h3>
                        <p className="mb-2">Ambas partes se sujetan al régimen de seguridad social obligatorio. EL EMPLEADOR cubrirá el 19.25% correspondiente a su aporte patronal, y EL TRABAJADOR contribuirá con el 7% de su salario. La empresa proporcionará atención médica y otros beneficios sociales según la ley.</p>

                        <h3 className="font-bold mt-4 mb-2">CLÁUSULA NOVENA: CONFIDENCIALIDAD</h3>
                        <p className="mb-2">EL TRABAJADOR se compromete a mantener absoluta confidencialidad sobre información técnica, comercial, financiera y cualquier otro dato que pueda afectar los intereses de la empresa, incluso después de terminado el contrato.</p>

                        <h3 className="font-bold mt-4 mb-2">CLÁUSULA DÉCIMA: TERMINACIÓN DEL CONTRATO</h3>
                        <p className="mb-2">El contrato podrá terminar por: 1) Mutuo acuerdo; 2) Renuncia del trabajador con preaviso de 15 días; 3) Despido con justa causa; 4) Vencimiento del término en contratos determinados; 5) Causales legales establecidas en el Código del Trabajo.</p>

                        <h3 className="font-bold mt-4 mb-2">CLÁUSULA UNDÉCIMA: COMPETENCIA Y NO CONCURRENCIA</h3>
                        <p className="mb-2">Durante la vigencia del contrato y por 1 año después de su terminación, EL TRABAJADOR no podrá trabajar para empresas competidoras directas ni iniciar actividades que compitan con los intereses de EL EMPLEADOR.</p>

                        <h3 className="font-bold mt-4 mb-2">CLÁUSULA DUODÉCIMA: LEY APLICABLE Y JURISDICCIÓN</h3>
                        <p className="mb-2">Este contrato se rige por las leyes de la República de Nicaragua, especialmente el Código del Trabajo. Cualquier controversia será resuelta por los tribunales competentes de Managua.</p>

                        <h3 className="font-bold mt-4 mb-2">CLÁUSULA DECIMOTERCERA: FIRMA Y ACEPTACIÓN</h3>
                        <p className="mb-2">Las partes declaran haber leído y comprendido el contenido del presente contrato, firmándolo en señal de aceptación y conformidad.</p>

                        <div className="flex justify-between mt-8 px-4">
                            <div className="border-t border-black w-40 text-center pt-1">
                                <span className="font-bold block">EL EMPLEADOR</span>
                                <span className="text-xs">{companyName}</span>
                            </div>
                            <div className="border-t border-black w-40 text-center pt-1">
                                <span className="font-bold block">EL TRABAJADOR</span>
                                <span className="text-xs">{emp.nombre}</span>
                            </div>
                        </div>
                    </div>
                )}
                {printDocType === 'renuncia' && (
                    <>
                        <div className="text-right mb-6">Managua, {date}</div>
                        <h2 className="text-center font-bold text-lg mb-6 uppercase underline">CARTA DE RENUNCIA VOLUNTARIA</h2>
                        <p className="mb-3"><strong>Señor Gerente General</strong></p>
                        <p className="mb-3"><strong>{companyName}</strong></p>
                        <p className="mb-3"><strong>Presente.-</strong></p>
                        <p className="mb-3">Por medio de la presente, yo <strong>{emp.nombre}</strong>, identificado con Cédula de Identidad No. <strong>{emp.cedula}</strong>, en mi calidad de empleado de <strong>{companyName}</strong> en el cargo de <strong>{emp.cargo}</strong>, desde el <strong>{emp.fechaIngreso}</strong>, manifiesto mi decisión irrevocable de renunciar voluntariamente a mi puesto de trabajo.</p>
                        <p className="mb-3">Esta renuncia se efectúa por motivos personales y sin presión alguna por parte de la empresa. Me comprometo a cumplir con el período de preaviso establecido en el Código del Trabajo de Nicaragua, específicamente 15 días hábiles, durante los cuales continuaré desempeñando mis funciones con la misma dedicación y eficiencia.</p>
                        <p className="mb-3">Durante mi permanencia en la empresa, he recibido formación, capacitación y oportunidades de crecimiento profesional que agradezco sinceramente. Solicito que se me proporcione una constancia de trabajo que certifique mi desempeño y antigüedad laboral para futuros empleos.</p>
                        <p className="mb-3">Quedo a la disposición de la empresa para coordinar la entrega de responsabilidades, documentación y activos de la compañía que estén bajo mi custodia.</p>
                        <div className="mt-8 border-t border-black w-48 text-center mx-auto pt-2">
                            <p className="font-bold">{emp.nombre}</p>
                            <p className="text-xs">Cédula: {emp.cedula}</p>
                        </div>
                    </>
                )}
                {printDocType === 'despido' && (
                    <>
                        <div className="text-right mb-6">Managua, {date}</div>
                        <h2 className="text-center font-bold text-lg mb-6 uppercase underline">CARTA DE DESPIDO</h2>
                        <p className="mb-3"><strong>{emp.nombre}</strong></p>
                        <p className="mb-3"><strong>Presente.-</strong></p>
                        <p className="mb-3">Por medio de la presente carta, <strong>{companyName}</strong>, representada por su Gerente General, comunica al Sr(a). <strong>{emp.nombre}</strong>, identificado con Cédula No. <strong>{emp.cedula}</strong>, quien labora en la empresa desde el <strong>{emp.fechaIngreso}</strong> en el cargo de <strong>{emp.cargo}</strong>, la terminación de su contrato de trabajo.</p>
                        <p className="mb-3">Esta decisión se toma conforme a lo establecido en el artículo 45 del Código del Trabajo de Nicaragua, por las siguientes causales: [Especificar las causales legales que aplican]. La empresa ha cumplido con todos los procedimientos legales requeridos, incluyendo la investigación previa y el derecho a defensa del trabajador.</p>
                        <p className="mb-3">Durante el período laboral, el trabajador recibió capacitación, oportunidades de desarrollo y todos los beneficios laborales establecidos por ley. La empresa agradece los servicios prestados y desea éxito en futuras oportunidades profesionales.</p>
                        <p className="mb-3">Se informa que el trabajador tiene derecho a indemnización por antigüedad, vacaciones proporcionales y otros beneficios laborales conforme a la legislación vigente. Los cálculos correspondientes se adjuntarán por separado.</p>
                        <div className="mt-8 border-t border-black w-48 text-center mx-auto pt-2">
                            <p className="font-bold">Gerente General</p>
                            <p className="text-xs">{companyName}</p>
                        </div>
                    </>
                )}
                {printDocType === 'carta' && (
                    <>
                        <div className="text-right mb-6">Managua, {date}</div>
                        <h2 className="text-center font-bold text-lg mb-6 uppercase underline">CARTA DE RECOMENDACIÓN</h2>
                        <p className="mb-3"><strong>A QUIEN CORRESPONDA:</strong></p>
                        <p className="mb-3">Por medio de la presente, <strong>{companyName}</strong>, certifica que el Sr(a). <strong>{emp.nombre}</strong>, identificado con Cédula No. <strong>{emp.cedula}</strong>, laboró en nuestra empresa desde el <strong>{emp.fechaIngreso}</strong> hasta la fecha, desempeñando el cargo de <strong>{emp.cargo}</strong>.</p>
                        <p className="mb-3">Durante su permanencia en la empresa, demostró responsabilidad, compromiso y eficiencia en el cumplimiento de sus funciones. Mantuvo una actitud profesional, colaborativa y contribuyó positivamente al desarrollo de los proyectos asignados.</p>
                        <p className="mb-3">Su desempeño laboral fue satisfactorio, cumpliendo con los objetivos establecidos y respetando las normas internas de la empresa. Recomendamos sus servicios para futuras oportunidades laborales, confiando en que será un valioso aporte para cualquier organización.</p>
                        <p className="mb-3">Sin otro particular, extendemos esta carta de recomendación a solicitud del interesado.</p>
                        <div className="mt-8 border-t border-black w-48 text-center mx-auto pt-2">
                            <p className="font-bold">Recursos Humanos</p>
                            <p className="text-xs">{companyName}</p>
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="p-4 max-w-[1400px] mx-auto">
            <style>{`
                @media print {
                    /* CONFIGURACIÓN DE PÁGINA DINÁMICA */
                    @page { 
                        /* Si el modal está abierto, usa Letter Portrait (Vertical) */
                        /* Si NO está abierto (imprime lista), usa Letter Landscape (Horizontal) */
                        size: ${isPrintModalOpen ? 'letter portrait' : 'letter landscape'}; 
                        margin: ${isPrintModalOpen ? '2cm' : '0.5cm'};
                    }
                    
                    /* REGLA GLOBAL: Ocultar todo por defecto */
                    body * { visibility: hidden; }

                    /* CASO 1: IMPRIMIENDO DOCUMENTO (Modal Abierto) */
                    body.printing-doc #doc-printable-area, 
                    body.printing-doc #doc-printable-area * { 
                        visibility: visible; 
                    }
                    body.printing-doc #doc-printable-area { 
                        position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; border: none !important; 
                    }

                    /* CASO 2: IMPRIMIENDO LISTA (Modal Cerrado - HORIZONTAL) */
                    body:not(.printing-doc) .table-container, 
                    body:not(.printing-doc) .table-container * { 
                        visibility: visible; 
                    }
                    body:not(.printing-doc) .table-container { 
                        position: absolute; left: 0; top: 0; 
                        width: 100% !important; 
                        margin: 0 !important; 
                        padding: 0 !important; 
                        border: none !important; 
                        overflow: visible !important;
                    }
                    
                    /* Ajustes de Tabla para que quepa en Horizontal */
                    body:not(.printing-doc) table {
                        width: 100% !important;
                        font-size: 9px !important; /* Fuente reducida */
                    }
                    body:not(.printing-doc) th, 
                    body:not(.printing-doc) td {
                        padding: 4px !important;
                        white-space: nowrap !important; /* Evitar saltos de línea feos */
                    }
                    
                    /* OCULTAR COLUMNA DE ACCIONES AL IMPRIMIR LA LISTA */
                    body:not(.printing-doc) th:last-child,
                    body:not(.printing-doc) td:last-child {
                        display: none !important;
                    }

                    /* Utilidades */
                    .no-print { display: none !important; }
                    input { border: none !important; background: transparent !important; padding: 0 !important; text-align: right; }
                    input::placeholder { color: transparent; }
                }
            `}</style>

            <div className="flex justify-between items-center mb-6 print:hidden">
                <h1 className="text-2xl font-bold text-gray-800">Directorio de Personal</h1>
                <div className="flex gap-2">
                    <button onClick={handlePrint} className="bg-slate-700 text-white px-4 py-2 rounded font-bold shadow hover:bg-slate-800 transition">🖨️ Imprimir Lista</button>
                    <button onClick={handleExportExcel} className="bg-green-600 text-white px-4 py-2 rounded font-bold shadow hover:bg-green-700 transition">📊 Excel</button>
                    <button onClick={() => { resetForm(); setIsEditModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded font-bold shadow hover:bg-blue-700 transition">+ Nuevo Empleado</button>
                </div>
            </div>

            {/* TABLA DE EMPLEADOS */}
            <div className="bg-white rounded-lg shadow overflow-x-auto border border-gray-200 table-container">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead className="bg-slate-800 text-white text-xs uppercase">
                        <tr>
                            <th className="p-3 border-r border-slate-600">ID</th>
                            <th className="p-3 border-r border-slate-600">Estado</th>
                            <th className="p-3 border-r border-slate-600">Cédula</th>
                            <th className="p-3 border-r border-slate-600">No INSS</th>
                            <th className="p-3 border-r border-slate-600">Nombre</th>
                            <th className="p-3 border-r border-slate-600">Cargo</th>
                            <th className="p-3 border-r border-slate-600">Fecha Ingreso</th>
                            <th className="p-3 border-r border-slate-600">Frec.</th>
                            <th className="p-3 border-r border-slate-600 text-right">Salario</th>
                            {/* Nuevas Columnas Fijas */}
                            <th className="p-3 border-r border-slate-600 text-center bg-slate-700">Comis.</th>
                            <th className="p-3 border-r border-slate-600 text-center bg-slate-700">Incent.</th>
                            <th className="p-3 border-r border-slate-600 text-center bg-slate-700">Viát.</th>
                            <th className="p-3 border-r border-slate-600 text-center bg-slate-700">Vac.</th>
                            <th className="p-3 border-r border-slate-600 text-center bg-slate-700">Cant. HE</th>
                            <th className="p-3 border-r border-slate-600 text-center bg-slate-700">Deducc.</th>
                            <th className="p-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700">
                        {employees.map(emp => (
                            <tr key={emp.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 border-r font-mono text-xs">{emp.id}</td>
                                <td className="p-3 border-r text-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${emp.estado === 'Activo' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>{emp.estado.substring(0, 3)}</span>
                                </td>
                                <td className="p-3 border-r font-mono text-xs">{emp.cedula}</td>
                                <td className="p-3 border-r font-mono text-xs">{emp.noInss || '-'}</td>
                                <td className="p-3 border-r font-bold">{emp.nombre}</td>
                                <td className="p-3 border-r text-xs">{emp.cargo}</td>
                                <td className="p-3 border-r text-xs">{emp.fechaIngreso}</td>
                                <td className="p-3 border-r text-xs">{emp.frecuenciaPago}</td>
                                <td className="p-3 border-r text-right font-bold text-blue-800">{formatCurrency(emp.salarioBase)}</td>

                                {/* Datos Fijos */}
                                <td className="p-3 border-r text-right text-xs">{emp.comisiones ? formatCurrency(emp.comisiones) : '-'}</td>
                                <td className="p-3 border-r text-right text-xs">{emp.incentivos ? formatCurrency(emp.incentivos) : '-'}</td>
                                <td className="p-3 border-r text-right text-xs">{emp.viaticos ? formatCurrency(emp.viaticos) : '-'}</td>
                                <td className="p-3 border-r text-right text-xs">{emp.diasVacaciones || '-'}</td>
                                <td className="p-3 border-r text-center text-xs">{emp.horasExtras || '-'}</td>
                                <td className="p-3 border-r text-right text-xs">{emp.deducciones ? formatCurrency(emp.deducciones) : '-'}</td>

                                <td className="p-3 text-center space-x-1 flex items-center justify-center">
                                    <button onClick={() => openPrintModal(emp)} className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-2 py-1 rounded border text-[10px] font-bold" title="Imprimir Documentos">📄</button>
                                    <button onClick={() => handleEdit(emp)} className="text-blue-600 hover:text-blue-800 font-bold text-xs underline">Edit</button>
                                    <button onClick={() => handleDelete(emp.id)} className="text-red-600 hover:text-red-800 font-bold text-xs underline">X</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL EDICION */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm print:hidden">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2">Editar Empleado</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1 space-y-2">
                                <label className="text-xs font-bold uppercase">Datos Personales</label>
                                <input required placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full border p-2 rounded text-sm" />
                                <div>
                                    <input required placeholder="Cédula" value={cedula} onChange={e => setCedula(e.target.value)} className={`w-full border p-2 rounded text-sm ${errors.cedula ? 'border-red-500' : ''}`} />
                                    {errors.cedula && <p className="text-red-500 text-xs mt-1">{errors.cedula}</p>}
                                </div>
                                <input placeholder="INSS" value={noInss} onChange={e => setNoInss(e.target.value)} className="w-full border p-2 rounded text-sm" />
                                <select value={estado} onChange={e => setEstado(e.target.value as any)} className="w-full border p-2 rounded text-sm"><option value="Activo">Activo</option><option value="Inactivo">Inactivo</option></select>
                            </div>

                            <div className="md:col-span-1 space-y-2">
                                <label className="text-xs font-bold uppercase">Laboral</label>
                                <input required placeholder="Cargo" value={cargo} onChange={e => setCargo(e.target.value)} className="w-full border p-2 rounded text-sm" />
                                <div>
                                    <input required type="number" placeholder="Salario" value={salario} onChange={e => setSalario(e.target.value)} className={`w-full border p-2 rounded text-sm ${errors.salario ? 'border-red-500' : ''}`} />
                                    {errors.salario && <p className="text-red-500 text-xs mt-1">{errors.salario}</p>}
                                </div>
                                <select value={frecuencia} onChange={e => setFrecuencia(e.target.value as any)} className="w-full border p-2 rounded text-sm"><option value="Mensual">Mensual</option><option value="Quincenal">Quincenal</option><option value="Semanal">Semanal</option></select>
                                <select value={contrato} onChange={e => setContrato(e.target.value)} className="w-full border p-2 rounded text-sm"><option value="Indeterminado">Indeterminado</option><option value="Determinado">Determinado</option><option value="Servicios">Servicios</option></select>
                                <input type="date" value={fechaIngreso} onChange={e => setFechaIngreso(e.target.value)} className="w-full border p-2 rounded text-sm" />
                            </div>

                            <div className="md:col-span-1 space-y-2 bg-gray-50 p-2 rounded">
                                <label className="text-xs font-bold uppercase text-green-700">Fijos (Opcional)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div><label className="text-xs">Comisiones</label><input type="number" placeholder="0.00" value={comisiones} onChange={e => setComisiones(e.target.value)} className="border p-1 rounded text-xs w-full" /></div>
                                    <div><label className="text-xs">Incentivos</label><input type="number" placeholder="0.00" value={incentivos} onChange={e => setIncentivos(e.target.value)} className="border p-1 rounded text-xs w-full" /></div>
                                    <div><label className="text-xs">Viáticos</label><input type="number" placeholder="0.00" value={viaticos} onChange={e => setViaticos(e.target.value)} className="border p-1 rounded text-xs w-full" /></div>
                                    <div><label className="text-xs">Días Vac.</label><input type="number" placeholder="0" value={diasVacaciones} onChange={e => setDiasVacaciones(e.target.value)} className="border p-1 rounded text-xs w-full" /></div>
                                    <div><label className="text-xs">Cant. Hrs. Extras</label><input type="number" placeholder="0" value={horasExtras} onChange={e => setHorasExtras(e.target.value)} className="border p-1 rounded text-xs w-full" /></div>
                                    <div><label className="text-xs">Deducciones</label><input type="number" placeholder="0.00" value={deducciones} onChange={e => setDeducciones(e.target.value)} className="border p-1 rounded text-xs w-full" /></div>
                                </div>
                            </div>

                            <div className="col-span-3 flex justify-end gap-2 mt-4 pt-4 border-t">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div >
            )}

            {/* MODAL PRINT (Ahora con ID único para CSS) */}
            {
                isPrintModalOpen && selectedEmployeeForPrint && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 print:bg-white print:static print:block">
                        <div className="bg-white w-full max-w-4xl h-[90vh] flex flex-col md:flex-row overflow-hidden rounded shadow-2xl print:shadow-none print:h-auto print:w-full">
                            <div className="w-full md:w-1/4 bg-gray-100 p-4 border-r no-print flex flex-col gap-2">
                                <h3 className="font-bold text-gray-700 mb-4">Documento</h3>
                                {['constancia', 'contrato', 'renuncia', 'despido', 'carta'].map(type => (
                                    <button key={type} onClick={() => setPrintDocType(type as any)} className={`text-left p-2 rounded text-sm uppercase font-bold ${printDocType === type ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-200'}`}>{type}</button>
                                ))}
                                <div className="mt-auto flex flex-col gap-2">
                                    <button onClick={handlePrint} className="bg-slate-800 text-white py-3 rounded font-bold hover:bg-slate-900 transition shadow">🖨️ IMPRIMIR</button>
                                    <button onClick={() => setIsPrintModalOpen(false)} className="bg-red-100 text-red-700 py-2 rounded font-bold hover:bg-red-200 transition">Cerrar</button>
                                </div>
                            </div>
                            <div className="w-full md:w-3/4 bg-gray-500 p-8 overflow-y-auto print:p-0 print:bg-white print:overflow-visible">
                                <div id="doc-printable-area" className="bg-white shadow-lg min-h-[27cm] p-12 mx-auto max-w-[21cm] print:shadow-none print:m-0 print:w-full">
                                    {renderDocumentContent()}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};