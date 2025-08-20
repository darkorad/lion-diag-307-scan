
declare global {
  interface Window {
    bluetoothSerial: {
      isEnabled: (
        successCallback: () => void,
        errorCallback: (error: string) => void
      ) => void;
      
      enable: (
        successCallback: () => void,
        errorCallback: (error: string) => void
      ) => void;
      
      list: (
        successCallback: (devices: BluetoothSerialDevice[]) => void,
        errorCallback: (error: string) => void
      ) => void;
      
      discoverUnpaired: (
        successCallback: (devices: BluetoothSerialDevice[]) => void,
        errorCallback: (error: string) => void
      ) => void;
      
      pair: (
        address: string,
        successCallback: () => void,
        errorCallback: (error: string) => void
      ) => void;
      
      connect: (
        address: string,
        successCallback: () => void,
        errorCallback: (error: string) => void
      ) => void;
      
      connectInsecure: (
        address: string,
        successCallback: () => void,
        errorCallback: (error: string) => void
      ) => void;
      
      disconnect: (
        successCallback: () => void,
        errorCallback: (error: string) => void
      ) => void;
      
      write: (
        data: string,
        successCallback: () => void,
        errorCallback: (error: string) => void
      ) => void;
      
      read: (
        successCallback: (data: string) => void,
        errorCallback: (error: string) => void
      ) => void;
      
      subscribe: (
        delimiter: string,
        successCallback: (data: string) => void,
        errorCallback: (error: string) => void
      ) => void;
      
      unsubscribe: (
        successCallback: () => void,
        errorCallback: (error: string) => void
      ) => void;

      // Add the missing discovery methods
      setDeviceDiscoveredListener?: (
        callback: (device: BluetoothSerialDevice) => void
      ) => void;
      
      clearDeviceDiscoveredListener?: () => void;
    };
  }

  interface BluetoothSerialDevice {
    id?: string;
    address: string;
    name: string;
    rssi?: number;
    class?: number;
  }
}

export {};
