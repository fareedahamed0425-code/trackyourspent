import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryManager } from '../components/CategoryManager';
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '../utils/storage';

describe('CategoryManager Component', () => {
  it('renders all default categories and category manager header', () => {
    render(
      <CategoryManager
        categories={DEFAULT_CATEGORIES}
        expenses={[]}
        settings={DEFAULT_SETTINGS}
        onAddCategory={vi.fn()}
        onUpdateCategory={vi.fn()}
        onDeleteCategory={vi.fn()}
        onOpenAddExpenseWithCategory={vi.fn()}
        onEditExpense={vi.fn()}
        onDeleteExpense={vi.fn()}
      />
    );

    expect(screen.getByText('Food & Dining')).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
  });
});
