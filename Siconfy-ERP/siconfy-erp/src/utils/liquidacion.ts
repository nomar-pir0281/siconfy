// src/utils/liquidacion.ts

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
    totalIngresos: number;
    totalDeducciones: number;
    netoRecibir: number;
}

const TASA_INSS = 0.07;

// Validado: Calcula días comerciales 30/360 INCLUSIVOS (+1) para cuadrar Aguinaldo
export const calcularDias360 = (fInicio: string, fFin: string): number => {
    if (!fInicio || !fFin) return 0;
    const d1 = new Date(fInicio);
    const d2 = new Date(fFin);
    d1.setMinutes(d1.getMinutes() + d1.getTimezoneOffset());
    d2.setMinutes(d2.getMinutes() + d2.getTimezoneOffset());

    const y1 = d1.getFullYear();
    const m1 = d1.getMonth() + 1;
    let day1 = d1.getDate();

    const y2 = d2.getFullYear();
    const m2 = d2.getMonth() + 1;
    let day2 = d2.getDate();

    if (day1 === 31) day1 = 30;
    if (day2 === 31) day2 = 30;

    return ((y2 - y1) * 360) + ((m2 - m1) * 30) + (day2 - day1) + 1;
};

// HELPER: Tabla Progresiva Anual Estándar (DGI)
const calcularIRAnualTabla = (baseAnual: number): number => {
    if (baseAnual <= 100000) return 0;
    if (baseAnual <= 200000) return (baseAnual - 100000) * 0.15;
    if (baseAnual <= 350000) return 15000 + (baseAnual - 200000) * 0.20;
    if (baseAnual <= 500000) return 45000 + (baseAnual - 350000) * 0.25;
    return 82500 + (baseAnual - 500000) * 0.30;
};

// HELPER: Obtener Tasa Fija para Pagos Ocasionales (Vacaciones/Indemnización gravada)
const obtenerTasaOcasional = (salarioMensual: number): number => {
    const inss = salarioMensual * TASA_INSS;
    const anualNeto = (salarioMensual - inss) * 12;
    
    if (anualNeto > 500000) return 0.30;
    if (anualNeto > 350000) return 0.25;
    if (anualNeto > 200000) return 0.20;
    if (anualNeto > 100000) return 0.15;
    return 0.00;
};

export const calcularLiquidacion = (
    fechaInicio: string,
    fechaFin: string,
    salarioMensual: number,
    vacacionesPendientes: number,
    diasSalarioPendiente: number,
    motivo: 'renuncia' | 'despido' | 'mutuo'
): ResultadoLiquidacion => {
    
    const diasTrabajados = calcularDias360(fechaInicio, fechaFin);
    const salarioDiario = salarioMensual / 30;

    // 1. Antigüedad
    const antiguedadAños = Math.floor(diasTrabajados / 360);
    const antiguedadMeses = Math.floor((diasTrabajados % 360) / 30);
    const antiguedadDias = (diasTrabajados % 360) % 30;

    // 2. Salario Pendiente
    const montoSalarioPendiente = diasSalarioPendiente * salarioDiario;

    // 3. Indemnización
    let diasIndemnizacion = 0;
    if (motivo !== 'renuncia') {
        if (antiguedadAños < 3) {
            diasIndemnizacion = (diasTrabajados / 360) * 30;
        } else {
            let diasAcumulados = 90; 
            const tiempoAdicional = diasTrabajados - (3 * 360);
            diasAcumulados += (tiempoAdicional / 360) * 20;
            diasIndemnizacion = diasAcumulados;
        }
        if (diasIndemnizacion > 150) diasIndemnizacion = 150;
    }
    const montoIndemnizacion = diasIndemnizacion * salarioDiario;

    // 4. Aguinaldo (Factor 2.5 exacto)
    const fechaFinDate = new Date(fechaFin);
    let añoAguinaldo = fechaFinDate.getFullYear();
    if (fechaFinDate.getMonth() < 11) añoAguinaldo -= 1; 
    const inicioAguinaldo = `${añoAguinaldo}-12-01`;
    const fechaBaseAguinaldo = (new Date(fechaInicio) > new Date(inicioAguinaldo)) ? fechaInicio : inicioAguinaldo;
    const diasParaAguinaldo = calcularDias360(fechaBaseAguinaldo, fechaFin);
    
    const montoAguinaldo = (diasParaAguinaldo / 30) * 2.5 * salarioDiario;

    // 5. Vacaciones
    const montoVacaciones = vacacionesPendientes * salarioDiario;

    // 6. CÁLCULO DE IMPUESTOS (INSS e IR Separados)
    
    // INSS (7%)
    const inssSalario = montoSalarioPendiente * TASA_INSS;
    const inssVacaciones = montoVacaciones * TASA_INSS;
    const inssTotal = inssSalario + inssVacaciones;

    // IR (IMPUESTO SOBRE LA RENTA)
    // Parte A: IR sobre Salario Pendiente (Método Prorrateado)
    // Calculamos el IR de un mes completo teórico y lo dividimos por días
    const inssMensualTeorico = salarioMensual * TASA_INSS;
    const netoMensualTeorico = salarioMensual - inssMensualTeorico;
    const anualTeorico = netoMensualTeorico * 12;
    const irAnualTeorico = calcularIRAnualTabla(anualTeorico);
    const irMensualCompleto = irAnualTeorico / 12;
    
    let irSalarioPendiente = 0;
    if (diasSalarioPendiente > 0) {
        irSalarioPendiente = (irMensualCompleto / 30) * diasSalarioPendiente;
    }

    // Parte B: IR sobre Vacaciones (Pago Ocasional - Tasa Fija)
    // Se usa la tasa marginal según el salario anual
    const tasaOcasional = obtenerTasaOcasional(salarioMensual);
    const baseVacacionesNeto = montoVacaciones - inssVacaciones;
    const irVacaciones = baseVacacionesNeto * tasaOcasional;

    const irTotal = irSalarioPendiente + irVacaciones;

    // Totales
    const totalIngresos = montoSalarioPendiente + montoIndemnizacion + montoAguinaldo + montoVacaciones;
    const totalDeducciones = inssTotal + irTotal;

    return {
        antiguedadAños, antiguedadMeses, antiguedadDias, salarioDiario,
        montoSalarioPendiente, montoIndemnizacion, montoAguinaldo, montoVacaciones,
        inss: inssTotal,
        ir: irTotal,
        totalIngresos, totalDeducciones,
        netoRecibir: totalIngresos - totalDeducciones
    };
};