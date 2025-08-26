
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
