RECUERDA QUE ESTAMOS TRABAJANDO EN EL DIRECTORIO:

C:\Users\HP\Documents\Siconfy-ERP v1.1.13

PARA TU MAYOR FACILIDAD DIVIDE EL TRABAJO EN SUBTAREAS

# VERIFICA PRIMERO SI YA HAY FASES IMPLEMENTADAS PARA NO REPETIRLAS

# ROL
Actúa como un Desarrollador Senior de Frontend experto en React, TypeScript y Tailwind CSS. Tu objetivo es actualizar la aplicación "Siconfy ERP".

# ESTADO ACTUAL
El usuario informa que el código está en su versión original (sin parches recientes).
- Existen errores conocidos (crash en Historial).
- Faltan opciones en la navegación inicial.
- No hay módulos de publicidad ni formatos de impresión avanzados.

# INSTRUCCIÓN MAESTRA
No generes todo el código de una sola vez. Vamos a trabajar por **Fases**.
Para cada archivo mencionado, primero **VERIFICA** si el código ya contiene la solución descrita. Si no la tiene, genera el código completo del archivo corregido.

---

## FASE 1: ESTABILIZACIÓN (Correcciones Críticas)
**Objetivo:** Evitar que la app se rompa y asegurar que el usuario pueda navegar a todas las secciones.

1. **Auditoría de `src/utils/historialService.ts`:**
   - *Verificación:* Revisa la función `getAllCalculations`. ¿Tiene un bloque `try-catch` alrededor de `JSON.parse`?
   - *Acción:* Si NO tiene `try-catch`, reescribe el archivo agregando manejo de errores. Si `JSON.parse` falla, debe devolver `[]` y limpiar `localStorage` para evitar la pantalla blanca.

2. **Auditoría de `src/pages/SeleccionInicialPage.tsx`:**
   - *Verificación:* Revisa cuántos botones renderiza. Actualmente solo hay 2 (Nómina y Liquidación).
   - *Acción:* Reescribe el archivo para incluir 6 botones que coincidan con el menú principal: "Nómina", "Liquidación", "Planilla", "Empleados", "Vacaciones" e "Historial". Todos deben usar `setTabActual`.

---

## FASE 2: INFRAESTRUCTURA DE PUBLICIDAD
**Objetivo:** Preparar la app para monetización sin romper el diseño.

3. **Creación de Componente Nuevo:**
   - Crea el archivo `src/components/AdBanner.tsx`.
   - Debe aceptar una prop `slot` ('top' | 'bottom').
   - Estilo: Contenedor gris de `h-24` con borde punteado.
   - **Importante:** Debe tener la clase CSS `print:hidden` para no salir en impresiones.

4. **Integración en `src/App.tsx`:**
   - Importa `<AdBanner />`.
   - Coloca `<AdBanner slot="top" />` justo debajo del `<nav>`.
   - Coloca `<AdBanner slot="bottom" />` justo antes del `<footer>`.
   - *Nota:* Asegúrate de no borrar la navegación existente.

---

## FASE 3: LÓGICA DE NEGOCIO (Nómina e IR)
**Objetivo:** Mejorar la precisión y transparencia de los cálculos.

5. **Ajuste en `src/utils/nomina.ts`:**
   - *Tarea A (Viáticos):* Verifica si los `viaticos` se están sumando a la base imponible del INSS. Si es así, corrígelo: los viáticos no cotizan INSS.
   - *Tarea B (Detalle IR):* Modifica la interfaz `ResultadoNomina` para incluir un campo opcional `detalleIR`.
   - *Tarea C:* Asegúrate de que `calcularNominaMensual` devuelva el objeto con el desglose del cálculo de IR (base imponible, porcentaje, etc.).

6. **Mejora en `src/pages/PlanillaPage.tsx`:**
   - Implementa un Modal que se abra al hacer clic en la columna de IR.
   - El modal debe mostrar los datos obtenidos en el paso anterior (Detalle del cálculo).

---

## FASE 4: DOCUMENTOS LEGALES (Impresión)
**Objetivo:** Generar PDFs profesionales.

7. **Configuración CSS en `src/App.css`:**
   - Define las clases `@media print`:
     - `.no-print { display: none !important; }`
     - `.print-only { display: block !important; }` (y `display: none` en pantalla normal).

8. **Nuevo Formato: Carta de Renuncia:**
   - Crea una nueva página o componente que tenga un formulario simple (Nombre, Fechas).
   - Al lado (o abajo), renderiza una "Vista Previa" con el texto legal estándar de renuncia en Nicaragua.

---

# EJECUCIÓN
Por favor, comienza ejecutando **SOLAMENTE LA FASE 1**.
Genera el código corregido para `src/utils/historialService.ts` y `src/pages/SeleccionInicialPage.tsx`.