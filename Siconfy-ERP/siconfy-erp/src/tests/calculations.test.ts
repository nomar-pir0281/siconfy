import { calcularNominaMensual, calcularIndemnizacion } from '../utils/nomina';

describe('Calculations', () => {
  it('should calculate monthly payroll with viáticos', () => {
    const result = calcularNominaMensual(10000, 0, 0, 0, 0, 500);
    expect(result.viaticos).toBe(500);
    expect(result.totalIngresos).toBe(10500);
    expect(result.salarioNeto).toBeGreaterThan(0);
  });

  it('should calculate indemnizacion for unjustified dismissal', () => {
    const result = calcularIndemnizacion('Despido Injustificado / Sin Causa Justa', 'Fijo', 10000, [], 5);
    expect(result.indemnizacion).toBe(50000);
    expect(result.detalle).toBe('Despido injustificado: 5 meses de salario');
  });
});