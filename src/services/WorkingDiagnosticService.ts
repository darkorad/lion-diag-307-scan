
import { MANUFACTURER_PIDS } from '@/constants/manufacturerPIDs';

export interface ManufacturerPID {
  manufacturer: string;
  pid: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  minValue: number;
  maxValue: number;
  formula: (value: number) => number;
}

export interface DiagnosticResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface LivePIDData {
  pid: string;
  name: string;
  value: number | string;
  unit: string;
  timestamp: Date;
}

export interface DiagnosticFunction {
  id: string;
  name: string;
  description: string;
  type: 'actuator_test' | 'service_reset' | 'coding' | 'dpf_regen';
  category: string;
}

export class WorkingDiagnosticService {
  private static instance: WorkingDiagnosticService;

  static getInstance(): WorkingDiagnosticService {
    if (!WorkingDiagnosticService.instance) {
      WorkingDiagnosticService.instance = new WorkingDiagnosticService();
    }
    return WorkingDiagnosticService.instance;
  }

  getManufacturerPids(manufacturer: string, maxCount: number = 20): ManufacturerPID[] {
    const manufacturerPids: ManufacturerPID[] = [...MANUFACTURER_PIDS].filter(
      pid => pid.manufacturer.toLowerCase() === manufacturer.toLowerCase()
    );
    
    const availablePids: ManufacturerPID[] = manufacturerPids.slice(0, maxCount);

    return availablePids;
  }

  getAvailableFunctions(manufacturer: string): DiagnosticFunction[] {
    const baseFunctions: DiagnosticFunction[] = [
      {
        id: 'actuator_fuel_pump',
        name: 'Fuel Pump Test',
        description: 'Test fuel pump operation',
        type: 'actuator_test',
        category: 'Engine'
      },
      {
        id: 'actuator_egr_valve',
        name: 'EGR Valve Test',
        description: 'Test EGR valve operation',
        type: 'actuator_test',
        category: 'Emissions'
      },
      {
        id: 'service_oil_reset',
        name: 'Oil Service Reset',
        description: 'Reset oil service indicator',
        type: 'service_reset',
        category: 'Service'
      },
      {
        id: 'dpf_regen',
        name: 'DPF Regeneration',
        description: 'Force DPF regeneration cycle',
        type: 'dpf_regen',
        category: 'Emissions'
      }
    ];

    // Add manufacturer-specific functions
    if (manufacturer.toLowerCase() === 'peugeot') {
      baseFunctions.push({
        id: 'service_bsi_reset',
        name: 'BSI Reset',
        description: 'Reset Body System Interface',
        type: 'service_reset',
        category: 'Body'
      });
    }

    return baseFunctions;
  }

  async readDTCs(): Promise<DiagnosticResult> {
    // Simulate reading DTCs
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      data: [
        {
          code: 'P0171',
          description: 'System Too Lean (Bank 1)',
          severity: 'medium',
          symptoms: ['Poor fuel economy', 'Rough idle'],
          possibleCauses: ['Vacuum leak', 'Dirty MAF sensor'],
          estimatedCost: '$50-200'
        }
      ]
    };
  }

  async clearDTCs(): Promise<DiagnosticResult> {
    // Simulate clearing DTCs
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: { message: 'DTCs cleared successfully' }
    };
  }

  async readLivePID(pid: string, manufacturer: string): Promise<LivePIDData | null> {
    // Simulate reading live PID data
    const pidInfo = MANUFACTURER_PIDS.find(p => p.pid === pid);
    
    if (!pidInfo) return null;

    // Generate realistic test data
    const rawValue = Math.random() * (pidInfo.maxValue - pidInfo.minValue) + pidInfo.minValue;
    const processedValue = pidInfo.formula(rawValue);

    return {
      pid,
      name: pidInfo.name,
      value: Math.round(processedValue * 10) / 10,
      unit: pidInfo.unit,
      timestamp: new Date()
    };
  }

  async performActuatorTest(manufacturer: string, testType: string): Promise<DiagnosticResult> {
    // Simulate actuator test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      data: { message: `${testType} test completed successfully` }
    };
  }

  async performServiceReset(procedure: string): Promise<DiagnosticResult> {
    // Simulate service reset
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      data: { message: `${procedure} reset completed` }
    };
  }

  async performCoding(manufacturer: string, module: string, codingData: string): Promise<DiagnosticResult> {
    // Simulate coding operation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    if (!codingData || codingData.length < 4) {
      return {
        success: false,
        error: 'Invalid coding data'
      };
    }

    return {
      success: true,
      data: { message: `${module} coding applied successfully` }
    };
  }

  async performDPFRegeneration(): Promise<DiagnosticResult> {
    // Simulate DPF regeneration
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    return {
      success: true,
      data: { message: 'DPF regeneration completed' }
    };
  }
}

export const workingDiagnosticService = WorkingDiagnosticService.getInstance();
