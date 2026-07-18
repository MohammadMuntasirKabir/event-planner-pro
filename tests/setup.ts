// Test setup - mocks for browser APIs not available in jsdom

const g = globalThis as unknown as { [key: string]: unknown };

// Minimal IntersectionObserver mock for scroll-reveal tests
g.IntersectionObserver = class IntersectionObserver {
  callback: IntersectionObserverCallback;
  elements: Element[] = [];

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe(element: Element) {
    this.elements.push(element);
    this.callback(
      [
        {
          isIntersecting: true,
          target: element,
          intersectionRatio: 1,
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
          time: 0,
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test mock, full IntersectionObserver interface not needed
      this as any,
    );
  }

  unobserve() {}
  disconnect() {}
};

// ResizeObserver mock
g.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// matchMedia mock
g.matchMedia =
  g.matchMedia ||
  function (query: string) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    };
  };
