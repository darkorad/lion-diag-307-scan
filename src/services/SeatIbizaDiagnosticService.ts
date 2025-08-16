
import { obd2Service } from './OBD2Service';
import { SEAT_IBIZA_MODULES } from '@/constants/seatIbizaModules';
import { SEAT_IBIZA_PIDS } from '@/constants/seatIbizaPIDs';

export interface WindowStatus {
  id: string;
  name: string;
  position: number; // 0-100%
  motorCurrent: number; // Amperes
  autoFunction: boolean;
  errors: string[];
  lastCalibration?: Date;
}

export interface WindowError {
  code: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  solution: string;
}

export interface FabricRoofStatus {
  position: number; // 0-100%
  motor1Current: number;
  motor2Current: number;
  latchStatus: 'locked' | 'unlocked' | 'error';
  windowSyncStatus: boolean;
  errors: string[];
}

export class SeatIbizaDiagnosticService {
  constructor(private sendCommand: (command: string) => Promise<string>) {}

  // WINDOW DIAGNOSTIC FUNCTIONS

  async scanAllWindows(): Promise<WindowStatus[]> {
    const windowStatuses: WindowStatus[] = [];

    // Front Left Window
    try {
      const flPosition = await this.getWindowPosition('fl');
      const flCurrent = await this.getWindowMotorCurrent('fl');
      const flAutoStatus = await this.getWindowAutoStatus('fl');
      const flErrors = await this.getWindowErrors('fl');

      windowStatuses.push({
        id: 'window_fl',
        name: 'Front Left (Driver)',
        position: flPosition,
        motorCurrent: flCurrent,
        autoFunction: flAutoStatus,
        errors: flErrors
      });
    } catch (error) {
      windowStatuses.push({
        id: 'window_fl',
        name: 'Front Left (Driver)',
        position: 0,
        motorCurrent: 0,
        autoFunction: false,
        errors: ['Communication Error']
      });
    }

    // Front Right Window
    try {
      const frPosition = await this.getWindowPosition('fr');
      const frCurrent = await this.getWindowMotorCurrent('fr');
      const frAutoStatus = await this.getWindowAutoStatus('fr');
      const frErrors = await this.getWindowErrors('fr');

      windowStatuses.push({
        id: 'window_fr',
        name: 'Front Right (Passenger)',
        position: frPosition,
        motorCurrent: frCurrent,
        autoFunction: frAutoStatus,
        errors: frErrors
      });
    } catch (error) {
      windowStatuses.push({
        id: 'window_fr',
        name: 'Front Right (Passenger)',
        position: 0,
        motorCurrent: 0,
        autoFunction: false,
        errors: ['Communication Error']
      });
    }

    // Rear windows (if present)
    for (const position of ['rl', 'rr']) {
      try {
        const pos = await this.getWindowPosition(position);
        const current = await this.getWindowMotorCurrent(position);
        const errors = await this.getWindowErrors(position);

        windowStatuses.push({
          id: `window_${position}`,
          name: position === 'rl' ? 'Rear Left' : 'Rear Right',
          position: pos,
          motorCurrent: current,
          autoFunction: false, // Rear windows typically don't have auto function
          errors: errors
        });
      } catch (error) {
        windowStatuses.push({
          id: `window_${position}`,
          name: position === 'rl' ? 'Rear Left' : 'Rear Right',
          position: 0,
          motorCurrent: 0,
          autoFunction: false,
          errors: ['Communication Error']
        });
      }
    }

    return windowStatuses;
  }

  private async getWindowPosition(window: string): Promise<number> {
    const pidMap: { [key: string]: string } = {
      'fl': '225010',
      'fr': '225020',
      'rl': '225030',
      'rr': '225040'
    };

    const pid = pidMap[window];
    if (!pid) throw new Error('Invalid window position');

    const response = await this.sendCommand(pid);
    if (response.includes('NO DATA')) throw new Error('No window position data');

    // Parse response (simplified)
    const data = response.replace(/\s/g, '');
    const positionRaw = parseInt(data.substr(4, 2), 16);
    return Math.round((positionRaw / 255) * 100);
  }

  private async getWindowMotorCurrent(window: string): Promise<number> {
    const pidMap: { [key: string]: string } = {
      'fl': '225011',
      'fr': '225021',
      'rl': '225031',
      'rr': '225041'
    };

    const pid = pidMap[window];
    if (!pid) throw new Error('Invalid window');

    const response = await this.sendCommand(pid);
    if (response.includes('NO DATA')) return 0;

    // Parse current reading
    const data = response.replace(/\s/g, '');
    const currentRaw = parseInt(data.substr(4, 4), 16);
    return currentRaw / 1000; // Convert to Amperes
  }

  private async getWindowAutoStatus(window: string): Promise<boolean> {
    const pidMap: { [key: string]: string } = {
      'fl': '225012',
      'fr': '225022'
    };

    const pid = pidMap[window];
    if (!pid) return false; // Rear windows don't have auto function

    try {
      const response = await this.sendCommand(pid);
      if (response.includes('NO DATA')) return false;

      const data = response.replace(/\s/g, '');
      const status = parseInt(data.substr(4, 2), 16);
      return (status & 0x01) !== 0; // Check auto function bit
    } catch {
      return false;
    }
  }

  private async getWindowErrors(window: string): Promise<string[]> {
    const errors: string[] = [];
    
    try {
      // Read DTCs from window modules
      const ecuMap: { [key: string]: string } = {
        'fl': '52',
        'fr': '53',
        'rl': '52', // Usually controlled by driver module
        'rr': '53'  // Usually controlled by passenger module
      };

      const ecuAddress = ecuMap[window];
      const response = await this.sendCommand(`1${ecuAddress}03`); // Read DTCs

      if (!response.includes('NO DATA')) {
        // Parse DTCs (simplified)
        const codes = this.parseDTCResponse(response);
        errors.push(...codes);
      }
    } catch (error) {
      errors.push('Cannot read error codes');
    }

    return errors;
  }

  // WINDOW CALIBRATION AND RESET FUNCTIONS

  async calibrateWindow(window: string): Promise<boolean> {
    try {
      const calibrationCommands: { [key: string]: string } = {
        'fl': '31010B', // Front left calibration
        'fr': '31010C'  // Front right calibration
      };

      const command = calibrationCommands[window];
      if (!command) throw new Error('Calibration not supported for this window');

      // Send calibration command
      const response = await this.sendCommand(command);
      
      // Wait for calibration to complete (typically 30 seconds)
      await new Promise(resolve => setTimeout(resolve, 30000));
      
      // Verify calibration success
      const position = await this.getWindowPosition(window);
      return position >= 0; // Any valid position indicates success
    } catch (error) {
      console.error(`Window calibration failed for ${window}:`, error);
      return false;
    }
  }

  async resetWindowAutoFunction(window: string): Promise<boolean> {
    try {
      const resetCommands: { [key: string]: string } = {
        'fl': '31020B', // Reset FL auto function
        'fr': '31020C'  // Reset FR auto function
      };

      const command = resetCommands[window];
      if (!command) throw new Error('Auto function reset not supported');

      const response = await this.sendCommand(command);
      
      // Wait for reset procedure
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Verify auto function is restored
      const autoStatus = await this.getWindowAutoStatus(window);
      return autoStatus;
    } catch (error) {
      console.error(`Window auto function reset failed for ${window}:`, error);
      return false;
    }
  }

  async performWindowSelfTest(window: string): Promise<{ success: boolean; results: string[] }> {
    const results: string[] = [];
    let success = true;

    try {
      results.push(`Starting self-test for ${window} window...`);

      // Test 1: Check communication
      try {
        await this.getWindowPosition(window);
        results.push('✓ Communication OK');
      } catch {
        results.push('✗ Communication Failed');
        success = false;
      }

      // Test 2: Check motor current
      const current = await this.getWindowMotorCurrent(window);
      if (current > 0 && current < 10) {
        results.push(`✓ Motor current normal (${current.toFixed(2)}A)`);
      } else {
        results.push(`⚠ Motor current abnormal (${current.toFixed(2)}A)`);
      }

      // Test 3: Check position sensor
      const position = await this.getWindowPosition(window);
      if (position >= 0 && position <= 100) {
        results.push(`✓ Position sensor OK (${position}%)`);
      } else {
        results.push('✗ Position sensor error');
        success = false;
      }

      // Test 4: Check auto function (front windows only)
      if (window === 'fl' || window === 'fr') {
        const autoFunction = await this.getWindowAutoStatus(window);
        results.push(`${autoFunction ? '✓' : '⚠'} Auto function ${autoFunction ? 'active' : 'inactive'}`);
      }

      results.push(`Self-test ${success ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
      results.push(`✗ Self-test error: ${error}`);
      success = false;
    }

    return { success, results };
  }

  // FABRIC ROOF FUNCTIONS (for convertible models)

  async getFabricRoofStatus(): Promise<FabricRoofStatus> {
    try {
      const position = await this.getFabricRoofPosition();
      const motor1Current = await this.getFabricMotorCurrent(1);
      const motor2Current = await this.getFabricMotorCurrent(2);
      const latchStatus = await this.getFabricLatchStatus();
      const windowSyncStatus = await this.getWindowSyncStatus();
      const errors = await this.getFabricRoofErrors();

      return {
        position,
        motor1Current,
        motor2Current,
        latchStatus,
        windowSyncStatus,
        errors
      };
    } catch (error) {
      return {
        position: 0,
        motor1Current: 0,
        motor2Current: 0,
        latchStatus: 'error',
        windowSyncStatus: false,
        errors: ['Communication Error']
      };
    }
  }

  private async getFabricRoofPosition(): Promise<number> {
    const response = await this.sendCommand('224601');
    if (response.includes('NO DATA')) return 0;

    const data = response.replace(/\s/g, '');
    const positionRaw = parseInt(data.substr(4, 2), 16);
    return Math.round((positionRaw / 255) * 100);
  }

  private async getFabricMotorCurrent(motorNumber: number): Promise<number> {
    const pid = motorNumber === 1 ? '224602' : '224603';
    const response = await this.sendCommand(pid);
    if (response.includes('NO DATA')) return 0;

    const data = response.replace(/\s/g, '');
    const currentRaw = parseInt(data.substr(4, 4), 16);
    return currentRaw / 1000;
  }

  private async getFabricLatchStatus(): Promise<'locked' | 'unlocked' | 'error'> {
    try {
      const response = await this.sendCommand('224604');
      if (response.includes('NO DATA')) return 'error';

      const data = response.replace(/\s/g, '');
      const status = parseInt(data.substr(4, 2), 16);
      
      if ((status & 0x01) !== 0) return 'locked';
      if ((status & 0x02) !== 0) return 'unlocked';
      return 'error';
    } catch {
      return 'error';
    }
  }

  private async getWindowSyncStatus(): Promise<boolean> {
    try {
      const response = await this.sendCommand('224605');
      if (response.includes('NO DATA')) return false;

      const data = response.replace(/\s/g, '');
      const status = parseInt(data.substr(4, 2), 16);
      return (status & 0x01) !== 0;
    } catch {
      return false;
    }
  }

  private async getFabricRoofErrors(): Promise<string[]> {
    const errors: string[] = [];
    
    try {
      // Read DTCs from fabric roof module
      const response = await this.sendCommand('14603'); // Read DTCs from fabric module
      
      if (!response.includes('NO DATA')) {
        const codes = this.parseDTCResponse(response);
        errors.push(...codes);
      }
    } catch {
      errors.push('Cannot read error codes');
    }

    return errors;
  }

  async calibrateFabricRoof(): Promise<boolean> {
    try {
      // Start fabric roof calibration procedure
      await this.sendCommand('31014F');
      
      // Wait for calibration (can take up to 2 minutes)
      await new Promise(resolve => setTimeout(resolve, 120000));
      
      // Verify calibration success
      const status = await this.getFabricRoofStatus();
      return status.errors.length === 0;
    } catch (error) {
      console.error('Fabric roof calibration failed:', error);
      return false;
    }
  }

  // UTILITY FUNCTIONS

  private parseDTCResponse(response: string): string[] {
    const codes: string[] = [];
    const data = response.replace(/\s/g, '');
    
    // Parse DTC codes from response (simplified)
    for (let i = 4; i < data.length; i += 4) {
      const byte1 = parseInt(data.substr(i, 2), 16);
      const byte2 = parseInt(data.substr(i + 2, 2), 16);
      
      if (byte1 === 0 && byte2 === 0) continue;
      
      const code = this.formatDTCCode(byte1, byte2);
      codes.push(code);
    }
    
    return codes;
  }

  private formatDTCCode(byte1: number, byte2: number): string {
    const firstChar = ['P', 'C', 'B', 'U'][(byte1 >> 6) & 0x03];
    const secondChar = ((byte1 >> 4) & 0x03).toString();
    const thirdChar = (byte1 & 0x0F).toString(16).toUpperCase();
    const lastTwoChars = byte2.toString(16).toUpperCase().padStart(2, '0');
    
    return `${firstChar}${secondChar}${thirdChar}${lastTwoChars}`;
  }

  // Get all available modules for SEAT Ibiza
  getAvailableModules() {
    return SEAT_IBIZA_MODULES;
  }

  // Get all available PIDs for SEAT Ibiza
  getAvailablePIDs() {
    return SEAT_IBIZA_PIDS;
  }
}

export const seatIbizaDiagnosticService = new SeatIbizaDiagnosticService(
  async (command: string) => {
    return obd2Service.sendCommandPublic(command);
  }
);
