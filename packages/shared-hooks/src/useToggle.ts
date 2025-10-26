import { useState, useCallback } from 'react';

export function useToggle(
  initialValue = false
): [boolean, () => void, (value?: boolean) => void] {
  const [value, setValue] = useState<boolean>(initialValue);

  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);

  const setToggle = useCallback((newValue?: boolean) => {
    setValue(newValue !== undefined ? newValue : prev => !prev);
  }, []);

  return [value, toggle, setToggle];
}