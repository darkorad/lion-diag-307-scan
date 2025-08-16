
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.8961d3c3f07d43bda4712722432c1d2f',
  appName: 'lion-diag-307-scan',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    appendUserAgent: 'OBD2DiagnosticApp/1.0'
  },
  ios: {
    contentInset: 'automatic'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999"
    },
    BluetoothLe: {
      displayStrings: {
        scanning: "Scanning for OBD2 devices...",
        cancel: "Cancel",
        availableDevices: "Available Devices",
        noDeviceFound: "No OBD2 devices found"
      }
    }
  }
};

export default config;
