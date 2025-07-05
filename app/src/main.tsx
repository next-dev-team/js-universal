import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@ant-design/v5-patch-for-react-19';
import '@/styles/less/global.less';
import '@/styles/tailwind.css';
import {
  getRenderLogger,
  initRenderLogger,
} from '../electron/common/logger/renderer.ts';
import App from './app.tsx';

initRenderLogger();

const userLog = getRenderLogger().scope('main.tsx');
userLog.info('react setupApp begin');

function setupApp() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

setupApp();
