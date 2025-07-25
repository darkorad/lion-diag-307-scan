
import { bluetoothConnectionManager } from './BluetoothConnectionManager';
import { masterBluetoothService } from './MasterBluetoothService';
import { VehicleDatabase } from './VehicleDatabase';
import { OBD2Data, DPFData } from '@/types/obd2';

export class EnhancedOBD2Service {
  private static instance: EnhancedOBD2Service;
  private isCollectingData = false;
  private dataCallbacks: Set<(data: OBD2Data) => void> = new Set();
  private dpfCallbacks: Set<(data: DPFData) => void> = new Set();
  private dataCollectionInterval: NodeJS.Timeout | null = null;
  private vehicleInfo: any = null;
  private supportedPids: any[] = [];
  private dataRate = 0;
  private lastDataCollection = 0;

  static getInstance(): EnhancedOBD2Service {
    if (!EnhancedOBD2Service.instance) {
      EnhancedOBD2Service.instance = new EnhancedOBD2Service();
    }
    return EnhancedOBD2Service.instance;
  }

  constructor() {
    // Initialize the connection manager
    bluetoothConnectionManager.initialize();
  }

  // Check if we're connected using the centralized manager
  isConnected(): boolean {
    return bluetoothConnectionManager.isConnected();
  }

  // Get connected device using the centralized manager
  getConnectedDevice() {
    return bluetoothConnectionManager.getConnectedDevice();
  }

  // Start live data collection
  async startLiveData(): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('No OBD2 device connected');
    }

    if (this.isCollectingData) {
      console.log('Data collection already active');
      return;
    }

    this.isCollectingData = true;
    console.log('Starting live data collection...');

    // Detect vehicle and get supported PIDs
    await this.detectVehicleAndPids();

    // Start data collection loop
    this.dataCollectionInterval = setInterval(async () => {
      try {
        await this.collectLiveData();
      } catch (error) {
        console.error('Data collection error:', error);
        // Don't stop collection for single errors, but log them
      }
    }, 1000); // Collect every second
  }

  // Stop live data collection
  stopLiveData(): void {
    this.isCollectingData = false;
    
    if (this.dataCollectionInterval) {
      clearInterval(this.dataCollectionInterval);
      this.dataCollectionInterval = null;
    }
    
    console.log('Live data collection stopped');
  }

  // Detect vehicle and supported PIDs
  private async detectVehicleAndPids(): Promise<void> {
    try {
      console.log('Detecting vehicle and supported PIDs...');
      
      // Get VIN for vehicle identification
      try {
        const vinData = await this.sendCommand('0902');
        if (vinData && !vinData.includes('NO DATA')) {
          const vin = this.parseVIN(vinData);
          if (vin) {
            // Simple vehicle info creation since VehicleDatabase methods don't exist
            this.vehicleInfo = {
              vin: vin,
              manufacturer: this.getManufacturerFromVIN(vin),
              model: 'Unknown',
              year: this.getYearFromVIN(vin)
            };
            console.log('Vehicle detected:', this.vehicleInfo);
          }
        }
      } catch (error) {
        console.warn('VIN detection failed:', error);
      }

      // Get supported PIDs
      const supportedPidRanges = ['0100', '0120', '0140', '0160', '0180', '01A0', '01C0'];
      
      for (const pidRange of supportedPidRanges) {
        try {
          const response = await this.sendCommand(pidRange);
          if (response && !response.includes('NO DATA')) {
            const pids = this.parseSupportedPids(pidRange, response);
            this.supportedPids.push(...pids);
          }
        } catch (error) {
          console.warn(`Failed to get PIDs for range ${pidRange}:`, error);
        }
      }

      console.log(`Detected ${this.supportedPids.length} supported PIDs`);
      
    } catch (error) {
      console.error('Vehicle detection failed:', error);
    }
  }

  // Helper method to get manufacturer from VIN
  private getManufacturerFromVIN(vin: string): string {
    const wmi = vin.substring(0, 3);
    // Simple mapping for common manufacturers
    const manufacturers: { [key: string]: string } = {
      'VF3': 'Peugeot',
      'VF7': 'Citroen',
      'WVW': 'Volkswagen',
      'WAU': 'Audi',
      'WBA': 'BMW',
      'WDD': 'Mercedes-Benz',
      'TMB': 'Skoda',
      'TRU': 'Audi',
      'VSS': 'SEAT'
    };
    return manufacturers[wmi] || 'Unknown';
  }

  // Helper method to get year from VIN
  private getYearFromVIN(vin: string): number {
    const yearCode = vin.charAt(9);
    const yearMap: { [key: string]: number } = {
      'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014,
      'F': 2015, 'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019,
      'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023, 'R': 2024
    };
    return yearMap[yearCode] || 2020;
  }

  // Get manufacturer-specific PIDs
  private getManufacturerSpecificPids(manufacturer: string): any {
    const pids: { [key: string]: any } = {
      'Peugeot': {
        turbochargerPressure: '221C50',
        fuelRailPressure: '221C60'
      },
      'Citroen': {
        turbochargerPressure: '221C50',
        fuelRailPressure: '221C60'
      },
      'Volkswagen': {
        turbochargerPressure: '221132',
        fuelRailPressure: '221133'
      }
    };
    return pids[manufacturer] || {};
  }

  // Collect live data from vehicle
  private async collectLiveData(): Promise<void> {
    if (!this.isConnected()) {
      this.stopLiveData();
      return;
    }

    const startTime = Date.now();
    const currentData: Partial<OBD2Data> = {};
    const currentDpfData: Partial<DPFData> = {};

    // Basic engine parameters
    const basicPids = [
      { pid: '010C', key: 'engineRPM' },
      { pid: '010D', key: 'vehicleSpeed' },
      { pid: '0105', key: 'engineTemp' },
      { pid: '010F', key: 'intakeAirTemp' },
      { pid: '0110', key: 'mafSensorRate' },
      { pid: '0111', key: 'throttlePosition' },
      { pid: '0114', key: 'oxygenSensor' },
      { pid: '012F', key: 'fuelLevel' },
      { pid: '0107', key: 'fuelTrim' },
      { pid: '0142', key: 'batteryVoltage' }
    ];

    // Advanced parameters if supported
    const advancedPids = [
      { pid: '015C', key: 'oilTemp' },
      { pid: '0133', key: 'loadValue' },
      { pid: '0146', key: 'ambientAirTemp' },
      { pid: '0149', key: 'acceleratorPedal' },
      { pid: '014C', key: 'commandedThrottleActuator' },
      { pid: '0151', key: 'fuelType' },
      { pid: '0152', key: 'ethanolFuelPercent' },
      { pid: '015E', key: 'engineFuelRate' }
    ];

    // Collect basic data
    for (const { pid, key } of basicPids) {
      if (this.isPidSupported(pid)) {
        try {
          const response = await this.sendCommand(pid);
          const value = this.parsePidResponse(pid, response);
          if (value !== null) {
            (currentData as any)[key] = value;
          }
        } catch (error) {
          console.warn(`Failed to get ${key}:`, error);
        }
      }
    }

    // Collect advanced data if vehicle supports it
    for (const { pid, key } of advancedPids) {
      if (this.isPidSupported(pid)) {
        try {
          const response = await this.sendCommand(pid);
          const value = this.parsePidResponse(pid, response);
          if (value !== null) {
            (currentData as any)[key] = value;
          }
        } catch (error) {
          console.warn(`Failed to get ${key}:`, error);
        }
      }
    }

    // Collect manufacturer-specific data if available
    if (this.vehicleInfo?.manufacturer) {
      const manufacturerPids = this.getManufacturerSpecificPids(this.vehicleInfo.manufacturer);
      
      // Get turbocharger pressure for turbocharged vehicles
      if (manufacturerPids.turbochargerPressure && this.isPidSupported(manufacturerPids.turbochargerPressure)) {
        try {
          const response = await this.sendCommand(manufacturerPids.turbochargerPressure);
          currentData.turbochargerPressure = this.parsePidResponse(manufacturerPids.turbochargerPressure, response);
        } catch (error) {
          console.warn('Failed to get turbo pressure:', error);
        }
      }

      // Get fuel rail pressure for diesel vehicles
      if (manufacturerPids.fuelRailPressure && this.isPidSupported(manufacturerPids.fuelRailPressure)) {
        try {
          const response = await this.sendCommand(manufacturerPids.fuelRailPressure);
          currentData.fuelPressure = this.parsePidResponse(manufacturerPids.fuelRailPressure, response);
        } catch (error) {
          console.warn('Failed to get fuel pressure:', error);
        }
      }

      // Collect DPF data for diesel vehicles
      await this.collectDPFData(currentDpfData);
    }

    // Calculate data rate
    const collectionTime = Date.now() - startTime;
    this.dataRate = collectionTime > 0 ? 1000 / collectionTime : 0;
    this.lastDataCollection = Date.now();

    // Notify callbacks if we have data
    if (Object.keys(currentData).length > 0) {
      this.dataCallbacks.forEach(callback => {
        try {
          callback(currentData as OBD2Data);
        } catch (error) {
          console.error('Data callback error:', error);
        }
      });
    }

    if (Object.keys(currentDpfData).length > 0) {
      this.dpfCallbacks.forEach(callback => {
        try {
          callback(currentDpfData as DPFData);
        } catch (error) {
          console.error('DPF callback error:', error);
        }
      });
    }
  }

  // Send command using the master bluetooth service - NOW PUBLIC
  public async sendCommand(command: string): Promise<string> {
    return await masterBluetoothService.sendCommand(command);
  }

  // Check if PID is supported
  private isPidSupported(pid: string): boolean {
    return this.supportedPids.some(p => p.pid === pid);
  }

  // Parse VIN from response
  private parseVIN(response: string): string | null {
    try {
      // Remove spaces and newlines
      const cleaned = response.replace(/\s/g, '');
      
      // VIN is typically 17 characters
      const vinMatch = cleaned.match(/[A-HJ-NPR-Z0-9]{17}/);
      return vinMatch ? vinMatch[0] : null;
    } catch (error) {
      return null;
    }
  }

  // Parse supported PIDs from response
  private parseSupportedPids(pidRange: string, response: string): any[] {
    const pids: any[] = [];
    try {
      // Implementation would parse the bitmap response
      // For now, return empty array
    } catch (error) {
      console.warn('Failed to parse supported PIDs:', error);
    }
    return pids;
  }

  // Parse PID response to actual value
  private parsePidResponse(pid: string, response: string): number | null {
    try {
      // Remove headers and clean response
      const cleaned = response.replace(/^[0-9A-F]{3}\s/, '').replace(/\s/g, '');
      
      if (cleaned.includes('NODATA') || cleaned.includes('ERROR')) {
        return null;
      }

      // Parse based on PID type
      const bytes = cleaned.match(/.{2}/g);
      if (!bytes || bytes.length < 2) return null;

      const A = parseInt(bytes[0], 16);
      const B = parseInt(bytes[1], 16);

      switch (pid) {
        case '010C': return (A * 256 + B) / 4; // RPM
        case '010D': return A; // Speed
        case '0105': return A - 40; // Coolant temp
        case '010F': return A - 40; // Intake air temp
        case '0110': return (A * 256 + B) / 100; // MAF
        case '0111': return A * 100 / 255; // Throttle position
        case '0114': return A / 200; // Oxygen sensor
        case '012F': return A * 100 / 255; // Fuel level
        case '0107': return (A - 128) * 100 / 128; // Fuel trim
        case '0142': return (A * 256 + B) / 1000; // Battery voltage
        case '015C': return A - 40; // Oil temp
        case '0133': return A * 100 / 255; // Load value
        case '0146': return A - 40; // Ambient air temp
        case '0149': return A * 100 / 255; // Accelerator pedal
        case '014C': return A * 100 / 255; // Commanded throttle
        case '0151': return A; // Fuel type
        case '0152': return A * 100 / 255; // Ethanol fuel percent
        case '015E': return (A * 256 + B) / 20; // Engine fuel rate
        default: return A;
      }
    } catch (error) {
      return null;
    }
  }

  // Collect DPF specific data
  private async collectDPFData(dpfData: Partial<DPFData>): Promise<void> {
    const dpfPids = [
      { pid: '2101', key: 'dpfInletTemperature' },
      { pid: '2102', key: 'dpfOutletTemperature' },
      { pid: '2103', key: 'dpfDifferentialPressure' },
      { pid: '2104', key: 'dpfSootLoadCalculated' },
      { pid: '2105', key: 'activeRegenStatus' }
    ];

    for (const { pid, key } of dpfPids) {
      try {
        const response = await this.sendCommand(pid);
        const value = this.parsePidResponse(pid, response);
        if (value !== null) {
          (dpfData as any)[key] = value;
        }
      } catch (error) {
        // DPF PIDs may not be supported on all vehicles
      }
    }
  }

  // Get advanced functions for universal panel
  public getAdvancedFunctions(): any[] {
    return [
      {
        id: 'dpf_regen',
        name: 'DPF Regeneration',
        description: 'Force DPF regeneration cycle',
        category: 'emissions',
        riskLevel: 'medium',
        parameters: {}
      },
      {
        id: 'egr_test',
        name: 'EGR Valve Test',
        description: 'Test EGR valve operation',
        category: 'emissions',
        riskLevel: 'low',
        parameters: {}
      }
    ];
  }

  // Execute advanced function
  public async executeAdvancedFunction(functionId: string, parameters?: any): Promise<any> {
    try {
      switch (functionId) {
        case 'dpf_regen':
          await this.sendCommand('31010F');
          return { success: true, result: 'DPF regeneration started' };
        case 'egr_test':
          await this.sendCommand('2F110E00');
          return { success: true, result: 'EGR test completed' };
        default:
          return { success: false, error: 'Unknown function' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Public methods for callbacks
  onDataReceived(callback: (data: OBD2Data) => void): void {
    this.dataCallbacks.add(callback);
  }

  removeDataCallback(callback: (data: OBD2Data) => void): void {
    this.dataCallbacks.delete(callback);
  }

  onDPFDataReceived(callback: (data: DPFData) => void): void {
    this.dpfCallbacks.add(callback);
  }

  removeDPFCallback(callback: (data: DPFData) => void): void {
    this.dpfCallbacks.delete(callback);
  }

  // Get service status
  getServiceStatus() {
    return {
      isCollecting: this.isCollectingData,
      dataRate: this.dataRate,
      lastUpdate: this.lastDataCollection,
      supportedPidsCount: this.supportedPids.length
    };
  }

  // Get vehicle info
  getVehicleInfo() {
    return this.vehicleInfo;
  }

  // Get supported PIDs
  getSupportedPids() {
    return this.supportedPids;
  }

  // Disconnect
  async disconnect(): Promise<void> {
    this.stopLiveData();
    await masterBluetoothService.disconnect();
  }
}

export const enhancedOBD2Service = EnhancedOBD2Service.getInstance();
