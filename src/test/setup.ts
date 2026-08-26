import '@testing-library/jest-dom';
import { vi } from 'vitest';

if (typeof window !== 'undefined' && typeof window.DOMMatrix === 'undefined') {
  (window as any).DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
  };
  (globalThis as any).DOMMatrix = (window as any).DOMMatrix;
}

vi.mock('../firebase', () => ({
  auth: {
    currentUser: { uid: 'test-user', email: 'test@example.com' },
    onAuthStateChanged: vi.fn((cb) => {
      cb({ uid: 'test-user', email: 'test@example.com' });
      return () => {};
    }),
    signOut: vi.fn(() => Promise.resolve()),
  },
  db: {},
  analytics: null,
}));
