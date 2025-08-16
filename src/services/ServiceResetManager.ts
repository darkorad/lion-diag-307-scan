
export interface ServiceResetFunction {
  id: string;
  name: string;
  description: string;
  category: 'maintenance' | 'calibration' | 'adaptation';
  vehicleSupport: string[];
  commands: string[];
  preconditions: string[];
  warningMessage?: string;
  estimatedTime: number; // in seconds
}

export class ServiceResetManager {
  private sendCommand: (command: string) => Promise<string>;

  constructor(sendCommandFn: (command: string) => Promise<string>) {
    this.sendCommand = sendCommandFn;
  }

  // Get all available service reset functions
  getAvailableResets(): ServiceResetFunction[] {
    return [
      {
        id: 'oil_service_reset',
        name: 'Oil Service Reset',
        description: 'Reset oil change service interval',
        category: 'maintenance',
        vehicleSupport: ['Peugeot', 'Citroen', 'Renault', 'Volkswagen', 'Audi', 'BMW'],
        commands: ['3101FF00', '2F1001', '3101FF01'],
        preconditions: ['Engine off', 'Ignition on', 'Vehicle stationary'],
        estimatedTime: 30
      },
      {
        id: 'service_inspection_reset',
        name: 'Service Inspection Reset',
        description: 'Reset general service inspection interval',
        category: 'maintenance',
        vehicleSupport: ['Volkswagen', 'Audi', 'Skoda', 'Seat'],
        commands: ['2C2001', '2E200100'],
        preconditions: ['Engine off', 'Ignition on'],
        estimatedTime: 20
      },
      {
        id: 'dpf_service_reset',
        name: 'DPF Service Reset',
        description: 'Reset DPF maintenance counter after filter replacement',
        category: 'maintenance',
        vehicleSupport: ['Peugeot', 'Citroen', 'Renault'],
        commands: ['2F40000', '2F40001'],
        preconditions: ['Engine off', 'DPF replaced'],
        warningMessage: 'Only perform after actual DPF replacement',
        estimatedTime: 45
      },
      {
        id: 'brake_pad_reset',
        name: 'Brake Pad Reset',
        description: 'Reset brake pad wear indicator',
        category: 'maintenance',
        vehicleSupport: ['BMW', 'Mercedes', 'Audi', 'Volkswagen'],
        commands: ['2F5001', '2F5002'],
        preconditions: ['New brake pads installed', 'Vehicle stationary'],
        estimatedTime: 25
      },
      {
        id: 'tire_pressure_reset',
        name: 'TPMS Reset',
        description: 'Reset tire pressure monitoring system',
        category: 'calibration',
        vehicleSupport: ['All makes'],
        commands: ['2F6501'],
        preconditions: ['Correct tire pressures set'],
        estimatedTime: 60
      },
      {
        id: 'steering_angle_calibration',
        name: 'Steering Angle Calibration',
        description: 'Calibrate steering angle sensor',
        category: 'calibration',
        vehicleSupport: ['Most makes'],
        commands: ['31010D', '2F1001', '31020D'],
        preconditions: ['Wheels centered', 'Vehicle on level surface'],
        warningMessage: 'Ensure wheels are perfectly centered',
        estimatedTime: 120
      },
      {
        id: 'throttle_adaptation',
        name: 'Throttle Body Adaptation',
        description: 'Adapt throttle body position after cleaning/replacement',
        category: 'adaptation',
        vehicleSupport: ['Most makes'],
        commands: ['31010B', '31020B'],
        preconditions: ['Engine warm', 'Throttle body clean'],
        estimatedTime: 90
      },
      {
        id: 'battery_registration',
        name: 'Battery Registration',
        description: 'Register new battery with energy management',
        category: 'adaptation',
        vehicleSupport: ['BMW', 'Mercedes', 'Audi', 'Volkswagen'],
        commands: ['2E2080', '2E2081'],
        preconditions: ['New battery installed', 'Battery type known'],
        warningMessage: 'Required for proper energy management',
        estimatedTime: 60
      },
      {
        id: 'sunroof_calibration',
        name: 'Sunroof Calibration',
        description: 'Calibrate sunroof position and limits',
        category: 'calibration',
        vehicleSupport: ['BMW', 'Mercedes', 'Audi', 'Volkswagen'],
        commands: ['2F7001', '2F7002', '2F7003'],
        preconditions: ['Sunroof mechanism clean', 'Battery voltage >12V'],
        estimatedTime: 180
      },
      {
        id: 'window_calibration',
        name: 'Window Calibration',
        description: 'Calibrate power window positions',
        category: 'calibration',
        vehicleSupport: ['Most makes'],
        commands: ['2F8001', '2F8002'],
        preconditions: ['Windows clean', 'Door panels installed'],
        estimatedTime: 120
      }
    ];
  }

  // Perform a specific service reset
  async performServiceReset(resetId: string, onProgress?: (step: string, progress: number) => void): Promise<boolean> {
    const reset = this.getAvailableResets().find(r => r.id === resetId);
    if (!reset) {
      throw new Error(`Service reset not found: ${resetId}`);
    }

    try {
      console.log(`Starting service reset: ${reset.name}`);
      
      if (onProgress) {
        onProgress('Initializing service reset...', 0);
      }

      // Execute commands with progress updates
      for (let i = 0; i < reset.commands.length; i++) {
        const command = reset.commands[i];
        const progress = Math.round(((i + 1) / reset.commands.length) * 100);
        
        if (onProgress) {
          onProgress(`Executing step ${i + 1}/${reset.commands.length}...`, progress);
        }

        await this.sendCommand(command);
        
        // Wait between commands
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      if (onProgress) {
        onProgress('Service reset completed successfully', 100);
      }

      console.log(`Service reset completed: ${reset.name}`);
      return true;
    } catch (error) {
      console.error(`Service reset failed: ${resetId}`, error);
      throw new Error(`Service reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get resets available for a specific vehicle make
  getResetsForVehicle(make: string): ServiceResetFunction[] {
    return this.getAvailableResets().filter(reset => 
      reset.vehicleSupport.includes(make) || reset.vehicleSupport.includes('All makes') || reset.vehicleSupport.includes('Most makes')
    );
  }

  // Validate preconditions for a reset
  validatePreconditions(resetId: string): { valid: boolean; missingConditions: string[] } {
    const reset = this.getAvailableResets().find(r => r.id === resetId);
    if (!reset) {
      return { valid: false, missingConditions: ['Service reset not found'] };
    }

    // In a real implementation, you would check actual vehicle conditions
    // For now, we'll return valid but show the preconditions to the user
    return {
      valid: true,
      missingConditions: [] // User should verify these conditions
    };
  }
}
