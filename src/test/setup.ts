import '@testing-library/jest-dom';

if (typeof window !== 'undefined' && typeof window.DOMMatrix === 'undefined') {
  (window as any).DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
  };
  (globalThis as any).DOMMatrix = (window as any).DOMMatrix;
}
