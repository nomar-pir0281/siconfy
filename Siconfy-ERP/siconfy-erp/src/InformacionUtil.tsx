// src/InformacionUtil.tsx
import { useState } from "react";

export const InformacionUtil = () => {
    const [seccion, setSeccion] = useState<'ir' | 'faq'>('ir');

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-200 mt-6 text-gray-800">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                ℹ️ Centro de Información Laboral
            </h2>

            <div className="flex border-b border-gray-300 mb-6">
                <button 
                    onClick={() => setSeccion('ir')}
                    className={`px-6 py-2 font-bold ${seccion === 'ir' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Tabla IR Anual
                </button>
                <button 
                    onClick={() => setSeccion('faq')}
                    className={`px-6 py-2 font-bold ${seccion === 'faq' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Preguntas Frecuentes
                </button>
            </div>

            {seccion === 'ir' && (
                <div className="animate-fade-in">
                    <h3 className="text-lg font-bold mb-4">Tabla Progresiva del IR (Rentas del Trabajo)</h3>
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

            {seccion === 'faq' && (
                <div className="space-y-4">
                    <h4 className="font-bold text-blue-700">¿Cómo se calcula el Aguinaldo?</h4>
                    <p className="text-sm">Se acumulan 2.5 días de salario por cada mes trabajado.</p>
                </div>
            )}
        </div>
    );
};