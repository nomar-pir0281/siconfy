// src/InformacionUtil.tsx
import React, { useState } from "react";

export const InformacionUtil = () => {
    // AGREGADO: Pestaña 'bases' para iniciar y 'indemnizacion' para la sección de Art. 45
    const [seccion, setSeccion] = useState<'bases' | 'ir' | 'indemnizacion' | 'faq'>('bases');

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-200 mt-6 text-gray-800">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                ℹ️ Centro de Información Laboral (Nicaragua)
            </h2>

            <div className="flex border-b border-gray-300 mb-6 flex-wrap">
                <button 
                    onClick={() => setSeccion('bases')}
                    className={`px-3 py-2 text-sm font-bold ${seccion === 'bases' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Bases Legales
                </button>
                <button 
                    onClick={() => setSeccion('ir')}
                    className={`px-3 py-2 text-sm font-bold ${seccion === 'ir' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Impuesto sobre la Renta (IR)
                </button>
                <button 
                    onClick={() => setSeccion('indemnizacion')}
                    className={`px-3 py-2 text-sm font-bold ${seccion === 'indemnizacion' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Indemnización Art. 45
                </button>
                <button 
                    onClick={() => setSeccion('faq')}
                    className={`px-3 py-2 text-sm font-bold ${seccion === 'faq' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Aguinaldo
                </button>
            </div>

            {/* SECCIÓN BASES LEGALES */}
            {seccion === 'bases' && (
                <div className="animate-fade-in space-y-4">
                    <p>Los cálculos realizados en Siconfy ERP se basan en la **Legislación Laboral de Nicaragua**, principalmente en:</p>
                    <ul className="list-disc pl-5">
                        <li>**Código del Trabajo (CT)**: Específicamente el cálculo de Aguinaldo (Art. 93), Vacaciones (Art. 78) e Indemnización (Art. 45).</li>
                        <li>**Ley de Concertación Tributaria (Ley 822)**: Para las deducciones del Impuesto sobre la Renta (IR).</li>
                        <li>**Ley de Seguridad Social (INSS)**: Para la deducción del 7% al trabajador.</li>
                    </ul>
                    <p className="bg-blue-50 p-3 rounded text-sm border-l-4 border-blue-400">
                        <strong className="text-blue-700">Nota</strong>: El salario diario se calcula usando 30 días, y el cálculo de tiempo se basa en el método comercial de 360 días por año (12 meses de 30 días).
                    </p>
                </div>
            )}

            {/* SECCIÓN IMPUESTO SOBRE LA RENTA (IR) */}
            {seccion === 'ir' && (
                <div className="animate-fade-in">
                    <h3 className="text-lg font-bold mb-4">Tabla Progresiva del IR (Rentas del Trabajo)</h3>
                    <p className="mb-4">El cálculo del IR se basa en la renta anual neta (Salario Anual menos INSS Anual) según la tabla progresiva de la Ley 822. El **INSS Laboral es del 7%**.</p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse border border-gray-300">
                            <thead className="bg-slate-100 uppercase text-xs">
                                <tr><th className="border p-2">Estrato Anual (C$)</th><th className="border p-2">Impuesto Base</th><th className="border p-2">%</th><th className="border p-2">Sobre Exceso</th></tr>
                            </thead>
                            <tbody>
                                <tr><td className="border p-2">0.01 a 100,000</td><td className="border p-2">0</td><td className="border p-2">0%</td><td className="border p-2">0</td></tr>
                                <tr className="bg-gray-50"><td className="border p-2">100,000.01 a 200,000</td><td className="border p-2">0</td><td className="border p-2">15%</td><td className="border p-2">100,000</td></tr>
                                <tr><td className="border p-2">200,000.01 a 350,000</td><td className="border p-2">15,000</td><td className="border p-2">20%</td><td className="border p-2">200,000</td></tr>
                                <tr className="bg-gray-50"><td className="border p-2">350,000.01 a 500,000</td><td className="border p-2">45,000</td><td className="border p-2">25%</td><td className="border p-2">350,000</td></tr>
                                <tr><td className="border p-2">500,000.01 a más</td><td className="border p-2">82,500</td><td className="border p-2">30%</td><td className="border p-2">500,000</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* SECCIÓN INDEMNIZACIÓN */}
            {seccion === 'indemnizacion' && (
                <div className="animate-fade-in space-y-4">
                    <h3 className="text-lg font-bold mb-4">Indemnización (Art. 45 del Código del Trabajo)</h3>
                    <p>La indemnización se paga al trabajador en caso de despido sin causa justa. El cálculo se realiza en base al salario más alto devengado en los últimos 6 meses. La ley establece un **tope de 5 meses de salario**.</p>
                    <p className="font-semibold">Cálculo de Antigüedad:</p>
                    <ul className="list-disc pl-5 text-sm">
                        <li>**Menos de 3 años:** 1 mes de salario por cada año de servicio, proporcionalmente por fracciones.</li>
                        <li>**De 3 a 6 años:** 3 meses de salario por los primeros 3 años, más 20 días de salario por cada año adicional.</li>
                        <li>**Más de 6 años:** El cálculo continúa con 20 días por año adicional hasta alcanzar el tope de 5 meses (150 días de salario).</li>
                    </ul>

                    <h4 className="font-bold mt-4">Ejemplo (Salario C$ 54,936.45):</h4>
                    <p className="text-sm">Si un empleado con salario de **C$ 54,936.45** es despedido con 1 año y 6 meses de antigüedad:</p>
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
Salario Diario: C$ 54,936.45 / 30 días = C$ 1,831.22
Antigüedad: 1.5 años
Días a indemnizar (proporcional): 1.5 años * 30 días/año = 45 días
Monto: 45 días * C$ 1,831.22 = C$ 82,404.90
                    </pre>
                </div>
            )}
            
            {/* SECCIÓN AGUINALDO */}
            {seccion === 'faq' && (
                <div className="animate-fade-in space-y-4">
                    <h3 className="text-lg font-bold mb-4">Cálculo de Aguinaldo (Art. 93 CT)</h3>
                    <p>El Aguinaldo (o décimo tercer mes) se calcula desde el 1 de diciembre hasta el 30 de noviembre del año siguiente. Si la relación laboral termina antes, se paga la parte proporcional. Es un doceavo del total de salarios ordinarios devengados en el período.</p>
                    <p className="font-semibold">Fórmula simplificada:</p>
                    <p className="bg-gray-100 p-3 rounded text-sm">Se acumulan **2.5 días de salario** por cada mes trabajado en el ciclo del aguinaldo.</p>
                    <h4 className="font-bold mt-4">Ejemplo Proporcional:</h4>
                    <p className="text-sm">Si un empleado con el mismo salario **C$ 54,936.45** trabaja 3.715 meses (113 días) en el ciclo de aguinaldo:</p>
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
Salario Diario: C$ 1,831.22
Días a Favor: 3.715 meses * 2.5 días/mes = 9.2875 días
Monto Aguinaldo: 9.2875 días * C$ 1,831.22 = C$ 17,007.72
                    </pre>
                    <p className="text-xs italic mt-2">Este monto coincide con el cálculo del Finiquito adjunto.</p>
                </div>
            )}
        </div>
    );
};