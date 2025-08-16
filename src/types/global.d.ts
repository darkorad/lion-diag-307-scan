
// global.d.ts

import type { AppPlugin } from '@capacitor/app';

declare global {
  interface CapacitorGlobal {
    isNativePlatform(): boolean;
    getPlatform(): string;
    Plugins: CapacitorPlugins;
  }

  interface CapacitorPlugins {
    App: AppPlugin & {
      addListener(eventName: string, callback: Function): void;
      removeAllListeners(): void;
      exitApp(): void;
      minimizeApp(): void;
      openUrl(options: { url: string }): Promise<void>;
    };
    Device?: {
      getInfo(): Promise<{
        platform: string;
        model: string;
        operatingSystem: string;
        osVersion: string;
        manufacturer: string;
        isVirtual: boolean;
        webViewVersion: string;
      }>;
    };
    Geolocation?: any;
    BluetoothLe?: any;
    Filesystem?: any;
    Camera?: any;
  }

  // Make Capacitor accessible as both a global variable and via window.Capacitor
  const Capacitor: CapacitorGlobal;

  interface Window {
    Capacitor: CapacitorGlobal;
    cordova?: {
      plugins?: {
        permissions?: {
          ACCESS_COARSE_LOCATION: string;
          ACCESS_FINE_LOCATION: string;
          WRITE_EXTERNAL_STORAGE: string;
          READ_EXTERNAL_STORAGE: string;
          CAMERA: string;
          BLUETOOTH_SCAN: string;
          BLUETOOTH_CONNECT: string;
          BLUETOOTH_ADVERTISE: string;
          requestPermission(
            permission: string,
            success: (status: any) => void,
            error: () => void
          ): void;
          requestPermissions(
            permissions: string[],
            success: (status: any) => void,
            error: () => void
          ): void;
          checkPermission(
            permission: string,
            success: (status: any) => void,
            error: () => void
          ): void;
        };
        settings?: {
          open(): void;
        };
        notification?: {
          local?: {
            hasPermission(): Promise<boolean>;
            requestPermission(): Promise<void>;
          };
        };
      };
    };
    bluetoothSerial?: {
      isEnabled(success: () => void, error: (err: any) => void): void;
      enable(success: () => void, error: (err: any) => void): void;
      list(success: (devices: any[]) => void, error: (err: any) => void): void;
      connect(address: string, success: () => void, error: (err: any) => void): void;
      connectInsecure(address: string, success: () => void, error: (err: any) => void): void;
      disconnect(success: () => void, error: (err: any) => void): void;
      write(data: string, success: () => void, error: (err: any) => void): void;
      read(success: (data: string) => void, error: (err: any) => void): void;
      isConnected(success: () => void, error: (err: any) => void): void;
      subscribe(delimiter: string, success: (data: string) => void, error: (err: any) => void): void;
      unsubscribe(success: () => void, error: (err: any) => void): void;
      discoverUnpaired(success: (devices: any[]) => void, error: (err: any) => void): void;
      showBluetoothSettings(success: () => void, error: (err: any) => void): void;
      available(success: (count: number) => void, error: (err: any) => void): void;
      readUntil(delimiter: string, success: (data: string) => void, error: (err: any) => void): void;
      setDeviceDiscoveredListener(notify: (device: any) => void): void;
      clearDeviceDiscoveredListener(): void;
      setName(name: string, success: () => void, error: (err: any) => void): void;
      setDiscoverable(duration: number, success: () => void, error: (err: any) => void): void;
    };
  }

  interface Navigator {
    bluetooth?: {
      requestDevice(options: any): Promise<any>;
    };
    notification?: {
      alert(
        message: string,
        callback: () => void,
        title: string,
        buttonName: string
      ): void;
    };
  }
}

export {};
