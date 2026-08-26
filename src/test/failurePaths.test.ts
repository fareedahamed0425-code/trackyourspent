import { describe, it, expect } from 'vitest';
import { evaluateMathExpression, formatCurrency, formatDateDisplay } from '../utils/helpers';

describe('Failure Paths & Edge Cases', () => {
  it('handles invalid or malicious math expressions gracefully without throwing', () => {
    const maliciousExpr = 'alert(1) + 50';
    const result = evaluateMathExpression(maliciousExpr);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('handles division by zero and infinity math values', () => {
    const divByZero = '100 / 0';
    const result = evaluateMathExpression(divByZero);
    expect(result.success).toBe(false);
  });

  it('handles syntax errors in expressions', () => {
    const brokenExpr = '50 + * 20';
    const result = evaluateMathExpression(brokenExpr);
    expect(result.success).toBe(false);
  });

  it('handles invalid date strings gracefully', () => {
    const badDate = 'invalid-date-string';
    const formatted = formatDateDisplay(badDate);
    expect(formatted).toBeDefined();
  });

  it('formats numbers safely in currency formatter', () => {
    expect(formatCurrency(0, '$')).toContain('0.00');
    expect(formatCurrency(500, '$')).toContain('500.00');
  });
});
