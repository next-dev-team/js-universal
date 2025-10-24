import { useState, useCallback } from 'react';

interface UseCounterOptions {
  min?: number;
  max?: number;
  step?: number;
}

export function useCounter(
  initialValue = 0,
  options: UseCounterOptions = {}
) {
  const { min, max, step = 1 } = options;
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount(prev => {
      const newValue = prev + step;
      return max !== undefined ? Math.min(newValue, max) : newValue;
    });
  }, [step, max]);

  const decrement = useCallback(() => {
    setCount(prev => {
      const newValue = prev - step;
      return min !== undefined ? Math.max(newValue, min) : newValue;
    });
  }, [step, min]);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  const set = useCallback((value: number) => {
    setCount(() => {
      let newValue = value;
      if (min !== undefined) newValue = Math.max(newValue, min);
      if (max !== undefined) newValue = Math.min(newValue, max);
      return newValue;
    });
  }, [min, max]);

  return {
    count,
    increment,
    decrement,
    reset,
    set,
  };
}