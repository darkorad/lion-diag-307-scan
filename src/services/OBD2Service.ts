
import { safeMasterBluetoothService } from './SafeMasterBluetoothService';

export class OBD2Service {
  private isBluetoothEnabled: boolean = false;
  private isConnected: boolean = false;

  constructor() {
    this.init();
  }

  private async init() {
    this.isBluetoothEnabled = await safeMasterBluetoothService.isBluetoothEnabled();
  }

  // Make sendCommand public so it can be used by other components
  async sendCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Simulate OBD2 command execution
      setTimeout(() => {
        if (command.includes('03')) {
          // Simulate DTC reading
          resolve('43 01 33 00 00 00 00');
        } else if (command.includes('010C')) {
          // Simulate RPM reading
          resolve('41 0C 1A F8');
        } else if (command.includes('010D')) {
          // Simulate speed reading
          resolve('41 0D 2F');
        } else {
          resolve('41 00 BE 1F B8 13');
        }
      }, Math.random() * 500 + 200);
    });
  }

  // Add the public method that other services expect
  async sendCommandPublic(command: string): Promise<string> {
    return this.sendCommand(command);
  }
}

export const obd2Service = new OBD2Service();
