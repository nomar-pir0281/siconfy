import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CalculadoraSalario } from './CalculadoraSalario';
import { CalculadoraLiquidacion } from './CalculadoraLiquidacion';
// Imports de Páginas
import { EmpleadoPage } from './pages/EmpleadoPage';
import VacacionesPage from './pages/VacacionesPage';
import { PlanillaPage } from './pages/PlanillaPage';
import { SeleccionInicialPage } from './pages/SeleccionInicialPage';
import { SalarioPeriodicoPage } from './pages/SalarioPeriodicoPage';
import { IndemnizacionPage } from './pages/IndemnizacionPage';
import { HistorialPage } from './pages/HistorialPage';
import { DocumentosPage } from './pages/DocumentosPage';
import { CartaRenunciaPage } from './pages/CartaRenunciaPage';
import { ManualPage } from './pages/ManualPage';
import { AyudaPage } from './pages/AyudaPage'; // <-- NUEVO
import { ProvisionesPage } from './pages/ProvisionesPage';

// Componentes UI
import Layout from './components/Layout';

function App() {

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<SeleccionInicialPage />} />
        <Route path="nomina" element={<CalculadoraSalario />} />
        <Route path="planilla" element={<PlanillaPage />} />
        <Route path="liquidacion" element={<CalculadoraLiquidacion />} />
        <Route path="empleados" element={<EmpleadoPage />} />
        <Route path="vacaciones" element={<VacacionesPage />} />
        <Route path="historial" element={<HistorialPage />} />
        <Route path="salarioPeriodico" element={<SalarioPeriodicoPage />} />
        <Route path="indemnizacion" element={<IndemnizacionPage />} />
        <Route path="documentos" element={<DocumentosPage />} />
        <Route path="manual" element={<ManualPage />} />
        <Route path="provisiones" element={<ProvisionesPage />} />
        <Route path="ayuda" element={<AyudaPage />} /> {/* <-- NUEVA RUTA */}
      </Route>
    </Routes>
  );
}

export default App;