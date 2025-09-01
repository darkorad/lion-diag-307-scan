
import { VehicleProfile, VehicleInfo } from '@/types/vehicle';
import { VEHICLE_PROFILES, getVehicleProfileByVin } from '@/constants/vehicleProfiles';
import { obd2CommandService } from './OBD2CommandService';

export class VehicleDetectionService {
  private sendCommand: (command: string) => Promise<string>;

  constructor(sendCommandFn?: (command: string) => Promise<string>) {
    // Use provided function or default to OBD2CommandService
    this.sendCommand = sendCommandFn || ((command: string) => obd2CommandService.sendCommand(command));
  }

  async detectVehicle(): Promise<VehicleInfo> {
    try {
      console.log('Starting vehicle detection...');
      
      // Try to get VIN first
      const vin = await this.getVIN();
      if (vin) {
        const profile = getVehicleProfileByVin(vin);
        if (profile) {
          console.log(`Vehicle detected via VIN: ${profile.displayName}`);
          return {
            vin,
            profile,
            detectedMake: profile.make,
            detectedModel: profile.model,
            isAutoDetected: true
          };
        }
      }

      // If VIN detection fails, try PID probing
      const detectedProfile = await this.detectByPIDSupport();
      if (detectedProfile) {
        console.log(`Vehicle detected via PID probing: ${detectedProfile.displayName}`);
        return {
          vin,
          profile: detectedProfile,
          detectedMake: detectedProfile.make,
          detectedModel: detectedProfile.model,
          isAutoDetected: true
        };
      }

      console.log('Vehicle auto-detection failed');
      return {
        vin,
        isAutoDetected: false
      };
    } catch (error) {
      console.error('Vehicle detection error:', error);
      return {
        isAutoDetected: false
      };
    }
  }

  private async getVIN(): Promise<string | null> {
    try {
      console.log('Attempting to read VIN...');
      
      // Try standard VIN PID (Mode 09, PID 02)
      const response = await this.sendCommand('0902');
      if (response && response.includes('49 02')) {
        const vinData = response.replace('49 02', '').replace(/\s/g, '');
        const vin = this.parseVINFromHex(vinData);
        if (vin && vin.length === 17) {
          console.log('VIN detected:', vin);
          return vin;
        }
      }

      // Try alternative VIN reading methods
      try {
        const altResponse = await this.sendCommand('0100');
        if (altResponse && !altResponse.includes('NO DATA')) {
          console.log('VIN not available via standard method, but OBD2 is responding');
        }
      } catch (error) {
        console.warn('Alternative VIN check failed:', error);
      }

      return null;
    } catch (error) {
      console.error('VIN reading failed:', error);
      return null;
    }
  }

  private parseVINFromHex(hexData: string): string {
    try {
      // Convert hex pairs to ASCII characters
      let vin = '';
      for (let i = 0; i < hexData.length; i += 2) {
        const hexPair = hexData.substr(i, 2);
        const charCode = parseInt(hexPair, 16);
        if (charCode >= 32 && charCode <= 126) { // Printable ASCII
          vin += String.fromCharCode(charCode);
        }
      }
      return vin.trim();
    } catch (error) {
      console.error('VIN parsing error:', error);
      return '';
    }
  }

  private async detectByPIDSupport(): Promise<VehicleProfile | null> {
    try {
      console.log('Detecting vehicle by PID support...');
      
      const supportScores = new Map<string, number>();
      
      for (const profile of VEHICLE_PROFILES) {
        let score = 0;
        const totalPids = profile.supportedPids.manufacturer.length;
        
        // Test manufacturer-specific PIDs
        for (const pid of profile.supportedPids.manufacturer) {
          try {
            const response = await this.sendCommand(pid);
            if (response && !response.includes('NO DATA') && !response.includes('?')) {
              score++;
            }
          } catch (error) {
            // PID not supported, continue
          }
        }
        
        const supportPercentage = totalPids > 0 ? (score / totalPids) * 100 : 0;
        supportScores.set(profile.id, supportPercentage);
        
        console.log(`${profile.displayName}: ${supportPercentage.toFixed(1)}% PID support`);
        
        // If we have > 50% support, likely match
        if (supportPercentage > 50) {
          return profile;
        }
      }
      
      // Return the profile with highest support if any
      let bestMatch: VehicleProfile | null = null;
      let bestScore = 0;
      
      for (const [profileId, score] of supportScores) {
        if (score > bestScore && score > 25) { // At least 25% support
          bestScore = score;
          bestMatch = VEHICLE_PROFILES.find(p => p.id === profileId) || null;
        }
      }
      
      return bestMatch;
    } catch (error) {
      console.error('PID detection error:', error);
      return null;
    }
  }

  async testPIDSupport(profile: VehicleProfile): Promise<{ [pid: string]: boolean }> {
    const results: { [pid: string]: boolean } = {};
    
    for (const pid of [...profile.supportedPids.standard, ...profile.supportedPids.manufacturer]) {
      try {
        const response = await this.sendCommand(pid);
        results[pid] = response && !response.includes('NO DATA') && !response.includes('?');
      } catch (error) {
        results[pid] = false;
      }
    }
    
    return results;
  }
}
