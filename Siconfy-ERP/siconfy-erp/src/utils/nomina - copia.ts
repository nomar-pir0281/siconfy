// src/utils/nomina.ts
import { TASA_INSS, TECHO_SALARIAL, TASAS_PATRONALES } from './constants';

export interface DetalleIR {
    salarioAnual: number;
    sobreExceso: number;
    porcentaje: number;
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
    detalleIR?: DetalleIR;
    optica: number;
    embargoAlimenticio: number;
    embargoJudicial: number;
    otrosDeducciones: number;
    totalDeducciones: number;

    // Totales
    salarioNeto: number;

    // Patronales & Provisiones
    inssPatronal: number;
    inatec: number;
    costoTotalEmpleador: number;
    tasaPatronalAplicada: number;
    provisionAguinaldo: number; // NUEVO CAMPO
}

const TASA_INATEC = 0.02;

export function calcularIRAnualDetallado(salarioAnual: number): DetalleIR {
    let impuestoBase = 0;
    let porcentaje = 0;
    let sobreExceso = 0;

    if (salarioAnual <= 100000) {
        porcentaje = 0; sobreExceso = 0; impuestoBase = 0;
    } else if (salarioAnual <= 200000) {
        porcentaje = 0.15; sobreExceso = 100000; impuestoBase = 0;
    } else if (salarioAnual <= 350000) {
        porcentaje = 0.20; sobreExceso = 200000; impuestoBase = 15000;
    } else if (salarioAnual <= 500000) {
        porcentaje = 0.25; sobreExceso = 350000; impuestoBase = 45000;
    } else {
        porcentaje = 0.30; sobreExceso = 500000; impuestoBase = 82500;
    }

    const irAnual = ((salarioAnual - sobreExceso) * porcentaje) + impuestoBase;

    return {
        salarioAnual,
        sobreExceso,
        porcentaje,
        impuestoBase,
        irAnual,
        irMensual: irAnual / 12
    };
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
    frecuencia?: 'mensual' | 'quincenal' | 'semanal';
    cantidadEmpleados?: number;
}

export const calcularNominaMensual = (
    salarioBase: number,
    opciones: OpcionesNomina = {}
): ResultadoNomina => {
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
        cantidadEmpleados = 51
    } = opciones;

    let factorMes = 1;
    if (frecuencia === 'quincenal') factorMes = 2;
    if (frecuencia === 'semanal') factorMes = 4.3333;

    // 1. Ingresos
    const salarioMensualizado = salarioBase * factorMes;
    const valorHora = (salarioMensualizado / 30) / 8;
    const montoHorasExtras = valorHora * 2 * horasExtras;
    const montoVacaciones = (salarioMensualizado / 30) * diasVacaciones;
    const totalIngresos = salarioBase + comisiones + incentivos + viaticos + montoVacaciones + montoHorasExtras + ingresosNoDeducibles;

    // 2. INSS Laboral
    const baseInss = totalIngresos - viaticos - ingresosNoDeducibles;
    const inssLaboral = Math.min(baseInss, TECHO_SALARIAL) * TASA_INSS;

    // 3. IR Laboral
    const baseIR = totalIngresos - viaticos - ingresosNoDeducibles - inssLaboral;
    let factorProyeccion = 12;
    if (frecuencia === 'quincenal') factorProyeccion = 24;
    if (frecuencia === 'semanal') factorProyeccion = 52;
    const dataIR = calcularIRAnualDetallado(baseIR * factorProyeccion);
    const ir = dataIR.irMensual * (12 / factorProyeccion);

    // 4. Totales
    const totalDeducciones = inssLaboral + ir + optica + embargoAlimenticio + embargoJudicial + otrosDeducciones;
    const salarioNeto = totalIngresos - totalDeducciones;

    // 5. Patronales
    const tasaPatronalReal = (cantidadEmpleados < 50) ? TASA_PATRONAL_PYME : TASA_PATRONAL_GRAN;
    const inssPatronal = baseInss * tasaPatronalReal;
    const inatec = baseInss * TASA_INATEC;

    // 6. Provisión Aguinaldo (1/12 de los ingresos computables)
    // El aguinaldo se calcula sobre todo salario ordinario y extraordinario (comisiones, HE). No viáticos.
    const baseAguinaldo = totalIngresos - viaticos - ingresosNoDeducibles;
    const provisionAguinaldo = baseAguinaldo * 0.083333333;

    return {
        salarioBase,
        diasTrabajados: 30 / factorMes,
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
        inssPatronal,
        inatec,
        costoTotalEmpleador: totalIngresos + inssPatronal + inatec + provisionAguinaldo,
        tasaPatronalAplicada: tasaPatronalReal,
        provisionAguinaldo // Nuevo
    };
};