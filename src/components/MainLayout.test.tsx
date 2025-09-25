import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MainLayout from './MainLayout';
import { vi } from 'vitest';

// Mock the Outlet component from react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  };
});

describe('MainLayout', () => {
  test('renders the main layout with navigation', () => {
    render(
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    );

    // Check if the app title is rendered (desktop version)
    const desktopTitle = screen.getByText('LionDiag Pro', { selector: 'h1.text-xl.font-bold.mb-4' });
    expect(desktopTitle).toBeInTheDocument();

    // Check if navigation links are present
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Connections')).toBeInTheDocument();
    expect(screen.getByText('Diagnostics')).toBeInTheDocument();
    expect(screen.getByText('Vehicles')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();

    // Check if the outlet is rendered
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });
});