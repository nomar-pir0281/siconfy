// src/utils/liquidacion.ts

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
    // Campos detallados para desglose en UI y Auditoría
    irSalario: number;
    irVacaciones: number;
    otrosDeducciones: number;
    totalIngresos: number;
    totalDeducciones: number;
    netoRecibir: number;
}

const TASA_INSS = 0.07;

// --- FUNCIONES AUXILIARES ---

/**
 * Cálculo de Días Comerciales (Método 30/360)
 * Estándar legal en Nicaragua.
 */
export const calcularDias360 = (fInicio: string, fFin: string): number => {
    if (!fInicio || !fFin) return 0;
    const d1 = new Date(fInicio);
    const d2 = new Date(fFin);

    // Ajuste de zona horaria
    d1.setMinutes(d1.getMinutes() + d1.getTimezoneOffset());
    d2.setMinutes(d2.getMinutes() + d2.getTimezoneOffset());

    const y1 = d1.getFullYear();
    const m1 = d1.getMonth() + 1;
    let day1 = d1.getDate();

    const y2 = d2.getFullYear();
    const m2 = d2.getMonth() + 1;
    let day2 = d2.getDate();

    // Ajuste fin de mes a 30 comercial
    if (day1 === 31) day1 = 30;
    if (day2 === 31) day2 = 30;

    return ((y2 - y1) * 360) + ((m2 - m1) * 30) + (day2 - day1) + 1;
};

/**
 * Cálculo manual de indemnización.
 * Preservado íntegramente para uso en IndemnizacionPage y cálculos aislados.
 */
export const calcularIndemnizacionManual = (
    tipoSalario: string,
    salarioBase: number,
    salariosVariables: number[],
    antiguedadAnios: number
): ResultadoIndemnizacion => {

    // Lógica para salario variable (promedio últimos 6 meses)
    let salarioMensual = salarioBase;
    if (tipoSalario === 'Variable') {
        // Validación para evitar división por cero o array vacío
        if (salariosVariables.length > 0) {
            const suma = salariosVariables.reduce((a, b) => a + b, 0);
            salarioMensual = suma / 6;
        }
    }

    // Usamos división directa para precisión
    const salarioDiario = salarioMensual / 30;

    // Regla del Art. 45 Código del Trabajo
    let diasPagar = 0;

    // Primeros 3 años: 1 mes por año (30 días/año)
    if (antiguedadAnios <= 3) {
        diasPagar = antiguedadAnios * 30;
    } else {
        // A partir del 4to año: 20 días adicionales por año
        diasPagar = 90; // Base de los primeros 3 años (30 * 3)
        let extra = antiguedadAnios - 3;

        // Aunque la ley dice "20 días por año adicional", existe interpretación sobre tope de años computables.
        // Aquí aplicamos la regla matemática estándar del Art 45 sin límite de años, pero con TECHO de monto.
        // Nota: Si se requiere limitar los años extra a 3 (para total 6), descomentar:
        // if (extra > 3) extra = 3; 

        diasPagar += extra * 20;
    }

    // Techo legal INDISPENSABLE: 5 meses de salario (150 días)
    if (diasPagar > 150) diasPagar = 150;

    return {
        indemnizacion: diasPagar * salarioDiario,
        detalle: `Cálculo base: ${diasPagar.toFixed(2)} días x C$ ${salarioDiario.toFixed(2)}`
    };
};

// --- CÁLCULO CENTRAL DE LIQUIDACIÓN ---
export const calcularLiquidacion = (
    fechaInicio: string,
    fechaFin: string,
    salarioMensual: number,
    vacacionesPendientes: number,
    diasSalarioPendiente: number,
    motivo: string
): ResultadoLiquidacion => {

    const diasTrabajados = calcularDias360(fechaInicio, fechaFin);
    const salarioDiario = salarioMensual / 30;

    // 1. Antigüedad
    const antiguedadAños = Math.floor(diasTrabajados / 360);
    const antiguedadMeses = Math.floor((diasTrabajados % 360) / 30);
    const antiguedadDias = (diasTrabajados % 360) % 30;

    // 2. Indemnización (Art. 45)
    let montoIndemnizacion = 0;
    // 'despido-causa-justa' es el único escenario donde se pierde la indemnización
    if (motivo !== 'despido-causa-justa') {
        // Convertimos días totales a años decimales para reutilizar la función manual precisa
        const antiguedadDecimal = diasTrabajados / 360;
        const resManual = calcularIndemnizacionManual('Fijo', salarioMensual, [], antiguedadDecimal);
        montoIndemnizacion = resManual.indemnizacion;
    }

    // 3. Aguinaldo (Treceavo Mes)
    const dateFin = new Date(fechaFin);
    let añoAguinaldo = dateFin.getFullYear();
    // Ciclo inicia 1 de Diciembre del año anterior
    if (dateFin.getMonth() < 11) añoAguinaldo -= 1;

    const inicioAguinaldoStr = `${añoAguinaldo}-12-01`;
    const fInicioReal = new Date(inicioAguinaldoStr) > new Date(fechaInicio) ? inicioAguinaldoStr : fechaInicio;

    const diasAguinaldo = Math.max(0, calcularDias360(fInicioReal, fechaFin));

    // [CORRECCIÓN PRECISION]: (Días / 30) * (Salario / 12)
    // Usamos divisiones directas para evitar pérdida de decimales con factores aproximados.
    const montoAguinaldo = (diasAguinaldo / 30) * (salarioMensual / 12);

    // 4. Ingresos Gravables (Vacaciones + Salario)
    const montoVacaciones = vacacionesPendientes * salarioDiario;
    const montoSalario = diasSalarioPendiente * salarioDiario;

    // 5. Totales Brutos
    const totalIngresos = montoIndemnizacion + montoAguinaldo + montoVacaciones + montoSalario;

    // 6. Deducciones INSS (7%) - Indemnización y Aguinaldo Exentos
    const inssSalario = montoSalario * TASA_INSS;
    const inssVacaciones = montoVacaciones * TASA_INSS;
    const inss = inssSalario + inssVacaciones;

    // 7. [AUDITORIA] CÁLCULO DE IR REFACTORIZADO (MÉTODO MARGINAL)
    // Este método es el único matemáticamente exacto para rentas ocasionales acumuladas.
    // Corrige el error de C$ 497.31 causado por discrepancias en tasas efectivas.

    // A) IR sobre Salario Ordinario Pendiente
    // Base Anual Teórica sin vacaciones = Salario Neto x 12
    const baseMensualNeta = salarioMensual * (1 - TASA_INSS);
    const baseAnualProyectada = baseMensualNeta * 12;

    const irAnualBaseData = calcularIRAnualDetallado(baseAnualProyectada);
    // Prorrateo diario exacto del IR mensual
    const irSalario = (irAnualBaseData.irMensual / 30) * diasSalarioPendiente;

    // B) IR sobre Vacaciones (Diferencial)
    // 1. Calculamos el impuesto que pagaría si SOLO ganara su salario (Ya lo tenemos: irAnualBaseData.irAnual)
    // 2. Calculamos el impuesto que pagaría si ganara Salario + Vacaciones
    const vacacionesNetas = montoVacaciones - inssVacaciones;
    const nuevaBaseAnual = baseAnualProyectada + vacacionesNetas;

    const irAnualConVacacionesData = calcularIRAnualDetallado(nuevaBaseAnual);

    // 3. La diferencia es el impuesto exacto atribuible a las vacaciones
    let irVacaciones = irAnualConVacacionesData.irAnual - irAnualBaseData.irAnual;

    // Validación de seguridad (no negativo)
    if (irVacaciones < 0) irVacaciones = 0;

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
        irSalario,      // Desglose para UI
        irVacaciones,   // Desglose para UI
        otrosDeducciones: 0,
        totalIngresos,
        totalDeducciones,
        netoRecibir: totalIngresos - totalDeducciones
    };
};