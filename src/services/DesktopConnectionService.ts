
export class DesktopConnectionService {
  private static instance: DesktopConnectionService;

  static getInstance(): DesktopConnectionService {
    if (!DesktopConnectionService.instance) {
      DesktopConnectionService.instance = new DesktopConnectionService();
    }
    return DesktopConnectionService.instance;
  }

  async isDesktop(): Promise<boolean> {
    // Check if running on desktop by checking user agent and screen size
    const userAgent = navigator.userAgent;
    const isDesktop = !(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent));
    const hasLargeScreen = window.screen.width >= 1024;
    
    return isDesktop && hasLargeScreen;
  }

  async getAvailableConnectionMethods(): Promise<string[]> {
    const methods: string[] = [];
    
    // Check if running on desktop
    if (await this.isDesktop()) {
      console.log('🖥️ Desktop version detected');
      methods.push('WiFi', 'USB');
      
      // Check if Web Bluetooth is available (some desktop browsers support it)
      if ('bluetooth' in navigator) {
        methods.push('Bluetooth');
      }
    } else {
      // Mobile/tablet version
      if ('bluetooth' in navigator) {
        methods.push('Bluetooth');
      }
      methods.push('WiFi');
    }

    return methods;
  }

  async showDesktopConnectionInstructions(): Promise<void> {
    const instructions = `
🖥️ DESKTOP CONNECTION INSTRUCTIONS for Windows 7:

WiFi Connection (Recommended):
1. 🌐 Use WiFi OBD2 adapter (ELM327 WiFi)
2. 📶 Connect your computer to the adapter's WiFi hotspot
3. 🔗 Default IP: 192.168.0.10:35000 or 192.168.1.5:35000
4. 🔧 Configure in app settings if different

USB Connection:
1. 🔌 Use USB OBD2 cable adapter (ELM327 USB)
2. 📱 Install CH340/CP2102 drivers if needed
3. 🖥️ Check Device Manager for COM port (COM3, COM4, etc.)
4. ⚙️ Configure COM port in app settings

Bluetooth (if available):
1. 📡 Requires Bluetooth dongle or built-in Bluetooth
2. 🔗 Pair ELM327 Bluetooth adapter first
3. 💻 Use Windows Bluetooth settings to pair

To create desktop shortcut:
1. 🌐 Open this app in Chrome/Edge
2. ⚙️ Click menu → More tools → Create shortcut
3. ✅ Check "Open as window"
4. 🖥️ App will run like native application
    `;
    
    console.log(instructions);
    
    // Show in UI if possible
    if (typeof window !== 'undefined' && window.alert) {
      alert(instructions);
    }
  }

  async createDesktopShortcutInstructions(): Promise<string> {
    return `
📋 CREATE DESKTOP SHORTCUT:

For Chrome:
1. Open this app in Chrome browser
2. Click the 3-dot menu (⋮) → More tools → Create shortcut
3. Check "Open as window" 
4. Click "Create"

For Edge:
1. Open this app in Edge browser  
2. Click the 3-dot menu (⋯) → Apps → Install this site as an app
3. Click "Install"

The app will then run like a native Windows application!

💡 TIP: Pin the shortcut to your taskbar for easy access.
    `;
  }
}

export const desktopConnectionService = DesktopConnectionService.getInstance();
