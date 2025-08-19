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

export class WorkingDiagnosticService {
  private static instance: WorkingDiagnosticService;

  static getInstance(): WorkingDiagnosticService {
    if (!WorkingDiagnosticService.instance) {
      WorkingDiagnosticService.instance = new WorkingDiagnosticService();
    }
    return WorkingDiagnosticService.instance;
  }

  getManufacturerPids(manufacturer: string, maxCount: number = 20): ManufacturerPID[] {
    // Explicitly type the filtered array
    const manufacturerPids: ManufacturerPID[] = [...MANUFACTURER_PIDS].filter(
      pid => pid.manufacturer.toLowerCase() === manufacturer.toLowerCase()
    );
    
    const availablePids: ManufacturerPID[] = manufacturerPids.slice(0, maxCount);

    return availablePids;
  }
}

export const workingDiagnosticService = WorkingDiagnosticService.getInstance();
