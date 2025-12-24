// src/utils/nomina.ts

// --- INTERFACES & TYPES ---

export interface TaxRates {
    inssLaboral: number;
    inatec: number;
    patronalPyme: number; // < 50 empleados
    patronalGran: number; // 50+ empleados
}

export interface DetalleIR {
    brutoAnual: number; // Referencial
    netoAnual: number;
    sobreExceso: number;
    porcentajeAplicable: number;
    impuestoBase: number;
    irAnual: number;
    irMensual: number;
}

export interface ResultadoNomina {
    // Ingresos
    salarioBase: number;
    diasTrabajados: number;
    comisiones: number;
    incentivos: number;
    viaticos: number;
    horasExtras: number;
    montoHorasExtras: number;
    diasVacaciones: number;
    montoVacaciones: number;
    ingresosNoDeducibles: number;
    totalIngresos: number;

    // Deducciones
    inssLaboral: number;
    ir: number;
    detalleIR?: DetalleIR; // Opcional para mostrar desglose en UI
    optica: number;
    embargoAlimenticio: number;
    embargoJudicial: number;
    otrosDeducciones: number;
    totalDeducciones: number;

    // Totales Netos
    salarioNeto: number;

    // Costos Patronales & Provisiones (Oculto al empleado, visible para la empresa)
    inssPatronal: number;
    inatec: number;
    costoTotalEmpleador: number;
    tasaPatronalAplicada: number;
    provisionAguinaldo: number;
    provisionIndemnizacion: number; // Agregado para completitud contable
    provisionVacaciones: number;    // Agregado para completitud contable
}

export interface OpcionesNomina {
    horasExtras?: number;
    comisiones?: number;
    incentivos?: number;
    viaticos?: number;
    diasVacaciones?: number;
    ingresosNoDeducibles?: number;
    optica?: number;
    embargoAlimenticio?: number;
    embargoJudicial?: number;
    otrosDeducciones?: number;
    frecuencia?: 'mensual' | 'quincenal' | 'semanal' | 'catorcenal';
    cantidadEmpleados?: number;
    diasTrabajados?: number; // Opcional para prorrateo
    tasas?: TaxRates; // Dynamic tax rates
}

// --- DEFAULT CONSTANTS ---
const DEFAULT_TAX_RATES: TaxRates = {
    inssLaboral: 0.07,
    inatec: 0.02,
    patronalPyme: 0.215,
    patronalGran: 0.225
};

// Factores de precisión para evitar errores de redondeo (C$ 497.31)
export const FACTOR_MENSUAL = 1 / 12; // 0.0833333333333333...

// --- LÓGICA DE IR (IMPUESTO SOBRE LA RENTA) ---

/**
 * Calcula el IR anual proyectado con precisión de punto flotante.
 * Basado en Art. 23 de la Ley de Concertación Tributaria.
 */
export function calcularIRAnualDetallado(salarioNetoAnual: number): DetalleIR {
    let impuestoBase = 0;
    let porcentaje = 0;
    let sobreExceso = 0;

    // Tabla Progresiva 2024
    if (salarioNetoAnual <= 100000) {
        porcentaje = 0; sobreExceso = 0; impuestoBase = 0;
    } else if (salarioNetoAnual <= 200000) {
        porcentaje = 0.15; sobreExceso = 100000; impuestoBase = 0;
    } else if (salarioNetoAnual <= 350000) {
        porcentaje = 0.20; sobreExceso = 200000; impuestoBase = 15000;
    } else if (salarioNetoAnual <= 500000) {
        porcentaje = 0.25; sobreExceso = 350000; impuestoBase = 45000;
    } else {
        porcentaje = 0.30; sobreExceso = 500000; impuestoBase = 82500;
    }

    const irAnual = ((salarioNetoAnual - sobreExceso) * porcentaje) + impuestoBase;

    return {
        brutoAnual: 0,
        netoAnual: salarioNetoAnual,
        sobreExceso,
        porcentajeAplicable: porcentaje,
        impuestoBase,
        irAnual,
        irMensual: irAnual * FACTOR_MENSUAL // División precisa ( / 12)
    };
}

// --- CÁLCULO PRINCIPAL DE NÓMINA ---

export const calcularNominaMensual = (
    salarioBase: number,
    opciones: OpcionesNomina = {}
): ResultadoNomina => {
    // Desestructuración con valores por defecto
    const {
        horasExtras = 0,
        comisiones = 0,
        incentivos = 0,
        viaticos = 0,
        diasVacaciones = 0,
        ingresosNoDeducibles = 0,
        optica = 0,
        embargoAlimenticio = 0,
        embargoJudicial = 0,
        otrosDeducciones = 0,
        frecuencia = 'mensual',
        cantidadEmpleados = 50, // Asumimos >50 si no se especifica para seguridad
        tasas = DEFAULT_TAX_RATES
    } = opciones;

    // Normalización de frecuencia para cálculos
    let factorMes = 1;
    if (frecuencia === 'quincenal') factorMes = 2;
    if (frecuencia === 'catorcenal') factorMes = 2.1428; // Aprox 30/14
    if (frecuencia === 'semanal') factorMes = 4.3333;    // Aprox 52/12

    // 1. Cálculo de Ingresos
    // Convertimos todo a base mensual para obtener el valor hora correcto
    const salarioMensualizado = salarioBase * factorMes;
    const valorDia = salarioMensualizado / 30;
    const valorHora = valorDia / 8;

    // Lógica para días trabajados custom (Si se especifica, se prorratea el básico)
    let salarioBaseCalculo = salarioBase;
    let diasEfectivos = 30 / factorMes;

    // [CORRECCIÓN USUARIO]: Para semanal, mostrar 7 días exactos en lugar de 6.92 calculados
    if (frecuencia === 'semanal') {
        diasEfectivos = 7;
    }

    if (opciones.diasTrabajados && opciones.diasTrabajados > 0) {
        diasEfectivos = opciones.diasTrabajados;
        salarioBaseCalculo = valorDia * diasEfectivos;
    }

    // Horas extras pagan doble (Art. 62 CT)
    const montoHorasExtras = valorHora * 2 * horasExtras;
    const montoVacaciones = valorDia * diasVacaciones;

    const totalIngresos = salarioBaseCalculo + comisiones + incentivos + viaticos + montoVacaciones + montoHorasExtras + ingresosNoDeducibles;

    // 2. Base Imponible INSS (Todo ingreso salarial, excluyendo viáticos y no deducibles)
    const baseInss = totalIngresos - viaticos - ingresosNoDeducibles;
    const inssLaboral = baseInss * tasas.inssLaboral;

    // 3. Base Imponible IR (Ingreso Gravable - INSS)
    const baseIR = totalIngresos - viaticos - ingresosNoDeducibles - inssLaboral;

    // Factor de Proyección para IR:
    // Si paga quincenal, multiplicamos x24 para ver cuánto ganaría al año.
    // Si paga mensual, multiplicamos x12.
    let factorProyeccion = 12;
    if (frecuencia === 'quincenal') factorProyeccion = 24;
    if (frecuencia === 'semanal') factorProyeccion = 52;
    if (frecuencia === 'catorcenal') factorProyeccion = 26;

    const salarioAnualProyectado = baseIR * factorProyeccion;
    const dataIR = calcularIRAnualDetallado(salarioAnualProyectado);

    // Des-proyectamos el IR anual al periodo actual
    const ir = dataIR.irAnual / factorProyeccion;

    // 4. Totales Empleado
    const totalDeducciones = inssLaboral + ir + optica + embargoAlimenticio + embargoJudicial + otrosDeducciones;
    const salarioNeto = totalIngresos - totalDeducciones;

    // 5. Costos Patronales (Ocultos al empleado)
    const tasaPatronalReal = (cantidadEmpleados <= 50) ? tasas.patronalPyme : tasas.patronalGran;
    const inssPatronal = baseInss * tasaPatronalReal;
    const inatec = baseInss * tasas.inatec;

    // 6. Provisiones de Ley (Pasivos Laborales)
    // Usamos el salario base + comisiones para provisiones (Ingreso variable)
    const baseProvisiones = totalIngresos - viaticos - ingresosNoDeducibles;

    // [CORRECCIÓN SENIOR]: Uso de FACTOR_MENSUAL (1/12) para precisión exacta
    const provisionAguinaldo = baseProvisiones * FACTOR_MENSUAL;
    const provisionIndemnizacion = baseProvisiones * FACTOR_MENSUAL; // Un mes por año
    const provisionVacaciones = baseProvisiones * FACTOR_MENSUAL;    // Un mes por año (30 días)

    return {
        salarioBase: salarioBaseCalculo, // Retornamos el salario ya prorrateado si aplica
        diasTrabajados: diasEfectivos,
        comisiones,
        incentivos,
        viaticos,
        horasExtras,
        montoHorasExtras,
        diasVacaciones,
        montoVacaciones,
        ingresosNoDeducibles,
        totalIngresos,
        inssLaboral,
        ir,
        detalleIR: dataIR,
        optica,
        embargoAlimenticio,
        embargoJudicial,
        otrosDeducciones,
        totalDeducciones,
        salarioNeto,
        // Datos Patronales
        inssPatronal,
        inatec,
        tasaPatronalAplicada: tasaPatronalReal,
        provisionAguinaldo,
        provisionIndemnizacion,
        provisionVacaciones,
        costoTotalEmpleador: totalIngresos + inssPatronal + inatec + provisionAguinaldo + provisionIndemnizacion + provisionVacaciones
    };
};