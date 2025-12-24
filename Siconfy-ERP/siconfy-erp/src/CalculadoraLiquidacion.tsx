import { InfoSection } from "./components/InfoSection";
import React, { useState, useRef, memo } from 'react';
import { calcularLiquidacion, type ResultadoLiquidacion } from './utils/liquidacion';
import { formatCurrency, formatCurrencyForTable, formatNumberForDisplay, parseCurrency } from './utils/formatters';
import { Card } from './components/ui/Card';

// --- COMPONENTE ESTRATÉGICO PARA ADSENSE (NUEVO) ---
// Este componente inyecta contenido de alto valor semántico para que Google apruebe la web.
const ExplicacionLegalAdsense: React.FC<{ data: ResultadoLiquidacion }> = ({ data }) => (
  <div className="mt-8 bg-white border border-stone-200 rounded-lg p-6 shadow-sm animate-fade-in print:hidden">
    <h3 className="text-lg font-bold text-stone-800 border-b border-stone-100 pb-2 mb-4">
      Análisis Legal del Cálculo (Según Ley 822 y Código del Trabajo)
    </h3>

    <div className="grid md:grid-cols-2 gap-6 text-sm text-stone-600">
      <div>
        <h4 className="font-semibold text-primary-700 mb-2">Sobre su Indemnización</h4>
        <p className="mb-2">
          Conforme al <strong>Artículo 45 del Código del Trabajo de Nicaragua</strong>, su indemnización de
          <span className="font-mono text-stone-900 font-medium"> {formatCurrency(data.montoIndemnizacion)} </span>
          corresponde a la antigüedad acumulada. Este ingreso está <strong>100% exento</strong> de Impuesto sobre la Renta.
        </p>
        <p>
          La ley establece un pago de un mes de salario por cada uno de los primeros 3 años, y 20 días por cada año adicional,
          respetando siempre el tope legal de 5 meses de salario.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-primary-700 mb-2">Tratamiento Fiscal (IR Vacaciones)</h4>
        <p className="mb-2">
          Se ha calculado una retención de IR sobre Vacaciones de
          <span className="font-mono text-stone-900 font-medium"> {formatCurrency(data.irVacaciones)} </span>.
        </p>
        <p>
          Según el <strong>Art. 71 de la Ley de Concertación Tributaria</strong>, las vacaciones pagadas
          se consideran una "Renta del Trabajo Ocasional". Para el cálculo justo, nuestro sistema suma este pago a su
          proyección anual estimada para determinar la tasa de retención definitiva correcta (del 10% al 30%), evitando deducciones excesivas.
        </p>
      </div>
    </div>

    <div className="mt-4 pt-4 border-t border-stone-100 text-xs text-stone-400 italic">
      * Este reporte es generado automáticamente por Siconfy-ERP para fines informativos y de auditoría laboral.
    </div>
  </div>
);

// --- COMPONENTES VISUALES ---

interface TablaResultadosProps {
  data: ResultadoLiquidacion;
  isPrint?: boolean;
  nombre: string;
  cedula: string;
  cargo: string;
  motivo: string;
  fechaInicio: string;
  fechaFin: string;
  salario: number;
  vacaciones: number;
  diasPendientes: number;
}

const TablaResultadosFiniquito: React.FC<TablaResultadosProps> = memo(({
  data, isPrint = false, nombre, cedula, cargo, motivo, fechaInicio, fechaFin, diasPendientes, vacaciones
}) => {
  const containerClass = isPrint
    ? "document-print-container p-8 font-serif text-black w-full"
    : "mt-8 animate-fade-in";

  return (
    <div className={containerClass}>
      {isPrint && (
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-xl font-bold uppercase tracking-wider">Finiquito de Prestaciones Laborales</h1>
          <p className="text-sm mt-1">Fecha de Emisión: {new Date().toLocaleDateString('es-NI')}</p>
        </div>
      )}

      <div className={`${!isPrint ? 'bg-stone-50 p-4 rounded-lg border border-stone-200 mb-6' : 'mb-6 text-sm'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
          <div className="flex justify-between border-b border-stone-300 border-dotted py-1">
            <span className="font-bold text-stone-600">COLABORADOR:</span>
            <span className="font-medium text-stone-900 uppercase">{nombre || '---'}</span>
          </div>
          <div className="flex justify-between border-b border-stone-300 border-dotted py-1">
            <span className="font-bold text-stone-600">CÉDULA:</span>
            <span className="font-medium text-stone-900">{cedula || '---'}</span>
          </div>
          <div className="flex justify-between border-b border-stone-300 border-dotted py-1">
            <span className="font-bold text-stone-600">CARGO:</span>
            <span className="font-medium text-stone-900 uppercase">{cargo || '---'}</span>
          </div>
          <div className="flex justify-between border-b border-stone-300 border-dotted py-1">
            <span className="font-bold text-stone-600">MOTIVO:</span>
            <span className="font-medium text-stone-900 uppercase">{motivo}</span>
          </div>
          <div className="col-span-1 md:col-span-2 flex justify-between border-b border-stone-300 border-dotted py-1">
            <span className="font-bold text-stone-600">PERÍODO:</span>
            <span className="font-medium text-stone-900">Del {fechaInicio} al {fechaFin}</span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-stone-200">
        <table className="w-full text-sm">
          <thead className="bg-stone-100 text-stone-700 font-bold uppercase text-xs">
            <tr>
              <th className="text-left py-3 px-4">Concepto</th>
              <th className="text-center py-3 px-4">Detalle</th>
              <th className="text-center py-3 px-4">Días</th>
              <th className="text-right py-3 px-4">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {data.montoSalarioPendiente > 0 && (
              <tr>
                <td className="py-3 px-4 font-medium">Salario Pendiente</td>
                <td className="text-center text-xs text-stone-500">Salario diario x días pend.</td>
                <td className="text-center text-stone-600">{diasPendientes}</td>
                <td className="text-right px-4 font-mono">{formatCurrencyForTable(data.montoSalarioPendiente)}</td>
              </tr>
            )}
            <tr>
              <td className="py-3 px-4 font-medium">Aguinaldo Proporcional</td>
              <td className="text-center text-xs text-stone-500">Prop. Anual</td>
              <td className="text-center text-stone-600">-</td>
              <td className="text-right px-4 font-mono">{formatCurrencyForTable(data.montoAguinaldo)}</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium">Vacaciones Proporcionales</td>
              <td className="text-center text-xs text-stone-500">Salario diario x días acum.</td>
              <td className="text-center text-stone-600">{vacaciones.toFixed(2)}</td>
              <td className="text-right px-4 font-mono">{formatCurrencyForTable(data.montoVacaciones)}</td>
            </tr>
            <tr className="bg-blue-50/50">
              <td className="py-3 px-4 font-bold text-blue-900">Indemnización (Antigüedad)</td>
              <td className="text-center text-xs text-blue-800">{data.antiguedadAños} Años, {data.antiguedadMeses} Meses</td>
              <td className="text-center">-</td>
              <td className="text-right px-4 font-mono font-bold text-blue-900">{formatCurrencyForTable(data.montoIndemnizacion)}</td>
            </tr>

            <tr className="bg-stone-50 font-bold border-t-2 border-stone-300">
              <td className="py-3 px-4" colSpan={3}>TOTAL INGRESOS BRUTOS</td>
              <td className="text-right px-4 font-mono">{formatCurrencyForTable(data.totalIngresos)}</td>
            </tr>

            <tr className="text-red-600">
              <td className="py-2 px-4 pl-8">(-) INSS Laboral</td>
              <td className="text-center text-xs">7% sobre sal. pend. + vacac.</td>
              <td></td>
              <td className="text-right px-4 font-mono">{formatCurrencyForTable(data.inss)}</td>
            </tr>
            <tr className="text-red-600 border-b-2 border-stone-800">
              <td className="py-2 px-4 pl-8">(-) IR Rentas del Trabajo</td>
              <td className="text-center text-xs px-2">
                <div className="flex flex-col gap-1 w-full max-w-[200px] mx-auto">
                  <div className="flex justify-between text-xs text-stone-500">
                    <span>IR Salario:</span>
                    <span>{formatCurrency(data.irSalario)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-stone-500">
                    <span>IR Vacaciones:</span>
                    <span>{formatCurrency(data.irVacaciones)}</span>
                  </div>
                </div>
              </td>
              <td></td>
              <td className="text-right px-4 font-mono">{formatCurrencyForTable(data.ir)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-6">
        <div className={`p-4 border-2 border-primary-800 rounded-lg bg-white shadow-lg ${isPrint ? 'border-black shadow-none' : ''}`}>
          <div className="flex items-center gap-6">
            <span className="font-bold text-lg text-stone-600 uppercase">Neto a Recibir:</span>
            <span className="font-black text-2xl text-primary-800">{formatCurrency(data.netoRecibir)}</span>
          </div>
        </div>
      </div>

      {isPrint && (
        <div className="flex justify-between px-8 mt-20 pt-10 page-break-avoid">
          <div className="text-center border-t border-black w-5/12 pt-2">
            <p className="font-bold text-sm">RECIBÍ CONFORME</p>
            <p className="text-xs uppercase mt-1">{nombre}</p>
            <p className="text-xs">Cédula: {cedula}</p>
          </div>
          <div className="text-center border-t border-black w-5/12 pt-2">
            <p className="font-bold text-sm">ENTREGUÉ CONFORME</p>
            <p className="text-xs mt-1">EMPLEADOR / RRHH</p>
          </div>
        </div>
      )}
    </div>
  );
});

// --- COMPONENTE PRINCIPAL ---

export const CalculadoraLiquidacion = () => {
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [cargo, setCargo] = useState('');
  const [motivo, setMotivo] = useState<'renuncia-15' | 'renuncia-inmediata' | 'despido-art45' | 'despido-causa-justa' | 'fallecimiento'>('renuncia-15');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const [salario, setSalario] = useState<number>(0);
  const [salarioInput, setSalarioInput] = useState('');

  const [vacaciones, setVacaciones] = useState<number>(0);
  const [diasPendientes, setDiasPendientes] = useState<number>(0);

  const [res, setRes] = useState<ResultadoLiquidacion | null>(null);

  const inputsRef = useRef<Array<HTMLElement | null>>([]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextInput = inputsRef.current[index + 1];
      if (nextInput) {
        nextInput.focus();
        if (nextInput instanceof HTMLInputElement) {
          nextInput.select();
        }
      }
    }
  };

  const handleCalcular = () => {
    if (!fechaInicio || !fechaFin || !salario) {
      alert("Por favor ingresa las fechas y el salario base.");
      return;
    }
    if (salario < 0) { alert("El salario no puede ser negativo"); return; }

    const resultado = calcularLiquidacion(fechaInicio, fechaFin, salario, vacaciones, diasPendientes, motivo);
    setRes(resultado);
  };

  const handleLimpiar = () => {
    setNombre(''); setCedula(''); setCargo('');
    setSalario(0); setSalarioInput('');
    setVacaciones(0); setDiasPendientes(0);
    setFechaInicio(''); setFechaFin(''); setRes(null);
    if (inputsRef.current[0]) inputsRef.current[0].focus();
  };

  const handleSalarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    setSalarioInput(valStr);
    setSalario(parseCurrency(valStr));
  };

  const handleSalarioBlur = () => {
    if (salario > 0) {
      setSalarioInput(formatNumberForDisplay(salario));
    } else {
      setSalarioInput('');
    }
  };

  const handleSalarioFocus = () => {
    if (salario > 0) setSalarioInput(salario.toString());
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 px-4">
      <div className="print:hidden">
        <Card title="Calculadora de Liquidación" action={
          <div className="flex gap-2">
            <button onClick={handleLimpiar} className="px-3 py-1.5 text-xs font-bold text-stone-500 hover:text-stone-700 transition">
              Limpiar
            </button>
            <button
              onClick={() => window.print()}
              disabled={!res}
              className="flex items-center gap-2 bg-primary-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>🖨️</span> Imprimir Finiquito
            </button>
          </div>
        }>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-4 border-b lg:border-b-0 lg:border-r border-stone-100 pb-4 lg:pb-0 lg:pr-6">
              <h4 className="text-xs font-black text-stone-400 uppercase tracking-wider mb-2">Datos del Colaborador</h4>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Nombre Completo</label>
                <input
                  className="w-full p-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  ref={el => { inputsRef.current[0] = el }}
                  onKeyDown={e => handleKeyDown(e, 0)}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Cédula de Identidad</label>
                <input
                  className="w-full p-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-600 outline-none"
                  value={cedula}
                  onChange={e => setCedula(e.target.value)}
                  placeholder="001-000000-0000A"
                  ref={el => { inputsRef.current[1] = el }}
                  onKeyDown={e => handleKeyDown(e, 1)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Cargo</label>
                <input
                  className="w-full p-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-600 outline-none"
                  value={cargo}
                  onChange={e => setCargo(e.target.value)}
                  ref={el => { inputsRef.current[2] = el }}
                  onKeyDown={e => handleKeyDown(e, 2)}
                />
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <h4 className="text-xs font-black text-stone-400 uppercase tracking-wider mb-2">Variables de Cálculo</h4>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Fecha de Ingreso</label>
                <input type="date" className="w-full p-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-600 outline-none"
                  value={fechaInicio} onChange={e => setFechaInicio(e.target.value)}
                  ref={el => { inputsRef.current[3] = el }}
                  onKeyDown={e => handleKeyDown(e, 3)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Fecha de Salida</label>
                <input type="date" className="w-full p-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-600 outline-none"
                  value={fechaFin} onChange={e => setFechaFin(e.target.value)}
                  ref={el => { inputsRef.current[4] = el }}
                  onKeyDown={e => handleKeyDown(e, 4)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Motivo de Salida</label>
                <select className="w-full p-2.5 border border-stone-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-600 outline-none"
                  value={motivo} onChange={e => setMotivo(e.target.value as 'renuncia-15' | 'renuncia-inmediata' | 'despido-art45' | 'despido-causa-justa' | 'fallecimiento')}
                  ref={el => { inputsRef.current[5] = el }}
                  onKeyDown={e => handleKeyDown(e, 5)}
                >
                  <option value="renuncia-15">Renuncia con 15 días</option>
                  <option value="renuncia-inmediata">Renuncia inmediata</option>
                  <option value="despido-art45">Despido Art.45</option>
                  <option value="despido-causa-justa">Despido por causa justa</option>
                  <option value="fallecimiento">Fallecimiento</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-green-700 mb-1">Salario Mensual Bruto</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-green-600 font-bold">C$</span>
                  <input
                    type="text"
                    className="w-full pl-10 p-2.5 border-2 border-green-100 bg-green-50/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none font-bold text-green-800"
                    value={salarioInput}
                    onChange={handleSalarioChange}
                    onBlur={handleSalarioBlur}
                    onFocus={handleSalarioFocus}
                    placeholder="0.00"
                    ref={el => { inputsRef.current[6] = el }}
                    onKeyDown={e => handleKeyDown(e, 6)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Días Vacaciones Acum.</label>
                <input type="number" className="w-full p-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-600 outline-none"
                  value={vacaciones || ''} onChange={e => setVacaciones(parseFloat(e.target.value))} placeholder="0"
                  ref={el => { inputsRef.current[7] = el }}
                  onKeyDown={e => handleKeyDown(e, 7)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Días Pendientes de Pago</label>
                <input type="number" className="w-full p-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-600 outline-none"
                  value={diasPendientes || ''} onChange={e => setDiasPendientes(parseFloat(e.target.value))} placeholder="0"
                  ref={el => { inputsRef.current[8] = el }}
                  onKeyDown={e => handleKeyDown(e, 8)}
                />
              </div>

              <div className="md:col-span-2 pt-4">
                <button
                  onClick={handleCalcular}
                  ref={el => { inputsRef.current[9] = el }}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 text-sm rounded-xl shadow-lg hover:shadow-xl transition transform active:scale-95 flex justify-center items-center gap-2"
                >
                  <span>🧮</span> CALCULAR LIQUIDACIÓN
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {res && (
        <div className="mt-8 animate-fade-in-up">
          <Card title="Vista Previa del Documento">
            <TablaResultadosFiniquito
              data={res}
              isPrint={false}
              nombre={nombre}
              cedula={cedula}
              cargo={cargo}
              motivo={motivo}
              fechaInicio={fechaInicio}
              fechaFin={fechaFin}
              salario={salario}
              vacaciones={vacaciones}
              diasPendientes={diasPendientes}
            />

            {/* INYECCIÓN DE CONTENIDO EDUCATIVO (Solución AdSense) */}
            <ExplicacionLegalAdsense data={res} />
          </Card>
        </div>
      )}

      {res && (
        <div className="hidden print:block">
          <TablaResultadosFiniquito
            data={res} isPrint={true} nombre={nombre} cedula={cedula}
            cargo={cargo} motivo={motivo} fechaInicio={fechaInicio}
            fechaFin={fechaFin} salario={salario} vacaciones={vacaciones}
            diasPendientes={diasPendientes}
          />
        </div>
      )}

      <InfoSection type="finiquito" />
    </div>
  );
};