import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AutoCalculator } from '../components/AutoCalculator';
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '../utils/storage';

describe('AutoCalculator Component', () => {
  it('renders calculator interface, keypad and expression input', () => {
    const handleAdd = vi.fn();
    render(
      <AutoCalculator
        expenses={[]}
        categories={DEFAULT_CATEGORIES}
        settings={DEFAULT_SETTINGS}
        onAddCalculatedExpense={handleAdd}
      />
    );

    expect(screen.getByText(/Financial Math & Live Tally/i)).toBeInTheDocument();
  });
});
