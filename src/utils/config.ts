type IConfig = {
  /** Base route configuration, ends with / */
  baseRouterPrefix: string;
  /** API prefix */
  baseApiPrefix: string;
};

const config: IConfig = {
  baseRouterPrefix: import.meta.env.VITE_BASE_ROUTER_PREFIX,
  baseApiPrefix: '/api/',
};

export default config;
