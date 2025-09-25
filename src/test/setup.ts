import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Capacitor plugins
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock Capacitor
vi.mock('@capacitor/core', () => ({
  registerPlugin: vi.fn().mockImplementation(() => ({
    checkBluetoothStatus: vi.fn().mockResolvedValue({}),
    requestPermissions: vi.fn().mockResolvedValue({}),
    enableBluetooth: vi.fn().mockResolvedValue({}),
    startDiscovery: vi.fn().mockResolvedValue({}),
    stopDiscovery: vi.fn().mockResolvedValue({}),
    getPairedDevices: vi.fn().mockResolvedValue({}),
    pairDevice: vi.fn().mockResolvedValue({}),
    connectToDevice: vi.fn().mockResolvedValue({}),
    disconnect: vi.fn().mockResolvedValue({}),
    isConnected: vi.fn().mockResolvedValue({}),
    sendCommand: vi.fn().mockResolvedValue({}),
    initializeELM327: vi.fn().mockResolvedValue({}),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    removeAllListeners: vi.fn()
  })),
}));