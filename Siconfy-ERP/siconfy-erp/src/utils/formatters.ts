// src/utils/formatters.ts

// 1. Formato de moneda NIO - SOLUCIÓN DEFINITIVA
// Se fuerza el formato numérico 'en-US' (coma para miles, punto para decimales) sin símbolo.
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true
    }).format(amount);
};

// 2. Formato numérico simple - ACTUALIZADO
// Usado para inputs o visualización donde no se requiere el símbolo de moneda pero sí el formato consistente.
export const formatNumberForDisplay = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

// 3. Formato de moneda para tablas/grillas - ESPECÍFICO
// Función dedicada para tablas, asegurando alineación y formato decimal estricto.
export const formatCurrencyForTable = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true
    }).format(amount);
};

// 4. Parser de moneda
// Capaz de interpretar formatos con coma para miles y punto para decimales.
export const parseCurrency = (value: string): number => {
    if (!value) return 0;
    // Mantiene solo dígitos, puntos, comas y signo negativo
    const cleanValue = value.replace(/[^0-9.,-]+/g, "");
    // Remueve comas (separadores de miles) y mantiene puntos como decimales
    const normalized = cleanValue.replace(/,/g, '');
    return parseFloat(normalized) || 0;
};

// 5. Formato de fecha (Mantenido con locale local para nombres de meses correctos)
export const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    return new Intl.DateTimeFormat('es-NI', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
};