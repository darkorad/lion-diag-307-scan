
import { enhancedBluetoothService } from '@/obd2/enhanced-bluetooth-service';
import { bluetoothConnectionManager } from './BluetoothConnectionManager';

export interface OBD2Response {
  success: boolean;
  data: string;
  error?: string;
  timestamp: number;
}

export class OBD2CommandService {
  private static instance: OBD2CommandService;
  private commandQueue: Array<{ command: string; resolve: Function; reject: Function }> = [];
  private isProcessing = false;
  private commandDelay = 100; // Minimum delay between commands in ms

  static getInstance(): OBD2CommandService {
    if (!OBD2CommandService.instance) {
      OBD2CommandService.instance = new OBD2CommandService();
    }
    return OBD2CommandService.instance;
  }

  async sendCommand(command: string, timeout: number = 5000): Promise<string> {
    if (!bluetoothConnectionManager.isConnected()) {
      throw new Error('OBD2 device not connected');
    }

    return new Promise((resolve, reject) => {
      this.commandQueue.push({ command, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.commandQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.commandQueue.length > 0) {
      const { command, resolve, reject } = this.commandQueue.shift()!;

      try {
        console.log(`Sending OBD2 command: ${command}`);
        
        // Use the enhanced Bluetooth service to send the command
        const response = await enhancedBluetoothService.sendObdCommand(command);
        
        // Clean up the response
        const cleanResponse = this.cleanResponse(response);
        console.log(`Command response: ${cleanResponse}`);
        
        resolve(cleanResponse);
      } catch (error) {
        console.error(`Command ${command} failed:`, error);
        reject(error);
      }

      // Add delay between commands to avoid overwhelming the adapter
      if (this.commandQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.commandDelay));
      }
    }

    this.isProcessing = false;
  }

  private cleanResponse(response: string): string {
    if (!response) return '';
    
    // Remove common OBD2 response artifacts
    return response
      .replace(/>/g, '') // Remove prompt characters
      .replace(/\r/g, '') // Remove carriage returns
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.sendCommand('0100'); // Test with supported PIDs command
      return response && response.length > 0 && !response.includes('NO DATA');
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  async getSupportedPIDs(): Promise<string[]> {
    try {
      const response = await this.sendCommand('0100');
      
      if (!response || response.includes('NO DATA')) {
        return [];
      }

      // Parse supported PIDs from response
      // This is a simplified implementation - real parsing would be more complex
      const supportedPIDs = [];
      
      // Standard PIDs that are commonly supported
      const commonPIDs = ['010C', '010D', '0105', '010B', '0111', '012F', '0142', '0143'];
      
      for (const pid of commonPIDs) {
        try {
          const testResponse = await this.sendCommand(pid);
          if (testResponse && !testResponse.includes('NO DATA') && !testResponse.includes('?')) {
            supportedPIDs.push(pid);
          }
        } catch (error) {
          // PID not supported, continue
        }
      }
      
      return supportedPIDs;
    } catch (error) {
      console.error('Failed to get supported PIDs:', error);
      return [];
    }
  }
}

export const obd2CommandService = OBD2CommandService.getInstance();
