# Audit and Revision Plan for Siconfy-ERP Calculations

## Issues Identified
1. **NETO Tab Calculations**: Validate net salary calculations in PLANILLA tab results
2. **PLANILLA Vacation Calculation**: Current calculation is excessive (using overtime rate), should use regular rate
3. **FINIQUITO Calculations**: Audit IR and other calculations in liquidation
4. **Pay Stub Printing**: Improve the printing functionality for pay stubs
5. **INSS Format**: Create specific format for INSS platform upload

## Proposed Fixes

### 1. PLANILLA Vacation Calculation Fix
- Change vacation calculation from overtime rate to regular daily rate
- Current: `montoVacaciones = valorHora * 2 * (diasVacaciones * 8)`
- Proposed: `montoVacaciones = (salarioMensualizado / 30) * diasVacaciones`

### 2. NETO Calculations Audit
- Review the net salary formula: `neto = totalIngresos - totalDeducciones`
- Ensure INSS and IR are correctly applied
- Check provision calculations

### 3. FINIQUITO Audit
- Verify IR calculation on total liquidation income
- Check indemnization, aguinaldo, vacation, and salary calculations
- Ensure proper tax application

### 4. Pay Stub Printing Improvement
- Create a dedicated pay stub component/modal
- Include employee details, period, earnings, deductions, net pay
- Add print-specific styling

### 5. INSS Format Creation
- Modify Excel export to INSS-specific format
- Include required fields: employee ID, INSS number, salary, contributions
- Ensure CSV or Excel format compatible with INSS platform

## Implementation Steps
1. Switch to Code mode to implement fixes
2. Update vacation calculation in `nomina.ts`
3. Add logging for NETO calculations
4. Create pay stub printing component
5. Modify Excel export for INSS format
6. Test all changes with existing test suite