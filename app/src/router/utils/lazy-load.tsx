import type { FC, ReactNode } from 'react';
import { Suspense } from 'react';
import Loading from '@/router/utils/loading.tsx';

/**
 * 组件懒加载，结合Suspense实现
 * @param Component 组件对象
 * @returns 返回新组件
 */
export const LazyLoad = (Component: FC): ReactNode => {
  return (
    // fallback的loading效果可自行修改为ui组件库的loading组件或骨架屏等等
    <Suspense fallback={<Loading />}>
      <Component />
    </Suspense>
  );
};
