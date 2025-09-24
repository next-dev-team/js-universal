import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import { Button, Tabs } from 'antd';

const { TabPane } = Tabs;

const App: FC = () => {
  const webviewRef = useRef<HTMLWebViewElement>(null);
  useEffect(() => {
    window.electron.pterm(['version', 'terminal']);
  }, []);
  return (
    <Tabs
      defaultActiveKey="1"
      destroyOnHidden
      style={{ width: '100%', height: '100vh' }}
    >
      <TabPane tab="Server URL" key="1">
        <webview
          ref={webviewRef}
          src="http://localhost:42000"
          style={{ width: '100%', height: '100vh' }}
        />
      </TabPane>
      <TabPane tab="Demo" key="2">
        <div>Demo Content Here</div>
        <Button
          onClick={() => {
            console.log('Button clicked - starting pterm call');
            window.electron
              .pterm(['run ', 'C:\\pinokio\\api\\applio.git'])
              .then((res) => {
                console.log('pterm success - run applio result:', res);
              })
              .catch((error) => {
                console.error('pterm error - run applio failed:', error);
              });
          }}
        >
          Run Applio
        </Button>
        <Button
          onClick={() =>
            window.electron
              .pterm(['stop', 'C:\\pinokio\\api\\applio.git\\start.js'])
              .then((res) => {
                console.log('stop applio', res);
              })
          }
        >
          Stop Applio
        </Button>
      </TabPane>
    </Tabs>
  );
};
export default App;
