// src/utils/liquidacion.ts
import { differenceInDays, differenceInYears } from 'date-fns';
// [AUDITORIA] Importamos la lógica centralizada de nómina para consistencia en IR Ordinario
import { calcularIRAnualDetallado } from './nomina'; 

// --- INTERFACES ---

export interface ResultadoIndemnizacion {
    indemnizacion: number;
    detalle: string;
}

export interface ResultadoLiquidacion {
    antiguedadAños: number;
    antiguedadMeses: number;
    antiguedadDias: number;
    salarioDiario: number;
    montoSalarioPendiente: number;
    montoIndemnizacion: number;
    montoAguinaldo: number;
    montoVacaciones: number;
    inss: number;
    ir: number;
    // [AUDITORIA] Nuevos campos para desglose y transparencia
    irSalario: number;
    irVacaciones: number; 
    totalIngresos: number;
    totalDeducciones: number;
    netoRecibir: number;
}

const TASA_INSS = 0.07;

// --- FUNCIONES AUXILIARES ---

/**
 * Cálculo de Días Comerciales (Método 30/360)
 * Base legal para prestaciones en Nicaragua
 */
export const calcularDias360 = (fInicio: string, fFin: string): number => {
    if (!fInicio || !fFin) return 0;
    const d1 = new Date(fInicio);
    const d2 = new Date(fFin);
    
    // Ajuste de zona horaria para evitar desfases
    d1.setMinutes(d1.getMinutes() + d1.getTimezoneOffset());
    d2.setMinutes(d2.getMinutes() + d2.getTimezoneOffset());

    const y1 = d1.getFullYear();
    const m1 = d1.getMonth() + 1;
    let day1 = d1.getDate();

    const y2 = d2.getFullYear();
    const m2 = d2.getMonth() + 1;
    let day2 = d2.getDate();

    // Ajuste fin de mes a 30
    if (day1 === 31) day1 = 30;
    if (day2 === 31) day2 = 30;

    return ((y2 - y1) * 360) + ((m2 - m1) * 30) + (day2 - day1) + 1;
};

// Función auxiliar de IR Ocasional (Rentas del Trabajo eventuales)
// Se utiliza para Vacaciones e Indemnizaciones Gravadas (si las hubiera)
const obtenerTasaOcasional = (salarioMensual: number): number => {
    const inss = salarioMensual * TASA_INSS;
    const anualNeto = (salarioMensual - inss) * 12;
    
    // Tabla Progresiva para Retenciones Definitivas (Art. Reglamento LCT)
    if (anualNeto > 500000) return 0.30;
    if (anualNeto > 350000) return 0.25;
    if (anualNeto > 200000) return 0.20;
    if (anualNeto > 100000) return 0.15;
    return 0.10; // Mínimo 10% para rentas ocasionales (ajustar si la política interna es 0% bajo 100k, pero ley suele indicar retención)
};

// --- CÁLCULO MANUAL (IndemnizacionPage) ---
export const calcularIndemnizacionManual = (
    motivo: string,
    tipoSalario: string,
    salarioBase: number,
    salariosVariables: number[],
    antiguedadAnios: number
): ResultadoIndemnizacion => {

  console.log('DEBUG Indemnizacion: antiguedadAnios =', antiguedadAnios);

  // 1. Salario Promedio
  let salarioMensual = salarioBase;
  if (tipoSalario === 'Variable') {
    const suma = salariosVariables.reduce((a, b) => a + b, 0);
    salarioMensual = suma / 6;
  }
  const salarioDiario = salarioMensual / 30;

  console.log('DEBUG Indemnizacion: salarioMensual =', salarioMensual, 'salarioDiario =', salarioDiario);

  // 2. Días a Pagar (Art 45)
  let diasPagar = 0;
  // Regla: 1 mes por cada uno de los primeros 3 años. 20 días a partir del 4to.
  if (antiguedadAnios <= 3) {
    diasPagar = antiguedadAnios * 30;
  } else {
    diasPagar = 90; // 3 años * 30
    let extra = antiguedadAnios - 3;
    // Tope legal: Los 20 días extra aplican hasta un tope total de 5 meses (150 días)
    if (extra > 3) extra = 3;
    
    diasPagar += extra * 20;
  }

  // Techo absoluto 5 salarios
  if (diasPagar > 150) {
    diasPagar = 150;
  }

  const indemnizacion = diasPagar * salarioDiario;
  console.log('DEBUG Indemnizacion: final diasPagar =', diasPagar, 'indemnizacion =', indemnizacion);

  return {
    indemnizacion,
    detalle: `Cálculo base: ${diasPagar.toFixed(2)} días x C$ ${salarioDiario.toFixed(2)}`
  };
};

// --- CÁLCULO AUTOMÁTICO (CalculadoraLiquidacion) ---
export const calcularLiquidacion = (
    fechaInicio: string,
    fechaFin: string,
    salarioMensual: number,
    vacacionesPendientes: number,
    diasSalarioPendiente: number,
    motivo: 'renuncia-15' | 'renuncia-inmediata' | 'despido-art45' | 'despido-causa-justa' | 'fallecimiento'
): ResultadoLiquidacion => {
    
    const diasTrabajados = calcularDias360(fechaInicio, fechaFin);
    const salarioDiario = salarioMensual / 30;

    console.log('DEBUG Liquidacion: diasTrabajados =', diasTrabajados, 'salarioDiario =', salarioDiario);

    // 1. Antigüedad
    const antiguedadAños = Math.floor(diasTrabajados / 360);
    const antiguedadMeses = Math.floor((diasTrabajados % 360) / 30);
    const antiguedadDias = (diasTrabajados % 360) % 30;

    // 2. Indemnización (Art. 45)
    let montoIndemnizacion = 0;
    if (['renuncia-15', 'despido-art45', 'fallecimiento'].includes(motivo)) {
        // Para el cálculo automático, asumimos salario fijo base
        const resManual = calcularIndemnizacionManual('Despido', 'Fijo', salarioMensual, [], antiguedadAños + (antiguedadMeses/12));
        montoIndemnizacion = resManual.indemnizacion;
    }

    // 3. Aguinaldo (Proporcional)
    const dateFin = new Date(fechaFin);
    let añoAguinaldo = dateFin.getFullYear();
    if (dateFin.getMonth() < 11) añoAguinaldo -= 1;
    
    const inicioAguinaldoStr = `${añoAguinaldo}-12-01`;
    const fInicioReal = new Date(inicioAguinaldoStr) > new Date(fechaInicio) ? inicioAguinaldoStr : fechaInicio;
    
    const diasAguinaldo = calcularDias360(fInicioReal, fechaFin);
    const montoAguinaldo = (diasAguinaldo / 30) * 2.5 * salarioDiario;

    // 4. Vacaciones y Salario Ordinario
    const montoVacaciones = vacacionesPendientes * salarioDiario;
    const montoSalario = diasSalarioPendiente * salarioDiario;

    // 5. Totales Ingresos
    const totalIngresos = montoIndemnizacion + montoAguinaldo + montoVacaciones + montoSalario;

    // 6. Deducciones (INSS)
    // El INSS se calcula sobre el Salario Ordinario y las Vacaciones pagadas. 
    // Indemnización y Aguinaldo están exentos.
    const inssSalario = montoSalario * TASA_INSS;
    const inssVacaciones = montoVacaciones * TASA_INSS;
    const inss = inssSalario + inssVacaciones;

    // 7. Deducciones (IR - Impuesto sobre la Renta)
    // [AUDITORIA] Corrección: Separar cálculo de IR Ordinario e IR Ocasional

    // A) IR sobre Salario Ordinario Pendiente (Proyección Anual)
    // Calculamos el IR mensual teórico de un mes completo y prorrateamos por los días trabajados.
    const baseIRMensualTeorica = salarioMensual - (salarioMensual * TASA_INSS);
    // Proyectamos a 12 meses para obtener la tasa efectiva anual según tabla progresiva
    const irAnualDetalle = calcularIRAnualDetallado(baseIRMensualTeorica * 12);
    const irMensualTeorico = irAnualDetalle.irMensual;
    // Prorrateo: (IR Mensual / 30) * Días Pagados
    const irSalario = (irMensualTeorico / 30) * diasSalarioPendiente;

    // B) IR sobre Vacaciones (Renta Ocasional / Retención Definitiva)
    // Las vacaciones pagadas en liquidación sufren retención definitiva (generalmente 10% a 30% según monto global)
    // Usamos la función auxiliar que determina la tasa basada en el ingreso anual estimado
    const tasaOcasional = obtenerTasaOcasional(salarioMensual);
    const baseVacaciones = montoVacaciones - inssVacaciones; // La base es neta de INSS
    let irVacaciones = 0;
    
    // Solo aplicamos retención si hay monto positivo
    if (baseVacaciones > 0) {
        irVacaciones = baseVacaciones * tasaOcasional;
    }

    const ir = irSalario + irVacaciones;
    const totalDeducciones = inss + ir;

    return {
        antiguedadAños, antiguedadMeses, antiguedadDias,
        salarioDiario,
        montoSalarioPendiente: montoSalario,
        montoIndemnizacion,
        montoAguinaldo,
        montoVacaciones,
        inss,
        ir,
        irSalario,      // Nuevo campo auditado
        irVacaciones,   // Nuevo campo auditado
        totalIngresos,
        totalDeducciones,
        netoRecibir: totalIngresos - totalDeducciones
    };
};