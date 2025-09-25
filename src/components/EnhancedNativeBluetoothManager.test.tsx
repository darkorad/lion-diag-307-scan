import React from 'react';
import { render, screen } from '@testing-library/react';
import EnhancedNativeBluetoothManager from './EnhancedNativeBluetoothManager';

// Simple test to check if the component renders
describe('EnhancedNativeBluetoothManager', () => {
  it('should render without crashing', () => {
    render(<EnhancedNativeBluetoothManager />);
    expect(screen.getByText('Enhanced Native Bluetooth Manager')).toBeInTheDocument();
  });
});
