import { useState, useEffect } from 'react';

export function useKeyPress(
  targetKey: string | string[],
  options: {
    event?: 'keydown' | 'keyup';
    target?: EventTarget;
    enabled?: boolean;
  } = {}
): boolean {
  const { event = 'keydown', target = window, enabled = true } = options;
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const downHandler = (event: KeyboardEvent) => {
      const keys = Array.isArray(targetKey) ? targetKey : [targetKey];
      if (keys.includes(event.key)) {
        setKeyPressed(true);
      }
    };

    const upHandler = (event: KeyboardEvent) => {
      const keys = Array.isArray(targetKey) ? targetKey : [targetKey];
      if (keys.includes(event.key)) {
        setKeyPressed(false);
      }
    };

    if (event === 'keydown') {
      target.addEventListener('keydown', downHandler);
      target.addEventListener('keyup', upHandler);
    } else {
      target.addEventListener('keyup', downHandler);
    }

    return () => {
      target.removeEventListener('keydown', downHandler);
      target.removeEventListener('keyup', upHandler);
    };
  }, [targetKey, event, target, enabled]);

  return keyPressed;
}