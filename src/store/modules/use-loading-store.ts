import { createStore, useStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type State = {
  isLoading: boolean;
};

type Action = {
  showLoading: () => void;
  hideLoading: () => void;
};

type AjaxLoadingStore = State & Action;

export const ajaxLoadingStore = createStore<AjaxLoadingStore>()(
  immer((set) => ({
    isLoading: false,
    showLoading: () =>
      set((state) => {
        state.isLoading = true;
      }),
    hideLoading: () =>
      set((state) => {
        state.isLoading = false;
      }),
  })),
);

export const useAjaxLoadingStore = () => {
  return useStore(ajaxLoadingStore);
};
