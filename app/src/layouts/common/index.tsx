import { Outlet } from 'react-router';
import { Button } from 'antd';
import RouterTitle from '@/layouts/common/components/router-title.tsx';

const CommonLayout = () => {
  return (
    <>
      <RouterTitle />
      <Button
        style={{ margin: '10px' }}
        type="primary"
        onClick={() => window.open('http://localhost:42000/', '_blank')}
      >
        Open Server
      </Button>
      <Outlet />
    </>
  );
};

export default CommonLayout;
