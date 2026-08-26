import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

const BombComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test explosion error');
  }
  return <div>Safe Component Loaded</div>;
};

describe('ErrorBoundary Component', () => {
  it('renders children normally when no error occurs', () => {
    render(
      <ErrorBoundary>
        <BombComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Safe Component Loaded')).toBeInTheDocument();
  });

  it('catches runtime errors and renders fallback UI', () => {
    // Suppress console.error in test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BombComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Fatal React Error')).toBeInTheDocument();
    expect(screen.getAllByText(/Test explosion error/).length).toBeGreaterThan(0);

    consoleSpy.mockRestore();
  });
});
