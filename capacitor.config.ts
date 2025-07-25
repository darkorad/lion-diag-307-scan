
import type { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.lovable.liondiag307scan',
  appName: 'lion-diag-307-scan',
  webDir: 'dist',
  // server: {
  //   url: "https://8961d3c3-f07d-43bd-a471-2722432c1d2f.lovableproject.com?forceHideBadge=true",
  //   cleartext: true
  // },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f172a',
      showSpinner: false
    },
    BluetoothSerial: {
      permissions: ["bluetooth", "bluetooth_admin", "access_coarse_location", "access_fine_location"]
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  ios: {
    contentInset: 'always'
  }
};

export default config;
