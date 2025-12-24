export interface InfoPoint {
  label: string;
  text: string;
  isWarning?: boolean;
}

export interface EducationalTab {
  title: string;
  description: string;
  details: InfoPoint[];
  legalSource: string;
}

export const EDUCATIONAL_DATA: Record<string, EducationalTab> = {
  indemnizacion: {
    title: "Análisis Legal: Antigüedad (Art. 45)",
    description: "Detalles clave sobre el cálculo de tu liquidación según el Código del Trabajo.",
    details: [
      { label: "Primeros 3 años", text: "Se paga 1 mes de salario por cada año cumplido." },
      { label: "Del 4to al 6to año", text: "Se pagan 20 días de salario por cada año adicional." },
      { label: "Tope Legal", text: "El máximo a pagar son 5 meses (150 días), aunque tengas más de 6 años de antigüedad.", isWarning: true },
      { label: "Cálculo Proporcional", text: "Las fracciones de año se pagan proporcionalmente según los días laborados." }
    ],
    legalSource: "Base Legal: Art. 45 Código del Trabajo / Jurisprudencia CSJ"
  },
  vacaciones: {
    title: "Análisis Legal: Vacaciones",
    description: "Cómo se calculan y pagan los descansos acumulados.",
    details: [
      { label: "Factor de Acumulación", text: "Acumulas 2.5 días por cada mes trabajado (30 días al año)." },
      { label: "Impuesto (IR)", text: "El pago de vacaciones genera IR como 'Renta Ocasional'. Se calcula sobre el excedente de la proyección anual.", isWarning: true },
      { label: "Salario Variable", text: "Para salarios variables, se usa el promedio de los últimos 6 meses." }
    ],
    legalSource: "Base Legal: Art. 76 CT / Ley de Concertación Tributaria 822"
  },
  planilla: {
    title: "Análisis Legal: Deducciones de Ley",
    description: "Entendiendo por qué recibes menos de lo que ganas (Deducciones).",
    details: [
      { label: "INSS Laboral (7%)", text: "Deducción obligatoria sobre el salario bruto total para tu seguridad social." },
      { label: "IR Salarial 2025", text: "Solo aplica si tu ingreso neto anual proyectado (Salario Bruto - INSS) x 12 supera los C$ 100,000." },
      { label: "Efecto de Bonos", text: "Ingresos extras disparan el IR del mes debido a la proyección anual.", isWarning: true }
    ],
    legalSource: "Base Legal: Ley de Seguridad Social / Tabla Progresiva IR 2025"
  },
  neto: {
    title: "Cálculo de Salario Neto",
    description: "Proceso de deducción desde el Salario Bruto hasta el monto líquido recibido.",
    details: [
      { label: "Cálculo Paso a Paso", text: "Salario Bruto - INSS (7%) = Salario Neto de INSS. A este se le resta el IR (si aplica)." },
      { label: "Ejemplo Real (C$ 10,000)", text: "Bruto: 10,000. INSS: 700. IR: 145. Neto a recibir: C$ 9,155. (Supera el techo de C$ 100k anuales)." },
      { label: "Deducciones Extras", text: "Préstamos o embargos se aplican sobre el Salario Neto, nunca sobre el Bruto.", isWarning: true }
    ],
    legalSource: "Fuente: Guía Empleadores 2025 / Ley 822"
  },
  finiquito: {
    title: "Liquidación Final (Finiquito)",
    description: "Resumen de lo que debe incluir tu pago al finalizar la relación laboral.",
    details: [
      { label: "Componentes", text: "Incluye: Vacaciones proporcionales, Aguinaldo proporcional e Indemnización (si aplica)." },
      { label: "Indemnización", text: "Se aplica según el Art. 45 si hay despido injustificado o renuncia con preaviso." },
      { label: "Retenciones", text: "El aguinaldo está exento de impuestos. Las vacaciones y la indemnización sí pueden estar sujetas a IR.", isWarning: true }
    ],
    legalSource: "Fuente: Código del Trabajo Art. 42, 45 y 76"
  },
  patronal: {
    title: "Costos Patronales (Costo Empresa)",
    description: "Costo adicional que asume el empleador por cada trabajador.",
    details: [
      { label: "INSS Patronal", text: "22.5% para empresas de 50+ trabajadores; 21.5% para menos de 50." },
      { label: "INATEC", text: "Aporte del 2% obligatorio sobre el total de la planilla bruta." },
      { label: "Carga Total", text: "Un empleador paga entre un 23.5% y 24.5% adicional al salario base.", isWarning: true }
    ],
    legalSource: "Fuente: Reglamento INSS / Ley 822"
  },
  subsidios: {
    title: "Gestión de Subsidios (60/40)",
    description: "Tratamiento legal de las incapacidades médicas.",
    details: [
      { label: "Pago INSS (60%)", text: "El Seguro paga el 60% del salario promedio a partir del 4to día." },
      { label: "Pago Empresa (40%)", text: "La empresa suele completar el 40% restante según políticas." },
      { label: "Exención de IR", text: "El 60% pagado por el INSS está EXENTO de IR. Solo se retiene sobre el 40% patronal.", isWarning: true }
    ],
    legalSource: "Fuente: Reglamento LCT Art. 19 / Normativas INSS"
  },
  horas_extras: {
    title: "Horas Extras y Feriados",
    description: "Cálculo de recargos según el Código del Trabajo.",
    details: [
      { label: "Recargo 100%", text: "Cada hora extra se paga al doble (valor de hora normal x 2)." },
      { label: "Límites Legales", text: "No se pueden laborar más de 3 horas extras diarias ni más de 9 a la semana.", isWarning: true },
      { label: "Feriados Nacionales", text: "Si trabajas un feriado, recibes tu día normal (100%) + un recargo del 100%. Total percibido por ese día: 200%." }
    ],
    legalSource: "Fuente: Código del Trabajo Art. 62"
  },
  ayuda: {
    title: "Guía General y Casos Prácticos",
    description: "Resumen ejecutivo y ejemplos de cálculo para entender tus resultados.",
    details: [
      { label: "Ejemplo de Planilla", text: "Ingreso C$ 10,000 -> INSS (7%) C$ 700 -> IR C$ 145 -> Neto C$ 9,155." },
      { label: "El Techo del IR", text: "Si tu salario bruto supera los C$ 8,960.57 mensual, ya empiezas a pagar IR.", isWarning: true },
      { label: "Preaviso (Art. 44)", text: "Debes avisar con 15 días de anticipación. El empleador no puede multarte si no lo haces.", isWarning: true },
      { label: "Aguinaldo (Art. 93)", text: "Es inembargable y no paga INSS ni IR. Se paga sobre el salario más alto." }
    ],
    legalSource: "Fuente: Compilación Laboral George Lazo / Guía IR 2025"
  }
};