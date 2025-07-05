import type { IpcResponse } from './index';

export const TEST_HANDLE1 = 'TEST_HANDLE1';
export type TEST_HANDLE1Request = { id: string };
export type TEST_HANDLE1Response = IpcResponse<{ a: string }>;
