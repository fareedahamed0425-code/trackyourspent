import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpinMenu } from '../components/SpinMenu';
import { DEFAULT_SETTINGS } from '../utils/storage';

describe('SpinMenu Component', () => {
  it('renders floating trigger button with accessible aria attributes', () => {
    render(
      <SpinMenu
        activeTab='dashboard'
        onSelectTab={vi.fn()}
        onOpenAddExpense={vi.fn()}
        settings={DEFAULT_SETTINGS}
        onUpdateSettings={vi.fn()}
      />
    );

    const trigger = screen.getByRole('button', { name: /Open Navigation Spin Menu/i });
    expect(trigger).toBeInTheDocument();
  });
});
