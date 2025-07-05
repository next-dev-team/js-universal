import { createHashRouter } from 'react-router';
import routes from '@/router/modules';
import config from '@/utils/config.ts';

const Router = createHashRouter(routes, {
  basename: config.baseRouterPrefix,
});
export default Router;
