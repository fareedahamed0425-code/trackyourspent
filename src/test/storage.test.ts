import { describe, it, expect } from 'vitest';
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS, getTodayDateString, generateSampleExpenses } from '../utils/storage';

describe('Storage and State Defaults', () => {
  it('provides comprehensive default categories', () => {
    expect(DEFAULT_CATEGORIES.length).toBeGreaterThan(5);
    const categoryIds = DEFAULT_CATEGORIES.map(c => c.id);
    expect(categoryIds).toContain('food');
    expect(categoryIds).toContain('transport');
    expect(categoryIds).toContain('groceries');
  });

  it('provides valid default user settings', () => {
    expect(DEFAULT_SETTINGS.currencySymbol).toBeTruthy();
    expect(DEFAULT_SETTINGS.totalBudget).toBeGreaterThan(0);
    expect(['bottom-right', 'bottom-left', 'top-right', 'top-left']).toContain(DEFAULT_SETTINGS.cornerPosition);
  });

  it('returns valid YYYY-MM-DD date string for today', () => {
    const todayStr = getTodayDateString();
    expect(todayStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('generates sample expenses with valid attributes', () => {
    const sample = generateSampleExpenses();
    expect(Array.isArray(sample)).toBe(true);
  });
});
