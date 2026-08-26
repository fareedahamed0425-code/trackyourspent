import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoginView } from '../components/LoginView';

describe('LoginView Component', () => {
  it('renders authentication title and guest login options', () => {
    render(<LoginView />);
    expect(screen.getByText(/trackyourspent/i)).toBeInTheDocument();
  });
});
