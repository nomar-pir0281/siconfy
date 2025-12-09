import React, { useState, useEffect, useCallback, memo } from 'react';
import type { Employee } from '../types';
import { EmployeeService } from '../utils/dbService';
import { calcularAcumulacion } from '../utils/prestaciones';
import { formatCurrency, parseCurrency, formatNumberForDisplay } from '../utils/formatters';

const EmpleadoPageComponent: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [printType, setPrintType] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({
    nombre: '',
    cedula: '',
    salarioBase: 0,
    fechaIngreso: '',
    comisiones: 0,
    incentivos: 0,
    horasExtras: 0,
    deducciones: 0,
    frecuencia: 'mensual',
    diasVacacionesAcumulados: 0,
    historialVacaciones: []
  });

  // Raw input values for better UX
  const [salarioBaseInput, setSalarioBaseInput] = useState<string>('');
  const [comisionesInput, setComisionesInput] = useState<string>('');
  const [incentivosInput, setIncentivosInput] = useState<string>('');
  const [horasExtrasInput, setHorasExtrasInput] = useState<string>('');
  const [deduccionesInput, setDeduccionesInput] = useState<string>('');

  const loadEmployees = useCallback(() => {
    const emps = EmployeeService.getAll();
    setEmployees(emps);
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'frecuencia') {
      setFormData(prev => ({ ...prev, [name]: value as 'mensual' | 'quincenal' | 'semanal' }));
    } else if (name.includes('salario') || name.includes('comisiones') || name.includes('incentivos') || name.includes('horasExtras') || name.includes('deducciones')) {
      const numericValue = parseCurrency(value);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const employee: Employee = {
        ...formData as Employee,
        diasVacacionesAcumulados: formData.fechaIngreso ? calcularAcumulacion(formData.fechaIngreso) : 0,
        historialVacaciones: formData.historialVacaciones || []
      };

      if (editingEmployee) {
        EmployeeService.update(employee);
        setEditingEmployee(null);
      } else {
        EmployeeService.save(employee);
      }

      // Clear form data
      setFormData({
        nombre: '',
        cedula: '',
        salarioBase: 0,
        fechaIngreso: '',
        comisiones: 0,
        incentivos: 0,
        horasExtras: 0,
        deducciones: 0,
        frecuencia: 'mensual',
        diasVacacionesAcumulados: 0,
        historialVacaciones: []
      });

      // Clear raw input values for new employee entry
      setSalarioBaseInput('');
      setComisionesInput('');
      setIncentivosInput('');
      setHorasExtrasInput('');
      setDeduccionesInput('');

      loadEmployees();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al guardar empleado');
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      ...employee,
      salarioBase: employee.salarioBase,
      comisiones: employee.comisiones,
      incentivos: employee.incentivos,
      horasExtras: employee.horasExtras,
      deducciones: employee.deducciones
    });

    // Set raw input values for editing
    setSalarioBaseInput(employee.salarioBase > 0 ? formatNumberForDisplay(employee.salarioBase) : '');
    setComisionesInput(employee.comisiones > 0 ? formatNumberForDisplay(employee.comisiones) : '');
    setIncentivosInput(employee.incentivos > 0 ? formatNumberForDisplay(employee.incentivos) : '');
    setHorasExtrasInput(employee.horasExtras > 0 ? formatNumberForDisplay(employee.horasExtras) : '');
    setDeduccionesInput(employee.deducciones > 0 ? formatNumberForDisplay(employee.deducciones) : '');
  };

  const handleDelete = (cedula: string) => {
    if (confirm('¿Seguro que desea eliminar este empleado?')) {
      EmployeeService.delete(cedula);
      loadEmployees();
    }
  };

  const handlePrintDocument = (type: string) => {
    if (!editingEmployee) {
      alert('Seleccione un empleado para imprimir el documento');
      return;
    }
    setPrintType(type);
    setTimeout(() => window.print(), 100);
  };

  // Blur handlers for formatting
  const handleSalarioBaseBlur = () => {
    const numValue = parseCurrency(salarioBaseInput);
    setFormData(prev => ({ ...prev, salarioBase: numValue }));
    setSalarioBaseInput(numValue > 0 ? formatNumberForDisplay(numValue) : '');
  };

  const handleComisionesBlur = () => {
    const numValue = parseCurrency(comisionesInput);
    setFormData(prev => ({ ...prev, comisiones: numValue }));
    setComisionesInput(numValue > 0 ? formatNumberForDisplay(numValue) : '');
  };

  const handleIncentivosBlur = () => {
    const numValue = parseCurrency(incentivosInput);
    setFormData(prev => ({ ...prev, incentivos: numValue }));
    setIncentivosInput(numValue > 0 ? formatNumberForDisplay(numValue) : '');
  };

  const handleHorasExtrasBlur = () => {
    const numValue = parseCurrency(horasExtrasInput);
    setFormData(prev => ({ ...prev, horasExtras: numValue }));
    setHorasExtrasInput(numValue > 0 ? formatNumberForDisplay(numValue) : '');
  };

  const handleDeduccionesBlur = () => {
    const numValue = parseCurrency(deduccionesInput);
    setFormData(prev => ({ ...prev, deducciones: numValue }));
    setDeduccionesInput(numValue > 0 ? formatNumberForDisplay(numValue) : '');
  };

  // Focus handlers for raw input
  const handleSalarioBaseFocus = () => {
    setSalarioBaseInput(salarioBaseInput.replace(/,/g, ''));
  };

  const handleComisionesFocus = () => {
    setComisionesInput(comisionesInput.replace(/,/g, ''));
  };

  const handleIncentivosFocus = () => {
    setIncentivosInput(incentivosInput.replace(/,/g, ''));
  };

  const handleHorasExtrasFocus = () => {
    setHorasExtrasInput(horasExtrasInput.replace(/,/g, ''));
  };

  const handleDeduccionesFocus = () => {
    setDeduccionesInput(deduccionesInput.replace(/,/g, ''));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Gestión de Empleados</h1>

      {/* Formulario */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">{editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cédula</label>
            <input
              type="text"
              name="cedula"
              value={formData.cedula}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
              disabled={!!editingEmployee}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Salario Base</label>
            <input
              type="text"
              value={salarioBaseInput}
              onChange={(e) => setSalarioBaseInput(e.target.value)}
              onFocus={handleSalarioBaseFocus}
              onBlur={handleSalarioBaseBlur}
              className="w-48 p-2 border rounded"
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha de Ingreso</label>
            <input
              type="date"
              name="fechaIngreso"
              value={formData.fechaIngreso}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Comisiones</label>
            <input
              type="text"
              value={comisionesInput}
              onChange={(e) => setComisionesInput(e.target.value)}
              onFocus={handleComisionesFocus}
              onBlur={handleComisionesBlur}
              className="w-40 p-2 border rounded"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Incentivos</label>
            <input
              type="text"
              value={incentivosInput}
              onChange={(e) => setIncentivosInput(e.target.value)}
              onFocus={handleIncentivosFocus}
              onBlur={handleIncentivosBlur}
              className="w-40 p-2 border rounded"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Horas Extras</label>
            <input
              type="text"
              value={horasExtrasInput}
              onChange={(e) => setHorasExtrasInput(e.target.value)}
              onFocus={handleHorasExtrasFocus}
              onBlur={handleHorasExtrasBlur}
              className="w-32 p-2 border rounded"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Deducciones</label>
            <input
              type="text"
              value={deduccionesInput}
              onChange={(e) => setDeduccionesInput(e.target.value)}
              onFocus={handleDeduccionesFocus}
              onBlur={handleDeduccionesBlur}
              className="w-40 p-2 border rounded"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Frecuencia</label>
            <select
              name="frecuencia"
              value={formData.frecuencia}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="mensual">Mensual</option>
              <option value="quincenal">Quincenal</option>
              <option value="semanal">Semanal</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {editingEmployee ? 'Actualizar' : 'Guardar'}
            </button>
            {editingEmployee && (
              <button
                type="button"
                onClick={() => {
                  setEditingEmployee(null);
                  setFormData({
                    nombre: '',
                    cedula: '',
                    salarioBase: 0,
                    fechaIngreso: '',
                    comisiones: 0,
                    incentivos: 0,
                    horasExtras: 0,
                    deducciones: 0,
                    frecuencia: 'mensual',
                    diasVacacionesAcumulados: 0,
                    historialVacaciones: []
                  });
            
                  // Clear raw input values
                  setSalarioBaseInput('');
                  setComisionesInput('');
                  setIncentivosInput('');
                  setHorasExtrasInput('');
                  setDeduccionesInput('');
                }}
                className="ml-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Documentos */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Formatos de Documentos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => handlePrintDocument('contrato')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            📄 Contrato
          </button>
          <button
            onClick={() => handlePrintDocument('constancia-salarial')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            💰 Constancia Salarial
          </button>
          <button
            onClick={() => handlePrintDocument('renuncia')}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            📝 Carta de Renuncia
          </button>
          <button
            onClick={() => handlePrintDocument('despido')}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            ⚖️ Carta de Despido
          </button>
          <button
            onClick={() => handlePrintDocument('carta-laboral')}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            📋 Carta Laboral
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Lista de Empleados</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Cédula</th>
                <th className="px-4 py-2 text-left">Salario Base</th>
                <th className="px-4 py-2 text-left">Fecha Ingreso</th>
                <th className="px-4 py-2 text-left">Vacaciones</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.cedula} className="border-t">
                  <td className="px-4 py-2">{emp.nombre}</td>
                  <td className="px-4 py-2">{emp.cedula}</td>
                  <td className="px-4 py-2">{formatCurrency(emp.salarioBase)}</td>
                  <td className="px-4 py-2">{emp.fechaIngreso}</td>
                  <td className="px-4 py-2">{emp.diasVacacionesAcumulados.toFixed(1)} días</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleEdit(emp)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(emp.cedula)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {employees.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No hay empleados registrados</p>
        )}
      </div>

      {/* Layouts de Impresión para Documentos */}
      {/* Contrato de Trabajo */}
      {printType === 'contrato' && (
        <div className="hidden print:block p-8 bg-white text-black font-serif leading-relaxed">
          <div className="text-center mb-8 border-b-2 border-black pb-4">
            <h1 className="text-2xl font-bold uppercase">Contrato de Trabajo</h1>
            <p className="text-sm">Fecha: {new Date().toLocaleDateString('es-NI')}</p>
          </div>

          <div className="mb-6">
            <p><strong>Entre las partes:</strong></p>
            <p><strong>Empleador:</strong> [Nombre de la Empresa]</p>
            <p><strong>Representado por:</strong> [Nombre del Representante]</p>
            <p><strong>Y</strong></p>
            <p><strong>Trabajador:</strong> {editingEmployee?.nombre || '[Nombre del Empleado]'}</p>
            <p><strong>Cédula:</strong> {editingEmployee?.cedula || '[Cédula]'}</p>
          </div>

          <div className="mb-6">
            <p><strong>Se acuerda lo siguiente:</strong></p>
            <ol className="ml-6 list-decimal">
              <li>El trabajador se compromete a prestar sus servicios en el puesto de [Puesto de Trabajo].</li>
              <li>La jornada laboral será de [Horas] horas diarias.</li>
              <li>El salario mensual será de {editingEmployee ? formatCurrency(editingEmployee.salarioBase) : '[Salario]'}</li>
              <li>El contrato inicia el {editingEmployee?.fechaIngreso || '[Fecha de Inicio]'}</li>
            </ol>
          </div>

          <div className="flex justify-between mt-12">
            <div className="text-center">
              <div className="border-t border-black w-48 pt-2">
                <p className="font-bold">Empleador</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-black w-48 pt-2">
                <p className="font-bold">Trabajador</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Constancia Salarial */}
      {printType === 'constancia-salarial' && (
        <div className="hidden print:block p-8 bg-white text-black font-serif leading-relaxed">
          <div className="text-center mb-8 border-b-2 border-black pb-4">
            <h1 className="text-2xl font-bold uppercase">Constancia Salarial</h1>
            <p className="text-sm">Fecha: {new Date().toLocaleDateString('es-NI')}</p>
          </div>

          <div className="mb-6">
            <p>La empresa [Nombre de la Empresa] certifica que:</p>
            <p><strong>Sr(a). {editingEmployee?.nombre || '[Nombre del Empleado]'}</strong></p>
            <p>Con cédula de identidad número: <strong>{editingEmployee?.cedula || '[Cédula]'}</strong></p>
            <p>Labora en esta empresa desde: <strong>{editingEmployee?.fechaIngreso || '[Fecha de Ingreso]'}</strong></p>
          </div>

          <div className="mb-6">
            <p>Devenga un salario mensual de <strong>{editingEmployee ? formatCurrency(editingEmployee.salarioBase) : '[Salario]'}</strong></p>
          </div>

          <div className="mb-6">
            <p>Se expide la presente constancia a solicitud del interesado para los fines que estime conveniente.</p>
          </div>

          <div className="flex justify-between mt-12">
            <div className="text-center">
              <div className="border-t border-black w-48 pt-2">
                <p className="font-bold">Recursos Humanos</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-black w-48 pt-2">
                <p className="font-bold">Sello de la Empresa</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Carta de Renuncia */}
      {printType === 'renuncia' && (
        <div className="hidden print:block p-8 bg-white text-black font-serif leading-relaxed">
          <div className="text-right mb-6">
            <p>[Ciudad], {new Date().toLocaleDateString('es-NI')}</p>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold uppercase">Carta de Renuncia</h1>
          </div>

          <div className="mb-6">
            <p><strong>Señor(a)</strong></p>
            <p><strong>Gerente de Recursos Humanos</strong></p>
            <p><strong>[Nombre de la Empresa]</strong></p>
            <p><strong>Presente.</strong></p>
          </div>

          <div className="mb-6">
            <p>Por medio de la presente, yo <strong>{editingEmployee?.nombre || '[Nombre del Empleado]'}</strong>, con cédula de identidad número <strong>{editingEmployee?.cedula || '[Cédula]'}</strong>, manifiesto mi decisión irrevocable de renunciar al puesto de trabajo que desempeño en la empresa.</p>
            <p>Mi último día de trabajo será: ____________________</p>
          </div>

          <div className="mb-6">
            <p>Agradezco la oportunidad de haber formado parte de esta empresa y los conocimientos adquiridos durante mi permanencia.</p>
          </div>

          <div className="mb-6">
            <p>Atentamente,</p>
          </div>

          <div className="text-center mt-12">
            <div className="border-t border-black w-48 mx-auto pt-2">
              <p className="font-bold">{editingEmployee?.nombre || '[Nombre del Empleado]'}</p>
              <p>Cédula: {editingEmployee?.cedula || '[Cédula]'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Carta de Despido */}
      {printType === 'despido' && (
        <div className="hidden print:block p-8 bg-white text-black font-serif leading-relaxed">
          <div className="text-right mb-6">
            <p>[Ciudad], {new Date().toLocaleDateString('es-NI')}</p>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold uppercase">Carta de Despido</h1>
          </div>

          <div className="mb-6">
            <p><strong>Sr(a). {editingEmployee?.nombre || '[Nombre del Empleado]'}</strong></p>
            <p><strong>Cédula:</strong> {editingEmployee?.cedula || '[Cédula]'}</p>
            <p><strong>Presente.</strong></p>
          </div>

          <div className="mb-6">
            <p>Por medio de la presente, se le comunica que a partir de la fecha, queda terminado su contrato de trabajo con la empresa [Nombre de la Empresa], por las siguientes causas:</p>
            <p>________________________________________________________________________</p>
            <p>________________________________________________________________________</p>
            <p>________________________________________________________________________</p>
          </div>

          <div className="mb-6">
            <p>Su último día de trabajo será: ____________________</p>
            <p>Se le recuerda que tiene derecho a las prestaciones laborales correspondientes según la legislación vigente.</p>
          </div>

          <div className="flex justify-between mt-12">
            <div className="text-center">
              <div className="border-t border-black w-48 pt-2">
                <p className="font-bold">Recursos Humanos</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-black w-48 pt-2">
                <p className="font-bold">Firma del Empleado</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Carta Laboral */}
      {printType === 'carta-laboral' && (
        <div className="hidden print:block p-8 bg-white text-black font-serif leading-relaxed">
          <div className="text-right mb-6">
            <p>[Ciudad], {new Date().toLocaleDateString('es-NI')}</p>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold uppercase">Carta Laboral</h1>
          </div>

          <div className="mb-6">
            <p>A quien corresponda:</p>
          </div>

          <div className="mb-6">
            <p>La empresa [Nombre de la Empresa] certifica que el(la) Sr(a). <strong>{editingEmployee?.nombre || '[Nombre del Empleado]'}</strong>, con cédula de identidad número <strong>{editingEmployee?.cedula || '[Cédula]'}</strong>, labora en esta empresa desde <strong>{editingEmployee?.fechaIngreso || '[Fecha de Ingreso]'}</strong>, desempeñando el cargo de [Puesto de Trabajo].</p>
          </div>

          <div className="mb-6">
            <p>Durante su permanencia en la empresa, ha demostrado responsabilidad y cumplimiento en sus funciones.</p>
            <p>Se expide la presente carta a solicitud del interesado para los fines que estime conveniente.</p>
          </div>

          <div className="flex justify-between mt-12">
            <div className="text-center">
              <div className="border-t border-black w-48 pt-2">
                <p className="font-bold">Recursos Humanos</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-black w-48 pt-2">
                <p className="font-bold">Sello de la Empresa</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const EmpleadoPage = memo(EmpleadoPageComponent);