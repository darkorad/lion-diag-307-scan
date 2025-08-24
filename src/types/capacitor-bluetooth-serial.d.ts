import '@e-is/capacitor-bluetooth-serial';

declare module '@e-is/capacitor-bluetooth-serial' {
  export interface BluetoothSerialPlugin {
    list(): Promise<BluetoothScanResult>;
  }
}
