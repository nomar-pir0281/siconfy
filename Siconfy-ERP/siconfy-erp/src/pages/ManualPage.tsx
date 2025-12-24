import React from 'react';

export const ManualPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-12 animate-fade-in">
      {/* Encabezado */}
      <header className="text-center bg-gradient-to-r from-slate-900 to-slate-800 text-white p-10 rounded-2xl shadow-xl border-b-4 border-blue-500">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">📖 Manual de Usuario Siconfy ERP</h1>
        <p className="text-lg text-blue-200 font-light">Guía Oficial de Gestión Laboral y Tributaria - Nicaragua 2025</p>
      </header>

      {/* SECCIÓN 1: GUÍA DE MÓDULOS */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-2">
          🚀 1. Guía de Módulos (Paso a Paso)
        </h2>

        <div className="space-y-6">
          {/* Salario Neto */}
          <div className="flex gap-4 items-start">
            <div className="bg-blue-100 text-blue-700 font-bold p-3 rounded-lg min-w-[3rem] text-center">1</div>
            <div>
              <h3 className="font-bold text-blue-900 text-lg">Cálculo de Salario Neto</h3>
              <p className="text-gray-600 text-sm mt-1">
                Ingresa tu salario mensual bruto. El sistema deduce automáticamente el <strong>7% de INSS Laboral</strong>.
                Si el monto restante proyectado anual supera los C$ 100,000, se aplicará la retención de IR según la tabla progresiva vigente.
              </p>
            </div>
          </div>

          {/* Finiquito */}
          <div className="flex gap-4 items-start">
            <div className="bg-green-100 text-green-700 font-bold p-3 rounded-lg min-w-[3rem] text-center">2</div>
            <div>
              <h3 className="font-bold text-green-900 text-lg">Liquidación / Finiquito (Art. 45)</h3>
              <p className="text-gray-600 text-sm mt-1">
                Selecciona fecha de inicio y fin. El sistema calculará tu antigüedad exacta.
                Recuerda: La indemnización tiene un <strong>tope legal de 5 meses</strong> de salario, el cual se alcanza al cumplir 6 años de trabajo continuo.
              </p>
            </div>
          </div>

          {/* Planilla */}
          <div className="flex gap-4 items-start">
            <div className="bg-orange-100 text-orange-700 font-bold p-3 rounded-lg min-w-[3rem] text-center">3</div>
            <div>
              <h3 className="font-bold text-orange-900 text-lg">Gestión de Planilla</h3>
              <p className="text-gray-600 text-sm mt-1">
                Herramienta para contadores. Permite sumar ingresos variables (Comisiones, Horas Extras, Bonos).
                El sistema recalcula el IR basado en el total devengado del mes, ajustando la proyección anual.
              </p>
            </div>
          </div>

          {/* Vacaciones */}
          <div className="flex gap-4 items-start">
            <div className="bg-purple-100 text-purple-700 font-bold p-3 rounded-lg min-w-[3rem] text-center">4</div>
            <div>
              <h3 className="font-bold text-purple-900 text-lg">Cálculo de Vacaciones</h3>
              <p className="text-gray-600 text-sm mt-1">
                Calcula el monto a pagar por días acumulados no descansados.
                <strong>Nota Importante:</strong> Este pago genera IR como "Renta Ocasional", por lo que la retención puede variar respecto al salario ordinario.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};