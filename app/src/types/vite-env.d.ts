/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  /** vite node环境 */
  readonly VITE_NODE_ENV: string;
  /** 默认标题 */
  readonly VITE_APP_TITLE: string;
  /** 端口号 */
  readonly VITE_APP_PORT: string;
  /** 构建输出目录 */
  readonly VITE_OUT_DIR: string;
  /** 页面基本路由前缀 */
  readonly VITE_BASE_ROUTER_PREFIX: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
