import { RouterProvider } from 'react-router/dom';
import AjaxLoading from '@/components/ajax-loading';
import { useAjaxLoadingStore } from '@/store';
import router from './router';

function App() {
  const { isLoading } = useAjaxLoadingStore();
  return (
    <>
      <RouterProvider router={router} />
      <AjaxLoading visible={isLoading} />
    </>
  );
}

export default App;
