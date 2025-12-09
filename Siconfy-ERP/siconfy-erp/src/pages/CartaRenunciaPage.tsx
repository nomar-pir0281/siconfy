
import React, { useState } from 'react';

export const CartaRenunciaPage: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    cargo: '',
    fechaRenuncia: '',
    fechaUltimoDia: '',
    motivo: ''
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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Carta de Renuncia</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Datos del Empleado</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingrese su nombre completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cargo
              </label>
              <input
                type="text"
                name="cargo"
                value={formData.cargo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingrese su cargo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Renuncia
              </label>
              <input
                type="date"
                name="fechaRenuncia"
                value={formData.fechaRenuncia}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha del Último Día Laboral
              </label>
              <input
                type="date"
                name="fechaUltimoDia"
                value={formData.fechaUltimoDia}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo de Renuncia (Opcional)
              </label>
              <textarea
                name="motivo"
                value={formData.motivo}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describa brevemente el motivo de su renuncia"
              />
            </div>
          </div>
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

          <div className="border border-gray-300 p-6 bg-gray-50 font-serif text-sm leading-relaxed print:bg-white print:border-none print:p-0">
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold">CARTA DE RENUNCIA</h3>
            </div>

            <div className="mb-4">
              <p className="mb-2">{formData.nombre || '[Nombre del Empleado]'}</p>
              <p className="mb-2">{formData.cargo || '[Cargo]'}</p>
              <p className="mb-4">Managua, Nicaragua, {formatDate(formData.fechaRenuncia) || '[Fecha de Renuncia]'}</p>
            </div>

            <div className="mb-4">
              <p className="font-bold mb-2">Señor(a):</p>
              <p className="mb-2">[Nombre del Empleador o Representante Legal]</p>
              <p className="mb-2">[Cargo del Empleador]</p>
              <p className="mb-4">[Nombre de la Empresa]</p>
            </div>

            <div className="mb-4">
              <p className="font-bold mb-2">Asunto: Renuncia Voluntaria al Cargo</p>
            </div>

            <div className="mb-4">
              <p className="mb-4">De mi consideración:</p>

              <p className="mb-4 text-justify">
                Por medio de la presente, me dirijo a usted para manifestarle mi decisión irrevocable de renunciar
                voluntariamente al cargo de {formData.cargo || '[Cargo]'} que desempeño en {formData.nombre ? 'esta empresa' : '[Nombre de la Empresa]'},
                a partir de la fecha de {formatDate(formData.fechaUltimoDia) || '[Fecha del Último Día Laboral]'}.
              </p>

              {formData.motivo && (
                <p className="mb-4 text-justify">
                  El motivo de mi renuncia es: {formData.motivo}
                </p>
              )}

              <p className="mb-4 text-justify">
                Agradezco la oportunidad que me han brindado de formar parte de esta empresa y contribuir al
                desarrollo de sus objetivos. Durante mi tiempo de servicio, he tratado de cumplir con mis
                responsabilidades de manera eficiente y profesional.
              </p>

              <p className="mb-4 text-justify">
                Me comprometo a entregar todas las responsabilidades, documentos, equipos y materiales que
                estén bajo mi custodia, en las mejores condiciones posibles, antes de mi fecha de salida.
              </p>

              <p className="mb-4 text-justify">
                Quedo a sus órdenes para cualquier trámite administrativo que sea necesario realizar para
                formalizar mi salida de la empresa.
              </p>
            </div>

            <div className="mb-6">
              <p className="mb-4">Atentamente,</p>
              <div className="border-t border-black w-48 pt-2">
                <p className="font-bold">{formData.nombre || '[Nombre del Empleado]'}</p>
                <p>{formData.cargo || '[Cargo]'}</p>
              </div>
            </div>

            <div className="text-xs text-gray-600 mt-8 print:text-black">
              <p>Nota: Esta carta cumple con los requisitos legales establecidos en el Código del Trabajo de Nicaragua
              para la renuncia voluntaria de un empleado.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos de impresión */}
      <style>
        {`
          @media print {
            .print\\:bg-white {
              background-color: white !important;
            }
