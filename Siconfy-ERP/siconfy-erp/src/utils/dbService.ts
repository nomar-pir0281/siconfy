import type { Employee, VacationRecord } from '../types';

const STORAGE_KEY = 'siconfy_empleados';

// Simulación de base de datos con localStorage
export class EmployeeService {
  static getAll(): Employee[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading employees:', error);
      return [];
    }
  }

  static save(employee: Employee): void {
    const employees = this.getAll();

    // Validar salario
    if (employee.salarioBase <= 0) {
      throw new Error('Salario inválido');
    }

    // Buscar si existe (por cédula)
    const existingIndex = employees.findIndex(emp => emp.cedula === employee.cedula);

    if (existingIndex >= 0) {
      // Actualizar existente
      employees[existingIndex] = { ...employee };
    } else {
      // Agregar nuevo
      employees.push(employee);
    }

    this.saveAll(employees);
  }

  static delete(cedula: string): void {
    const employees = this.getAll();
    const filtered = employees.filter(emp => emp.cedula !== cedula);
    this.saveAll(filtered);
  }

  static findByCedula(cedula: string): Employee | undefined {
    const employees = this.getAll();
    return employees.find(emp => emp.cedula === cedula);
  }

  static update(employee: Employee): void {
    this.save(employee);
  }

  static registerVacationUsage(cedula: string, diasUsados: number, motivo: string): void {
    const employee = this.findByCedula(cedula);
    if (!employee) {
      throw new Error('Empleado no encontrado');
    }

    if (diasUsados > employee.diasVacacionesAcumulados) {
      throw new Error('No hay suficientes días de vacaciones disponibles');
    }

    const saldoAnterior = employee.diasVacacionesAcumulados;
    employee.diasVacacionesAcumulados -= diasUsados;

    const record: VacationRecord = {
      fecha: new Date().toISOString().split('T')[0],
      diasUsados,
      motivo,
      saldoAnterior,
      saldoPosterior: employee.diasVacacionesAcumulados
    };

    if (!employee.historialVacaciones) {
      employee.historialVacaciones = [];
    }
    employee.historialVacaciones.push(record);

    this.update(employee);
  }

  static updateVacationDays(): void {
    const employees = this.getAll();
    employees.forEach(emp => {
      if (emp.fechaIngreso) {
        // This will be implemented in prestaciones.ts
        // emp.diasVacacionesAcumulados = calcularAcumulacion(emp.fechaIngreso);
      }
    });
    this.saveAll(employees);
  }

  static clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  private static saveAll(employees: Employee[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
    } catch (error) {
      console.error('Error saving employees:', error);
      throw new Error('Error al guardar empleados');
    }
  }
}