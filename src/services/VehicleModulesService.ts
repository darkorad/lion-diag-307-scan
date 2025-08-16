
import { BluetoothDevice } from './MasterBluetoothService';
import { safeMasterBluetoothService } from './SafeMasterBluetoothService';

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
  private isInitialized = false;

  static getInstance(): VehicleModulesService {
    if (!VehicleModulesService.instance) {
      VehicleModulesService.instance = new VehicleModulesService();
    }
    return VehicleModulesService.instance;
  }

  private constructor() {}

  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;
      
      console.log('Initializing VehicleModulesService...');
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('VehicleModulesService initialization failed:', error);
      return false;
    }
  }

  async scanAllModules(): Promise<ModuleInfo[]> {
    try {
      await this.initialize();
      
      const status = safeMasterBluetoothService.getConnectionStatus();
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
      const status = safeMasterBluetoothService.getConnectionStatus();
      if (!status.isConnected) {
        throw new Error('Not connected to OBD2 device');
      }

      return await safeMasterBluetoothService.sendCommand(command);
    } catch (error) {
      console.error('Command failed:', error);
      throw error;
    }
  }
}

export const vehicleModulesService = VehicleModulesService.getInstance();
