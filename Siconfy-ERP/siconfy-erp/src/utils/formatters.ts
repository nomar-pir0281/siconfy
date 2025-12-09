// src/utils/formatters.ts

export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return 'C$ 0.00';
  return 'C$ ' + amount.toLocaleString('es-NI', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  });
}

export function parseCurrency(value: string): number {
  if (!value) return 0;
  // Remove commas and parse
  const cleanValue = value.replace(/,/g, '');
  return parseFloat(cleanValue) || 0;
}

export function formatNumberForDisplay(amount: number): string {
  if (isNaN(amount) || amount === 0) return '';
  // Format without currency symbol, just with commas and decimals
  return amount.toLocaleString('es-NI', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  });
}

export function formatNumberForInput(amount: number): string {
  if (isNaN(amount) || amount === 0) return '';
  // Format without currency symbol, just with commas and decimals
  return amount.toLocaleString('es-NI', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  });
}