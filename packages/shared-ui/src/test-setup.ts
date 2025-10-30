import '@testing-library/jest-dom';

// Mock IntersectionObserver
if (typeof window !== 'undefined' && !window.IntersectionObserver) {
  (window as any).IntersectionObserver = class IntersectionObserver {
    root: Element | Document | null = null;
    rootMargin: string = '';
    thresholds: ReadonlyArray<number> = [];

    constructor(
      public callback: IntersectionObserverCallback,
      public options?: IntersectionObserverInit
    ) {
      this.root = options?.root || null;
      this.rootMargin = options?.rootMargin || '';
      this.thresholds = options?.threshold ? [options.threshold].flat() : [0];
    }

    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  } as any;
}

// Mock ResizeObserver
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  (window as any).ResizeObserver = class ResizeObserver {
    constructor(public callback: ResizeObserverCallback) {}
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
}