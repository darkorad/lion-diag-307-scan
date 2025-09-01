
import { BluetoothDevice } from './bluetooth/types';
import { unifiedBluetoothService } from './UnifiedBluetoothService';
import { OBD2Data, DPFData } from '@/types/obd2';
import { errorLoggingService, ErrorCategory, ErrorSeverity } from './ErrorLoggingService';

export class EnhancedOBD2Service {
  private static instance: EnhancedOBD2Service;
  private dataCallbacks: Array<(data: OBD2Data) => void> = [];
  private dpfCallbacks: Array<(data: DPFData) => void> = [];
  private isLiveDataActive = false;
  
  static getInstance(): EnhancedOBD2Service {
    if (!EnhancedOBD2Service.instance) {
      EnhancedOBD2Service.instance = new EnhancedOBD2Service();
    }
    return EnhancedOBD2Service.instance;
  }

  async scanForDevices(): Promise<BluetoothDevice[]> {
    try {
      console.log('🔍 Enhanced OBD2 Service: Starting device scan...');
      
      // Use unified service for scanning - fixed parameter count
      const devices = await unifiedBluetoothService.scanForDevices();
      
      console.log(`✅ Enhanced OBD2 Service: Found ${devices.length} devices`);
      return devices;
      
    } catch (error) {
      console.error('❌ Enhanced OBD2 Service scan failed:', error);
      throw error;
    }
  }

  // Vehicle information methods
  getVehicleInfo(): any {
    return {
      manufacturer: 'Unknown',
      model: 'Unknown',
      vin: 'Not detected',
      year: null
    };
  }

  getSupportedPids(): any[] {
    return [];
  }

  getServiceStatus(): any {
    return {
      dataRate: 0,
      connected: false,
      lastUpdate: null
    };
  }

  // Advanced functions
  getAdvancedFunctions(): any[] {
    return [
      {
        id: 'oil_reset',
        name: 'Oil Service Reset',
        description: 'Reset oil service interval',
        category: 'service',
        riskLevel: 'low',
        requiresPin: false
      },
      {
        id: 'dpf_regen',
        name: 'DPF Regeneration',
        description: 'Force diesel particulate filter regeneration',
        category: 'emissions',
        riskLevel: 'medium',
        requiresPin: false
      }
    ];
  }

  async executeAdvancedFunction(functionId: string): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      console.log(`Executing advanced function: ${functionId}`);
      
      // Simulate function execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        success: true,
        result: `Function ${functionId} executed successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Communication methods
  private commandRetryCount = 0;
  private maxCommandRetries = 3;
  private commandTimeoutMs = 3000;

  async sendCommand(command: string): Promise<string> {
    try {
      console.log(`Sending command: ${command}`);
      
      // Check if we're connected before sending
      const connectedDevice = unifiedBluetoothService.getConnectedDevice();
      if (!connectedDevice) {
        throw new Error('No OBD2 device connected. Please connect to a device first.');
      }
      
      // Use the unified service to send the command with timeout
      const response = await unifiedBluetoothService.sendCommand(command, this.commandTimeoutMs);
      
      // Reset retry count on success
      this.commandRetryCount = 0;
      
      return response;
    } catch (error) {
      this.commandRetryCount++;
      
      // Provide specific error messages based on error type
      let errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('timeout')) {
        errorMessage = 'Command timed out. The OBD2 device is not responding.';
      } else if (errorMessage.includes('busy')) {
        errorMessage = 'OBD2 device is busy processing another command.';
      } else if (errorMessage.includes('NO DATA') || errorMessage.includes('?')) {
        errorMessage = 'The vehicle did not provide data for this command. This may not be supported by your vehicle.';
      }
      
      // Auto-retry for certain errors if we haven't exceeded max retries
      if (this.commandRetryCount <= this.maxCommandRetries && 
          (errorMessage.includes('timeout') || errorMessage.includes('busy'))) {
        console.log(`Retrying command (${this.commandRetryCount}/${this.maxCommandRetries})...`);
        return this.sendCommand(command);
      }
      
      // Reset retry count when we give up
      this.commandRetryCount = 0;
      throw new Error(`Command failed: ${errorMessage}`);
    }
  }

  // Live data methods
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
    console.log('Starting live data collection...');
    this.isLiveDataActive = true;
    
    // Simulate live data updates
    this.simulateLiveData();
  }

  stopLiveData(): void {
    console.log('Stopping live data collection...');
    this.isLiveDataActive = false;
  }

  private simulateLiveData(): void {
    if (!this.isLiveDataActive) return;

    // Simulate OBD2 data - using all required properties from OBD2Data interface
    const mockOBD2Data: OBD2Data = {
      engineRPM: Math.random() * 3000 + 800,
      vehicleSpeed: Math.random() * 120,
      engineTemp: Math.random() * 40 + 80,
      mafSensorRate: Math.random() * 100,
      throttlePosition: Math.random() * 100,
      fuelPressure: Math.random() * 200,
      boostPressure: Math.random() * 100,
      intakeAirTemp: Math.random() * 50 + 20,
      fuelTrim: Math.random() * 20 - 10,
      oxygenSensor: Math.random() * 5,
      batteryVoltage: Math.random() * 2 + 12,
      fuelLevel: Math.random() * 100,
      oilTemp: Math.random() * 50 + 60,
      loadValue: Math.random() * 100,
      ambientAirTemp: Math.random() * 40 + 10,
      acceleratorPedal: Math.random() * 100,
      commandedThrottleActuator: Math.random() * 100,
      fuelType: Math.floor(Math.random() * 10),
      ethanolFuelPercent: Math.random() * 100,
      engineFuelRate: Math.random() * 50,
      turbochargerPressure: Math.random() * 200,
      fuelRailPressure: Math.random() * 1000
    };

    // Simulate DPF data - using all required properties from DPFData interface
    const mockDPFData: DPFData = {
      sootLevel: Math.random() * 100,
      dpfInletTemperature: Math.random() * 200 + 300,
      dpfOutletTemperature: Math.random() * 200 + 350,
      dpfDifferentialPressure: Math.random() * 50,
      dpfSootLoadCalculated: Math.random() * 100,
      dpfSootLoadMeasured: Math.random() * 100,
      exhaustGasTemperature1: Math.random() * 400 + 200,
      exhaustGasTemperature2: Math.random() * 400 + 200,
      activeRegenStatus: Math.random() > 0.8,
      passiveRegenStatus: Math.random() > 0.7,
      dpfRegenRequest: Math.random() > 0.9
    };

    // Notify callbacks
    this.dataCallbacks.forEach(callback => callback(mockOBD2Data));
    this.dpfCallbacks.forEach(callback => callback(mockDPFData));

    // Continue simulation
    if (this.isLiveDataActive) {
      setTimeout(() => this.simulateLiveData(), 1000);
    }
  }
}

export const enhancedOBD2Service = EnhancedOBD2Service.getInstance();
