import type { IBaseJsonData } from '@/services/request/base.ts';
import request from '@/services/request/base.ts';
import config from '@/utils/config.ts';

const { baseApiPrefix } = config;
const serverHost = import.meta.env.VITE_SERVER_URL ?? '';
const newBaseApiPrefix = serverHost + baseApiPrefix;
const createApi = request.createApi({ baseURL: newBaseApiPrefix });
const requestApi = {
  getList: createApi<IBaseJsonData<{ name: string }>>({
    url: 'test1/get-list',
    method: 'GET',
  }),
};
export default requestApi;
