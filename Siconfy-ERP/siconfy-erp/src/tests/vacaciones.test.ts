import { calcularDias360 } from '../utils/liquidacion';

// Test the vacation calculation logic
describe('Vacaciones - Cálculos', () => {
  // Test the proportional calculation used in VacacionesPage
  const calcularProporcionalHoy = (fechaIngreso: string) => {
    const start = new Date(fechaIngreso);
    const now = new Date('2024-12-14'); // Fixed date for testing

    if (isNaN(start.getTime())) return 0;

    const diffTime = now.getTime() - start.getTime();
    if (diffTime < 0) return 0;

    // (Días Trabajados / 360) * 30 - Año comercial de 360 días
    const diasTrabajados = diffTime / (1000 * 60 * 60 * 24);
    return (diasTrabajados / 360) * 30;
  };

  it('Debe calcular acumulación proporcional correctamente', () => {
    // Empleado con 1 año (366 días en 2024 bisiesto)
    const result1Year = calcularProporcionalHoy('2023-12-14');
    console.log('DEBUG Test - 1 year result:', result1Year);
    expect(result1Year).toBeCloseTo(30.5, 1); // 366/360 * 30 = 30.5

    // Empleado con 6 meses (183 días aprox)
    const result6Months = calcularProporcionalHoy('2024-06-14');
    console.log('DEBUG Test - 6 months result:', result6Months);
    expect(result6Months).toBeCloseTo(15.25, 1); // Should be ~15.25 days

    // Empleado con 1 mes (30 días)
    const result1Month = calcularProporcionalHoy('2024-11-14');
    console.log('DEBUG Test - 1 month result:', result1Month);
    expect(result1Month).toBeCloseTo(2.5, 1); // Should be ~2.5 days
  });

  it('Debe calcular período Dec-Nov correctamente', () => {
    // Test the period calculation from prestaciones.ts logic
    const calcularAcumulacion = () => {
      const ahora = new Date('2024-12-14');
      const añoActual = ahora.getFullYear();
      const mesActual = ahora.getMonth() + 1;

      let inicioPeriodo: string;
      if (mesActual < 12) {
        inicioPeriodo = `${añoActual - 1}-12-01`;
      } else {
        inicioPeriodo = `${añoActual}-12-01`;
      }

      const fechaActual = ahora.toISOString().split('T')[0];
      const diasTotales = calcularDias360(inicioPeriodo, fechaActual);

      const meses = Math.min(diasTotales / 30, 12);
      return meses * 2.5;
    };

    // Current period: Dec 1, 2023 to Dec 14, 2024 = 14 days (since Dec 14 - Dec 1 = 13 days + 1 = 14)
    // 14 / 30 * 2.5 = 1.166...
    const result = calcularAcumulacion(); // Old hire date
    console.log('DEBUG Test - Period calculation result:', result);
    expect(result).toBeCloseTo(1.166, 2); // Should be proportional for 14 days in period
  });

  it('Debe calcular valor monetario correctamente', () => {
    const salarioBase = 10000;
    const diasDisponibles = 15;
    const salarioDiario = salarioBase / 30;
    const valorMonetario = salarioDiario * diasDisponibles;

    console.log('DEBUG Test - Monetary calculation:', 'salarioDiario =', salarioDiario, 'valorMonetario =', valorMonetario);
    expect(salarioDiario).toBe(333.3333333333333);
    expect(valorMonetario).toBe(5000);
  });
});