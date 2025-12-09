export interface CalculationHistory {
  tipo: string;
  fecha: Date;
  inputs: any;
  resultado: any;
}

const STORAGE_KEY = 'calculationHistory';

export function saveCalculation(calculation: CalculationHistory): void {
  const history = getAllCalculations();
  history.push(calculation);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function getAllCalculations(): CalculationHistory[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    return parsed.map((item: any) => ({
      ...item,
      fecha: new Date(item.fecha)
    }));
  }
  return [];
}

export function deleteCalculation(index: number): void {
  const history = getAllCalculations();
  if (index >= 0 && index < history.length) {
    history.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}