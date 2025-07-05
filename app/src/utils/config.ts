type IConfig = {
  /** 基础路由配置，/结尾 */
  baseRouterPrefix: string;
  /** 接口api前缀 */
  baseApiPrefix: string;
};

const config: IConfig = {
  baseRouterPrefix: import.meta.env.VITE_BASE_ROUTER_PREFIX,
  baseApiPrefix: '/api/',
};

export default config;
