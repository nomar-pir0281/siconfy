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
import { AdBanner } from './components/AdBanner'; 

function App() {
  const [tabActual, setTabActual] = useState<'nomina' | 'liquidacion' | 'info' | 'empleados' | 'vacaciones' | 'planilla' | 'seleccionInicial' | 'salarioPeriodico' | 'indemnizacion' | 'historial'>('seleccionInicial');

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 flex flex-col">
      
      {/* NAVEGACIÓN */}
      <nav className="bg-slate-800 text-white p-4 shadow-md print:hidden z-50 relative">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
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

      {/* LAYOUT PRINCIPAL CON SIDEBARS PARA ADS */}
      <div className="flex flex-grow justify-center w-full max-w-[1600px] mx-auto pt-4">
          
          {/* Ad Vertical Izquierdo */}
          <div className="hidden lg:block mr-4">
              <AdBanner slot="vertical-left" />
          </div>

          {/* Contenido Central */}
          <div className="flex flex-col w-full max-w-6xl px-2 md:px-0">
               <AdBanner slot="top" />
               
               <main className="flex-grow bg-white md:bg-transparent shadow-sm md:shadow-none rounded-lg md:rounded-none overflow-hidden">
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

               <AdBanner slot="bottom" />
          </div>

          {/* Ad Vertical Derecho */}
          <div className="hidden lg:block ml-4">
              <AdBanner slot="vertical-right" />
          </div>

      </div>

<footer className="bg-slate-900 text-gray-400 py-6 mt-auto print:hidden text-center text-xs md:text-sm border-t border-slate-700 z-50 relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center items-center space-x-4 mb-2">
            {/* Se elimina target="_blank" para mantener la navegación en la misma pestaña */}
            <a href="/Politica.html" className="hover:text-white transition underline">Política de Privacidad</a>
            <span>|</span>
            <a href="/Terminos.html" className="hover:text-white transition underline">Términos de Uso</a>
            <span>|</span>
            <a href="https://wa.me/50587662961" className="hover:text-white transition underline" target="_blank" rel="noopener noreferrer">📱 WhatsApp</a>
          </div>
          <p>Siconfy ERP © 2025. Todos los derechos reservados.</p>
        </div>
      </footer>

    </div>
  );
}

export default App;