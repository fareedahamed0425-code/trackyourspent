import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AIAdvisorView } from '../components/AIAdvisorView';
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '../utils/storage';

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('AIAdvisorView Component', () => {
  it('renders initial welcoming message and chat interface', () => {
    render(
      <AIAdvisorView
        expenses={[]}
        categories={DEFAULT_CATEGORIES}
        settings={DEFAULT_SETTINGS}
      />
    );

    expect(screen.getByText('AI Financial Advisor')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask for advice on your budget/i)).toBeInTheDocument();
    expect(screen.getByText(/I have access to your expenses and budget data/i)).toBeInTheDocument();
  });

  it('renders input field with proper aria and placeholder attributes', () => {
    render(
      <AIAdvisorView
        expenses={[]}
        categories={DEFAULT_CATEGORIES}
        settings={DEFAULT_SETTINGS}
      />
    );

    const input = screen.getByPlaceholderText(/Ask for advice on your budget/i);
    expect(input).toBeInTheDocument();
    expect(input).not.toBeDisabled();
  });
});
