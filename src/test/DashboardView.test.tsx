import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardView } from '../components/DashboardView';
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '../utils/storage';

describe('DashboardView Component', () => {
  it('renders overall total, daily expenditure, and banner', () => {
    const handleNavigate = vi.fn();
    const handleSelectDate = vi.fn();
    const handleOpenAdd = vi.fn();

    render(
      <DashboardView
        expenses={[]}
        categories={DEFAULT_CATEGORIES}
        settings={DEFAULT_SETTINGS}
        onNavigateToTab={handleNavigate}
        onSelectDate={handleSelectDate}
        onOpenAddExpense={handleOpenAdd}
      />
    );

    expect(screen.getByText(/trackyourspent Ledger/i)).toBeInTheDocument();
    expect(screen.getByText(/Daily Expenditure/i)).toBeInTheDocument();
    expect(screen.getByText(/Overall Total/i)).toBeInTheDocument();
  });
});
