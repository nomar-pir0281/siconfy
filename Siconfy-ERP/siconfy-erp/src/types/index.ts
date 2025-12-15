// src/types/index.ts

export interface VacationRecord {
    id: number;
    fecha: string;
    diasUsados: number;
    motivo: string;
}
  
export interface Employee {
    id: number;
    nombre: string;
    cedula: string;
    noInss?: string; 
    cargo: string;
    salarioBase: number;
    
    // --- NUEVOS CAMPOS FIJOS (Para Tab Empleados) ---
    comisiones?: number;
    incentivos?: number;
    viaticos?: number;
    diasVacaciones?: number;
    horasExtras?: number; // Cantidad de horas fijas
    deducciones?: number; // Deducciones fijas del empleado
    // ------------------------------------------------

    fechaIngreso: string; 
    estado: 'Activo' | 'Inactivo';
    frecuenciaPago: 'Mensual' | 'Quincenal' | 'Semanal';
    
    contrato?: string;
    moneda?: string;
    diasVacacionesAcumulados: number;
    historialVacaciones: VacationRecord[];
}