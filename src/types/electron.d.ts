
export interface ElectronAPI {
  checkBluetoothAvailable: () => Promise<{ available: boolean; reason?: string }>;
  platform: string;
  isElectron: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
