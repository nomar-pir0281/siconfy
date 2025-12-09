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
    try {
      const parsed = JSON.parse(stored);
      // Validación básica para asegurar que es un array
      if (!Array.isArray(parsed)) return [];

      // Convert date strings back to Date objects
      return parsed.map((item: any) => ({
        ...item,
        fecha: new Date(item.fecha)
      }));
    } catch (error) {
      console.error("Error leyendo historial (datos corruptos). Reseteando...", error);
      // Si falla, limpiamos el storage para que la app vuelva a funcionar
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
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