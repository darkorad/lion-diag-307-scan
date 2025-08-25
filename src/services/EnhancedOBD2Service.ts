import { BluetoothDevice } from './bluetooth/types';
import { unifiedBluetoothService } from './UnifiedBluetoothService';

export class EnhancedOBD2Service {
  private static instance: EnhancedOBD2Service;
  
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
}

export const enhancedOBD2Service = EnhancedOBD2Service.getInstance();
