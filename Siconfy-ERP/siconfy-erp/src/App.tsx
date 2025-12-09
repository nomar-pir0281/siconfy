import { useState } from 'react';
import { CalculadoraSalario } from './CalculadoraSalario';
import { CalculadoraLiquidacion } from './CalculadoraLiquidacion';
import { InformacionUtil } from './InformacionUtil';
import { EmpleadoPage } from './pages/EmpleadoPage';
import { VacacionesPage } from './pages/VacacionesPage';
import { PlanillaPage } from './pages/PlanillaPage';
import { SeleccionInicialPage } from './pages/SeleccionInicialPage';
import { SalarioPeriodicoPage } from './pages/SalarioPeriodicoPage';
import { IndemnizacionPage } from './pages/IndemnizacionPage';
import { HistorialPage } from './pages/HistorialPage';
import { AdBanner } from './components/AdBanner'; // <--- IMPORTAR BANNER

function App() {
  const [tabActual, setTabActual] = useState<'nomina' | 'liquidacion' | 'info' | 'empleados' | 'vacaciones' | 'planilla' | 'seleccionInicial' | 'salarioPeriodico' | 'indemnizacion' | 'historial'>('seleccionInicial');

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 flex flex-col">
      
      {/* NAVEGACIÓN - Oculta al imprimir */}
      <nav className="bg-slate-800 text-white p-4 shadow-md print:hidden">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 
            className="text-xl font-bold flex items-center gap-2 cursor-pointer" 
            onClick={() => setTabActual('seleccionInicial')}
          >
            🇳🇮 Siconfy ERP
          </h1>
          <div className="space-x-1 md:space-x-2 flex flex-wrap justify-end">
             <button onClick={() => setTabActual('seleccionInicial')} className={`px-2 py-1 rounded transition text-xs font-bold ${tabActual === 'seleccionInicial' ? 'bg-red-600' : 'hover:bg-slate-700'}`}>🏠 INICIO</button>
             <button onClick={() => setTabActual('nomina')} className={`px-2 py-1 rounded transition text-xs font-bold ${tabActual === 'nomina' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}>💰 NETO</button>
             <button onClick={() => setTabActual('planilla')} className={`px-2 py-1 rounded transition text-xs font-bold ${tabActual === 'planilla' ? 'bg-orange-600' : 'hover:bg-slate-700'}`}>📊 PLANILLA</button>
             <button onClick={() => setTabActual('liquidacion')} className={`px-2 py-1 rounded transition text-xs font-bold ${tabActual === 'liquidacion' ? 'bg-green-600' : 'hover:bg-slate-700'}`}>⚖️ FINIQUITO</button>
             <button onClick={() => setTabActual('empleados')} className={`px-2 py-1 rounded transition text-xs font-bold ${tabActual === 'empleados' ? 'bg-indigo-600' : 'hover:bg-slate-700'}`}>👥 EMPLEADOS</button>
             <button onClick={() => setTabActual('vacaciones')} className={`px-2 py-1 rounded transition text-xs font-bold ${tabActual === 'vacaciones' ? 'bg-teal-600' : 'hover:bg-slate-700'}`}>🏖️ VACACIONES</button>
             <button onClick={() => setTabActual('historial')} className={`px-2 py-1 rounded transition text-xs font-bold ${tabActual === 'historial' ? 'bg-pink-600' : 'hover:bg-slate-700'}`}>📜 HISTORIAL</button>
             <button onClick={() => setTabActual('info')} className={`px-2 py-1 rounded transition text-xs font-bold ${tabActual === 'info' ? 'bg-purple-600' : 'hover:bg-slate-700'}`}>ℹ️ AYUDA</button>
           </div>
        </div>
      </nav>

      {/* PUBLICIDAD SUPERIOR */}
      <AdBanner slot="top" />

      {/* CONTENIDO PRINCIPAL */}
       <main className="flex-grow p-4 md:p-8">
         {tabActual === 'nomina' && <CalculadoraSalario />}
         {tabActual === 'liquidacion' && <CalculadoraLiquidacion />}
         {tabActual === 'empleados' && <EmpleadoPage />}
         {tabActual === 'vacaciones' && <VacacionesPage />}
         {tabActual === 'planilla' && <PlanillaPage />}
         {tabActual === 'seleccionInicial' && <SeleccionInicialPage setTabActual={setTabActual as (tab: string) => void} />}
         {tabActual === 'salarioPeriodico' && <SalarioPeriodicoPage setTabActual={setTabActual as (tab: string) => void} />}
         {tabActual === 'indemnizacion' && <IndemnizacionPage setTabActual={setTabActual as (tab: string) => void} />}
         {tabActual === 'historial' && <HistorialPage setTabActual={setTabActual as (tab: string) => void} />}
         {tabActual === 'info' && <InformacionUtil />}
       </main>

      {/* PUBLICIDAD INFERIOR */}
      <AdBanner slot="bottom" />

      {/* FOOTER - Oculto al imprimir */}
      <footer className="bg-slate-900 text-gray-400 py-6 mt-auto print:hidden text-center text-xs md:text-sm border-t border-slate-700">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center items-center space-x-4 mb-2">
            <a href="/Politica.html" target="_blank" className="hover:text-white transition underline">Política de Privacidad</a>
            <span>|</span>
            <a href="/Terminos.html" target="_blank" className="hover:text-white transition underline">Términos de Uso</a>
          </div>
          <p>Siconfy ERP © 2025. Todos los derechos reservados.</p>
        </div>
      </footer>

    </div>
  );
}

export default App;