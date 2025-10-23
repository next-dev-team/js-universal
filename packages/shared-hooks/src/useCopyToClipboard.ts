import { useState, useCallback } from 'react';

interface CopyToClipboardState {
  value: string | null;
  success: boolean;
  error: Error | null;
}

export function useCopyToClipboard(): [
  CopyToClipboardState,
  (text: string) => Promise<void>
] {
  const [state, setState] = useState<CopyToClipboardState>({
    value: null,
    success: false,
    error: null,
  });

  const copyToClipboard = useCallback(async (text: string) => {
    if (!navigator?.clipboard) {
      setState({
        value: text,
        success: false,
        error: new Error('Clipboard not supported'),
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setState({
        value: text,
        success: true,
        error: null,
      });
    } catch (error) {
      setState({
        value: text,
        success: false,
        error: error instanceof Error ? error : new Error('Copy failed'),
      });
    }
  }, []);

  return [state, copyToClipboard];
}