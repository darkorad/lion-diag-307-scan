
import { obd2Service } from './OBD2Service';
import { delay } from '@/utils/obd2Utils';

export interface LightStatus {
  mil: boolean; // Malfunction Indicator Light (Check Engine)
  abs: boolean;
  airbag: boolean;
  oilPressure: boolean;
  engineTemp: boolean;
  battery: boolean;
  fuelLevel: boolean;
  turnSignalLeft: boolean;
  turnSignalRight: boolean;
  highBeam: boolean;
  parkingBrake: boolean;
}

export interface DTCInfo {
  code: string;
  description: string;
  status: 'active' | 'pending' | 'permanent' | 'stored';
  category: 'engine' | 'transmission' | 'abs' | 'airbag' | 'body' | 'other';
}

export interface VehicleInfo {
  vin: string;
  ecuName: string;
  protocolName: string;
  supportedPids: string[];
  fuelType: string;
  emissionStandard: string;
}

export interface ReadinessStatus {
  misfire: boolean;
  fuelSystem: boolean;
  components: boolean;
  catalyst: boolean;
  heatedCatalyst: boolean;
  evaporativeSystem: boolean;
  secondaryAirSystem: boolean;
  acRefrigerant: boolean;
  oxygenSensor: boolean;
  oxygenSensorHeater: boolean;
  egr: boolean;
  dpf: boolean;
}

class DiagnosticService {
  constructor() {}

  async getLightStatus(): Promise<LightStatus> {
    try {
      // Get MIL status and DTC count (PID 01)
      const response = await obd2Service['sendCommand']('0101');
      const data = this.parseHexResponse(response);
      
      if (data.length >= 6) {
        const milOn = (data[2] & 0x80) !== 0;
        const dtcCount = data[2] & 0x7F;
        
        // Simulate other lights based on various conditions
        return {
          mil: milOn,
          abs: false, // Would need manufacturer-specific PIDs
          airbag: false,
          oilPressure: false,
          engineTemp: false,
          battery: false,
          fuelLevel: false,
          turnSignalLeft: false,
          turnSignalRight: false,
          highBeam: false,
          parkingBrake: false
        };
      }
      
      throw new Error('Invalid light status response');
    } catch (error) {
      console.error('Failed to get light status:', error);
      // Return default status
      return {
        mil: false,
        abs: false,
        airbag: false,
        oilPressure: false,
        engineTemp: false,
        battery: false,
        fuelLevel: false,
        turnSignalLeft: false,
        turnSignalRight: false,
        highBeam: false,
        parkingBrake: false
      };
    }
  }

  async getStoredDTCs(): Promise<DTCInfo[]> {
    try {
      const response = await obd2Service['sendCommand']('03');
      return this.parseDTCs(response, 'stored');
    } catch (error) {
      console.error('Failed to get stored DTCs:', error);
      return [];
    }
  }

  async getPendingDTCs(): Promise<DTCInfo[]> {
    try {
      const response = await obd2Service['sendCommand']('07');
      return this.parseDTCs(response, 'pending');
    } catch (error) {
      console.error('Failed to get pending DTCs:', error);
      return [];
    }
  }

  async getPermanentDTCs(): Promise<DTCInfo[]> {
    try {
      const response = await obd2Service['sendCommand']('0A');
      return this.parseDTCs(response, 'permanent');
    } catch (error) {
      console.error('Failed to get permanent DTCs:', error);
      return [];
    }
  }

  async clearDTCs(): Promise<boolean> {
    try {
      await obd2Service['sendCommand']('04');
      await delay(2000); // Wait for ECU to process
      return true;
    } catch (error) {
      console.error('Failed to clear DTCs:', error);
      return false;
    }
  }

  async getVehicleInfo(): Promise<VehicleInfo> {
    try {
      // Get VIN
      const vinResponse = await obd2Service['sendCommand']('0902');
      const vin = this.parseVIN(vinResponse);
      
      // Get ECU name
      const ecuResponse = await obd2Service['sendCommand']('090A');
      const ecuName = this.parseECUName(ecuResponse);
      
      // Get supported PIDs
      const pidsResponse = await obd2Service['sendCommand']('0100');
      const supportedPids = this.parseSupportedPIDs(pidsResponse);
      
      return {
        vin: vin || 'Not Available',
        ecuName: ecuName || 'Generic OBD2 ECU',
        protocolName: 'ISO 15765-4 (CAN)',
        supportedPids,
        fuelType: 'Diesel',
        emissionStandard: 'Euro 4'
      };
    } catch (error) {
      console.error('Failed to get vehicle info:', error);
      return {
        vin: 'Not Available',
        ecuName: 'Generic OBD2 ECU',
        protocolName: 'ISO 15765-4 (CAN)',
        supportedPids: [],
        fuelType: 'Unknown',
        emissionStandard: 'Unknown'
      };
    }
  }

  async getReadinessStatus(): Promise<ReadinessStatus> {
    try {
      const response = await obd2Service['sendCommand']('0101');
      const data = this.parseHexResponse(response);
      
      if (data.length >= 6) {
        const status1 = data[3];
        const status2 = data[4];
        
        return {
          misfire: (status1 & 0x01) === 0,
          fuelSystem: (status1 & 0x02) === 0,
          components: (status1 & 0x04) === 0,
          catalyst: (status2 & 0x01) === 0,
          heatedCatalyst: (status2 & 0x02) === 0,
          evaporativeSystem: (status2 & 0x04) === 0,
          secondaryAirSystem: (status2 & 0x08) === 0,
          acRefrigerant: (status2 & 0x10) === 0,
          oxygenSensor: (status2 & 0x20) === 0,
          oxygenSensorHeater: (status2 & 0x40) === 0,
          egr: (status2 & 0x80) === 0,
          dpf: true // Assume ready for diesel vehicles
        };
      }
      
      throw new Error('Invalid readiness status response');
    } catch (error) {
      console.error('Failed to get readiness status:', error);
      return {
        misfire: true,
        fuelSystem: true,
        components: true,
        catalyst: true,
        heatedCatalyst: true,
        evaporativeSystem: true,
        secondaryAirSystem: true,
        acRefrigerant: true,
        oxygenSensor: true,
        oxygenSensorHeater: true,
        egr: true,
        dpf: true
      };
    }
  }

  async performActuatorTest(actuator: string): Promise<boolean> {
    try {
      // These would be manufacturer-specific commands
      switch (actuator) {
        case 'egr_valve':
          await obd2Service['sendCommand']('2F1234'); // Example command
          break;
        case 'fuel_pump':
          await obd2Service['sendCommand']('2F5678');
          break;
        case 'radiator_fan':
          await obd2Service['sendCommand']('2F9ABC');
          break;
        default:
          throw new Error('Unsupported actuator');
      }
      return true;
    } catch (error) {
      console.error('Actuator test failed:', error);
      return false;
    }
  }

  private parseHexResponse(response: string): number[] {
    const hex = response.replace(/\s+/g, '');
    const data: number[] = [];
    for (let i = 0; i < hex.length; i += 2) {
      data.push(parseInt(hex.substr(i, 2), 16));
    }
    return data;
  }

  private parseDTCs(response: string, status: DTCInfo['status']): DTCInfo[] {
    const data = this.parseHexResponse(response);
    const dtcs: DTCInfo[] = [];
    
    // Skip first byte (response code)
    for (let i = 1; i < data.length; i += 2) {
      if (i + 1 >= data.length) break;
      
      const byte1 = data[i];
      const byte2 = data[i + 1];
      
      if (byte1 === 0 && byte2 === 0) continue;
      
      const dtcCode = this.formatDTCCode(byte1, byte2);
      const description = this.getDTCDescription(dtcCode);
      const category = this.getDTCCategory(dtcCode);
      
      dtcs.push({
        code: dtcCode,
        description,
        status,
        category
      });
    }
    
    return dtcs;
  }

  private formatDTCCode(byte1: number, byte2: number): string {
    const firstChar = ['P', 'C', 'B', 'U'][(byte1 >> 6) & 0x03];
    const secondChar = ((byte1 >> 4) & 0x03).toString();
    const thirdChar = (byte1 & 0x0F).toString(16).toUpperCase();
    const lastTwoChars = byte2.toString(16).toUpperCase().padStart(2, '0');
    
    return `${firstChar}${secondChar}${thirdChar}${lastTwoChars}`;
  }

  private getDTCDescription(code: string): string {
    const descriptions: { [key: string]: string } = {
      'P0001': 'Fuel Volume Regulator Control Circuit/Open',
      'P0002': 'Fuel Volume Regulator Control Circuit Range/Performance',
      'P0003': 'Fuel Volume Regulator Control Circuit Low',
      'P0004': 'Fuel Volume Regulator Control Circuit High',
      'P0005': 'Fuel Shutoff Valve A Control Circuit/Open',
      'P0171': 'System Too Lean (Bank 1)',
      'P0172': 'System Too Rich (Bank 1)',
      'P0300': 'Random/Multiple Cylinder Misfire Detected',
      'P0301': 'Cylinder 1 Misfire Detected',
      'P0302': 'Cylinder 2 Misfire Detected',
      'P0303': 'Cylinder 3 Misfire Detected',
      'P0304': 'Cylinder 4 Misfire Detected',
      'P0420': 'Catalyst System Efficiency Below Threshold (Bank 1)',
      'P0430': 'Catalyst System Efficiency Below Threshold (Bank 2)',
      'P2002': 'Particulate Filter Efficiency Below Threshold (Bank 1)',
      'P2003': 'Particulate Filter Efficiency Below Threshold (Bank 2)'
    };
    
    return descriptions[code] || 'Unknown DTC - Consult service manual';
  }

  private getDTCCategory(code: string): DTCInfo['category'] {
    const prefix = code.charAt(0);
    const system = code.charAt(1);
    
    if (prefix === 'P') {
      if (system === '0' || system === '1') return 'engine';
      if (system === '2' || system === '3') return 'transmission';
    } else if (prefix === 'C') {
      return 'body';
    } else if (prefix === 'B') {
      return 'body';
    } else if (prefix === 'U') {
      return 'other';
    }
    
    return 'other';
  }

  private parseVIN(response: string): string {
    try {
      const data = this.parseHexResponse(response);
      // VIN parsing logic would go here
      return 'VF32ARHZE36******'; // Placeholder
    } catch {
      return 'Not Available';
    }
  }

  private parseECUName(response: string): string {
    try {
      const data = this.parseHexResponse(response);
      // ECU name parsing logic would go here
      return 'Bosch EDC16C34';
    } catch {
      return 'Generic OBD2 ECU';
    }
  }

  private parseSupportedPIDs(response: string): string[] {
    try {
      const data = this.parseHexResponse(response);
      const pids: string[] = [];
      
      if (data.length >= 6) {
        for (let i = 2; i < 6; i++) {
          const byte = data[i];
          for (let bit = 7; bit >= 0; bit--) {
            if ((byte & (1 << bit)) !== 0) {
              const pidNumber = ((i - 2) * 8) + (7 - bit) + 1;
              pids.push(`01${pidNumber.toString(16).toUpperCase().padStart(2, '0')}`);
            }
          }
        }
      }
      
      return pids;
    } catch {
      return [];
    }
  }
}

export const diagnosticService = new DiagnosticService();
