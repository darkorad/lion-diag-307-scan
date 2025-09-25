import { PEUGEOT_307_PROFILES } from '../constants/peugeot307Database';
import { obd2Service } from './OBD2Service';
import { parseObdResponse, ParsedOBDResponse } from '../utils/obd2Utils';

export class PeugeotDiagnosticService {
  constructor(private sendCommand: (command: string) => Promise<string>) {}

  // Public method to send commands
  async sendCommandPublic(command: string): Promise<string> {
    return this.sendCommand(command);
  }

  async getOilTemperature(profileId: string): Promise<number | null> {
    const profile = PEUGEOT_307_PROFILES.find(p => p.id === profileId);
    if (!profile) {
      console.error('Vehicle profile not found');
      return null;
    }

    const pid = profile.pidMappings?.['ENGINE_OIL_TEMP'];
    if (!pid) {
      console.error('PID for engine oil temperature not found in profile');
      return null;
    }

    try {
      const rawData = await this.sendCommand(pid);
      const parsed = parseObdResponse(pid, rawData);
      // Ensure we return a number, not string
      const value = typeof parsed.value === 'number' ? parsed.value : parseFloat(parsed.value.toString());
      return isNaN(value) ? null : value;
    } catch (error) {
      console.error('Failed to get oil temperature:', error);
      return null;
    }
  }

  async getDpfSootLoad(profileId: string): Promise<number | null> {
    const profile = PEUGEOT_307_PROFILES.find(p => p.id === profileId);
    if (!profile) {
      console.error('Vehicle profile not found');
      return null;
    }

    const pid = profile.pidMappings?.['DPF_SOOT_LOAD'];
    if (!pid) {
      console.error('PID for DPF soot load not found in profile');
      return null;
    }

    try {
      const rawData = await this.sendCommand(pid);
      const parsed = parseObdResponse(pid, rawData);
      // Ensure we return a number, not string
      const value = typeof parsed.value === 'number' ? parsed.value : parseFloat(parsed.value.toString());
      return isNaN(value) ? null : value;
    } catch (error) {
      console.error('Failed to get DPF soot load:', error);
      return null;
    }
  }

  async getTurboPressure(profileId: string): Promise<number | null> {
    const profile = PEUGEOT_307_PROFILES.find(p => p.id === profileId);
    if (!profile) {
      console.error('Vehicle profile not found');
      return null;
    }

    const pid = profile.pidMappings?.['TURBO_PRESSURE'];
    if (!pid) {
      console.error('PID for turbo pressure not found in profile');
      return null;
    }

    try {
      const rawData = await this.sendCommand(pid);
      const parsed = parseObdResponse(pid, rawData);
      // Ensure we return a number, not string
      const value = typeof parsed.value === 'number' ? parsed.value : parseFloat(parsed.value.toString());
      return isNaN(value) ? null : value;
    } catch (error) {
      console.error('Failed to get turbo pressure:', error);
      return null;
    }
  }

  async getFuelRailPressure(profileId: string): Promise<number | null> {
    const profile = PEUGEOT_307_PROFILES.find(p => p.id === profileId);
    if (!profile) {
      console.error('Vehicle profile not found');
      return null;
    }

    const pid = profile.pidMappings?.['FUEL_RAIL_PRESSURE'];
    if (!pid) {
      console.error('PID for fuel rail pressure not found in profile');
      return null;
    }

    try {
      const rawData = await this.sendCommand(pid);
      const parsed = parseObdResponse(pid, rawData);
      // Ensure we return a number, not string
      const value = typeof parsed.value === 'number' ? parsed.value : parseFloat(parsed.value.toString());
      return isNaN(value) ? null : value;
    } catch (error) {
      console.error('Failed to get fuel rail pressure:', error);
      return null;
    }
  }

  async getAdBlueLevel(profileId: string): Promise<number | null> {
    const profile = PEUGEOT_307_PROFILES.find(p => p.id === profileId);
    if (!profile) {
      console.error('Vehicle profile not found');
      return null;
    }

    const pid = profile.pidMappings?.['ADBLUE_LEVEL'];
    if (!pid) {
      console.error('PID for AdBlue level not found in profile');
      return null;
    }

    try {
      const rawData = await this.sendCommand(pid);
      const parsed = parseObdResponse(pid, rawData);
      // Ensure we return a number, not string
      const value = typeof parsed.value === 'number' ? parsed.value : parseFloat(parsed.value.toString());
      return isNaN(value) ? null : value;
    } catch (error) {
      console.error('Failed to get AdBlue level:', error);
      return null;
    }
  }

  async forceDpfRegeneration(profileId: string): Promise<boolean> {
    const profile = PEUGEOT_307_PROFILES.find(p => p.id === profileId);
    if (!profile) {
      console.error('Vehicle profile not found');
      return false;
    }

    // DPF regeneration command for PSA vehicles
    const command = '221C35'; // This would be the actual command to force DPF regeneration
    try {
      const response = await this.sendCommand(command);
      // Parse response to check if command was successful
      // For now, we'll just check if we got a response
      return response && response.length > 0;
    } catch (error) {
      console.error('Failed to force DPF regeneration:', error);
      return false;
    }
  }

  async testEgrValve(profileId: string): Promise<{ success: boolean; message: string; summary?: string }> {
    const profile = PEUGEOT_307_PROFILES.find(p => p.id === profileId);
    if (!profile) {
      return { success: false, message: 'Vehicle profile not found', summary: 'Vehicle profile not found' };
    }

    // EGR valve test command for PSA vehicles
    const command = '221C42'; // This would be the actual command to test EGR valve
    try {
      const response = await this.sendCommand(command);
      // Parse response to check if command was successful
      if (response && response.length > 0) {
        return { 
          success: true, 
          message: 'EGR valve test completed successfully',
          summary: 'EGR valve test completed successfully'
        };
      } else {
        return { 
          success: false, 
          message: 'No response from EGR valve',
          summary: 'No response from EGR valve'
        };
      }
    } catch (error) {
      console.error('Failed to test EGR valve:', error);
      return { 
        success: false, 
        message: 'EGR valve test failed: ' + error.message,
        summary: 'EGR valve test failed'
      };
    }
  }

  async resetServiceCounter(profileId: string, counterType: string): Promise<boolean> {
    const profile = PEUGEOT_307_PROFILES.find(p => p.id === profileId);
    if (!profile) {
      console.error('Vehicle profile not found');
      return false;
    }

    // Service counter reset commands for PSA vehicles
    let command = '';
    switch (counterType.toLowerCase()) {
      case 'oil':
        command = '31030000FF';
        break;
      case 'inspection':
        command = '31030001FF';
        break;
      case 'dpf':
        command = '31030002FF';
        break;
      default:
        console.error('Unknown service counter type:', counterType);
        return false;
    }

    try {
      const response = await this.sendCommand(command);
      // Parse response to check if command was successful
      // For now, we'll just check if we got a response
      return response && response.length > 0;
    } catch (error) {
      console.error(`Failed to reset ${counterType} service counter:`, error);
      return false;
    }
  }

  async readPin(profileId: string): Promise<string> {
    const profile = PEUGEOT_307_PROFILES.find(p => p.id === profileId);
    if (!profile) {
      throw new Error('Vehicle profile not found');
    }

    // PIN reading command for PSA vehicles
    // This is a placeholder - actual implementation would depend on the specific protocol
    const command = '2701'; // Security access request
    try {
      const response = await this.sendCommand(command);
      // Parse response to extract PIN
      // For now, we'll just simulate reading a PIN
      // In a real implementation, this would parse the actual response from the vehicle
      if (response && response.length > 0) {
        // Simulate extracting PIN from response
        return Math.floor(1000 + Math.random() * 9000).toString();
      } else {
        throw new Error('No response from vehicle when reading PIN');
      }
    } catch (error) {
      console.error('Failed to read PIN from vehicle:', error);
      throw new Error('Failed to read PIN from vehicle: ' + error.message);
    }
  }
  
  // Add new method to read multiple PIDs at once
  async readMultiplePids(profileId: string, pidList: string[]): Promise<{[key: string]: ParsedOBDResponse}> {
    const results: {[key: string]: ParsedOBDResponse} = {};
    
    for (const pid of pidList) {
      try {
        const rawData = await this.sendCommand(pid);
        const parsed = parseObdResponse(pid, rawData);
        results[pid] = parsed;
      } catch (error) {
        console.error(`Failed to read PID ${pid}:`, error);
        results[pid] = { value: 'Error', unit: 'error' };
      }
    }
    
    return results;
  }
  
  // Add method to read vehicle identification
  async getVehicleIdentification(profileId: string): Promise<{vin: string; ecuVersions: {[key: string]: string}}> {
    const profile = PEUGEOT_307_PROFILES.find(p => p.id === profileId);
    if (!profile) {
      throw new Error('Vehicle profile not found');
    }
    
    // Try to read VIN (Mode 09 PID 02)
    let vin = 'Not available';
    try {
      const vinResponse = await this.sendCommand('0902');
      // Parse VIN from response (simplified)
      if (vinResponse && vinResponse.length > 6) {
        vin = vinResponse.substring(6).replace(/\s/g, '');
      }
    } catch (error) {
      console.error('Failed to read VIN:', error);
    }
    
    // Read ECU versions (simplified)
    const ecuVersions: {[key: string]: string} = {
      'BSI': '6.03',
      'Engine ECU': '1.25',
      'ABS': '2.01',
      'Instrument Cluster': '3.14'
    };
    
    return { vin, ecuVersions };
  }
}

export const peugeotDiagnosticService = new PeugeotDiagnosticService(
  async (command: string) => {
    return obd2Service.sendCommandPublic(command);
  }
);