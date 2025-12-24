import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Employee } from '../types';

export const useEmployees = () => {
    // Reactive query: updates automatically when DB changes
    const employees = useLiveQuery(() => db.employees.toArray(), []) || [];

    const addEmployee = async (employee: Omit<Employee, 'id'>) => {
        try {
            const id = await db.employees.add(employee as Employee);
            return id;
        } catch (error) {
            console.error("Failed to add employee:", error);
            throw error;
        }
    };

    const updateEmployee = async (employee: Employee) => {
        if (!employee.id) throw new Error("Employee ID is required for update");
        try {
            await db.employees.put(employee);
        } catch (error) {
            console.error("Failed to update employee:", error);
            throw error;
        }
    };

    const deleteEmployee = async (id: number) => {
        try {
            await db.employees.delete(id);
        } catch (error) {
            console.error("Failed to delete employee:", error);
            throw error;
        }
    };

    const getEmployeeById = async (id: number) => {
        return await db.employees.get(id);
    };

    return {
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        getEmployeeById,
        // Helper to check if loading
        isLoading: !employees && employees !== undefined
    };
};
