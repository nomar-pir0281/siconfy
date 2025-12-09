import React, { useState, useEffect, useCallback, memo } from 'react';
import type { Employee } from '../types';
import { EmployeeService } from '../utils/dbService';
import { calcularAcumulacion, calcularAcumulacionTotal } from '../utils/prestaciones';

const VacacionesPageComponent: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [diasUsados, setDiasUsados] = useState(0);
  const [motivo, setMotivo] = useState('');

  const loadEmployees = useCallback(() => {
    const emps = EmployeeService.getAll();
    setEmployees(emps);
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleRegisterVacation = () => {
    if (!selectedEmployee || diasUsados <= 0 || !motivo) {
      alert('Seleccione empleado, días y motivo');
      return;
    }

    try {
      EmployeeService.registerVacationUsage(selectedEmployee.cedula, diasUsados, motivo);
      setSelectedEmployee(null);
      setDiasUsados(0);
      setMotivo('');
      loadEmployees();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al registrar vacaciones');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO' }).format(amount);
  };

  const calcularValorVacaciones = (employee: Employee) => {
    const diasAcumulados = employee.fechaIngreso ? calcularAcumulacion(employee.fechaIngreso) : 0;
    const salarioDiario = employee.salarioBase / 30;
    return diasAcumulados * salarioDiario;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Tracker de Vacaciones</h1>

      {/* Tabla de Vacaciones */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Días de Vacaciones Acumuladas (Período Actual)</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Cédula</th>
                <th className="px-4 py-2 text-left">Fecha Ingreso</th>
                <th className="px-4 py-2 text-left">Acum. Período</th>
                <th className="px-4 py-2 text-left">Acum. Total</th>
                <th className="px-4 py-2 text-left">Usados</th>
                <th className="px-4 py-2 text-left">Disponibles</th>
                <th className="px-4 py-2 text-left">Valor Monetario</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const diasAcumuladosPeriodo = emp.fechaIngreso ? calcularAcumulacion(emp.fechaIngreso) : 0;
                const diasAcumuladosTotal = emp.fechaIngreso ? calcularAcumulacionTotal(emp.fechaIngreso) : 0;
                const diasUsados = emp.historialVacaciones?.reduce((sum, record) => sum + record.diasUsados, 0) || 0;
                const diasDisponibles = Math.max(0, diasAcumuladosTotal - diasUsados);
                const valorMonetario = calcularValorVacaciones(emp);
                return (
                  <tr key={emp.cedula} className="border-t">
                    <td className="px-4 py-2">{emp.nombre}</td>
                    <td className="px-4 py-2">{emp.cedula}</td>
                    <td className="px-4 py-2">{emp.fechaIngreso}</td>
                    <td className="px-4 py-2">{diasAcumuladosPeriodo.toFixed(1)} días</td>
                    <td className="px-4 py-2">{diasAcumuladosTotal.toFixed(1)} días</td>
                    <td className="px-4 py-2">{diasUsados.toFixed(1)} días</td>
                    <td className="px-4 py-2 font-semibold">{diasDisponibles.toFixed(1)} días</td>
                    <td className="px-4 py-2">{formatCurrency(valorMonetario)}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => setSelectedEmployee(emp)}
                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      >
                        Registrar Uso
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {employees.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No hay empleados registrados</p>
        )}
      </div>

      {/* Modal para registrar uso de vacaciones */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Registrar Uso de Vacaciones</h3>
            <p className="mb-2"><strong>Empleado:</strong> {selectedEmployee.nombre}</p>
            <p className="mb-4"><strong>Días Disponibles:</strong> {selectedEmployee.diasVacacionesAcumulados.toFixed(1)}</p>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Días a Usar</label>
              <input
                type="number"
                value={diasUsados}
                onChange={(e) => setDiasUsados(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border rounded"
                min="0"
                max={selectedEmployee.diasVacacionesAcumulados}
                step="0.5"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Motivo</label>
              <input
                type="text"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Ej: Vacaciones anuales"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setSelectedEmployee(null);
                  setDiasUsados(0);
                  setMotivo('');
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleRegisterVacation}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botón de Imprimir */}
      <div className="text-center">
        <button
          onClick={() => window.print()}
          className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 print:hidden"
        >
          🖨️ Imprimir Memorándum
        </button>
      </div>

      {/* Layout de Impresión - Memorándum */}
      <div className="hidden print:block p-8 bg-white text-black font-serif leading-relaxed">
        <div className="text-center mb-8 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold uppercase">Memorándum de Vacaciones</h1>
          <p className="text-sm">Fecha: {new Date().toLocaleDateString('es-NI')}</p>
        </div>

        <div className="mb-6">
          <p><strong>De:</strong> Departamento de Recursos Humanos</p>
          <p><strong>Para:</strong> {selectedEmployee ? selectedEmployee.nombre : 'Empleado'}</p>
          <p><strong>Asunto:</strong> Solicitud de Vacaciones</p>
          <p><strong>Fecha:</strong> {new Date().toLocaleDateString('es-NI')}</p>
        </div>

        <div className="mb-6">
          <p>Por medio del presente, se solicita la aprobación de {diasUsados} días de vacaciones correspondientes al período actual.</p>
        </div>

        {selectedEmployee && (
          <div className="mb-6">
            <p><strong>Datos del Empleado:</strong></p>
            <ul className="ml-6">
              <li>Nombre: {selectedEmployee.nombre}</li>
              <li>Cédula: {selectedEmployee.cedula}</li>
              <li>Fecha de Ingreso: {selectedEmployee.fechaIngreso}</li>
              <li>Días Disponibles: {(() => {
                const diasAcumuladosTotal = selectedEmployee.fechaIngreso ? calcularAcumulacionTotal(selectedEmployee.fechaIngreso) : 0;
                const diasUsadosHist = selectedEmployee.historialVacaciones?.reduce((sum, record) => sum + record.diasUsados, 0) || 0;
                return Math.max(0, diasAcumuladosTotal - diasUsadosHist);
              })().toFixed(1)} días</li>
            </ul>
          </div>
        )}

        <div className="mb-6">
          <p><strong>Período de Vacaciones Solicitado:</strong></p>
          <p>Desde: ____________________ Hasta: ____________________</p>
          <p>Motivo: {motivo || 'Vacaciones anuales'}</p>
        </div>

        <div className="mb-6">
          <p>Se adjunta el historial de vacaciones del empleado para su revisión.</p>
          <p>Las vacaciones se acumulan a razón de 2.5 días por mes laborado según la legislación laboral nicaragüense.</p>
        </div>

        <div className="flex justify-between mt-12">
          <div className="text-center">
            <div className="border-t border-black w-48 pt-2">
              <p className="font-bold">Solicitante</p>
              <p className="text-sm">{selectedEmployee?.nombre}</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-black w-48 pt-2">
              <p className="font-bold">Aprobado por</p>
              <p className="text-sm">Recursos Humanos</p>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 mt-8">
          <p>Siconfy ERP © 2025. Sistema de Gestión Empresarial</p>
        </div>
      </div>
    </div>
  );
};

export const VacacionesPage = memo(VacacionesPageComponent);