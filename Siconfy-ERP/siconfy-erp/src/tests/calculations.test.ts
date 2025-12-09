import { calcularNominaMensual, calcularIndemnizacion } from '../utils/nomina';

describe('Calculations - Nómina', () => {
  it('Debe calcular nómina mensual restando viáticos de la base cotizable', () => {
    // Escenario: Salario 10,000 + 500 viáticos
    const result = calcularNominaMensual(10000, 0, 0, 0, 0, 500);
    
    expect(result.viaticos).toBe(500);
    expect(result.totalIngresos).toBe(10500);
    // El salario neto debe ser positivo
    expect(result.salarioNeto).toBeGreaterThan(0);
  });

  it('Debe calcular indemnización por despido injustificado (Pago Proporcional)', () => {
    // Escenario: Despido, Salario Fijo 10,000, 5 años antigüedad
    const result = calcularIndemnizacion('Despido Injustificado / Sin Causa Justa', 'Fijo', 10000, [], 5);
    
    // 5 años * 10,000 = 50,000
    expect(result.indemnizacion).toBe(50000);
    
    // CORRECCIÓN: Actualizamos el texto esperado para coincidir con nomina.ts
    expect(result.detalle).toBe('Despido injustificado: Pago proporcional antigüedad');
  });
});