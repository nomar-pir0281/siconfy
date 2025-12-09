// src/utils/nomina.ts

export interface ResultadoNomina {
    salarioBase: number;
    viaticos: number;
    montoHorasExtras: number;
    comisiones: number;
    incentivos: number;
    totalIngresos: number;
    inssLaboral: number;
    ir: number;
    deducciones: number;
    totalDeducciones: number;
    salarioNeto: number;
    inssPatronal: number;
    inatec: number;
    costoTotalEmpleador: number;
}

const TASA_INSS_LABORAL = 0.07;
const TASA_INSS_PATRONAL = 0.225; 
const TASA_INATEC = 0.02;

export const calcularNominaMensual = (
    salarioBase: number,
    cantHorasExtras: number = 0,
    comisiones: number = 0,
    incentivos: number = 0,
    deduccionesPrestamos: number = 0,
    viaticos: number = 0,
    frecuencia: 'mensual' | 'quincenal' | 'semanal' = 'mensual'
): ResultadoNomina => {
    
    // 1. DEFINIR DIVISORES PARA HORAS EXTRAS
    // Para sacar el valor de la hora, siempre usamos base 30 días comercial
    // Valor Hora = (Salario Mensualizado / 30 / 8)
    let salarioMensualizado = salarioBase;
    if (frecuencia === 'quincenal') salarioMensualizado = salarioBase * 2;
    if (frecuencia === 'semanal') salarioMensualizado = salarioBase * 4.3333; // Promedio semanas mes

    const valorHoraOrdinaria = (salarioMensualizado / 30) / 8;
    const montoHorasExtras = valorHoraOrdinaria * 2 * cantHorasExtras;

    // 2. TOTAL INGRESOS DEL PERIODO (BRUTO)
    const totalIngresos = salarioBase + montoHorasExtras + comisiones + incentivos + viaticos;

    // 3. INSS LABORAL (7% directo sobre lo ganado en la semana/quincena)
    const inssLaboral = totalIngresos * TASA_INSS_LABORAL;

    // 4. CÁLCULO DE IR (CORREGIDO PARA SEMANAL)
    // Paso A: Determinar Base Imponible del Periodo (Lo que gané - INSS)
    const baseImponiblePeriodo = totalIngresos - inssLaboral;

    // Paso B: Proyectar a un Año Fiscal
    let factorProyeccion = 12; // Mensual
    if (frecuencia === 'quincenal') factorProyeccion = 24;
    if (frecuencia === 'semanal') factorProyeccion = 52; // Año comercial de semanas

    const salarioAnualProyectado = baseImponiblePeriodo * factorProyeccion;
    
    // Paso C: Calcular Impuesto Anual
    const irAnual = calcularIRAnual(salarioAnualProyectado);
    
    // Paso D: Traer el impuesto de vuelta al periodo
    const irPeriodo = irAnual / factorProyeccion;

    // 5. TOTALES
    const totalDeducciones = inssLaboral + irPeriodo + deduccionesPrestamos;
    const salarioNeto = totalIngresos - totalDeducciones;

    // 6. PATRONAL
    const inssPatronal = totalIngresos * TASA_INSS_PATRONAL;
    const inatec = totalIngresos * TASA_INATEC;

    return {
        salarioBase,
        viaticos,
        montoHorasExtras,
        comisiones,
        incentivos,
        totalIngresos,
        inssLaboral,
        ir: irPeriodo,
        deducciones: deduccionesPrestamos,
        totalDeducciones,
        salarioNeto,
        inssPatronal,
        inatec,
        costoTotalEmpleador: totalIngresos + inssPatronal + inatec
    };
};

function calcularIRAnual(salarioAnual: number): number {
    let impuestoBase = 0;
    let porcentaje = 0;
    let sobreExceso = 0;

    if (salarioAnual <= 100000) {
        return 0;
    } else if (salarioAnual <= 200000) {
        porcentaje = 0.15;
        sobreExceso = 100000;
        impuestoBase = 0;
    } else if (salarioAnual <= 350000) {
        porcentaje = 0.20;
        sobreExceso = 200000;
        impuestoBase = 15000;
    } else if (salarioAnual <= 500000) {
        porcentaje = 0.25;
        sobreExceso = 350000;
        impuestoBase = 45000;
    } else {
        porcentaje = 0.30;
        sobreExceso = 500000;
        impuestoBase = 82500;
    }

    return ((salarioAnual - sobreExceso) * porcentaje) + impuestoBase;
}

export interface ResultadoIndemnizacion {
    indemnizacion: number;
    detalle: string;
}

export const calcularIndemnizacion = (
    motivoCese: string,
    tipoSalario: 'Fijo' | 'Variable',
    salarioBase: number,
    salariosMes: number[],
    antiguedad: number
): ResultadoIndemnizacion => {
    let salarioPromedio = 0;
    if (tipoSalario === 'Fijo') {
        salarioPromedio = salarioBase;
    } else {
        if (salariosMes.length === 6 && salariosMes.every(s => s > 0)) {
            salarioPromedio = salariosMes.reduce((a, b) => a + b, 0) / 6;
        }
    }

    let indemnizacion = 0;
    let detalle = '';

    if (motivoCese === 'Despido Injustificado / Sin Causa Justa') {
        indemnizacion = Math.min(antiguedad, 6) * salarioPromedio;
        detalle = `Despido injustificado: ${Math.min(antiguedad, 6)} meses de salario`;
    } else if (motivoCese === 'Renuncia (con preaviso)') {
        indemnizacion = 0;
        detalle = 'Renuncia con preaviso: Sin indemnización';
    } else if (motivoCese === 'Renuncia (sin preaviso)') {
        indemnizacion = Math.min(antiguedad * 0.5, 3) * salarioPromedio;
        detalle = `Renuncia sin preaviso: ${Math.min(antiguedad * 0.5, 3)} meses de salario`;
    }

    return { indemnizacion, detalle };
};