import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import AjaxLoading from '@/components/ajax-loading';
import Router from '@/router';

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
