// src/types/index.ts
export interface Employee {
  id: number;
  nombre: string;
  cedula: string;
  noInss?: string;
  noTrabajador?: string; // Nuevo campo solicitado
  cargo: string;
  salarioBase: number;
  moneda: string; // Ya estaba, pero nos aseguramos
  fechaIngreso: string;
  estado: 'Activo' | 'Inactivo';
  frecuenciaPago: 'Mensual' | 'Quincenal' | 'Semanal';

  // Campo que faltaba y causaba error en EmpleadoPage.tsx
  contrato?: string;

  // Opcionales
  comisiones?: number;
  incentivos?: number;
  viaticos?: number;
  horasExtras?: number;
  diasVacaciones?: number;
  deducciones?: number;
  vacacionesPagadas?: number;

  // Historial de Vacaciones
  diasVacacionesAcumulados?: number;
  historialVacaciones?: VacationRecord[];
}

// Interfaz para el historial de vacaciones (Faltaba exportarla)
export interface VacationRecord {
  id: number;
  fecha: string;
  diasUsados: number;
  motivo: string;
}