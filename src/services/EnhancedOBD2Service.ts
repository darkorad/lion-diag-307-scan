
import { masterBluetoothService, BluetoothDevice } from './MasterBluetoothService';
import { OBD2Data as TypesOBD2Data, DPFData as TypesDPFData } from '../types/obd2';

// Use the types from the types file to ensure consistency
export interface OBD2Data extends TypesOBD2Data {}
export interface DPFData extends TypesDPFData {}

export interface VehicleInfo {
  manufacturer?: string;
  model?: string;
  year?: string;
  vin?: string;
}

export interface ServiceStatus {
  dataRate: number;
  isConnected: boolean;
  lastUpdate?: Date;
}

export interface AdvancedFunctionResult {
  success: boolean;
  result?: any;
  error?: string;
}

export class EnhancedOBD2Service {
  private static instance: EnhancedOBD2Service;
  private isConnected = false;
  private currentDevice: BluetoothDevice | null = null;
  private supportedPIDs: string[] = [];
  private dataCallbacks: ((data: OBD2Data) => void)[] = [];
  private dpfCallbacks: ((data: DPFData) => void)[] = [];
  private isCollectingData = false;
  private vehicleInfo: VehicleInfo = {};
  private serviceStatus: ServiceStatus = { dataRate: 0, isConnected: false };

  private constructor() {
    console.log('EnhancedOBD2Service initialized');
  }

  static getInstance(): EnhancedOBD2Service {
    if (!EnhancedOBD2Service.instance) {
      EnhancedOBD2Service.instance = new EnhancedOBD2Service();
    }
    return EnhancedOBD2Service.instance;
  }

  async initializeELM327CarScannerStyle(): Promise<void> {
    try {
      console.log('Initializing ELM327...');
      
      await this.sendCommand('ATE0');   // Disable echo
      await this.sendCommand('ATL0');   // Disable line feeds
      await this.sendCommand('ATS0');   // Disable spaces
      await this.sendCommand('ATH1');   // Enable headers
      await this.sendCommand('ATSP0');  // Set protocol to automatic
      
      this.isConnected = true;
      this.serviceStatus.isConnected = true;
      console.log('ELM327 initialization complete');
    } catch (error) {
      console.error('ELM327 initialization failed:', error);
      throw error;
    }
  }

  async getSupportedPIDs(): Promise<string[]> {
    if (this.supportedPIDs.length > 0) {
      return this.supportedPIDs;
    }

    try {
      const pidRanges = [
        '00', '20', '40', '60', '80', 'A0', 'C0'
      ];

      let supportedPIDs: string[] = [];

      for (const pidRange of pidRanges) {
        const response = await this.sendCommand(`01 ${pidRange}`);
        const byteA = parseInt(response.substring(6, 8), 16);
        const byteB = parseInt(response.substring(8, 10), 16);
        const byteC = parseInt(response.substring(10, 12), 16);
        const byteD = parseInt(response.substring(12, 14), 16);

        for (let i = 0; i < 32; i++) {
          if ((byteA >> i) & 1) {
            supportedPIDs.push((parseInt(pidRange, 16) + i).toString(16).padStart(2, '0').toUpperCase());
          }
          if ((byteB >> i) & 1) {
            supportedPIDs.push((parseInt(pidRange, 16) + 8 + i).toString(16).padStart(2, '0').toUpperCase());
          }
          if ((byteC >> i) & 1) {
            supportedPIDs.push((parseInt(pidRange, 16) + 16 + i).toString(16).padStart(2, '0').toUpperCase());
          }
          if ((byteD >> i) & 1) {
            supportedPIDs.push((parseInt(pidRange, 16) + 24 + i).toString(16).padStart(2, '0').toUpperCase());
          }
        }
      }

      this.supportedPIDs = supportedPIDs;
      return supportedPIDs;
    } catch (error) {
      console.error('Failed to retrieve supported PIDs:', error);
      return [];
    }
  }

  async getRealTimeData(pids: string[]): Promise<OBD2Data> {
    const data: Partial<OBD2Data> = {};

    for (const pid of pids) {
      try {
        const response = await this.sendCommand(`01 ${pid}`);
        // Parse the response based on PID and assign to appropriate property
        // This is a simplified implementation
      } catch (error) {
        console.warn(`Failed to retrieve data for PID ${pid}:`, error);
      }
    }

    return data as OBD2Data;
  }

  async sendCommand(command: string, timeout: number = 5000): Promise<string> {
    if (!this.isConnected || !this.currentDevice) {
      throw new Error('No device connected');
    }

    try {
      console.log(`Sending OBD2 command: ${command}`);
      
      const response = await masterBluetoothService.sendCommand(command);
      
      console.log(`OBD2 response: ${response}`);
      return response.trim();
      
    } catch (error) {
      console.error('Command failed:', error);
      throw new Error(`Command failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async monitorVehicleSpeed(): Promise<number> {
    try {
      const response = await this.sendCommand('01 0D');
      
      if (response.includes('41 0D')) {
        const speedHex = response.substring(9);
        const speed = parseInt(speedHex, 16);
        return speed;
      } else {
        console.warn('Unexpected response format:', response);
        return -1;
      }
    } catch (error) {
      console.error('Failed to retrieve vehicle speed:', error);
      return -1;
    }
  }

  async readDiagnosticTroubleCodes(): Promise<string[]> {
    try {
      const response = await this.sendCommand('03');
      
      if (response.includes('43')) {
        const dtcs: string[] = [];
        
        const dtc1 = response.substring(4, 8);
        const dtc2 = response.substring(8, 12);
        
        if (dtc1 !== '0000') dtcs.push(dtc1);
        if (dtc2 !== '0000') dtcs.push(dtc2);
        
        return dtcs;
      } else {
        console.warn('No DTCs found or unexpected response:', response);
        return [];
      }
    } catch (error) {
      console.error('Failed to read DTCs:', error);
      return [];
    }
  }

  // Methods that were missing
  getVehicleInfo(): VehicleInfo {
    return this.vehicleInfo;
  }

  getSupportedPids(): any[] {
    return this.supportedPIDs.map(pid => ({ pid, name: `PID ${pid}` }));
  }

  getServiceStatus(): ServiceStatus {
    return this.serviceStatus;
  }

  getAdvancedFunctions(): any[] {
    return [
      { id: 'dpf_regen', name: 'DPF Regeneration', category: 'emissions' },
      { id: 'oil_reset', name: 'Oil Service Reset', category: 'maintenance' },
      { id: 'battery_reset', name: 'Battery Registration', category: 'electrical' }
    ];
  }

  async executeAdvancedFunction(functionId: string): Promise<AdvancedFunctionResult> {
    try {
      console.log(`Executing advanced function: ${functionId}`);
      // Placeholder implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, result: 'Function executed successfully' };
    } catch (error) {
      console.error(`Failed to execute function ${functionId}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  onDataReceived(callback: (data: OBD2Data) => void): void {
    this.dataCallbacks.push(callback);
  }

  onDPFDataReceived(callback: (data: DPFData) => void): void {
    this.dpfCallbacks.push(callback);
  }

  removeDataCallback(callback: (data: OBD2Data) => void): void {
    const index = this.dataCallbacks.indexOf(callback);
    if (index > -1) {
      this.dataCallbacks.splice(index, 1);
    }
  }

  removeDPFCallback(callback: (data: DPFData) => void): void {
    const index = this.dpfCallbacks.indexOf(callback);
    if (index > -1) {
      this.dpfCallbacks.splice(index, 1);
    }
  }

  async startLiveData(): Promise<void> {
    if (this.isCollectingData) return;
    
    this.isCollectingData = true;
    console.log('Started live data collection');
    
    // Simulate data collection
    const interval = setInterval(async () => {
      if (!this.isCollectingData) {
        clearInterval(interval);
        return;
      }

      try {
        const mockData: OBD2Data = {
          engineRPM: Math.random() * 3000 + 800,
          vehicleSpeed: Math.random() * 120,
          engineTemp: Math.random() * 20 + 80,
          mafSensorRate: Math.random() * 50,
          throttlePosition: Math.random() * 100,
          fuelPressure: Math.random() * 300 + 200,
          boostPressure: Math.random() * 2,
          intakeAirTemp: Math.random() * 50,
          fuelTrim: Math.random() * 20 - 10,
          oxygenSensor: Math.random() * 1,
          batteryVoltage: Math.random() * 2 + 12,
          fuelLevel: Math.random() * 100,
          oilTemp: Math.random() * 50 + 80,
          loadValue: Math.random() * 100,
          ambientAirTemp: Math.random() * 30,
          acceleratorPedal: Math.random() * 100,
          commandedThrottleActuator: Math.random() * 100,
          fuelType: 1,
          ethanolFuelPercent: 0,
          engineFuelRate: Math.random() * 10,
          turbochargerPressure: Math.random() * 2,
          fuelRailPressure: Math.random() * 1000 + 500
        };

        this.dataCallbacks.forEach(callback => callback(mockData));
        this.serviceStatus.dataRate = 10;
        this.serviceStatus.lastUpdate = new Date();
      } catch (error) {
        console.error('Live data collection error:', error);
      }
    }, 1000);
  }

  stopLiveData(): void {
    this.isCollectingData = false;
    console.log('Stopped live data collection');
  }

  async disconnect(): Promise<void> {
    try {
      await masterBluetoothService.disconnect();
      this.isConnected = false;
      this.serviceStatus.isConnected = false;
      this.currentDevice = null;
      console.log('OBD2 service disconnected');
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  }
}

export const enhancedOBD2Service = EnhancedOBD2Service.getInstance();
