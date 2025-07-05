export type IpcResponse<T = unknown> = {
  /** 0:正常响应，其他失败 */
  code: number;
  /** 响应数据 */
  data?: T;
  /** 错误信息 */
  message?: string;
};

export const defaultTimeout = 10 * 1000;
