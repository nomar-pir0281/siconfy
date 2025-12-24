import { InfoSection } from '../components/InfoSection';
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { formatCurrency } from '../utils/formatters';
import { ReportPreviewModal } from '../components/reports/ReportPreviewModal';

interface ResultadoIndemnizacion {
  antiguedadAnios: number;
  antiguedadMeses: number;
  antiguedadDias: number;
  diasIndemnizacion: number;
  montoIndemnizacion: number;
  salarioDiario: number;
  limiteAplicado: boolean;
}

export const IndemnizacionPage = () => {
  const navigate = useNavigate();
  // Inputs
  const [salarioBase, setSalarioBase] = useState<number>(0);
  const [salarioInput, setSalarioInput] = useState('');
  const [tipoContrato, setTipoContrato] = useState<'Indeterminado' | 'Determinado'>('Indeterminado');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Resultado
  const [resultado, setResultado] = useState<ResultadoIndemnizacion | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [nombre, setNombre] = useState('');

  // Referencias para navegación con teclado
  const inputsRef = useRef<Array<HTMLElement | null>>([]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextInput = inputsRef.current[index + 1];
      if (nextInput) {
        nextInput.focus();
        if (nextInput instanceof HTMLInputElement) nextInput.select();
      }
    }
  };

  const calcularIndemnizacion = () => {
    if (!salarioBase || !fechaInicio || !fechaFin) {
      alert('Por favor complete todos los campos requeridos.');
      return;
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (fin < inicio) {
      alert('La fecha de salida no puede ser anterior a la de ingreso.');
      return;
    }

    // 1. Calcular Antigüedad Real
    let years = fin.getFullYear() - inicio.getFullYear();
    let months = fin.getMonth() - inicio.getMonth();
    let days = fin.getDate() - inicio.getDate();

    if (days < 0) {
      months--;
      // Obtener días del mes anterior
      const prevMonth = new Date(fin.getFullYear(), fin.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    // 2. Calcular Días a Pagar (Art. 45)
    let diasPagar = 0;

    // Regla: Primeros 3 años = 1 mes (30 días) por año.
    // Años subsiguientes (4to en adelante) = 20 días por año.

    // Años completos
    if (years <= 3) {
      diasPagar += years * 30;
    } else {
      diasPagar += (3 * 30); // Primeros 3 años
      diasPagar += (years - 3) * 20; // Años adicionales
    }

    // Proporcionales (Meses y Días)
    // La tasa depende de si estamos en los primeros 3 años o después
    const tasaMensual = (years < 3) ? (30 / 12) : (20 / 12);
    const tasaDiaria = tasaMensual / 30;

    diasPagar += (months * tasaMensual);
    diasPagar += (days * tasaDiaria);

    // 3. Verificar Techo Legal (5 meses = 150 días)
    let limiteAplicado = false;
    if (diasPagar > 150) {
      diasPagar = 150;
      limiteAplicado = true;
    }

    const salarioDiario = salarioBase / 30;
    const montoIndemnizacion = diasPagar * salarioDiario;

    setResultado({
      antiguedadAnios: years,
      antiguedadMeses: months,
      antiguedadDias: days,
      diasIndemnizacion: diasPagar,
      montoIndemnizacion,
      salarioDiario,
      limiteAplicado
    });
  };

  // Manejo de input monetario
  const handleSalarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/,/g, '');
    if (!isNaN(Number(val))) {
      setSalarioInput(e.target.value);
      setSalarioBase(Number(val));
    }
  };

  const handleLimpiar = () => {
    setSalarioBase(0);
    setSalarioInput('');
    setFechaInicio('');
    setFechaFin('');
    setResultado(null);
    if (inputsRef.current[0]) inputsRef.current[0].focus();
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 px-4 animate-fade-in">
      <Card title="Cálculo de Indemnización (Art. 45)" action={
        <button onClick={handleLimpiar} className="text-xs text-stone-500 font-bold hover:text-stone-800 underline">
          Limpiar
        </button>
      }>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna Izquierda: Inputs */}
          <div className="space-y-4">

            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Salario Mensual</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-400 font-bold">C$</span>
                <input
                  ref={el => { inputsRef.current[0] = el }}
                  type="number"
                  value={salarioInput}
                  onChange={handleSalarioChange}
                  onKeyDown={e => handleKeyDown(e, 0)}
                  className="w-full pl-10 p-2 border rounded font-bold text-stone-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0.00"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Nombre Trabajador (Opcional)</label>
              <input
                ref={el => { inputsRef.current[4] = el }}
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                onKeyDown={e => handleKeyDown(e, 4)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej: María González"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Tipo de Contrato</label>
              <select
                ref={el => { inputsRef.current[1] = el }}
                value={tipoContrato}
                onChange={e => setTipoContrato(e.target.value as any)}
                onKeyDown={e => handleKeyDown(e, 1)}
                className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Indeterminado">Indeterminado (Aplica Art. 45)</option>
                <option value="Determinado">Determinado (Fecha Fija)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Fecha de Inicio</label>
              <input
                ref={el => { inputsRef.current[2] = el }}
                type="date"
                value={fechaInicio}
                onChange={e => setFechaInicio(e.target.value)}
                onKeyDown={e => handleKeyDown(e, 2)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Fecha de Finalización</label>
              <input
                ref={el => { inputsRef.current[3] = el }}
                type="date"
                value={fechaFin}
                onChange={e => setFechaFin(e.target.value)}
                onKeyDown={e => handleKeyDown(e, 3)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              onClick={calcularIndemnizacion}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition shadow-lg mt-4"
            >
              Calcular Indemnización
            </button>
          </div>

          {/* Columna Derecha: Resultados */}
          <div className="bg-stone-50 rounded-lg p-6 border border-stone-200 flex flex-col justify-center">
            {!resultado ? (
              <div className="text-center text-stone-400">
                <p className="text-4xl mb-2">⚖️</p>
                <p className="text-sm">Ingrese los datos para calcular</p>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in-up">
                <div className="text-center border-b pb-4">
                  <p className="text-xs font-bold text-stone-500 uppercase">Monto a Pagar</p>
                  <p className="text-3xl font-black text-blue-800">{formatCurrency(resultado.montoIndemnizacion)}</p>
                  {resultado.limiteAplicado && (
                    <span className="inline-block bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded mt-1">
                      ⚠️ Tope Legal Aplicado (5 Meses)
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Antigüedad:</span>
                    <span className="font-bold">{resultado.antiguedadAnios} años, {resultado.antiguedadMeses} meses</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Días a Pagar:</span>
                    <span className="font-bold">{resultado.diasIndemnizacion.toFixed(2)} días</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Salario Diario:</span>
                    <span className="font-bold">{formatCurrency(resultado.salarioDiario)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowPreview(true)}
                  className="w-full mt-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2 rounded transition flex items-center justify-center gap-2"
                >
                  <span>📄</span> Ver Hoja de Cálculo
                </button>

                <button
                  onClick={() => navigate('/liquidacion')}
                  className="w-full mt-2 bg-white border border-blue-200 text-blue-600 text-xs font-bold py-2 rounded hover:bg-blue-50 transition"
                >
                  Ir a Liquidación Completa →
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
        <h4 className="font-bold mb-2">ℹ️ Sobre el Artículo 45 (Código del Trabajo Nicaragua)</h4>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li><strong>Primeros 3 años:</strong> Se paga 1 mes de salario por cada año trabajado.</li>
          <li><strong>Del 4to año en adelante:</strong> Se pagan 20 días de salario por cada año adicional.</li>
          <li><strong>Tope Máximo:</strong> La indemnización no puede exceder los 5 meses de salario (150 días).</li>
          <li>Las fracciones de año (meses y días) se pagan proporcionalmente.</li>
        </ul>
      </div>

      {/* MODAL DE VISTA PREVIA */}
      <ReportPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="HOJA DE CÁLCULO DE INDEMNIZACIÓN"
        subtitle="Artículo 45 - Código del Trabajo"
      >
        {resultado && (
          <div className="p-6 border-2 border-slate-800 rounded-lg">
            <div className="mb-6 border-b-2 border-slate-200 pb-4">
              <h3 className="text-lg font-bold uppercase text-slate-800">Trabajador: {nombre || 'NO ESPECIFICADO'}</h3>
              <p className="text-xs text-slate-500 mt-1">Período Laboral: {fechaInicio} al {fechaFin}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
              <div className="space-y-3">
                <h4 className="font-bold text-slate-700 uppercase text-xs border-b border-slate-300 pb-1">Datos del Cálculo</h4>
                <div className="flex justify-between">
                  <span className="text-slate-600">Salario Mensual:</span>
                  <span className="font-mono font-bold">{formatCurrency(salarioBase)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Salario Diario:</span>
                  <span className="font-mono">{formatCurrency(resultado.salarioDiario)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Antigüedad:</span>
                  <span className="font-bold">{resultado.antiguedadAnios}a {resultado.antiguedadMeses}m {resultado.antiguedadDias}d</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-700 uppercase text-xs border-b border-slate-300 pb-1">Desglose Legal</h4>
                <div className="flex justify-between">
                  <span className="text-slate-600">Días Calculados:</span>
                  <span className="font-mono">{resultado.diasIndemnizacion.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tipo de Contrato:</span>
                  <span className="font-bold">{tipoContrato}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tope Legal (150d):</span>
                  <span className={`font-bold ${resultado.limiteAplicado ? 'text-red-700' : 'text-green-700'}`}>
                    {resultado.limiteAplicado ? 'APLICADO ⚠️' : 'No Aplicado ✓'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg text-slate-700">TOTAL INDEMNIZACIÓN:</span>
                <span className="font-black text-2xl text-blue-800">{formatCurrency(resultado.montoIndemnizacion)}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-300">
              <h5 className="font-bold text-xs uppercase text-slate-600 mb-3">Cálculo Detallado:</h5>
              <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded">
                {resultado.antiguedadAnios <= 3 ? (
                  <p>• Primeros {resultado.antiguedadAnios} años: {resultado.antiguedadAnios} × 30 días = {resultado.antiguedadAnios * 30} días</p>
                ) : (
                  <>
                    <p>• Primeros 3 años: 3 × 30 días = 90 días</p>
                    <p>• Años adicionales ({resultado.antiguedadAnios - 3}): {resultado.antiguedadAnios - 3} × 20 días = {(resultado.antiguedadAnios - 3) * 20} días</p>
                  </>
                )}
                {resultado.antiguedadMeses > 0 && (
                  <p>• Meses proporcionales: {resultado.antiguedadMeses} meses</p>
                )}
                {resultado.diasIndemnizacion} días × {formatCurrency(resultado.salarioDiario)}/día = <strong>{formatCurrency(resultado.montoIndemnizacion)}</strong>
              </div>
            </div>

            <div className="mt-8 flex justify-between gap-8 pt-8 px-4">
              <div className="border-t border-black flex-1 text-center text-xs font-bold pt-2">
                EMPLEADOR
              </div>
              <div className="border-t border-black flex-1 text-center text-xs font-bold pt-2">
                TRABAJADOR
              </div>
            </div>
          </div>
        )}
      </ReportPreviewModal>

      <InfoSection type="finiquito" />
    </div>
  );
};