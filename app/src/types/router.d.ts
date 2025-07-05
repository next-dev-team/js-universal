import type { IndexRouteObject, NonIndexRouteObject } from 'react-router';

type ExtendRouteObject = {
  /** 页面标题 */
  title?: string;
};
type ExtendIndexRouteObject = IndexRouteObject & ExtendRouteObject;
type ExtendNonIndexRouteObject = Omit<NonIndexRouteObject, 'children'> &
  ExtendRouteObject & { children?: ExtendRouteObjectWith[] };
export type ExtendRouteObjectWith =
  | ExtendIndexRouteObject
  | ExtendNonIndexRouteObject;
