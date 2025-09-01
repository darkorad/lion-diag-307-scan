export interface WiFiConnectionConfig {
  ip: string;
  port: number;
  timeout?: number;
}

export class WiFiOBD2Service {
  private socket: WebSocket | null = null;
  private isConnected = false;
  private currentConfig: WiFiConnectionConfig | null = null;
  private connectionTimeout: number = 10000;

  // Connect to WiFi OBD2 adapter
  async connect(config: WiFiConnectionConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `ws://${config.ip}:${config.port}`;
        console.log(`Attempting to connect to WiFi OBD2 at ${wsUrl}`);

        const timeout = setTimeout(() => {
          if (this.socket) {
            this.socket.close();
          }
          reject(new Error(`Connection timeout to ${config.ip}:${config.port}`));
        }, config.timeout || this.connectionTimeout);

        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          clearTimeout(timeout);
          this.isConnected = true;
          this.currentConfig = config;
          console.log('WiFi OBD2 connection established');
          resolve();
        };

        this.socket.onerror = (error) => {
          clearTimeout(timeout);
          console.error('WiFi OBD2 connection error:', error);
          reject(new Error(`Failed to connect to WiFi OBD2 adapter at ${config.ip}:${config.port}`));
        };

        this.socket.onclose = () => {
          this.isConnected = false;
          this.currentConfig = null;
          console.log('WiFi OBD2 connection closed');
        };

      } catch (error) {
        reject(new Error(`WiFi connection failed: ${error}`));
      }
    });
  }

  // Alternative HTTP-based connection for adapters that use REST API
  async connectHTTP(config: WiFiConnectionConfig): Promise<void> {
    try {
      const baseUrl = `http://${config.ip}:${config.port}`;
      console.log(`Testing HTTP connection to ${baseUrl}`);

      // Test connection with a simple AT command
      const response = await fetch(`${baseUrl}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'text/plain',
        },
        signal: AbortSignal.timeout(config.timeout || this.connectionTimeout)
      });

      if (response.ok) {
        this.isConnected = true;
        this.currentConfig = config;
        console.log('HTTP OBD2 connection established');
      } else {
        throw new Error(`HTTP connection failed with status: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`HTTP connection failed: ${error}`);
    }
  }

  // Disconnect from WiFi adapter
  async disconnect(): Promise<void> {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
    this.currentConfig = null;
    console.log('Disconnected from WiFi OBD2 adapter');
  }

  // Send command via WebSocket
  async sendCommand(command: string): Promise<string> {
    if (!this.isConnected || !this.socket) {
      throw new Error('Not connected to WiFi OBD2 adapter');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Command timeout'));
      }, 5000);

      const handleMessage = (event: MessageEvent) => {
        clearTimeout(timeout);
        this.socket?.removeEventListener('message', handleMessage);
        
        const response = event.data.toString().trim();
        console.log(`WiFi OBD2 Response: ${response}`);
        resolve(response);
      };

      this.socket.addEventListener('message', handleMessage);
      
      const commandWithCR = command.trim() + '\r';
      console.log(`Sending WiFi OBD2 command: ${command}`);
      this.socket.send(commandWithCR);
    });
  }

  // Send command via HTTP
  async sendCommandHTTP(command: string): Promise<string> {
    if (!this.isConnected || !this.currentConfig) {
      throw new Error('Not connected to WiFi OBD2 adapter');
    }

    try {
      const baseUrl = `http://${this.currentConfig.ip}:${this.currentConfig.port}`;
      const response = await fetch(`${baseUrl}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: command + '\r',
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`HTTP request failed with status: ${response.status}`);
      }

      const result = await response.text();
      console.log(`HTTP OBD2 Response: ${result}`);
      return result.trim();
    } catch (error) {
      throw new Error(`HTTP command failed: ${error}`);
    }
  }

  // Check connection status
  isDeviceConnected(): boolean {
    return this.isConnected;
  }

  // Get current connection info
  getConnectionInfo(): { isConnected: boolean; config: WiFiConnectionConfig | null } {
    return {
      isConnected: this.isConnected,
      config: this.currentConfig
    };
  }

  // Scan for WiFi OBD2 adapters on common IP ranges
  async scanForAdapters(): Promise<string[]> {
    const commonIPs = [
      '192.168.0.10',
      '192.168.1.5',
      '192.168.4.1',
      '192.168.0.1',
      '10.0.0.1'
    ];

    const commonPorts = [35000, 80, 8080, 23];
    const foundAdapters: string[] = [];

    for (const ip of commonIPs) {
      for (const port of commonPorts) {
        try {
          const response = await fetch(`http://${ip}:${port}/`, {
            method: 'GET',
            signal: AbortSignal.timeout(2000)
          });
          
          if (response.ok) {
            foundAdapters.push(`${ip}:${port}`);
          }
        } catch {
          // Ignore failed connections during scan
        }
      }
    }

    return foundAdapters;
  }
}

// Export singleton instance
export const wifiOBD2Service = new WiFiOBD2Service();