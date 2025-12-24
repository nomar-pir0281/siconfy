// src/types/planilla.ts

/**
 * Interface for variable income inputs in the planilla calculation.
 */
export interface IngresosVariables {
  comisiones: number;
  incentivos: number;
  viaticos: number;
  diasVacaciones: number;
  horasExtras: number;
  diasTrabajados?: number; // Opcional, por defecto 30 / factor
  ingresosNoDeducibles: number;
}

/**
 * Interface for variable deduction inputs in the planilla calculation.
 */
export interface DeduccionesVariables {
  optica: number;
  embargoAlimenticio: number;
  embargoJudicial: number;
  otrosDeducciones: number;
}

/**
 * Combined interface for all variable inputs per employee in the planilla.
 */
export interface PlanillaInputs extends IngresosVariables, DeduccionesVariables { }

/**
 * Interface for global planilla settings.
 */
export interface PlanillaSettings {
  frecuencia: 'Mensual' | 'Quincenal' | 'Semanal';
  cantidadEmpleados: number;
}