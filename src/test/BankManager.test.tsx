import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BankManager } from '../components/BankManager';
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '../utils/storage';

describe('BankManager Component', () => {
  it('renders bank accounts management interface and empty state or accounts list', () => {
    render(
      <BankManager
        bankAccounts={[]}
        expenses={[]}
        categories={DEFAULT_CATEGORIES}
        settings={DEFAULT_SETTINGS}
        onAddBank={vi.fn()}
        onUpdateBank={vi.fn()}
        onDeleteBank={vi.fn()}
        onSaveExpense={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: 'Bank Accounts' })).toBeInTheDocument();
  });
});
