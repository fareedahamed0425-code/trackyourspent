import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HistorySection } from '../components/HistorySection';
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '../utils/storage';
import { Expense } from '../types';

describe('HistorySection Component', () => {
  const sampleExpenses: Expense[] = [
    {
      id: 'e1',
      title: 'Electricity Bill',
      amount: 1500,
      categoryId: 'utilities',
      date: '2026-08-20',
      time: '11:00',
      paymentMethod: 'UPI / Online',
      createdAt: 1,
      updatedAt: 1
    }
  ];

  it('renders ledger history and filter controls', () => {
    render(
      <HistorySection
        expenses={sampleExpenses}
        categories={DEFAULT_CATEGORIES}
        settings={DEFAULT_SETTINGS}
        onEditExpense={vi.fn()}
        onDeleteExpense={vi.fn()}
      />
    );

    expect(screen.getByText('Electricity Bill')).toBeInTheDocument();
  });
});
