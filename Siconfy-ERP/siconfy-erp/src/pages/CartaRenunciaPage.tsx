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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-NI', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      
      {/* PANEL DE CONTROL (Oculto al imprimir) */}
      <div className="print:hidden">
          <h1 className="text-3xl font-bold mb-6 text-center">Carta de Renuncia</h1>
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="grid grid-cols-1 gap-4">
                <input name="nombre" placeholder="Nombre Completo" onChange={handleInputChange} className="border p-2 rounded" />
                <input name="cargo" placeholder="Cargo" onChange={handleInputChange} className="border p-2 rounded" />
                <input type="date" name="fechaRenuncia" onChange={handleInputChange} className="border p-2 rounded" />
                <textarea name="motivo" placeholder="Motivo (Opcional)" onChange={handleInputChange} className="border p-2 rounded" />
            </div>
          </div>
          <button 
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 font-bold mb-8"
          >
            🖨️ Imprimir Carta
          </button>
      </div>

      {/* DOCUMENTO FINAL (Visible e impreso) */}
      <div className="bg-white p-10 shadow-lg print:shadow-none print:p-0 document-print-container">
        <div className="text-right mb-8">
            <p>Managua, {formatDate(formData.fechaRenuncia) || '[Fecha]'}</p>
        </div>
        <h2 className="text-center font-bold text-xl underline mb-8">RENUNCIA IRREVOCABLE</h2>
        
        <div className="text-justify leading-loose space-y-6">
            <p><strong>Estimados Señores:</strong></p>
            <p>
                Por medio de la presente, yo <strong>{formData.nombre || '________________'}</strong>, hago formal mi renuncia al cargo de 
                <strong> {formData.cargo || '________________'}</strong>.
            </p>
            <p>
                Mi último día laboral será el <strong>{formatDate(formData.fechaUltimoDia) || '________________'}</strong>.
            </p>
            {formData.motivo && <p>Motivo: {formData.motivo}</p>}
        </div>

        <div className="mt-20 pt-4 border-t border-black w-64 text-center">
            <p className="font-bold">{formData.nombre}</p>
            <p>Firma</p>
        </div>
      </div>
    </div>
  );
};