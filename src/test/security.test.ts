import { describe, it, expect } from 'vitest';
import { evaluateMathExpression } from '../utils/helpers';

describe('Security Proof & Sandboxing', () => {
  it('blocks prototype pollution and eval attempts in expression engine', () => {
    const payloads = [
      '__proto__',
      'constructor',
      'prototype',
      'window.location',
      '<script>alert(1)</script>',
      'document.cookie'
    ];

    payloads.forEach((payload) => {
      const res = evaluateMathExpression(payload);
      expect(res.success).toBe(false);
    });
  });

  it('strictly validates allowed operators and rejects unauthorized tokens', () => {
    const dangerousTokens = ['process.env', 'import', 'require', 'eval', 'Function'];
    dangerousTokens.forEach((token) => {
      const res = evaluateMathExpression(token);
      expect(res.success).toBe(false);
    });
  });
});
