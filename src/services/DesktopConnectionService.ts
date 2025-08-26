
export class DesktopConnectionService {
  private static instance: DesktopConnectionService;

  static getInstance(): DesktopConnectionService {
    if (!DesktopConnectionService.instance) {
      DesktopConnectionService.instance = new DesktopConnectionService();
    }
    return DesktopConnectionService.instance;
  }

  async isElectron(): Promise<boolean> {
    return !!(window as any).electronAPI;
  }

  async getAvailableConnectionMethods(): Promise<string[]> {
    const methods = ['WiFi', 'USB'];
    
    // Check if running in Electron
    if (await this.isElectron()) {
      console.log('🖥️ Desktop version detected - Bluetooth not available');
      return methods;
    }

    // Web version might support Web Bluetooth
    if ('bluetooth' in navigator) {
      methods.push('Bluetooth');
    }

    return methods;
  }

  async showDesktopConnectionInstructions(): Promise<void> {
    console.log(`
🖥️ DESKTOP CONNECTION INSTRUCTIONS:

For Windows 7 Desktop Version:

WiFi Connection (Recommended):
1. 🌐 Use WiFi OBD2 adapter (like ELM327 WiFi)
2. 📶 Connect computer to adapter's WiFi hotspot
3. 🔗 Use IP address: 192.168.0.10:35000 (common default)

USB Connection:
1. 🔌 Use USB OBD2 cable adapter
2. 📱 Install driver if required (usually auto-detected)
3. 🖥️ Select appropriate COM port in settings

Note: Bluetooth requires mobile device or Bluetooth dongle
    `);
  }
}

export const desktopConnectionService = DesktopConnectionService.getInstance();
