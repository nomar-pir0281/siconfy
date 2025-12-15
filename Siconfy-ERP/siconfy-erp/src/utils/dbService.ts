// src/utils/dbService.ts
import { Employee, VacationRecord } from '../types';

const STORAGE_KEY = 'siconfy_employees_v2';

const defaultEmployees: Employee[] = [
    {
        id: 1,
        nombre: 'Angel Bolaños',
        cedula: '001-000000-0000A',
        noInss: '1234567-8',
        cargo: 'Gerente General',
        salarioBase: 70000,
        comisiones: 0,
        incentivos: 0,
        viaticos: 5000,
        vacacionesPagadas: 0,
        horasExtras: 0,
        fechaIngreso: '2018-08-01',
        estado: 'Activo',
        frecuenciaPago: 'Mensual',
        diasVacacionesAcumulados: 12.5,
        historialVacaciones: []
    },
    {
        id: 2,
        nombre: 'Antonela Gonzalez',
        cedula: '001-000000-0000B',
        noInss: '8765432-1',
        cargo: 'Asistente Administrativo',
        salarioBase: 20566,
        comisiones: 0,
        incentivos: 0,
        viaticos: 0,
        vacacionesPagadas: 0,
        horasExtras: 0,
        fechaIngreso: '2016-08-01',
        estado: 'Activo',
        frecuenciaPago: 'Quincenal',
        diasVacacionesAcumulados: 5.0,
        historialVacaciones: []
    }
];

export const EmployeeService = {
    getAll: (): Employee[] => {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultEmployees));
            return defaultEmployees;
        }
        return JSON.parse(data);
    },

    getById: (id: number): Employee | undefined => {
        const employees = EmployeeService.getAll();
        return employees.find(e => e.id === id);
    },

    save: (employee: Omit<Employee, 'id'>): Employee => {
        const employees = EmployeeService.getAll();
        const newId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
        const newEmployee = { ...employee, id: newId };
        employees.push(newEmployee);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
        return newEmployee;
    },

    update: (employee: Employee): Employee => {
        const employees = EmployeeService.getAll();
        const index = employees.findIndex(e => e.id === employee.id);
        if (index !== -1) {
            employees[index] = employee;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
        }
        return employee;
    },

    delete: (id: number): void => {
        const employees = EmployeeService.getAll();
        const filtered = employees.filter(e => e.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    },

    registerVacationUsage: (cedula: string, dias: number, motivo: string) => {
        const employees = EmployeeService.getAll();
        const empIndex = employees.findIndex(e => e.cedula === cedula);
        
        if (empIndex >= 0) {
            const emp = employees[empIndex];
            const newRecord: VacationRecord = {
                id: Date.now(),
                fecha: new Date().toISOString().split('T')[0],
                diasUsados: dias,
                motivo
            };
            emp.historialVacaciones = [...(emp.historialVacaciones || []), newRecord];
            employees[empIndex] = emp;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
        }
    }
};