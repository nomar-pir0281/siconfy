import React from "react";

export const InformacionUtil = () => {
    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-blue-800">Centro de Ayuda y Base Legal (Nicaragua)</h2>
            
            <div className="space-y-6">
                <section>
                    <h3 className="font-bold text-lg border-b pb-2">1. Deducciones de Ley</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-700">
                        <li><strong>INSS Laboral (7%):</strong> Se aplica al total de ingresos ordinarios (Salario Base, Comisiones, Horas Extras, Vacaciones Pagadas). Según Decreto INSS.</li>
                        <li><strong>IR (Impuesto sobre la Renta):</strong> Calculado según tabla progresiva anual del Art. 23 de la Ley de Concertación Tributaria (Ley 822). Se deduce del salario neto de INSS.</li>
                    </ul>
                </section>

                <section>
                    <h3 className="font-bold text-lg border-b pb-2">2. Aportes Patronales</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-700">
                        <li><strong>INSS Patronal (21.5% o 22.5%):</strong> Aplicable a empresas con más de 50 trabajadores (22.5%) o régimen general.</li>
                        <li><strong>INATEC (2%):</strong> Aporte obligatorio sobre la nómina bruta bruta mensual.</li>
                    </ul>
                </section>

                <section>
                    <h3 className="font-bold text-lg border-b pb-2">3. Prestaciones Sociales (Código del Trabajo)</h3>
                    <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                        <p><strong>Aguinaldo (Décimo Tercer Mes):</strong> Un mes de salario por año trabajado, o proporcional. Se paga en los primeros 10 días de diciembre.</p>
                        <p className="mt-2"><strong>Vacaciones:</strong> 15 días de descanso por cada 6 meses de trabajo (2.5 días por mes). Son acumulables hasta 2 años.</p>
                        <p className="mt-2"><strong>Indemnización por Antigüedad (Art. 45):</strong></p>
                        <ul className="list-circle pl-5 text-sm mt-1">
                            <li>1 mes de salario por cada uno de los primeros 3 años.</li>
                            <li>20 días de salario por el 4to, 5to y 6to año.</li>
                        </ul>
                    </div>
                </section>
            </div>
            
            <div className="mt-8 pt-4 border-t text-center">
                <a href="/Terminos.html" className="text-blue-600 hover:underline mx-2">Términos de Uso</a>
                |
                <a href="/Politica.html" className="text-blue-600 hover:underline mx-2">Política de Privacidad</a>
            </div>
        </div>
    );
};