// src/utils/dbService.ts
/**
 * @deprecated This service is being replaced by Dexie.js based persistence.
 * Please use the `useEmployees` hook from `src/hooks/useEmployees.ts` for new implementations.
 * This file is kept for backward compatibility during migration.
 */
import { Employee } from '../types';

// Configuración de Seguridad y Versionado
const DB_CONFIG = {
    KEY: 'siconfy_employees_v3_secure',
    VERSION: '1.2.0'
};

// Datos por defecto (Originales preservados)
const defaultEmployees: Employee[] = [
    {
        id: 1,
        nombre: 'Angel Bolaños',
        cedula: '001-000000-0000A',
        noInss: '1234567-8',
        cargo: 'Gerente General',
        salarioBase: 70000,
        moneda: 'C$',
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
        moneda: 'C$',
        comisiones: 0,
        incentivos: 0,
        viaticos: 0,
        vacacionesPagadas: 0,
        horasExtras: 0,
        fechaIngreso: '2023-01-15',
        estado: 'Activo',
        frecuenciaPago: 'Quincenal',
        diasVacacionesAcumulados: 5.0,
        historialVacaciones: []
    }
];

// --- STORAGE MANAGER (Capa de Seguridad) ---
class StorageManager {
    static save<T>(data: T): void {
        try {
            const payload = {
                v: DB_CONFIG.VERSION,
                ts: Date.now(),
                data: data
            };
            // Ofuscación básica Base64
            const secureData = btoa(JSON.stringify(payload));
            localStorage.setItem(DB_CONFIG.KEY, secureData);
        } catch (e) {
            console.error("Error guardando DB:", e);
        }
    }

    static load<T>(): T | null {
        try {
            const item = localStorage.getItem(DB_CONFIG.KEY);
            if (!item) return null;
            try {
                const parsed = JSON.parse(atob(item));
                return parsed.data;
            } catch {
                return null;
            }
        } catch (e) {
            return null;
        }
    }
}

// --- LÓGICA DE NEGOCIO ---

const getEmployees = (): Employee[] => {
    const data = StorageManager.load<Employee[]>();
    if (!data) {
        StorageManager.save(defaultEmployees);
        return defaultEmployees;
    }
    return data;
};

const saveEmployee = (employee: Employee): void => {
    const employees = getEmployees();
    const index = employees.findIndex(e => e.id === employee.id);

    if (index >= 0) {
        employees[index] = employee;
    } else {
        if (!employee.id) employee.id = Date.now();
        employees.push(employee);
    }
    StorageManager.save(employees);
};

const deleteEmployee = (id: number): void => {
    const employees = getEmployees().filter(e => e.id !== id);
    StorageManager.save(employees);
};

// --- EXPORTACIONES ---

// Objeto de servicio para compatibilidad con código legacy
export const EmployeeService = {
    getAll: getEmployees,
    save: saveEmployee,
    update: saveEmployee, // Reusing save as it handles updates based on ID
    delete: deleteEmployee,
    reset: () => StorageManager.save(defaultEmployees)
};

// Exportaciones nombradas para nuevos componentes
export { getEmployees, saveEmployee, deleteEmployee };