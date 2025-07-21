import type { FC, ReactNode } from 'react';
import { Suspense } from 'react';
import Loading from '@/router/utils/loading.tsx';

/**
 * Component lazy loading, implemented with Suspense
 * @param Component Component object
 * @returns Returns a new component
 */
export const LazyLoad = (Component: FC): ReactNode => {
  return (
    // The fallback loading effect can be modified to a UI component library's loading component or skeleton screen, etc.
    <Suspense fallback={<Loading />}>
      <Component />
    </Suspense>
  );
};
