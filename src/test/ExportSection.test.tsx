import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExportSection } from '../components/ExportSection';
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '../utils/storage';

describe('ExportSection Component', () => {
  it('renders data download and backup cards', () => {
    render(
      <ExportSection
        expenses={[]}
        categories={DEFAULT_CATEGORIES}
        settings={DEFAULT_SETTINGS}
        onRestoreData={vi.fn()}
      />
    );

    expect(screen.getByText(/Download & Export Reports/i)).toBeInTheDocument();
  });
});
