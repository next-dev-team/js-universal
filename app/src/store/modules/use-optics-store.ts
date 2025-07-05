import * as O from 'optics-ts';
import { createStore, useStore } from 'zustand';

type State = {
  a: {
    b: {
      c: string;
    };
  };
  b: {
    c: {
      a: string;
      d: {
        f: number;
      };
    };
  };
};

type Action = {
  getAllData: () => State;
  setABC: (c: string) => void;
  setBCA: (a: string) => void;
  setBCDF: (f: number) => void;
};

type AjaxLoadingStore = State & Action;

export const opticsStore = createStore<AjaxLoadingStore>()((set, get) => ({
  a: {
    b: {
      c: 'string',
    },
  },
  b: {
    c: {
      a: 'a',
      d: {
        f: 0,
      },
    },
  },
  getAllData: () => {
    return {
      a: get().a,
      b: get().b,
    };
  },
  setABC: (c) => {
    set((state) => {
      const pathLens = O.optic<State>().path('a.b.c');
      const newState = O.modify(pathLens)(() => c)(state);
      return newState;
    });
  },
  setBCA: (a) => {
    set((state) => {
      const pathLens = O.optic<State>().prop('b').prop('c').prop('a');
      const newState = O.modify(pathLens)(() => a)(state);
      return newState;
    });
  },
  setBCDF: (f) => {
    set((state) => {
      const pathLens = O.optic<State>().path('b.c.d.f');
      const newState = O.modify(pathLens)(() => f)(state);
      return newState;
    });
  },
}));

export const useOpticsStoreStore = () => {
  return useStore(opticsStore);
};
