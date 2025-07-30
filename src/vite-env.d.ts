
/// <reference types="vite/client" />

// Cordova types
declare global {
  interface Window {
    cordova?: {
      plugins?: {
        permissions: {
          requestPermissions: (
            permissions: string[],
            successCallback: (status: { hasPermission: boolean }) => void,
            errorCallback: (error: unknown) => void
          ) => void;
          requestPermission: (
            permission: string,
            successCallback: (status: { hasPermission: boolean }) => void,
            errorCallback: () => void
          ) => void;
          ACCESS_COARSE_LOCATION: string;
          ACCESS_FINE_LOCATION: string;
          READ_EXTERNAL_STORAGE: string;
          WRITE_EXTERNAL_STORAGE: string;
          CAMERA: string;
        };
        notification?: {
          local?: {
            hasPermission: () => Promise<boolean>;
            requestPermission: () => Promise<void>;
          };
        };
        settings?: {
          open: () => void;
        };
      };
    };
  }
}

export {};
