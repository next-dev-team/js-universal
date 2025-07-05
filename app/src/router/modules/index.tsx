import { lazy } from 'react';
import { Navigate } from 'react-router';
import CommonLayout from '@/layouts/common';
import testRoutes from '@/router/modules/test.tsx';
import { LazyLoad } from '@/router/utils';
import type { ExtendRouteObjectWith } from '@/types/router';

const routes: ExtendRouteObjectWith[] = [
  {
    path: '/',
    element: <CommonLayout />,
    errorElement: <div>errorElement</div>,
    children: [
      {
        index: true,
        element: <Navigate to="/index" />,
      },
      {
        path: '/index',
        element: LazyLoad(lazy(() => import('@/pages/index'))),
        title: 'index',
      },
      ...testRoutes,
    ],
  },
  {
    path: '*',
    element: LazyLoad(lazy(() => import('@/pages/404.tsx'))),
    title: '404',
  },
];

export default routes;
