import type { IndexRouteObject, NonIndexRouteObject } from 'react-router';

type ExtendRouteObject = {
  /** Page Title */
  title?: string;
};
type ExtendIndexRouteObject = IndexRouteObject & ExtendRouteObject;
type ExtendNonIndexRouteObject = Omit<NonIndexRouteObject, 'children'> &
  ExtendRouteObject & { children?: ExtendRouteObjectWith[] };
export type ExtendRouteObjectWith =
  | ExtendIndexRouteObject
  | ExtendNonIndexRouteObject;
