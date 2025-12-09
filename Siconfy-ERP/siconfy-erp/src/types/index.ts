export interface Employee {
  nombre: string;
  cedula: string;
  salarioBase: number;
  fechaIngreso: string;
  comisiones: number;
  incentivos: number;
  horasExtras: number;
  deducciones: number;
  frecuencia: 'mensual' | 'quincenal' | 'semanal';
  diasVacacionesAcumulados: number;
  historialVacaciones: VacationRecord[];
}

export interface VacationRecord {
  fecha: string;
  diasUsados: number;
  motivo: string;
  saldoAnterior: number;
  saldoPosterior: number;
}

export interface PayrollRecord {
  nombre: string;
  cedula: string;
  salarioBase: number;
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