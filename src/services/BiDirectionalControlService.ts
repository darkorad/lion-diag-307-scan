
import { enhancedBluetoothService } from '@/obd2/enhanced-bluetooth-service';

export interface ActuatorTest {
  id: string;
  name: string;
  component: string;
  category: 'engine' | 'transmission' | 'brake' | 'climate' | 'body' | 'electrical';
  command: string;
  duration?: number;
  parameters?: { [key: string]: any };
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
}

export interface BiDirectionalResult {
  success: boolean;
  message: string;
  data?: any;
  duration?: number;
}

export class BiDirectionalControlService {
  private isTestRunning = false;

  // Get available actuator tests for a specific vehicle
  getAvailableTests(make: string, model?: string): ActuatorTest[] {
    const commonTests: ActuatorTest[] = [
      {
        id: 'horn_test',
        name: 'Horn Test',
        component: 'Horn',
        category: 'body',
        command: '2F1001',
        duration: 2000,
        riskLevel: 'low',
        description: 'Test horn operation for specified duration'
      },
      {
        id: 'radiator_fan',
        name: 'Radiator Fan Test',
        component: 'Cooling Fan',
        category: 'engine',
        command: '2F1301',
        duration: 10000,
        riskLevel: 'medium',
        description: 'Activate radiator cooling fan'
      },
      {
        id: 'fuel_pump',
        name: 'Fuel Pump Test',
        component: 'Fuel Pump',
        category: 'engine',
        command: '2F1201',
        duration: 5000,
        riskLevel: 'medium',
        description: 'Test fuel pump operation'
      },
      {
        id: 'egr_valve',
        name: 'EGR Valve Test',
        component: 'EGR Valve',
        category: 'engine',
        command: '2F110E01',
        duration: 5000,
        riskLevel: 'medium',
        description: 'Test EGR valve actuation'
      },
      {
        id: 'ac_compressor',
        name: 'A/C Compressor',
        component: 'A/C Compressor',
        category: 'climate',
        command: '2F1401',
        duration: 8000,
        riskLevel: 'medium',
        description: 'Test A/C compressor clutch engagement'
      },
      {
        id: 'abs_pump',
        name: 'ABS Pump Test',
        component: 'ABS Pump',
        category: 'brake',
        command: '2F1501',
        duration: 3000,
        riskLevel: 'high',
        description: 'Test ABS hydraulic pump (vehicle must be stationary)'
      }
    ];

    // Add manufacturer-specific tests
    const manufacturerTests = this.getManufacturerSpecificTests(make);
    return [...commonTests, ...manufacturerTests];
  }

  // Execute actuator test
  async executeTest(test: ActuatorTest): Promise<BiDirectionalResult> {
    if (this.isTestRunning) {
      return {
        success: false,
        message: 'Another test is currently running'
      };
    }

    this.isTestRunning = true;
    const startTime = Date.now();

    try {
      console.log(`Starting ${test.name} test...`);
      
      // Send activation command
      const response = await enhancedBluetoothService.sendObdCommand(test.command);
      
      if (response.includes('NO DATA') || response.includes('ERROR')) {
        throw new Error('Test not supported or communication error');
      }

      // Wait for test duration if specified
      if (test.duration) {
        await new Promise(resolve => setTimeout(resolve, test.duration));
        
        // Send deactivation command
        const stopCommand = test.command.replace(/01$/, '00');
        await enhancedBluetoothService.sendObdCommand(stopCommand);
      }

      const duration = Date.now() - startTime;
      
      return {
        success: true,
        message: `${test.name} completed successfully`,
        data: response,
        duration
      };
    } catch (error) {
      return {
        success: false,
        message: `${test.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    } finally {
      this.isTestRunning = false;
    }
  }

  // Get manufacturer-specific tests
  private getManufacturerSpecificTests(make: string): ActuatorTest[] {
    const manufacturerTests: { [key: string]: ActuatorTest[] } = {
      'Volkswagen': [
        {
          id: 'vag_turbo_test',
          name: 'Turbo Wastegate Test',
          component: 'Turbocharger',
          category: 'engine',
          command: '2F1132',
          duration: 5000,
          riskLevel: 'medium',
          description: 'Test turbocharger wastegate operation'
        }
      ],
      'BMW': [
        {
          id: 'bmw_swirl_flaps',
          name: 'Swirl Flaps Test',
          component: 'Intake Flaps',
          category: 'engine',
          command: '2F1145',
          duration: 3000,
          riskLevel: 'medium',
          description: 'Test intake manifold swirl flaps'
        }
      ],
      'Mercedes-Benz': [
        {
          id: 'mb_glow_plugs',
          name: 'Glow Plugs Test',
          component: 'Glow Plugs',
          category: 'engine',
          command: '2F1167',
          duration: 10000,
          riskLevel: 'medium',
          description: 'Test glow plug operation (diesel engines)'
        }
      ]
    };

    return manufacturerTests[make] || [];
  }

  // Emergency stop all tests
  async emergencyStop(): Promise<void> {
    this.isTestRunning = false;
    try {
      // Send common stop commands
      const stopCommands = ['2F0000', '2F1000', '2F1100', '2F1200', '2F1300', '2F1400', '2F1500'];
      for (const cmd of stopCommands) {
        await enhancedBluetoothService.sendObdCommand(cmd);
      }
    } catch (error) {
      console.error('Emergency stop failed:', error);
    }
  }

  isRunning(): boolean {
    return this.isTestRunning;
  }
}

export const biDirectionalControlService = new BiDirectionalControlService();
