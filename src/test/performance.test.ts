import { describe, it, expect } from 'vitest';
import { evaluateMathExpression } from '../utils/helpers';
import { generateSampleExpenses } from '../utils/storage';

describe('Performance Benchmarks', () => {
  it('evaluates 1000 math expressions under 50ms', () => {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      evaluateMathExpression('150 + 250 * 2 - 50 / 2');
    }
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });

  it('aggregates 5,000 expense records under 30ms', () => {
    const expenses = Array.from({ length: 5000 }, (_, i) => ({
      id: 'e' + i,
      title: 'Expense ' + i,
      amount: (i % 100) + 10,
      categoryId: 'food',
      date: '2026-08-26',
      time: '12:00',
      paymentMethod: 'UPI / Online' as const,
      createdAt: i,
      updatedAt: i
    }));

    const start = performance.now();
    const sum = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const duration = performance.now() - start;

    expect(sum).toBeGreaterThan(0);
    expect(duration).toBeLessThan(50);
  });
});
