import { VehicleModule } from '@/types/vehicleModules';
import { unifiedBluetoothService } from './UnifiedBluetoothService';
import { ENHANCED_VEHICLE_MODULES } from '@/constants/enhancedVehicleDatabase';

export interface ScanResult {
  moduleId: string;
  moduleName: string;
  moduleAddress: string;
  status: 'found' | 'not_found' | 'error';
  dtcCount: number;
  dtcs: string[];
  supportedFunctions: string[];
  errorMessage?: string;
}

export interface FullSystemScanReport {
  timestamp: Date;
  vehicleInfo?: {
    make?: string;
    model?: string;
    year?: number;
    vin?: string;
  };
  modules: ScanResult[];
  summary: {
    totalModules: number;
    foundModules: number;
    errorModules: number;
    totalDTCs: number;
  };
}

export class SystemScanService {
  private static instance: SystemScanService;

  private constructor() {}

  public static getInstance(): SystemScanService {
    if (!SystemScanService.instance) {
      SystemScanService.instance = new SystemScanService();
    }
    return SystemScanService.instance;
  }

  /**
   * Perform a full system scan of all available modules
   */
  public async performFullSystemScan(): Promise<FullSystemScanReport> {
    const report: FullSystemScanReport = {
      timestamp: new Date(),
      modules: [],
      summary: {
        totalModules: 0,
        foundModules: 0,
        errorModules: 0,
        totalDTCs: 0
      }
    };

    // Get all modules to scan
    const modulesToScan = ENHANCED_VEHICLE_MODULES;
    report.summary.totalModules = modulesToScan.length;

    // Scan each module
    for (const module of modulesToScan) {
      try {
        const result = await this.scanModule(module);
        report.modules.push(result);
        
        if (result.status === 'found') {
          report.summary.foundModules++;
          report.summary.totalDTCs += result.dtcCount;
        } else if (result.status === 'error') {
          report.summary.errorModules++;
        }
      } catch (error) {
        const errorResult: ScanResult = {
          moduleId: module.id,
          moduleName: module.name,
          moduleAddress: module.ecuAddress || 'Unknown',
          status: 'error',
          dtcCount: 0,
          dtcs: [],
          supportedFunctions: [],
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        };
        report.modules.push(errorResult);
        report.summary.errorModules++;
      }
    }

    return report;
  }

  /**
   * Scan a specific module
   */
  private async scanModule(module: VehicleModule): Promise<ScanResult> {
    try {
      // Check if we're connected
      const connectionStatus = unifiedBluetoothService.getConnectionStatus();
      if (connectionStatus !== 'connected') {
        throw new Error('Not connected to OBD2 device');
      }

      // Try to communicate with the module
      // In a real implementation, we would send specific commands to check if the module exists
      // For now, we'll simulate based on common modules
      
      const commonModules = ['01', '02', '03', '08', '09', '15', '17'];
      const isCommonModule = module.ecuAddress && commonModules.includes(module.ecuAddress);
      
      if (isCommonModule) {
        // Simulate finding the module and reading DTCs
        const dtcCount = Math.floor(Math.random() * 5); // Random DTC count 0-4
        const dtcs: string[] = [];
        
        // Generate random DTCs if any
        for (let i = 0; i < dtcCount; i++) {
          const dtcTypes = ['P', 'C', 'B', 'U'];
          const type = dtcTypes[Math.floor(Math.random() * dtcTypes.length)];
          const code = `${type}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`;
          dtcs.push(code);
        }
        
        // Get supported functions (just the names for simplicity)
        const supportedFunctions = module.supportedFunctions.map(func => func.name);
        
        return {
          moduleId: module.id,
          moduleName: module.name,
          moduleAddress: module.ecuAddress || 'Unknown',
          status: 'found',
          dtcCount,
          dtcs,
          supportedFunctions
        };
      } else {
        // Module not found
        return {
          moduleId: module.id,
          moduleName: module.name,
          moduleAddress: module.ecuAddress || 'Unknown',
          status: 'not_found',
          dtcCount: 0,
          dtcs: [],
          supportedFunctions: []
        };
      }
    } catch (error) {
      return {
        moduleId: module.id,
        moduleName: module.name,
        moduleAddress: module.ecuAddress || 'Unknown',
        status: 'error',
        dtcCount: 0,
        dtcs: [],
        supportedFunctions: [],
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Export scan report to JSON
   */
  public exportReportToJSON(report: FullSystemScanReport): string {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Export scan report to text format
   */
  public exportReportToText(report: FullSystemScanReport): string {
    let text = `=== VEHICLE SYSTEM SCAN REPORT ===\n`;
    text += `Scan Date: ${report.timestamp.toLocaleString()}\n\n`;
    
    if (report.vehicleInfo) {
      text += `Vehicle Information:\n`;
      if (report.vehicleInfo.make) text += `  Make: ${report.vehicleInfo.make}\n`;
      if (report.vehicleInfo.model) text += `  Model: ${report.vehicleInfo.model}\n`;
      if (report.vehicleInfo.year) text += `  Year: ${report.vehicleInfo.year}\n`;
      if (report.vehicleInfo.vin) text += `  VIN: ${report.vehicleInfo.vin}\n`;
      text += `\n`;
    }
    
    text += `Scan Summary:\n`;
    text += `  Total Modules: ${report.summary.totalModules}\n`;
    text += `  Found Modules: ${report.summary.foundModules}\n`;
    text += `  Error Modules: ${report.summary.errorModules}\n`;
    text += `  Total DTCs: ${report.summary.totalDTCs}\n\n`;
    
    text += `Module Details:\n`;
    for (const module of report.modules) {
      text += `  ${module.moduleName} (${module.moduleAddress}):\n`;
      text += `    Status: ${module.status}\n`;
      text += `    DTC Count: ${module.dtcCount}\n`;
      
      if (module.dtcCount > 0) {
        text += `    DTCs: ${module.dtcs.join(', ')}\n`;
      }
      
      if (module.errorMessage) {
        text += `    Error: ${module.errorMessage}\n`;
      }
      
      text += `\n`;
    }
    
    return text;
  }

  /**
   * Get module by ID
   */
  public getModuleById(moduleId: string): VehicleModule | undefined {
    return ENHANCED_VEHICLE_MODULES.find(module => module.id === moduleId);
  }

  /**
   * Get modules by category
   */
  public getModulesByCategory(category: VehicleModule['category']): VehicleModule[] {
    return ENHANCED_VEHICLE_MODULES.filter(module => module.category === category);
  }
}

export const systemScanService = SystemScanService.getInstance();