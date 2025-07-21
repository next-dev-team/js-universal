import { TEST_HANDLE1 } from '../../common/ipc/test.ts';
import type {
  TEST_HANDLE1Request,
  TEST_HANDLE1Response,
} from '../../common/ipc/test.ts';
import { ipcRendererTimeOutRequest } from '../common/request.ts';

const getTestHandle1 = async (params: TEST_HANDLE1Request) => {
  const result = await ipcRendererTimeOutRequest({
    channel: TEST_HANDLE1,
    data: params,
  });
  return result as TEST_HANDLE1Response;
};

export { getTestHandle1 };
