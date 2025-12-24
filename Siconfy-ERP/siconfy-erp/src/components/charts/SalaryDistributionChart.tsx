import React, { useMemo, useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

interface SalaryDistributionChartProps {
    salarioBruto: number;
    salarioNeto: number;
    inssLaboral: number;
    ir: number;
    otrasDeducciones: number;
}

export const SalaryDistributionChart: React.FC<SalaryDistributionChartProps> = ({
    salarioBruto,
    salarioNeto,
    inssLaboral,
    ir,
    otrasDeducciones
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const data = useMemo(() => [
        { label: 'Salario Neto', value: salarioNeto, color: '#22c55e', description: 'Dinero disponible para ti' }, // green-500
        { label: 'INSS Laboral', value: inssLaboral, color: '#ea580c', description: '7% según Ley de Seguridad Social' }, // orange-600
        { label: 'IR (Impuesto)', value: ir, color: '#dc2626', description: 'Retención según Ley 987' }, // red-600
        { label: 'Otras Deducc.', value: otrasDeducciones, color: '#64748b', description: 'Préstamos, embargos, etc.' }, // slate-500
    ].filter(d => d.value > 0), [salarioNeto, inssLaboral, ir, otrasDeducciones]);

    const total = data.reduce((sum, item) => sum + item.value, 0);

    // SVG Geometry Constants
    const size = 300;
    const center = size / 2;
    const radius = 120;
    const strokeWidth = 50;
    const radiusOffset = radius - strokeWidth / 2; // Center of the stroke
    const circumference = 2 * Math.PI * radiusOffset;

    let currentAngle = -90; // Start at top

    return (
        <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-sm border border-gray-100 animate-fade-in">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Distribución de Ingresos</h3>

            <div className="relative w-[300px] h-[300px]">
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                    <span className="text-xs font-bold text-gray-400 uppercase">Salario Bruto</span>
                    <span className="text-2xl font-black text-gray-800">{formatCurrency(salarioBruto)}</span>
                </div>

                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform rotate-0">
                    {data.map((item, index) => {
                        const percentage = item.value / total;
                        const strokeDasharray = `${percentage * circumference} ${circumference}`;
                        const strokeDashoffset = 0; // Fixed offset because we rotate the path
                        const rotation = currentAngle;

                        // Advance angle for next segment
                        currentAngle += percentage * 360;

                        const isHovered = hoveredIndex === index;

                        return (
                            <circle
                                key={item.label}
                                cx={center}
                                cy={center}
                                r={radiusOffset}
                                fill="transparent"
                                stroke={item.color}
                                strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                transform={`rotate(${rotation} ${center} ${center})`}
                                className="transition-all duration-300 ease-out cursor-pointer hover:opacity-90"
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <title>{`${item.label}: ${formatCurrency(item.value)} (${(percentage * 100).toFixed(1)}%)`}</title>
                            </circle>
                        );
                    })}
                </svg>
            </div>

            {/* Legend / Tooltip Info */}
            <div className="w-full mt-6 space-y-3">
                {data.map((item, index) => (
                    <div
                        key={item.label}
                        className={`flex items-center justify-between p-2 rounded transition-colors ${hoveredIndex === index ? 'bg-gray-50' : ''}`}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-700">{item.label}</span>
                                <span className="text-[10px] text-gray-400">{item.description}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-gray-800">{formatCurrency(item.value)}</p>
                            <p className="text-[10px] text-gray-400 font-mono">{((item.value / total) * 100).toFixed(1)}%</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
