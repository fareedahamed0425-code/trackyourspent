import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDateDisplay, evaluateMathExpression } from '../utils/helpers';
import { Expense } from '../types';

describe('Helper Utility Functions', () => {
  describe('formatCurrency', () => {
    it('formats numbers with given currency symbol', () => {
      expect(formatCurrency(1500, '?')).toContain('1,500.00');
      expect(formatCurrency(1500, '?')).toContain('?');
      expect(formatCurrency(0, '$')).toContain('.00');
    });

    it('handles decimal values and zero properly', () => {
      expect(formatCurrency(12.5, '?')).toBe('?12.50');
      expect(formatCurrency(99.999, '?')).toBe('?100.00');
    });
  });

  describe('formatDateDisplay', () => {
    it('formats valid date strings without throwing', () => {
      const formatted = formatDateDisplay('2026-08-26');
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('handles today relative date', () => {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      const todayStr = `${y}-${m}-${d}`;
      expect(formatDateDisplay(todayStr)).toBe('Today');
    });
  });

  describe('evaluateMathExpression', () => {
    it('evaluates basic addition, subtraction, multiplication, division', () => {
      expect(evaluateMathExpression('100 + 250').result).toBe(350);
      expect(evaluateMathExpression('500 - 120').result).toBe(380);
      expect(evaluateMathExpression('25 * 4').result).toBe(100);
      expect(evaluateMathExpression('100 / 4').result).toBe(25);
    });

    it('evaluates expression with percentage', () => {
      expect(evaluateMathExpression('500 * 20%').result).toBe(100);
    });

    it('rejects invalid or unsafe characters', () => {
      expect(evaluateMathExpression('alert(1)').success).toBe(false);
      expect(evaluateMathExpression('window.location').success).toBe(false);
    });
  });
});
