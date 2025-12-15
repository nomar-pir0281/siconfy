import { calcularNominaMensual } from '../utils/nomina';
import { calcularIndemnizacionManual } from '../utils/liquidacion';

describe('Calculations - Nómina', () => {
  it('Debe calcular nómina mensual restando viáticos de la base cotizable', () => {
    // Escenario: Salario 10,000 + 500 viáticos
    const result = calcularNominaMensual(10000, { viaticos: 500 });

    expect(result.viaticos).toBe(500);
    expect(result.totalIngresos).toBe(10500);
    // El salario neto debe ser positivo
    expect(result.salarioNeto).toBeGreaterThan(0);
  });

  it('Debe calcular indemnización por despido injustificado (Pago Proporcional)', () => {
    // Escenario: Despido, Salario Fijo 10,000, 5 años antigüedad
    const result = calcularIndemnizacionManual('Despido Injustificado / Sin Causa Justa', 'Fijo', 10000, [], 5);

    // 5 años: 3 meses + 2 años * 20 días = 90 + 40 = 130 días
    // 130 días * (10000 / 30) ≈ 43333.33
    expect(result.indemnizacion).toBeCloseTo(43333.33, 2);

    expect(result.detalle).toBe('Cálculo base: 130.00 días x C$ 333.33');
  });
});