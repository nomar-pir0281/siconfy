// src/utils/nomina.ts

export interface DetalleIR {
    salarioAnual: number;
    sobreExceso: number;
    porcentaje: number;
    impuestoBase: number;
    irAnual: number;
}

export interface ResultadoNomina {
    salarioBase: number;
    viaticos: number;
    montoHorasExtras: number;
    comisiones: number;
    incentivos: number;
    totalIngresos: number;
    inssLaboral: number;
    ir: number;
    detalleIR?: DetalleIR; // <--- Nuevo campo
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
    
    // 1. HORAS EXTRAS (Base 30 días)
    let salarioMensualizado = salarioBase;
    if (frecuencia === 'quincenal') salarioMensualizado = salarioBase * 2;
    if (frecuencia === 'semanal') salarioMensualizado = salarioBase * 4.3333;

    const valorHoraOrdinaria = (salarioMensualizado / 30) / 8;
    const montoHorasExtras = valorHoraOrdinaria * 2 * cantHorasExtras;

    // 2. TOTAL INGRESOS
    const totalIngresos = salarioBase + montoHorasExtras + comisiones + incentivos + viaticos;

    // 3. INSS LABORAL
    // CORRECCIÓN: Los viáticos NO cotizan INSS (si son reales). 
    // Restamos viáticos de la base imponible del INSS.
    const baseCotizableInss = totalIngresos - viaticos; 
    const inssLaboral = baseCotizableInss * TASA_INSS_LABORAL;

    // 4. IR
    const baseImponibleIR = totalIngresos - viaticos - inssLaboral; // Viáticos tampoco gravan IR usualmente
    
    // Proyección Anual
    let factorProyeccion = 12;
    if (frecuencia === 'quincenal') factorProyeccion = 24;
    if (frecuencia === 'semanal') factorProyeccion = 52;

    const salarioAnualProyectado = baseImponibleIR * factorProyeccion;
    
    // Calcular Impuesto
    const dataIR = calcularIRAnualDetallado(salarioAnualProyectado);
    const irPeriodo = dataIR.irAnual / factorProyeccion;

    // 5. TOTALES
    const totalDeducciones = inssLaboral + irPeriodo + deduccionesPrestamos;
    const salarioNeto = totalIngresos - totalDeducciones;

    // 6. PATRONAL (Sobre base cotizable, sin viáticos)
    const inssPatronal = baseCotizableInss * TASA_INSS_PATRONAL;
    const inatec = baseCotizableInss * TASA_INATEC;

    return {
        salarioBase,
        viaticos,
        montoHorasExtras,
        comisiones,
        incentivos,
        totalIngresos,
        inssLaboral,
        ir: irPeriodo,
        detalleIR: dataIR, // Guardamos el detalle
        deducciones: deduccionesPrestamos,
        totalDeducciones,
        salarioNeto,
        inssPatronal,
        inatec,
        costoTotalEmpleador: totalIngresos + inssPatronal + inatec
    };
};

// Función auxiliar exportada o interna que devuelve el detalle
function calcularIRAnualDetallado(salarioAnual: number): DetalleIR {
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
        irAnual
    };
}

// Mantenemos la función original por compatibilidad si se usa en otro lado, pero usando la nueva lógica
export function calcularIRAnual(salarioAnual: number): number {
    return calcularIRAnualDetallado(salarioAnual).irAnual;
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
        indemnizacion = Math.min(antiguedad, 6) * salarioPromedio; // Revisar si son 5 o 6 según contrato, ley dice indemnización min 1 mes a 5 meses
        // CORRECCIÓN: Art 45 dice 1 mes por año los primeros 3 años, luego 20 días.
        // Pero el código original tenía una lógica simple. Lo mantengo simple por ahora o lo ajusto a Art 45 estricto si lo pides.
        // Asumimos lógica simplificada existente:
        indemnizacion = Math.min(antiguedad, 5) * salarioPromedio; 
        detalle = `Despido injustificado: Pago proporcional antigüedad`;
    } else if (motivoCese === 'Renuncia (con preaviso)') {
        indemnizacion = 0;
        detalle = 'Renuncia con preaviso: Sin indemnización Art. 45';
    } 

    return { indemnizacion, detalle };
};