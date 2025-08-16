
import { BluetoothDevice } from '@/services/MobileSafeBluetoothService';
import { mobileSafeBluetoothService } from '@/services/MobileSafeBluetoothService';

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
  private static instance: VehicleModulesService;
  private initialized = false;

  static getInstance(): VehicleModulesService {
    if (!VehicleModulesService.instance) {
      VehicleModulesService.instance = new VehicleModulesService();
    }
    return VehicleModulesService.instance;
  }

  private constructor() {}

  async initialize(): Promise<boolean> {
    try {
      if (this.initialized) {
        return true;
      }
      
      console.log('Initializing VehicleModulesService...');
      
      // Initialize mobile-safe bluetooth service
      await mobileSafeBluetoothService.initialize();
      
      this.initialized = true;
      console.log('VehicleModulesService initialized successfully');
      return true;
    } catch (error) {
      console.error('VehicleModulesService initialization failed:', error);
      return false;
    }
  }

  async scanAllModules(): Promise<ModuleInfo[]> {
    try {
      await this.initialize();
      
      const status = mobileSafeBluetoothService.getConnectionStatus();
      if (!status.isConnected) {
        throw new Error('Not connected to OBD2 device');
      }

      // Basic ECU addresses for scanning
      const basicModules: ModuleInfo[] = [
        {
          id: 'engine',
          name: 'Engine Control Module',
          ecuAddress: '01',
          supported: true,
          status: 'ok'
        },
        {
          id: 'transmission',
          name: 'Transmission Control',
          ecuAddress: '02',
          supported: false,
          status: 'unknown'
        },
        {
          id: 'abs',
          name: 'ABS Control Module',
          ecuAddress: '03',
          supported: true,
          status: 'ok'
        },
        {
          id: 'airbag',
          name: 'Airbag Control Module',
          ecuAddress: '15',
          supported: true,
          status: 'ok'
        }
      ];

      return basicModules;
    } catch (error) {
      console.error('Module scan failed:', error);
      throw error;
    }
  }

  async sendCommand(command: string): Promise<string> {
    try {
      const status = mobileSafeBluetoothService.getConnectionStatus();
      if (!status.isConnected) {
        throw new Error('Not connected to OBD2 device');
      }

      return await mobileSafeBluetoothService.sendCommand(command);
    } catch (error) {
      console.error('Command failed:', error);
      throw error;
    }
  }

  async readVehicleParameters(vehicleType: string): Promise<VehicleParameter[]> {
    try {
      await this.initialize();
      
      // Basic parameters for demonstration
      const parameters: VehicleParameter[] = [
        {
          id: 'engine_speed',
          name: 'Engine Speed',
          value: 0,
          unit: 'RPM',
          min: 0,
          max: 8000,
          writable: false,
          category: 'Engine'
        },
        {
          id: 'vehicle_speed',
          name: 'Vehicle Speed',
          value: 0,
          unit: 'km/h',
          min: 0,
          max: 250,
          writable: false,
          category: 'Vehicle'
        }
      ];

      return parameters;
    } catch (error) {
      console.error('Failed to read vehicle parameters:', error);
      throw error;
    }
  }

  getInitializationStatus(): boolean {
    return this.initialized;
  }
}

export const vehicleModulesService = VehicleModulesService.getInstance();
