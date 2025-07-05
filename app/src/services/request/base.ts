import { axiosRequest } from '@liangskyli/axios-request';
import { ajaxLoadingStore } from '@/store';

export type IBaseJsonData<T = unknown> = {
  code: number;
  message?: string;
  data: T;
};
const request = axiosRequest({
  loadingMiddlewareConfig: {
    showLoading: () => {
      ajaxLoadingStore.getState().showLoading();
    },
    hideLoading: () => {
      ajaxLoadingStore.getState().hideLoading();
    },
  },
  serializedResponseMiddlewareConfig: {
    serializedResponseCodeKey: 'code',
    serializedResponseSuccessCode: 0,
    serializedResponseDataKey: 'data',
  },
  ShowErrorMiddlewareConfig: {
    showError: (err, ctx) => {
      console.log('showError:', err, ctx);
    },
  },
});
export default request;
