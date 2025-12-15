import { calcularLiquidacion, calcularDias360 } from '../utils/liquidacion';

describe('Cálculos de Liquidación Nicaragua', () => {
    
    test('Cálculo de Días 360 (Año Completo)', () => {
        // 1 Enero a 31 Diciembre = 360 días
        const dias = calcularDias360('2025-01-01', '2025-12-31');
        expect(dias).toBe(360);
    });

    test('Caso Renuncia Inmediata (Sin Indemnización)', () => {
        // Salario 10,000, Renuncia inmediata. No debe haber indemnización.
        const res = calcularLiquidacion(
            '2025-01-01', '2025-06-30',
            10000, 0, 0, 'renuncia-inmediata'
        );
        expect(res.montoIndemnizacion).toBe(0);
        expect(res.antiguedadMeses).toBe(6);
    });

    test('Caso Despido Art.45 (Indemnización con Techo 5 meses)', () => {
        // Trabajó 10 años (2015-2025). Salario 10,000.
        // Antigüedad > 6 años -> Indemnización limitada a 5 meses (150 días)
        const res = calcularLiquidacion(
            '2015-01-01', '2025-01-01',
            10000, 0, 0, 'despido-art45'
        );
        expect(res.antiguedadAños).toBeGreaterThanOrEqual(10);
        expect(res.montoIndemnizacion).toBeCloseTo(50000, 1);
    });

    test('Cálculo INSS Laboral (7%)', () => {
        // Salario pendiente 30 días = 10,000
        // INSS = 10,000 * 0.07 = 700
        const res = calcularLiquidacion(
            '2025-01-01', '2025-02-01',
            10000, 0, 30, 'renuncia-inmediata'
        );
        expect(res.inss).toBeCloseTo(700, 1);
    });
});