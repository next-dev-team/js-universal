import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import Router from '@/router';
import AjaxLoading from '@/components/ajax-loading';

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <RouterProvider router={Router} />
      <AjaxLoading />
    </ConfigProvider>
  );
}

export default App;
