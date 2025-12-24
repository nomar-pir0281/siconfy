import Dexie, { Table } from 'dexie';
import { Employee } from '../types'; // Adjust path if necessary

export class SiconfyDB extends Dexie {
    employees!: Table<Employee, number>;
    payrolls!: Table<any, number>; // Define proper interface if available
    settings!: Table<{ key: string; value: any }, string>;

    constructor() {
        super('SiconfyDB');

        this.version(1).stores({
            employees: '++id, nombre, cedula, estado', // Indices for search/filtering
            payrolls: '++id, fecha, total, frecuencia',
            settings: 'key' // Primary key is 'key'
        });
    }
}

export const db = new SiconfyDB();
