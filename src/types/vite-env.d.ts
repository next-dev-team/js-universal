/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  /** Vite Node Environment */
  readonly VITE_NODE_ENV: string;
  /** Default Title */
  readonly VITE_APP_TITLE: string;
  /** Port Number */
  readonly VITE_APP_PORT: string;
  /** Build Output Directory */
  readonly VITE_OUT_DIR: string;
  /** Page Base Route Prefix */
  readonly VITE_BASE_ROUTER_PREFIX: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
