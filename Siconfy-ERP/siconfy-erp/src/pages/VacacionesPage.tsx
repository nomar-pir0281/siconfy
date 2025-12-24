import { InfoSection } from '../components/InfoSection';
import React, { useState, useEffect, useCallback, memo } from 'react';
import type { Employee } from '../types';
import { EmployeeService } from '../utils/dbService';
import { formatCurrency } from '../utils/formatters';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// --- COMPONENTE EDUCATIVO (ADSENSE STRATEGY) ---
const ExplicacionVacaciones = () => (
  <div className="mt-8 p-6 bg-blue-50/50 rounded-lg border border-blue-100 text-sm text-stone-700 animate-fade-in print:hidden">
    <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
      <span>⚖️</span> Base Legal (Código del Trabajo de Nicaragua)
    </h4>
    <div className="grid md:grid-cols-2 gap-6">
      <p>
        El <strong>Artículo 76</strong> establece que todo trabajador tiene derecho a 15 días de descanso
        remunerado por cada 6 meses de trabajo continuo. Esto equivale a una acumulación de
        <strong>2.5 días por mes</strong>.
      </p>
      <p>
        <strong>Pago de Vacaciones:</strong> Las vacaciones se pagan en base al último salario ordinario devengado
        y están sujetas a deducciones de ley (INSS e IR) según el Art. 71 de la Ley Tributaria.
        El derecho a vacaciones es irrenunciable.
      </p>
    </div>
  </div>
);

const VacacionesPageComponent: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Estado para Modal de Registro de Uso
  const [selectedForUsage, setSelectedForUsage] = useState<Employee | null>(null);
  const [diasUsados, setDiasUsados] = useState<string>('');
  const [motivo, setMotivo] = useState('');

  const loadEmployees = useCallback(() => {
    const emps = EmployeeService.getAll();
    setEmployees(emps);
  }, [lastUpdate]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // --- LÓGICA DE CÁLCULO (Regla: 30 días anuales / 2.5 mensuales) ---
  const calcularProporcionalHoy = (fechaIngreso: string) => {
    const start = new Date(fechaIngreso);
    const now = new Date();
    if (isNaN(start.getTime())) return 0;

    // Diferencia en milisegundos
    const diffTime = now.getTime() - start.getTime();
    if (diffTime < 0) return 0;

    // Días trabajados totales
    const diasTrabajados = diffTime / (1000 * 60 * 60 * 24);

    // Regla: (Días Trabajados / 360) * 30 días de derecho anual
    return (diasTrabajados / 360) * 30;
  };

  const handleRegisterVacation = () => {
    const dias = parseFloat(diasUsados);
    if (!selectedForUsage || isNaN(dias) || dias <= 0) {
      alert("Por favor ingrese una cantidad de días válida.");
      return;
    }

    try {
      // Obtenemos el empleado actualizado
      const employee = employees.find(e => e.id === selectedForUsage.id);
      if (!employee) return;

      // Actualizamos historial
      const nuevoHistorial = [
        ...(employee.historialVacaciones || []),
        {
          id: Date.now(),
          fecha: new Date().toISOString().split('T')[0],
          diasUsados: dias,
          motivo: motivo || 'Descanso ordinario'
        }
      ];

      // Actualizamos acumulado (restando lo usado)
      // Nota: El acumulado se recalcula dinámicamente, pero restamos lo "pagado/gozado"
      const nuevasVacacionesPagadas = (employee.vacacionesPagadas || 0) + dias;

      const updatedEmployee: Employee = {
        ...employee,
        historialVacaciones: nuevoHistorial,
        vacacionesPagadas: nuevasVacacionesPagadas
      };

      EmployeeService.save(updatedEmployee);

      // Reset y recarga
      setSelectedForUsage(null);
      setDiasUsados('');
      setMotivo('');
      setLastUpdate(new Date());
      alert("Vacaciones registradas correctamente.");
    } catch (e) {
      console.error(e);
      alert("Error al guardar.");
    }
  };

  // --- EXPORTACIONES ---
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Vacaciones Acumuladas", 14, 20);

    const tableData = employees.map(emp => {
      const acumuladoTotal = calcularProporcionalHoy(emp.fechaIngreso);
      const saldo = acumuladoTotal - (emp.vacacionesPagadas || 0);
      return [
        emp.nombre,
        emp.fechaIngreso,
        acumuladoTotal.toFixed(2),
        (emp.vacacionesPagadas || 0).toFixed(2),
        saldo.toFixed(2)
      ];
    });

    autoTable(doc, {
      head: [['Colaborador', 'Fecha Ingreso', 'Acumulado Total', 'Gozado', 'Saldo Actual']],
      body: tableData,
      startY: 30,
    });

    doc.save('vacaciones_reporte.pdf');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* HEADER */}
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Control de Vacaciones</h1>
          <p className="mt-1 text-sm text-gray-500">Gestión de saldos y registro de descansos del personal.</p>
        </div>
        <div className="mt-4 flex gap-3 md:mt-0 md:ml-4">
          <button
            onClick={exportPDF}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            📄 Exportar PDF
          </button>
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Ingreso</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acumulado Total</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Gozado/Pagado</th>
                <th className="px-6 py-3 text-center text-xs font-black text-gray-700 uppercase tracking-wider bg-gray-100">Saldo Actual</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-sm">
                    No hay empleados registrados. Vaya a "Empleados" para agregar uno.
                  </td>
                </tr>
              ) : employees.map((emp) => {
                const acumulado = calcularProporcionalHoy(emp.fechaIngreso);
                const gozado = emp.vacacionesPagadas || 0;
                const saldo = acumulado - gozado;

                return (
                  <tr key={emp.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{emp.nombre}</div>
                          <div className="text-sm text-gray-500">{emp.cargo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {emp.fechaIngreso}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">
                      {acumulado.toFixed(2)} días
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">
                      {gozado.toFixed(2)} días
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-primary-700 bg-gray-50">
                      {saldo.toFixed(2)} días
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedForUsage(emp)}
                        className="text-primary-600 hover:text-primary-900 font-bold bg-primary-50 px-3 py-1 rounded-full text-xs"
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
      </div>

      {/* MODAL DE REGISTRO */}
      {selectedForUsage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Registrar Vacaciones: {selectedForUsage.nombre}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Días a tomar</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  value={diasUsados}
                  onChange={(e) => setDiasUsados(e.target.value)}
                  placeholder="Ej. 2.5"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo / Notas</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ej. Vacaciones de Semana Santa"
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedForUsage(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleRegisterVacation}
                className="px-4 py-2 text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-700"
              >
                Guardar Registro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INYECCIÓN DE CONTENIDO EDUCATIVO (ADSENSE) */}
      <ExplicacionVacaciones />

      <div className="mt-8">
        <InfoSection type="vacaciones" />
      </div>

    </div>
  );
};

export default VacacionesPageComponent;