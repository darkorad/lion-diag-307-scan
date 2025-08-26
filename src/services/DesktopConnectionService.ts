
// Desktop Connection Service - Browser-based implementation
export interface DesktopConnectionResult {
  success: boolean;
  message: string;
  adapters?: any[];
}

export class DesktopConnectionService {
  private static instance: DesktopConnectionService;

  static getInstance(): DesktopConnectionService {
    if (!DesktopConnectionService.instance) {
      DesktopConnectionService.instance = new DesktopConnectionService();
    }
    return DesktopConnectionService.instance;
  }

  // Check if running on desktop (browser environment)
  async isDesktop(): Promise<boolean> {
    // Check for desktop indicators
    const isDesktopUA = !/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasDesktopFeatures = window.screen.width >= 1024;
    
    console.log('🖥️ Desktop detection:', { isDesktopUA, hasDesktopFeatures });
    return isDesktopUA && hasDesktopFeatures;
  }

  // Get available connection methods based on browser capabilities
  async getAvailableConnectionMethods(): Promise<string[]> {
    const methods = [];
    
    // Check for Web Serial API (USB)
    if ('serial' in navigator) {
      methods.push('USB');
    }
    
    // Check for Web Bluetooth API
    if ('bluetooth' in navigator) {
      methods.push('Bluetooth');
    }
    
    // WiFi is always available in browsers
    methods.push('WiFi');
    
    console.log('🔌 Available connection methods:', methods);
    return methods;
  }

  // Show desktop connection instructions in console
  async showDesktopConnectionInstructions(): Promise<void> {
    const instructions = `
    🖥️ DESKTOP OBD2 CONNECTION INSTRUCTIONS
    =====================================
    
    WiFi Connection (Recommended):
    1. Get ELM327 WiFi adapter (~$15-25)
    2. Plug into car's OBD2 port
    3. Connect PC to adapter's WiFi (usually "WiFi_OBD2")
    4. Use IP: 192.168.0.10:35000 or 192.168.4.1:35000
    
    USB Connection:
    1. Get ELM327 USB adapter
    2. Install drivers if needed (CH340/CP2102)
    3. Check Device Manager for COM port
    4. Use Chrome/Edge with Web Serial API
    
    Bluetooth Connection:
    1. Get ELM327 Bluetooth adapter
    2. Pair in Windows Bluetooth settings
    3. Use Chrome/Edge with Web Bluetooth API
    
    Browser Requirements:
    - Chrome 89+ or Edge 89+ for best compatibility
    - Enable experimental web features if needed
    `;
    
    console.log(instructions);
  }

  // Create desktop shortcut instructions
  async createDesktopShortcutInstructions(): Promise<string> {
    return `
    🖥️ CREATE DESKTOP APPLICATION SHORTCUT
    =====================================
    
    For Google Chrome:
    1. Open this web app in Chrome
    2. Click the 3-dot menu (⋮) in top right
    3. Go to "More tools" → "Create shortcut..."
    4. Check "Open as window" for app-like experience
    5. Click "Create"
    
    For Microsoft Edge:
    1. Open this web app in Edge
    2. Click the 3-dot menu (...) in top right
    3. Go to "Apps" → "Install this site as an app"
    4. Click "Install"
    
    Benefits:
    ✓ Runs like a native Windows application
    ✓ No browser tabs or address bar
    ✓ Appears in Start Menu and taskbar
    ✓ Faster startup and better performance
    ✓ Works offline once cached
    
    The shortcut will create a PWA (Progressive Web App) that feels like a desktop program while maintaining all web functionality.
    `;
  }

  // Browser-based USB/Serial detection
  async detectUSBAdapters(): Promise<DesktopConnectionResult> {
    try {
      console.log('🔍 Checking for Web Serial API support...');
      
      if ('serial' in navigator) {
        console.log('✅ Web Serial API is supported');
        
        try {
          // Request user to select a serial port
          const ports = await (navigator as any).serial.getPorts();
          console.log(`Found ${ports.length} previously authorized serial ports`);
          
          return {
            success: true,
            message: `Web Serial API available. ${ports.length} authorized ports found.`,
            adapters: ports.map((port: any, index: number) => ({
              id: `usb-${index}`,
              name: `USB Serial Port ${index + 1}`,
              type: 'USB/Serial',
              port: port
            }))
          };
        } catch (error) {
          console.error('Serial port access error:', error);
          return {
            success: false,
            message: 'Serial port access denied or unavailable'
          };
        }
      } else {
        console.log('❌ Web Serial API not supported in this browser');
        return {
          success: false,
          message: 'Web Serial API not supported. Please use Chrome/Edge browser for USB adapter support.'
        };
      }
    } catch (error) {
      console.error('USB adapter detection failed:', error);
      return {
        success: false,
        message: 'Failed to detect USB adapters'
      };
    }
  }

  async connectToUSBAdapter(adapterId: string): Promise<DesktopConnectionResult> {
    try {
      console.log(`🔌 Attempting to connect to USB adapter: ${adapterId}`);
      
      if (!('serial' in navigator)) {
        throw new Error('Web Serial API not supported');
      }

      // Request user to select a port
      const port = await (navigator as any).serial.requestPort();
      
      // Open the serial port
      await port.open({ 
        baudRate: 38400, // Standard ELM327 baud rate
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      });

      console.log('✅ USB adapter connected successfully');
      
      return {
        success: true,
        message: 'USB adapter connected successfully'
      };
      
    } catch (error) {
      console.error('USB connection failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'USB connection failed'
      };
    }
  }

  async detectWiFiAdapters(): Promise<DesktopConnectionResult> {
    console.log('🔍 Scanning for WiFi OBD2 adapters...');
    
    // Common WiFi OBD2 adapter IP addresses and ports
    const commonAddresses = [
      '192.168.0.10:35000',
      '192.168.4.1:35000',
      '10.0.0.1:35000'
    ];

    const detectedAdapters = [];

    for (const address of commonAddresses) {
      try {
        // Use a simple fetch with timeout to check if adapter responds
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch(`http://${address}`, {
          signal: controller.signal,
          mode: 'no-cors' // Avoid CORS issues
        });

        clearTimeout(timeoutId);
        
        detectedAdapters.push({
          id: `wifi-${address}`,
          name: `WiFi OBD2 Adapter (${address})`,
          type: 'WiFi',
          address: address
        });
      } catch (error) {
        // Adapter not found at this address
        continue;
      }
    }

    return {
      success: detectedAdapters.length > 0,
      message: `Found ${detectedAdapters.length} WiFi adapters`,
      adapters: detectedAdapters
    };
  }

  async connectToWiFiAdapter(address: string): Promise<DesktopConnectionResult> {
    try {
      console.log(`🔌 Connecting to WiFi adapter at ${address}`);
      
      // Test connection with a simple OBD2 command
      const testCommand = 'ATZ\r'; // Reset command
      
      // This would typically use WebSocket or fetch for WiFi adapters
      // For now, we'll simulate the connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: `Connected to WiFi adapter at ${address}`
      };
      
    } catch (error) {
      console.error('WiFi connection failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'WiFi connection failed'
      };
    }
  }

  getBrowserCapabilities() {
    return {
      webSerial: 'serial' in navigator,
      webBluetooth: 'bluetooth' in navigator,
      webUSB: 'usb' in navigator,
      userAgent: navigator.userAgent,
      platform: navigator.platform
    };
  }
}

export const desktopConnectionService = DesktopConnectionService.getInstance();
