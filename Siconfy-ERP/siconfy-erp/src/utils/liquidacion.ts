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

// Validado: Método 30/360 US/NASD para Nicaragua (Comercial)
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

    // Lógica 30/360 estándar
    if (day1 === 31) day1 = 30;
    if (day2 === 31) day2 = 30;

    return ((y2 - y1) * 360) + ((m2 - m1) * 30) + (day2 - day1) + 1;
};

const calcularIRAnualTabla = (baseAnual: number): number => {
    if (baseAnual <= 100000) return 0;
    if (baseAnual <= 200000) return (baseAnual - 100000) * 0.15;
    if (baseAnual <= 350000) return 15000 + (baseAnual - 200000) * 0.20;
    if (baseAnual <= 500000) return 45000 + (baseAnual - 350000) * 0.25;
    return 82500 + (baseAnual - 500000) * 0.30;
};

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

    // 3. Indemnización (Art. 45 CT)
    let diasIndemnizacion = 0;
    // Si renuncia, no hay indemnización (0 días)
    if (motivo !== 'renuncia') {
        if (antiguedadAños < 3) {
            // Menos de 3 años: 1 mes por año (o proporcional) -> diasTrabajados / 360 * 30
            // Simplificado: diasTrabajados / 12
            diasIndemnizacion = (diasTrabajados / 360) * 30;
        } else {
            // 3 a 6 años: 20 días por año adicional
            // Primeros 3 años = 3 meses (90 días)
            let diasAcumulados = 90; 
            const tiempoAdicional = diasTrabajados - (3 * 360);
            // Validar que tiempo adicional no sea negativo
            if (tiempoAdicional > 0) {
                 diasAcumulados += (tiempoAdicional / 360) * 20;
            }
            diasIndemnizacion = diasAcumulados;
        }
        // Techo de 5 meses (150 días)
        if (diasIndemnizacion > 150) diasIndemnizacion = 150;
    }
    const montoIndemnizacion = diasIndemnizacion * salarioDiario;

    // 4. Aguinaldo (Factor 2.5 exacto por mes o proporcional)
    const fechaFinDate = new Date(fechaFin);
    let añoAguinaldo = fechaFinDate.getFullYear();
    // Si es antes de diciembre, el ciclo es dic año anterior a fecha fin
    // Si ya pasó diciembre, es dic de este año. La lógica estándar es 1 dic a 30 nov.
    if (fechaFinDate.getMonth() < 11) añoAguinaldo -= 1; 
    
    // CORRECCIÓN AUDITORÍA: usar const en lugar de let
    const inicioAguinaldo = `${añoAguinaldo}-12-01`;
    
    // Determinar fecha base: la mayor entre inicio contrato o inicio ciclo aguinaldo
    const fechaBaseAguinaldo = (new Date(fechaInicio) > new Date(inicioAguinaldo)) ? fechaInicio : inicioAguinaldo;
    const diasParaAguinaldo = calcularDias360(fechaBaseAguinaldo, fechaFin);
    
    // Aguinaldo es un doceavo de lo ganado, equivalente a 2.5 días por mes trabajado
    const montoAguinaldo = (diasParaAguinaldo / 30) * 2.5 * salarioDiario;

    // 5. Vacaciones
    const montoVacaciones = vacacionesPendientes * salarioDiario;

    // 6. IMPUESTOS
    const inssSalario = montoSalarioPendiente * TASA_INSS;
    // Vacaciones e Indemnización NO pagan INSS en liquidación final usualmente, 
    // PERO Vacaciones pagadas SI cotizan en algunos regímenes.
    // En la práctica estándar de liquidación NI: Vacaciones SI pagan INSS, Indemnización NO.
    const inssVacaciones = montoVacaciones * TASA_INSS;
    const inssTotal = inssSalario + inssVacaciones;

    // IR
    const inssMensualTeorico = salarioMensual * TASA_INSS;
    const netoMensualTeorico = salarioMensual - inssMensualTeorico;
    const anualTeorico = netoMensualTeorico * 12;
    const irAnualTeorico = calcularIRAnualTabla(anualTeorico);
    const irMensualCompleto = irAnualTeorico / 12;
    
    let irSalarioPendiente = 0;
    if (diasSalarioPendiente > 0) {
        irSalarioPendiente = (irMensualCompleto / 30) * diasSalarioPendiente;
    }

    const tasaOcasional = obtenerTasaOcasional(salarioMensual);
    const baseVacacionesNeto = montoVacaciones - inssVacaciones; // IR se calcula sobre neto (menos INSS)
    // Indemnización está exenta de IR en Nicaragua hasta cierto monto (generalmente total exenta por Art 45)
    // Asumimos exenta.
    const irVacaciones = baseVacacionesNeto * tasaOcasional;

    const irTotal = irSalarioPendiente + irVacaciones;

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