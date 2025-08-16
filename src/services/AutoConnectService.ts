import { BluetoothDevice } from './MasterBluetoothService';

export interface StoredDevice {
  id: string;
  address: string;
  name: string;
  lastConnected: number;
  connectionSuccess: boolean;
  protocol?: string;
  adapterType?: string;
  rssi?: number;
}

export interface AutoConnectSettings {
  enabled: boolean;
  maxAttempts: number;
  timeoutMs: number;
  tryLastDevice: boolean;
  fallbackToScan: boolean;
}

export interface AutoConnectStats {
  totalDevices: number;
  successfulDevices: number;
  lastConnectionTime: number | null;
}

class AutoConnectService {
  private static instance: AutoConnectService;
  private settings: AutoConnectSettings = {
    enabled: true,
    maxAttempts: 3,
    timeoutMs: 30000,
    tryLastDevice: true,
    fallbackToScan: true
  };
  private rememberedDevices: StoredDevice[] = [];

  static getInstance(): AutoConnectService {
    if (!AutoConnectService.instance) {
      AutoConnectService.instance = new AutoConnectService();
    }
    return AutoConnectService.instance;
  }

  constructor() {
    this.loadSettings();
    this.loadRememberedDevices();
  }

  updateSettings(newSettings: Partial<AutoConnectSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem('autoConnectSettings', JSON.stringify(this.settings));
  }

  getSettings(): AutoConnectSettings {
    return { ...this.settings };
  }

  rememberDevice(device: BluetoothDevice, protocol?: string): void {
    const existingIndex = this.rememberedDevices.findIndex(d => d.address === device.address);
    const newDevice: StoredDevice = {
      id: device.id,
      address: device.address,
      name: device.name,
      lastConnected: Date.now(),
      connectionSuccess: true,
      protocol: protocol,
      adapterType: device.deviceType,
      rssi: device.rssi
    };

    if (existingIndex > -1) {
      this.rememberedDevices[existingIndex] = newDevice;
    } else {
      this.rememberedDevices.push(newDevice);
    }

    this.saveRememberedDevices();
  }

  forgetDevice(deviceAddress: string): void {
    this.rememberedDevices = this.rememberedDevices.filter(d => d.address !== deviceAddress);
    this.saveRememberedDevices();
  }

  forgetAllDevices(): void {
    this.rememberedDevices = [];
    this.saveRememberedDevices();
  }

  getRememberedDevices(): StoredDevice[] {
    return [...this.rememberedDevices].sort((a, b) => b.lastConnected - a.lastConnected);
  }

  async attemptAutoConnect(): Promise<{ success: boolean; device?: StoredDevice; error?: string }> {
    if (!this.settings.enabled) {
      return { success: false, error: 'Auto-connect is disabled' };
    }

    const rememberedDevices = this.getRememberedDevices();

    if (this.settings.tryLastDevice && rememberedDevices.length > 0) {
      const lastDevice = rememberedDevices[0];
      const result = await this.tryConnect(lastDevice);
      if (result.success) return result;
    }

    for (const device of rememberedDevices) {
      if (this.settings.tryLastDevice && device.address === rememberedDevices[0].address) continue;
      const result = await this.tryConnect(device);
      if (result.success) return result;
    }

    if (this.settings.fallbackToScan) {
      return { success: false, error: 'Fallback to scan not implemented yet' };
    }

    return { success: false, error: 'No remembered devices to connect to' };
  }

  getConnectionStats(): AutoConnectStats {
    const successfulDevices = this.rememberedDevices.filter(d => d.connectionSuccess).length;
    const lastConnectionTime = this.rememberedDevices.length > 0 ? this.rememberedDevices[0].lastConnected : null;

    return {
      totalDevices: this.rememberedDevices.length,
      successfulDevices: successfulDevices,
      lastConnectionTime: lastConnectionTime || null
    };
  }

  private async tryConnect(device: StoredDevice): Promise<{ success: boolean; device?: StoredDevice; error?: string }> {
    return new Promise(resolve => {
      setTimeout(() => {
        device.connectionSuccess = true;
        device.lastConnected = Date.now();
        this.saveRememberedDevices();
        resolve({ success: true, device: device });
      }, 2000);
    });
  }

  private loadSettings(): void {
    const storedSettings = localStorage.getItem('autoConnectSettings');
    if (storedSettings) {
      this.settings = { ...this.settings, ...JSON.parse(storedSettings) };
    }
  }

  private loadRememberedDevices(): void {
    const storedDevices = localStorage.getItem('rememberedDevices');
    if (storedDevices) {
      this.rememberedDevices = JSON.parse(storedDevices);
    }
  }

  private saveRememberedDevices(): void {
    localStorage.setItem('rememberedDevices', JSON.stringify(this.rememberedDevices));
  }
}

export const autoConnectService = AutoConnectService.getInstance();
