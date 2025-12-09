import { calcularDias360 } from './liquidacion';

export function calcularAcumulacion(fechaIngreso: string): number {
  if (!fechaIngreso) return 0;

  // Calcular período actual de vacaciones (de diciembre a noviembre)
  const ahora = new Date();
  const añoActual = ahora.getFullYear();
  const mesActual = ahora.getMonth() + 1; // 1-12

  // Inicio del período actual: 1 de diciembre del año anterior si estamos antes de diciembre
  let inicioPeriodo: string;
  if (mesActual < 12) {
    inicioPeriodo = `${añoActual - 1}-12-01`;
  } else {
    inicioPeriodo = `${añoActual}-12-01`;
  }

  const fechaActual = ahora.toISOString().split('T')[0];
  const diasTotales = calcularDias360(inicioPeriodo, fechaActual);

  // Acumulación: 2.5 días por mes
  const meses = Math.min(diasTotales / 30, 12); // Máximo 12 meses por período
  return meses * 2.5;
}

export function calcularAcumulacionTotal(fechaIngreso: string): number {
  if (!fechaIngreso) return 0;

  const fechaActual = new Date().toISOString().split('T')[0];
  const diasTotales = calcularDias360(fechaIngreso, fechaActual);

  // Acumulación total: 2.5 días por mes desde ingreso
  const meses = diasTotales / 30;
  return meses * 2.5;
}