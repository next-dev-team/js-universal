import { Outlet } from 'react-router';
import RouterTitle from '@/layouts/common/components/router-title.tsx';

const CommonLayout = () => {
  return (
    <>
      <RouterTitle />
      <Outlet />
    </>
  );
};

export default CommonLayout;
