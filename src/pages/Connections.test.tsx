import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Connections from './Connections';
import { LionDiagBluetooth, BluetoothDevice as PluginBluetoothDevice } from '../plugins/LionDiagBluetooth';
import { enhancedAndroidBluetoothService } from '../services/EnhancedAndroidBluetoothService';
import { Toaster } from '@/components/ui/sonner';
import { Capacitor } from '@capacitor/core';

// Mock the LionDiagBluetooth plugin
vi.mock('../plugins/LionDiagBluetooth', () => ({
  LionDiagBluetooth: {
    checkBluetoothStatus: vi.fn().mockResolvedValue({ enabled: true }),
    requestPermissions: vi.fn().mockResolvedValue({ granted: true }),
    enableBluetooth: vi.fn().mockResolvedValue({ requested: true }),
    startDiscovery: vi.fn().mockResolvedValue({ success: true }),
    stopDiscovery: vi.fn().mockResolvedValue({ success: true }),
    getPairedDevices: vi.fn().mockResolvedValue({ devices: [] }),
    pairDevice: vi.fn(),
    connectToDevice: vi.fn(),
    disconnect: vi.fn().mockResolvedValue({ success: true }),
    sendCommand: vi.fn().mockResolvedValue({ response: 'OK' }),
    attemptAutoReconnect: vi.fn(),
    removeAllListeners: vi.fn(),
    addListener: vi.fn(),
  },
}));

// Mock Capacitor
vi.mock('@capacitor/core', () => ({
    Capacitor: {
        getPlatform: vi.fn(() => 'android'),
    },
}));


describe('Connections Page', () => {
    let listeners: Record<string, Function> = {};

    beforeEach(() => {
        vi.clearAllMocks();
        listeners = {};
        (LionDiagBluetooth.addListener as vi.Mock).mockImplementation((event, callback) => {
            listeners[event] = callback;
        });
        enhancedAndroidBluetoothService['discoveredDevices'].clear();
        enhancedAndroidBluetoothService['connectedDevice'] = null;
        enhancedAndroidBluetoothService['isInitialized'] = false;
    });

  test('renders the component and scans for devices', async () => {
    render(
        <>
            <Toaster />
            <Connections />
        </>
    );

    await waitFor(() => expect(listeners.deviceFound).toBeDefined());

    await userEvent.click(screen.getByText('Scan for Devices'));
    expect(LionDiagBluetooth.startDiscovery).toHaveBeenCalled();

    const mockDevice: PluginBluetoothDevice = {
      name: 'OBD2 Adapter',
      address: '00:11:22:33:44:55',
      bonded: false,
      type: 1,
      compatibility: 90,
    };

    act(() => {
      listeners.deviceFound(mockDevice);
    });

    await waitFor(() => {
        expect(screen.getByText('OBD2 Adapter')).toBeInTheDocument();
        expect(screen.getByText('00:11:22:33:44:55')).toBeInTheDocument();
    });
  });

  test('pairs with a device', async () => {
    render(
        <>
            <Toaster />
            <Connections />
        </>
    );

    await waitFor(() => expect(listeners.deviceFound).toBeDefined());

    const mockDevice: PluginBluetoothDevice = { name: 'Test Device', address: '11:22:33:44:55:66', bonded: false, type: 1, compatibility: 80 };
    act(() => {
        listeners.deviceFound(mockDevice);
    });

    const pairButton = await screen.findByRole('button', { name: /Pair/i });
    await userEvent.click(pairButton);

    expect(LionDiagBluetooth.pairDevice).toHaveBeenCalledWith({ address: '11:22:33:44:55:66' });

    act(() => {
        (LionDiagBluetooth.pairDevice as vi.Mock).mockResolvedValue({ success: true, message: 'Paired successfully' });
        listeners.pairingState({ state: 'bonded', device: 'Test Device', address: '11:22:33:44:55:66', success: true, message: 'Paired successfully' });
    });

    await waitFor(() => {
        expect(screen.getByText('Paired successfully')).toBeInTheDocument();
    });
  });

  test('connects to and disconnects from a device', async () => {
    render(
        <>
            <Toaster />
            <Connections />
        </>
    );

    await waitFor(() => expect(listeners.deviceFound).toBeDefined());

    const mockDevice: PluginBluetoothDevice = { name: 'ELM327 Device', address: 'AA:BB:CC:DD:EE:FF', bonded: true, type: 1, compatibility: 95 };
    act(() => {
        listeners.deviceFound(mockDevice);
    });

    const connectButton = await screen.findByRole('button', { name: /Connect/i });
    await userEvent.click(connectButton);

    expect(LionDiagBluetooth.connectToDevice).toHaveBeenCalledWith({ address: 'AA:BB:CC:DD:EE:FF' });

    act(() => {
        (LionDiagBluetooth.connectToDevice as vi.Mock).mockResolvedValue({ success: true, address: 'AA:BB:CC:DD:EE:FF', device: 'ELM327 Device' });
        listeners.connected({ success: true, device: 'ELM327 Device', address: 'AA:BB:CC:DD:EE:FF' });
    });

    await waitFor(() => {
        expect(screen.getByText('Connected to ELM327 Device')).toBeInTheDocument();
        expect(screen.getByText('Disconnect')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Disconnect'));
    expect(LionDiagBluetooth.disconnect).toHaveBeenCalled();

    act(() => {
        listeners.disconnected();
    });

    await waitFor(() => {
        expect(screen.getByText('Device disconnected')).toBeInTheDocument();
        expect(screen.queryByText('Disconnect')).not.toBeInTheDocument();
    });
  });
});
