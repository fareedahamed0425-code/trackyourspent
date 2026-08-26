import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CategoryIcon } from '../components/CategoryIcon';

describe('CategoryIcon Component', () => {
  it('renders matching lucide icons without throwing', () => {
    const { container } = render(<CategoryIcon name='Utensils' className='w-4 h-4' />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders fallback icon when icon name is unknown', () => {
    const { container } = render(<CategoryIcon name='NonExistentIcon' className='w-4 h-4' />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
