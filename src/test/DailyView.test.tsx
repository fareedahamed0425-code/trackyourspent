import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DailyView } from '../components/DailyView';
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '../utils/storage';
import { Expense } from '../types';

describe('DailyView Component', () => {
  const sampleExpenses: Expense[] = [
    {
      id: 'e1',
      title: 'Starbucks Coffee',
      amount: 250,
      categoryId: 'food',
      date: '2026-08-26',
      time: '09:30',
      paymentMethod: 'UPI / Online',
      createdAt: 1,
      updatedAt: 1
    },
    {
      id: 'e2',
      title: 'Groceries Supermart',
      amount: 1200,
      categoryId: 'groceries',
      date: '2026-08-26',
      time: '14:00',
      paymentMethod: 'Credit Card',
      createdAt: 2,
      updatedAt: 2
    }
  ];

  it('renders selected date, expense items, and daily aggregate sum', () => {
    const handleSelectDate = vi.fn();
    const handleOpenAdd = vi.fn();
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();

    render(
      <DailyView
        expenses={sampleExpenses}
        categories={DEFAULT_CATEGORIES}
        settings={DEFAULT_SETTINGS}
        selectedDate='2026-08-26'
        onSelectDate={handleSelectDate}
        onOpenAddExpense={handleOpenAdd}
        onEditExpense={handleEdit}
        onDeleteExpense={handleDelete}
      />
    );

    expect(screen.getByText('Starbucks Coffee')).toBeInTheDocument();
    expect(screen.getByText('Groceries Supermart')).toBeInTheDocument();
    expect(screen.getByText(/1,450/)).toBeInTheDocument();
  });

  it('filters expenses correctly when user types search query', () => {
    render(
      <DailyView
        expenses={sampleExpenses}
        categories={DEFAULT_CATEGORIES}
        settings={DEFAULT_SETTINGS}
        selectedDate='2026-08-26'
        onSelectDate={vi.fn()}
        onOpenAddExpense={vi.fn()}
        onEditExpense={vi.fn()}
        onDeleteExpense={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Filter day items/i);
    fireEvent.change(searchInput, { target: { value: 'Starbucks' } });

    expect(screen.getByText('Starbucks Coffee')).toBeInTheDocument();
    expect(screen.queryByText('Groceries Supermart')).not.toBeInTheDocument();
  });
});
