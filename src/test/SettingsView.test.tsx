import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SettingsView } from '../components/SettingsView';
import { DEFAULT_SETTINGS, DEFAULT_CATEGORIES } from '../utils/storage';

describe('SettingsView Component', () => {
  it('renders application settings form with budget and currency fields', () => {
    render(
      <SettingsView
        settings={DEFAULT_SETTINGS}
        onUpdateSettings={vi.fn()}
        onResetData={vi.fn()}
        onLoadSampleData={vi.fn()}
      />
    );

    expect(screen.getByText(/Preferences/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Total Budget/i)).toBeInTheDocument();
  });
});
