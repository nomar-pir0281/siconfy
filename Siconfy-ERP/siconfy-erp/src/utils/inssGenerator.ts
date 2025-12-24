// src/utils/inssGenerator.ts
// Asumimos que existen estos tipos basados en tu proyecto. 
// Si la interfaz se llama diferente en src/types/planilla.ts, ajústala aquí.

export interface PlanillaRow {
  id?: number | string;
  nombre: string;
  noInss?: string;
  salarioBasePeriodo: number;
  comisiones: number;
  incentivos: number;
  viaticos: number;
  montoVacaciones: number;
  montoHorasExtras: number;
  ingresosNoDeducibles: number; // o Total No Cotizable
  totalIngresos: number;
  inssLaboral: number;
  ir: number;
  detalleOtrasDeducciones: number | string;
  otrosDeducciones?: number; // A veces viene separado
  totalDeducciones: number;
  salarioNeto: number;
  inssPatronal: number;
  inatec: number;
  provisionAguinaldo: number;
  totalProvisiones: number;
}

/**
 * Genera un reporte CSV detallado para uso interno de RRHH / Contabilidad
 */
export function generatePlanillaCSV(planillaData: PlanillaRow[]): string {
  const headers = [
    'No.',
    'Nombre Completo',
    'No. INSS',
    'Salario Base',
    'Comisiones',
    'Incentivos',
    'Viáticos (No Cotizable)',
    'Vacaciones',
    'Horas Extras',
    'Otros Ingresos',
    'Total Devengado',
    'INSS Laboral (7%)',
    'IR (Imp. Renta)',
    'Otras Deducciones',
    'Total Deducciones',
    'Neto a Pagar',
    'INSS Patronal (22.5%)', // Ajustar según tamaño empresa si es necesario
    'INATEC (2%)',
    'Prov. Aguinaldo',
    'Costo Total Empleador'
  ];

  const rows = planillaData.map((row, idx) => [
    idx + 1,
    `"${row.nombre || 'Sin Nombre'}"`, // Encomillar nombres para evitar errores con comas
    row.noInss || 'N/D',
    (row.salarioBasePeriodo ?? 0).toFixed(2),
    (row.comisiones ?? 0).toFixed(2),
    (row.incentivos ?? 0).toFixed(2),
    (row.viaticos ?? 0).toFixed(2),
    (row.montoVacaciones ?? 0).toFixed(2),
    (row.montoHorasExtras ?? 0).toFixed(2),
    (row.ingresosNoDeducibles ?? 0).toFixed(2),
    (row.totalIngresos ?? 0).toFixed(2),
    (row.inssLaboral ?? 0).toFixed(2),
    (row.ir ?? 0).toFixed(2),
    // Manejo seguro si es string o number
    typeof row.detalleOtrasDeducciones === 'number' 
        ? row.detalleOtrasDeducciones.toFixed(2) 
        : `"${row.detalleOtrasDeducciones || 0}"`,
    (row.totalDeducciones ?? 0).toFixed(2),
    (row.salarioNeto ?? 0).toFixed(2),
    (row.inssPatronal ?? 0).toFixed(2),
    (row.inatec ?? 0).toFixed(2),
    (row.provisionAguinaldo ?? 0).toFixed(2),
    (row.totalProvisiones ?? 0).toFixed(2)
  ]);

  const csvContent = [
    headers.join(','), 
    ...rows.map(r => r.join(','))
  ].join('\n');

  return csvContent;
}

/**
 * (Futuro) Genera estructura compatible con formato de carga masiva INSS/OVIS
 * NOTA: Este formato suele requerir columnas posicionales específicas o TXT sin encabezados.
 * Se deja la estructura lista para implementar la especificación exacta.
 */
export function generateInssTxtReport(planillaData: PlanillaRow[]): string {
    // TODO: Implementar especificación técnica OVIS
    // Ejemplo de placeholder:
    return planillaData.map(row => {
        const inss = (row.noInss || '').replace(/-/g, '');
        const salarioCotizable = (row.totalIngresos - row.viaticos).toFixed(2);
        return `${inss}|${row.nombre}|${salarioCotizable}|${row.inssLaboral.toFixed(2)}`;
    }).join('\n');
}