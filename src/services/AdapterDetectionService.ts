
import { OBD2Adapter, AdapterDetectionResult } from '@/types/adapters';
import { OBD2_ADAPTERS } from '@/constants/adapterDatabase';

export class AdapterDetectionService {
  private sendCommand: (command: string) => Promise<string>;

  constructor(sendCommandFn: (command: string) => Promise<string>) {
    this.sendCommand = sendCommandFn;
  }

  async detectAdapter(): Promise<AdapterDetectionResult> {
    try {
      console.log('Starting adapter detection...');
      
      // Get adapter information
      const version = await this.getAdapterVersion();
      const protocol = await this.getCurrentProtocol();
      const features = await this.getAdapterFeatures();
      
      // Try to match with known adapters
      const adapter = this.matchAdapter(version, features);
      
      return {
        detected: !!adapter,
        adapter,
        connectionInfo: {
          protocol,
          version,
          features
        }
      };
    } catch (error) {
      console.error('Adapter detection failed:', error);
      return { detected: false };
    }
  }

  private async getAdapterVersion(): Promise<string> {
    try {
      // Try different version commands
      const commands = ['ATI', 'AT@1', 'ATZ'];
      
      for (const command of commands) {
        try {
          const response = await this.sendCommand(command);
          if (response && !response.includes('?') && !response.includes('NO DATA')) {
            return response.trim();
          }
        } catch (error) {
          continue;
        }
      }
      
      return 'Unknown';
    } catch (error) {
      return 'Unknown';
    }
  }

  private async getCurrentProtocol(): Promise<string> {
    try {
      const response = await this.sendCommand('ATDP');
      return response.trim();
    } catch (error) {
      return 'Unknown';
    }
  }

  private async getAdapterFeatures(): Promise<string[]> {
    const features: string[] = [];
    
    try {
      // Test various AT commands to determine features
      const testCommands = [
        { command: 'ATRV', feature: 'voltage_reading' },
        { command: 'ATMA', feature: 'monitor_all' },
        { command: 'ATMT', feature: 'monitor_timing' },
        { command: 'ATPPS', feature: 'programmable_parameters' },
        { command: 'ATCS', feature: 'can_status' },
        { command: 'ATCV', feature: 'calibration_voltage' }
      ];
      
      for (const test of testCommands) {
        try {
          const response = await this.sendCommand(test.command);
          if (response && !response.includes('?') && !response.includes('NO DATA')) {
            features.push(test.feature);
          }
        } catch (error) {
          continue;
        }
      }
    } catch (error) {
      console.warn('Feature detection failed:', error);
    }
    
    return features;
  }

  private matchAdapter(version: string, features: string[]): OBD2Adapter | undefined {
    // Try to match based on version string
    for (const adapter of OBD2_ADAPTERS) {
      if (adapter.autoDetectPatterns) {
        for (const pattern of adapter.autoDetectPatterns) {
          const regex = new RegExp(pattern, 'i');
          if (regex.test(version)) {
            return adapter;
          }
        }
      }
      
      // Match based on features
      if (adapter.capabilities) {
        let featureMatch = 0;
        const totalFeatures = Object.keys(adapter.capabilities).length;
        
        if (features.includes('voltage_reading') && adapter.capabilities.realTimeData) featureMatch++;
        if (features.includes('can_status') && adapter.capabilities.advancedDiagnostics) featureMatch++;
        if (features.includes('programmable_parameters') && adapter.capabilities.coding) featureMatch++;
        
        // If more than 50% features match
        if (featureMatch > totalFeatures * 0.5) {
          return adapter;
        }
      }
    }
    
    // Fallback to generic ELM327
    return OBD2_ADAPTERS.find(adapter => adapter.id === 'elm327-bt-v15');
  }

  // Auto-configure adapter for optimal performance
  async configureAdapter(adapter: OBD2Adapter): Promise<boolean> {
    try {
      console.log(`Configuring adapter: ${adapter.name}`);
      
      const configCommands = [
        'ATE0',    // Echo off
        'ATL0',    // Linefeeds off
        'ATS0',    // Spaces off
        'ATH1',    // Headers on
        'ATSP0',   // Set protocol to auto
        'ATDP',    // Display protocol
        'ATSTFF',  // Set all to default
        'ATFE',    // Forget events
        'ATWS'     // Warm start
      ];
      
      for (const command of configCommands) {
        try {
          await this.sendCommand(command);
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.warn(`Configuration command failed: ${command}`, error);
        }
      }
      
      console.log('Adapter configured successfully');
      return true;
    } catch (error) {
      console.error('Adapter configuration failed:', error);
      return false;
    }
  }
}
