import { EnhancedNativeBluetoothService } from './EnhancedNativeBluetoothService';

describe('EnhancedNativeBluetoothService', () => {
  let service: EnhancedNativeBluetoothService;

  beforeEach(() => {
    // Reset the singleton instance
    // @ts-expect-error - accessing private property for testing
    EnhancedNativeBluetoothService.instance = null;
    service = EnhancedNativeBluetoothService.getInstance();
  });

  it('should be a singleton', () => {
    const service1 = EnhancedNativeBluetoothService.getInstance();
    const service2 = EnhancedNativeBluetoothService.getInstance();
    expect(service1).toBe(service2);
  });

  it('should have initial connection info', () => {
    const connectionInfo = service.getConnectionInfo();
    expect(connectionInfo.isConnected).toBe(false);
    expect(connectionInfo.connectionAttempts).toBe(0);
  });

  it('should have initial device memory', () => {
    const deviceMemory = service.getDeviceMemory();
    expect(Array.isArray(deviceMemory.devices)).toBe(true);
    expect(Array.isArray(deviceMemory.blacklistedDevices)).toBe(true);
    expect(deviceMemory.preferences.autoConnect).toBe(true);
  });

  it('should be able to set and get preferred device', () => {
    const deviceAddress = '00:11:22:33:44:55';
    service.setPreferredDevice(deviceAddress);
    
    const deviceMemory = service.getDeviceMemory();
    expect(deviceMemory.preferences.preferredDevice).toBe(deviceAddress);
  });

  it('should be able to set and get auto-connect preference', () => {
    service.setAutoConnect(false);
    
    const deviceMemory = service.getDeviceMemory();
    expect(deviceMemory.preferences.autoConnect).toBe(false);
  });

  it('should be able to clear device memory', () => {
    // Add some data to memory
    service.setPreferredDevice('00:11:22:33:44:55');
    service.setAutoConnect(false);
    
    // Clear memory
    service.clearDeviceMemory();
    
    const deviceMemory = service.getDeviceMemory();
    expect(deviceMemory.devices).toEqual([]);
    expect(deviceMemory.blacklistedDevices).toEqual([]);
    expect(deviceMemory.preferences.autoConnect).toBe(true);
    expect(deviceMemory.preferences.preferredDevice).toBeUndefined();
  });
});