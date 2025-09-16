import type { FC } from 'react';
import { useEffect, useRef } from 'react';

const App: FC = () => {
  const webviewRef = useRef<HTMLWebViewElement>(null);
  useEffect(() => {
    window.electron.pterm(['version', 'terminal']);
  }, []);
  return (
    <webview
      ref={webviewRef}
      src="http://localhost:42000"
      style={{ width: '100%', height: '100vh' }}
    />
  );
};
export default App;
