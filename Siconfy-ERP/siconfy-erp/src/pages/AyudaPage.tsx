import React from 'react';
import { InfoSection } from '../components/InfoSection';

export const AyudaPage = () => {
    return (
        <div className="max-w-6xl mx-auto p-4 space-y-8 pb-12 animate-fade-in">
            <header className="text-center bg-gradient-to-r from-sky-900 to-sky-700 text-white p-10 rounded-2xl shadow-xl border-b-4 border-sky-400">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">ℹ️ Centro de Ayuda Legal y Técnico</h1>
                <p className="text-lg text-sky-100 font-light">Resolviendo tus dudas sobre Nómina y Leyes en Nicaragua</p>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* COLUMNA PRINCIPAL */}
                <div className="lg:col-span-2 space-y-8">

                    {/* SECCIÓN 1: GLOSARIO TÉCNICO (Migrado de ManualPage) */}
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-2">
                            📚 1. Glosario Técnico
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded border border-slate-100 hover:bg-slate-100 transition">
                                <span className="font-bold text-slate-900 block mb-1">Salario Bruto</span>
                                <span className="text-xs text-gray-600">Total de ingresos antes de aplicar cualquier deducción de ley.</span>
                            </div>
                            <div className="p-4 bg-slate-50 rounded border border-slate-100 hover:bg-slate-100 transition">
                                <span className="font-bold text-slate-900 block mb-1">INSS Laboral</span>
                                <span className="text-xs text-gray-600">Aporte del 7% que paga el trabajador para su seguridad social.</span>
                            </div>
                            <div className="p-4 bg-slate-50 rounded border border-slate-100 hover:bg-slate-100 transition">
                                <span className="font-bold text-slate-900 block mb-1">Renta Ocasional</span>
                                <span className="text-xs text-gray-600">Impuesto aplicado a ingresos no periódicos (ej: Vacaciones pagadas al salir).</span>
                            </div>
                            <div className="p-4 bg-slate-50 rounded border border-slate-100 hover:bg-slate-100 transition">
                                <span className="font-bold text-slate-900 block mb-1">Salario Variable</span>
                                <span className="text-xs text-gray-600">Cuando el sueldo cambia mes a mes. Para prestaciones, se usa el promedio de los últimos 6 meses.</span>
                            </div>
                        </div>
                    </section>

                    {/* SECCIÓN 2: PREGUNTAS FRECUENTES (Migrado de ManualPage) */}
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-2">
                            ❓ 2. Preguntas Frecuentes
                        </h2>
                        <div className="space-y-4">
                            <details className="group p-4 bg-gray-50 rounded-lg open:bg-sky-50 transition-colors">
                                <summary className="font-bold text-gray-800 cursor-pointer list-none flex justify-between items-center">
                                    ¿Por qué mi IR es más alto si recibí un bono?
                                    <span className="text-sky-500 font-bold group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                                    El sistema tributario nicaragüense proyecta tus ingresos anuales. Si recibes un bono este mes, la fórmula asume que ganarás ese monto extra el resto del año, elevando temporalmente tu tasa de retención.
                                </p>
                            </details>

                            <details className="group p-4 bg-gray-50 rounded-lg open:bg-sky-50 transition-colors">
                                <summary className="font-bold text-gray-800 cursor-pointer list-none flex justify-between items-center">
                                    ¿El aguinaldo paga impuestos?
                                    <span className="text-sky-500 font-bold group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                                    <strong>NO.</strong> Según el Art. 93 del Código del Trabajo, el Décimo Tercer Mes es inembargable y está totalmente exento de deducciones de INSS e IR.
                                </p>
                            </details>

                            <details className="group p-4 bg-gray-50 rounded-lg open:bg-sky-50 transition-colors">
                                <summary className="font-bold text-gray-800 cursor-pointer list-none flex justify-between items-center">
                                    ¿Puedo pedir vacaciones pagadas sin renunciar?
                                    <span className="text-sky-500 font-bold group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                                    La ley establece que las vacaciones son para descansar. Solo se permite el pago en dinero cuando finaliza el contrato de trabajo. Acumularlas por más de 2 años puede resultar en la pérdida del derecho.
                                </p>
                            </details>
                        </div>
                    </section>

                    {/* SECCIÓN 3: DEDUCCIONES Y APORTES (Migrado de InformacionUtil) */}
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-2">
                            📊 3. Explicación de Deducciones
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold text-lg mb-2">Deducciones al Trabajador</h3>
                                <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
                                    <li><strong>INSS Laboral (7%):</strong> Se aplica al total de ingresos ordinarios (Salario Base, Comisiones, Horas Extras, Vacaciones Pagadas).</li>
                                    <li><strong>IR (Impuesto sobre la Renta):</strong> Calculado según tabla progresiva anual del Art. 23 de la Ley de Concertación Tributaria (Ley 822).</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2">Aportes Patronales (Costo Empresa)</h3>
                                <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
                                    <li><strong>INSS Patronal (22.5%):</strong> Para empresas con más de 50 trabajadores (Régimen Integral).</li>
                                    <li><strong>INATEC (2%):</strong> Aporte obligatorio sobre la nómina bruta mensual para educación técnica.</li>
                                </ul>
                                <div className="mt-4">
                                    <InfoSection type="patronal" />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* COLUMNA LATERAL */}
                <aside className="space-y-6">
                    {/* ENLACES OFICIALES (Migrado de ManualPage) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
                            🏛️ Enlaces Oficiales (Nicaragua)
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="https://www.mem.gob.ni/wp-content/uploads/2023/08/2014.12.18-Ley-891-Reformas-Ley-822-G-240.pdf"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-start gap-3 p-3 rounded hover:bg-sky-50 transition group"
                                >
                                    <span className="text-2xl">🏛️</span>
                                    <div>
                                        <p className="font-bold text-sm text-sky-700 group-hover:underline">Ley 891 - Reformas Fiscales</p>
                                        <p className="text-[10px] text-gray-500">Reformas LCT 822</p>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="http://www.mitrab.gob.ni/documentos/biblioteca-virtual"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-start gap-3 p-3 rounded hover:bg-sky-50 transition group"
                                >
                                    <span className="text-2xl">📚</span>
                                    <div>
                                        <p className="font-bold text-sm text-sky-700 group-hover:underline">Biblioteca Virtual MITRAB</p>
                                        <p className="text-[10px] text-gray-500">Documentos Laborales</p>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://oig.cepal.org/sites/default/files/1982_d974_nic.pdf"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-start gap-3 p-3 rounded hover:bg-sky-50 transition group"
                                >
                                    <span className="text-2xl">🏥</span>
                                    <div>
                                        <p className="font-bold text-sm text-sky-700 group-hover:underline">Ley de Seguridad Social</p>
                                        <p className="text-[10px] text-gray-500">Decreto 974</p>
                                    </div>
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Componentes Técnicos Reutilizables */}
                    <InfoSection type="subsidios" />
                    <InfoSection type="horas_extras" />

                    <div className="text-center text-xs text-gray-400 mt-8">
                        <p>Información con fines educativos.</p>
                        <p>Consulte siempre las fuentes oficiales.</p>
                    </div>


                </aside>
            </div>
        </div>
    );
};
