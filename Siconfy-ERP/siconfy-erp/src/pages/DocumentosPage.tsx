import React, { useState } from 'react';
import { formatCurrency } from '../utils/formatters';

export const DocumentosPage: React.FC = () => {
  const [selectedDoc, setSelectedDoc] = useState<string>('contrato');
  const [formData, setFormData] = useState({
    // Datos comunes
    nombre: '',
    cedula: '',
    cargo: '',
    fechaIngreso: '',
    salarioBase: 0,
    empresa: '[Nombre de la Empresa]',
    representante: '[Nombre del Representante]',
    // Para despido
    fechaDespido: '',
    motivoDespido: '',
    // Para renuncia
    fechaRenuncia: '',
    fechaUltimoDia: '',
    motivoRenuncia: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-NI', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderForm = () => {
    switch (selectedDoc) {
      case 'contrato':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Empleado</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cédula</label>
                <input
                  type="text"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Número de cédula"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cargo</label>
                <input
                  type="text"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Puesto de trabajo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha de Ingreso</label>
                <input
                  type="date"
                  name="fechaIngreso"
                  value={formData.fechaIngreso}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Salario Base</label>
                <input
                  type="number"
                  name="salarioBase"
                  value={formData.salarioBase}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        );

      case 'constancia-salarial':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Empleado</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cédula</label>
                <input
                  type="text"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Número de cédula"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha de Ingreso</label>
                <input
                  type="date"
                  name="fechaIngreso"
                  value={formData.fechaIngreso}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Salario Base</label>
                <input
                  type="number"
                  name="salarioBase"
                  value={formData.salarioBase}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        );

      case 'renuncia':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Empleado</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cédula</label>
                <input
                  type="text"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Número de cédula"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cargo</label>
                <input
                  type="text"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Puesto de trabajo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha de Renuncia</label>
                <input
                  type="date"
                  name="fechaRenuncia"
                  value={formData.fechaRenuncia}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Último Día Laboral</label>
                <input
                  type="date"
                  name="fechaUltimoDia"
                  value={formData.fechaUltimoDia}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Motivo (Opcional)</label>
                <textarea
                  name="motivoRenuncia"
                  value={formData.motivoRenuncia}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Describa el motivo de la renuncia"
                />
              </div>
            </div>
          </div>
        );

      case 'despido':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Empleado</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cédula</label>
                <input
                  type="text"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Número de cédula"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha de Despido</label>
                <input
                  type="date"
                  name="fechaDespido"
                  value={formData.fechaDespido}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Motivo del Despido</label>
                <textarea
                  name="motivoDespido"
                  value={formData.motivoDespido}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Describa detalladamente las causas del despido"
                />
              </div>
            </div>
          </div>
        );

      case 'carta-laboral':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Empleado</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cédula</label>
                <input
                  type="text"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Número de cédula"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cargo</label>
                <input
                  type="text"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Puesto de trabajo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha de Ingreso</label>
                <input
                  type="date"
                  name="fechaIngreso"
                  value={formData.fechaIngreso}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderPreview = () => {
    switch (selectedDoc) {
      case 'contrato':
        return (
          <div className="border border-gray-300 p-6 bg-gray-50 font-serif text-sm leading-relaxed print:bg-white print:border-none print:p-0">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold">CONTRATO DE TRABAJO</h3>
              <p className="text-sm">Fecha: {new Date().toLocaleDateString('es-NI')}</p>
            </div>

            <div className="mb-6">
              <p><strong>Entre las partes:</strong></p>
              <p><strong>Empleador:</strong> {formData.empresa}</p>
              <p><strong>Representado por:</strong> {formData.representante}</p>
              <p><strong>Y</strong></p>
              <p><strong>Trabajador:</strong> {formData.nombre || '[Nombre del Empleado]'}</p>
              <p><strong>Cédula:</strong> {formData.cedula || '[Cédula]'}</p>
            </div>

            <div className="mb-6">
              <p><strong>Se acuerda lo siguiente:</strong></p>
              <ol className="ml-6 list-decimal">
                <li>El trabajador se compromete a prestar sus servicios en el puesto de {formData.cargo || '[Puesto de Trabajo]'}.</li>
                <li>La jornada laboral será de 8 horas diarias de lunes a sábado.</li>
                <li>El salario mensual será de {formData.salarioBase ? formatCurrency(formData.salarioBase) : '[Salario]'}.</li>
                <li>El contrato inicia el {formatDate(formData.fechaIngreso) || '[Fecha de Inicio]'}</li>
                <li>El contrato tendrá una duración indeterminada.</li>
              </ol>
            </div>

            <div className="flex justify-between mt-12">
              <div className="text-center">
                <div className="border-t border-black w-48 pt-2">
                  <p className="font-bold">Empleador</p>
                  <p>{formData.representante}</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-black w-48 pt-2">
                  <p className="font-bold">Trabajador</p>
                  <p>{formData.nombre || '[Nombre]'}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'constancia-salarial':
        return (
          <div className="border border-gray-300 p-6 bg-gray-50 font-serif text-sm leading-relaxed print:bg-white print:border-none print:p-0">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold">CONSTANCIA SALARIAL</h3>
              <p className="text-sm">Fecha: {new Date().toLocaleDateString('es-NI')}</p>
            </div>

            <div className="mb-6">
              <p>La empresa {formData.empresa} certifica que:</p>
              <p><strong>Sr(a). {formData.nombre || '[Nombre del Empleado]'}</strong></p>
              <p>Con cédula de identidad número: <strong>{formData.cedula || '[Cédula]'}</strong></p>
              <p>Labora en esta empresa desde: <strong>{formatDate(formData.fechaIngreso) || '[Fecha de Ingreso]'}</strong></p>
            </div>

            <div className="mb-6">
              <p>Devenga un salario mensual de <strong>{formData.salarioBase ? formatCurrency(formData.salarioBase) : '[Salario]'}</strong></p>
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
        );

      case 'renuncia':
        return (
          <div className="border border-gray-300 p-6 bg-gray-50 font-serif text-sm leading-relaxed print:bg-white print:border-none print:p-0">
            <div className="text-right mb-6">
              <p>Managua, Nicaragua, {formatDate(formData.fechaRenuncia) || '[Fecha de Renuncia]'}</p>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold">CARTA DE RENUNCIA</h3>
            </div>

            <div className="mb-6">
              <p><strong>Señor(a)</strong></p>
              <p><strong>Gerente de Recursos Humanos</strong></p>
              <p><strong>{formData.empresa}</strong></p>
              <p><strong>Presente.</strong></p>
            </div>

            <div className="mb-6">
              <p>Por medio de la presente, yo <strong>{formData.nombre || '[Nombre del Empleado]'}</strong>, con cédula de identidad número <strong>{formData.cedula || '[Cédula]'}</strong>, manifiesto mi decisión irrevocable de renunciar al puesto de trabajo que desempeño en la empresa.</p>
              <p>Mi último día de trabajo será: <strong>{formatDate(formData.fechaUltimoDia) || '[Fecha]'}</strong></p>
            </div>

            {formData.motivoRenuncia && (
              <div className="mb-6">
                <p>El motivo de mi renuncia es: {formData.motivoRenuncia}</p>
              </div>
            )}

            <div className="mb-6">
              <p>Agradezco la oportunidad de haber formado parte de esta empresa y los conocimientos adquiridos durante mi permanencia.</p>
            </div>

            <div className="mb-6">
              <p>Atentamente,</p>
            </div>

            <div className="text-center mt-12">
              <div className="border-t border-black w-48 mx-auto pt-2">
                <p className="font-bold">{formData.nombre || '[Nombre del Empleado]'}</p>
                <p>Cédula: {formData.cedula || '[Cédula]'}</p>
              </div>
            </div>
          </div>
        );

      case 'despido':
        return (
          <div className="border border-gray-300 p-6 bg-gray-50 font-serif text-sm leading-relaxed print:bg-white print:border-none print:p-0">
            <div className="text-right mb-6">
              <p>Managua, Nicaragua, {formatDate(formData.fechaDespido) || '[Fecha de Despido]'}</p>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold">CARTA DE DESPIDO</h3>
            </div>

            <div className="mb-6">
              <p><strong>Sr(a). {formData.nombre || '[Nombre del Empleado]'}</strong></p>
              <p><strong>Cédula:</strong> {formData.cedula || '[Cédula]'}</p>
              <p><strong>Presente.</strong></p>
            </div>

            <div className="mb-6">
              <p>Por medio de la presente, se le comunica que a partir de la fecha, queda terminado su contrato de trabajo con la empresa {formData.empresa}, por las siguientes causas:</p>
              <p className="mt-4">{formData.motivoDespido || '[Describa detalladamente las causas del despido]'}</p>
            </div>

            <div className="mb-6">
              <p>Su último día de trabajo será: <strong>{formatDate(formData.fechaDespido) || '[Fecha]'}</strong></p>
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
        );

      case 'carta-laboral':
        return (
          <div className="border border-gray-300 p-6 bg-gray-50 font-serif text-sm leading-relaxed print:bg-white print:border-none print:p-0">
            <div className="text-right mb-6">
              <p>Managua, Nicaragua, {new Date().toLocaleDateString('es-NI')}</p>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold">CARTA LABORAL</h3>
            </div>

            <div className="mb-6">
              <p>A quien corresponda:</p>
            </div>

            <div className="mb-6">
              <p>La empresa {formData.empresa} certifica que el(la) Sr(a). <strong>{formData.nombre || '[Nombre del Empleado]'}</strong>, con cédula de identidad número <strong>{formData.cedula || '[Cédula]'}</strong>, labora en esta empresa desde <strong>{formatDate(formData.fechaIngreso) || '[Fecha de Ingreso]'}</strong>, desempeñando el cargo de <strong>{formData.cargo || '[Cargo]'}</strong>.</p>
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
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Formatos de Documentos</h1>

      {/* Selector de documento */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Seleccionar Documento</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button
            onClick={() => setSelectedDoc('contrato')}
            className={`p-4 rounded-lg border-2 transition-all ${selectedDoc === 'contrato' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📄</div>
              <div className="font-semibold">Contrato</div>
            </div>
          </button>
          <button
            onClick={() => setSelectedDoc('constancia-salarial')}
            className={`p-4 rounded-lg border-2 transition-all ${selectedDoc === 'constancia-salarial' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-300'}`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">💰</div>
              <div className="font-semibold">Constancia Salarial</div>
            </div>
          </button>
          <button
            onClick={() => setSelectedDoc('renuncia')}
            className={`p-4 rounded-lg border-2 transition-all ${selectedDoc === 'renuncia' ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-300'}`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📝</div>
              <div className="font-semibold">Carta de Renuncia</div>
            </div>
          </button>
          <button
            onClick={() => setSelectedDoc('despido')}
            className={`p-4 rounded-lg border-2 transition-all ${selectedDoc === 'despido' ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-300'}`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">⚖️</div>
              <div className="font-semibold">Carta de Despido</div>
            </div>
          </button>
          <button
            onClick={() => setSelectedDoc('carta-laboral')}
            className={`p-4 rounded-lg border-2 transition-all ${selectedDoc === 'carta-laboral' ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-300'}`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📋</div>
              <div className="font-semibold">Carta Laboral</div>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Datos del Documento</h2>
          {renderForm()}
        </div>

        {/* Vista Previa */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Vista Previa</h2>
            <button
              onClick={() => window.print()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 print:hidden"
            >
              🖨️ Imprimir
            </button>
          </div>
          {renderPreview()}
        </div>
      </div>

      {/* Estilos de impresión */}
      <style>
        {`
          @media print {
            .print\\:bg-white {
              background-color: white !important;
            }
            .print\\:border-none {
              border: none !important;
            }
            .print\\:p-0 {
              padding: 0 !important;
            }
            .print\\:text-black {
              color: black !important;
            }
          }
        `}
      </style>
    </div>
  );
};