import { useState } from 'react';
import { parseCurrency, formatNumberForDisplay } from '../utils/formatters';

export const useCurrencyInput = (initialValue: number = 0) => {
  const [value, setValue] = useState<number>(initialValue);
  const [inputValue, setInputValue] = useState<string>(
    initialValue > 0 ? formatNumberForDisplay(initialValue) : ''
  );

  const handleBlur = () => {
    const numValue = parseCurrency(inputValue);
    setValue(numValue);
    setInputValue(numValue > 0 ? formatNumberForDisplay(numValue) : '');
  };

  const handleFocus = () => {
    setInputValue(inputValue.replace(/,/g, ''));
  };

  return {
    value,
    inputValue,
    setInputValue,
    handleBlur,
    handleFocus,
  };
};