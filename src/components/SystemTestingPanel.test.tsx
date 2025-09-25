import React from 'react';
import { render, screen } from '@testing-library/react';
import SystemTestingPanel from './SystemTestingPanel';

// Mock the services
jest.mock('@/services/ComprehensiveBluetoothService', () => ({
  comprehensiveBluetoothService: {
    initialize: jest.fn().mockResolvedValue(true),
    requestAllBluetoothPermissions: jest.fn().mockResolvedValue(true),
    checkBluetoothStatus: jest.fn().mockResolvedValue({ supported: true, enabled: true }),
    startScan: jest.fn().mockResolvedValue(true),
    stopScan: jest.fn().mockResolvedValue(undefined),
    getDiscoveredDevices: jest.fn().mockReturnValue([]),
  }
}));

jest.mock('@/services/OBD2Service', () => ({
  obd2Service: {
    sendCommand: jest.fn().mockResolvedValue('ATZ Response')
  }
}));

jest.mock('@/services/PeugeotDiagnosticService', () => ({
  peugeotDiagnosticService: {}
}));

describe('SystemTestingPanel', () => {
  it('renders without crashing', () => {
    render(<SystemTestingPanel />);
    expect(screen.getByText('System Testing')).toBeInTheDocument();
  });

  it('displays all test categories', () => {
    render(<SystemTestingPanel />);
    expect(screen.getByText('Bluetooth Tests')).toBeInTheDocument();
    expect(screen.getByText('Diagnostic Tests')).toBeInTheDocument();
  });

  it('shows the run tests button', () => {
    render(<SystemTestingPanel />);
    expect(screen.getByText('Run All Tests')).toBeInTheDocument();
  });
});