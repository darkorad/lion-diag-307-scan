
import { enhancedBluetoothService } from '@/obd2/enhanced-bluetooth-service';
import { VehicleProfile } from '@/types/vehicle';

export interface ModuleInfo {
  id: string;
  name: string;
  ecuAddress: string;
  supported: boolean;
  version?: string;
  partNumber?: string;
  status: 'ok' | 'error' | 'unknown';
}

export interface VehicleParameter {
  id: string;
  name: string;
  value: string | number;
  unit: string;
  min?: number;
  max?: number;
  writable: boolean;
  category: string;
}

export class VehicleModulesService {
  private vehicleProfile: VehicleProfile | null = null;

  constructor(private sendCommand: (command: string) => Promise<string>) {}

  setVehicleProfile(profile: VehicleProfile | null): void {
    this.vehicleProfile = profile;
  }

  // Scan all ECU modules in the vehicle
  async scanAllModules(): Promise<ModuleInfo[]> {
    const modules: ModuleInfo[] = [];
    
    // Common ECU addresses for most vehicles
    const ecuAddresses = [
      { id: 'engine', name: 'Engine Control Module', address: '01' },
      { id: 'transmission', name: 'Transmission Control', address: '02' },
      { id: 'abs', name: 'ABS/ESP Control', address: '03' },
      { id: 'airbag', name: 'Airbag System', address: '15' },
      { id: 'instrument', name: 'Instrument Cluster', address: '17' },
      { id: 'comfort', name: 'Comfort Control', address: '46' },
      { id: 'radio', name: 'Radio/Navigation', address: '56' },
      { id: 'climate', name: 'Climate Control', address: '08' },
      { id: 'lighting', name: 'Lighting Control', address: '09' },
      { id: 'parking', name: 'Parking Aid', address: '10' },
      { id: 'steering', name: 'Steering Wheel', address: '16' },
      { id: 'central_locking', name: 'Central Locking', address: '35' },
      { id: 'gateway', name: 'Gateway', address: '19' },
      { id: 'dpf', name: 'DPF Control', address: '18' },
      { id: 'fuel_pump', name: 'Fuel Pump Control', address: '67' }
    ];

    for (const ecu of ecuAddresses) {
      try {
        // Try to communicate with ECU
        const response = await this.sendCommand(`1${ecu.address}0100`);
        
        if (response && !response.includes('NO DATA') && !response.includes('ERROR')) {
          modules.push({
            id: ecu.id,
            name: ecu.name,
            ecuAddress: ecu.address,
            supported: true,
            status: 'ok'
          });
        }
      } catch (error) {
        modules.push({
          id: ecu.id,
          name: ecu.name,
          ecuAddress: ecu.address,
          supported: false,
          status: 'unknown'
        });
      }
    }

    return modules;
  }

  // Read real odometer from instrument cluster
  async getRealOdometer(): Promise<number> {
    try {
      // Try multiple methods to read odometer
      const commands = ['221A0C', '2121A0', '1A0C'];
      
      for (const cmd of commands) {
        try {
          const response = await this.sendCommand(cmd);
          if (response && !response.includes('NO DATA')) {
            // Parse odometer response (varies by vehicle)
            const data = response.replace(/\s/g, '');
            if (data.length >= 8) {
              const km = parseInt(data.substr(4, 6), 16);
              return km;
            }
          }
        } catch (e) {
          continue;
        }
      }
      
      throw new Error('Could not read odometer');
    } catch (error) {
      throw new Error(`Failed to read real odometer: ${error}`);
    }
  }

  // Test horn
  async testHorn(duration: number = 1000): Promise<void> {
    try {
      await this.sendCommand('3E00'); // Keep alive
      await this.sendCommand('2F1001'); // Activate horn
      setTimeout(async () => {
        await this.sendCommand('2F1000'); // Deactivate horn
      }, duration);
    } catch (error) {
      throw new Error(`Horn test failed: ${error}`);
    }
  }

  // Test wipers
  async testWipers(cycles: number = 3): Promise<void> {
    try {
      for (let i = 0; i < cycles; i++) {
        await this.sendCommand('2F2001'); // Wiper on
        await new Promise(resolve => setTimeout(resolve, 2000));
        await this.sendCommand('2F2000'); // Wiper off
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      throw new Error(`Wiper test failed: ${error}`);
    }
  }

  // Climate control test
  async testClimate(): Promise<{ temperature: number; fanSpeed: number; mode: string }> {
    try {
      const tempResponse = await this.sendCommand('221140');
      const fanResponse = await this.sendCommand('221141');
      const modeResponse = await this.sendCommand('221142');
      
      return {
        temperature: parseInt(tempResponse.substr(4, 2), 16) - 40,
        fanSpeed: parseInt(fanResponse.substr(4, 2), 16),
        mode: this.parseClimateMode(modeResponse.substr(4, 2))
      };
    } catch (error) {
      throw new Error(`Climate test failed: ${error}`);
    }
  }

  // EGR valve learning and condition
  async performEGRLearning(): Promise<{ success: boolean; position: number; condition: string }> {
    try {
      // Start EGR learning procedure
      await this.sendCommand('31010E');
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for learning
      
      // Read EGR position
      const positionResponse = await this.sendCommand('22110E');
      const position = parseInt(positionResponse.substr(4, 2), 16);
      
      // Determine condition
      let condition = 'Good';
      if (position < 10) condition = 'Stuck Closed';
      else if (position > 90) condition = 'Stuck Open';
      else if (position < 20 || position > 80) condition = 'Poor';
      
      return {
        success: true,
        position,
        condition
      };
    } catch (error) {
      throw new Error(`EGR learning failed: ${error}`);
    }
  }

  // Bulb testing
  async testAllBulbs(): Promise<{ [key: string]: boolean }> {
    const bulbTests = {
      headlights: '2F0901',
      taillights: '2F0902',
      brakelights: '2F0903',
      indicators_left: '2F0904',
      indicators_right: '2F0905',
      hazards: '2F0906',
      fog_front: '2F0907',
      fog_rear: '2F0908',
      reverse: '2F0909'
    };

    const results: { [key: string]: boolean } = {};

    for (const [bulb, command] of Object.entries(bulbTests)) {
      try {
        await this.sendCommand(command);
        await new Promise(resolve => setTimeout(resolve, 2000));
        await this.sendCommand(command.replace('01', '00')); // Turn off
        results[bulb] = true;
      } catch (error) {
        results[bulb] = false;
      }
    }

    return results;
  }

  // Battery and charging system test
  async testChargingSystem(): Promise<{ voltage: number; current: number; temperature: number; health: string }> {
    try {
      const voltageResp = await this.sendCommand('22F190');
      const currentResp = await this.sendCommand('22F191');
      const tempResp = await this.sendCommand('22F192');
      
      const voltage = parseInt(voltageResp.substr(4, 4), 16) / 1000;
      const current = parseInt(currentResp.substr(4, 4), 16) / 100;
      const temperature = parseInt(tempResp.substr(4, 2), 16) - 40;
      
      let health = 'Good';
      if (voltage < 12.0) health = 'Low';
      else if (voltage > 14.8) health = 'Overcharge';
      else if (temperature > 50) health = 'Hot';
      
      return { voltage, current, temperature, health };
    } catch (error) {
      throw new Error(`Charging system test failed: ${error}`);
    }
  }

  // Fuel system pressure test
  async testFuelPressure(): Promise<{ pressure: number; status: string }> {
    try {
      const response = await this.sendCommand('22F194');
      const pressure = parseInt(response.substr(4, 4), 16) / 100; // Convert to bar
      
      let status = 'Normal';
      if (pressure < 3.0) status = 'Low Pressure';
      else if (pressure > 5.5) status = 'High Pressure';
      
      return { pressure, status };
    } catch (error) {
      throw new Error(`Fuel pressure test failed: ${error}`);
    }
  }

  private parseClimateMode(modeHex: string): string {
    const mode = parseInt(modeHex, 16);
    const modes = ['Off', 'Face', 'Feet', 'Mix', 'Defrost', 'Auto'];
    return modes[mode] || 'Unknown';
  }
}
