
import { enhancedOBD2Service } from './EnhancedOBD2Service';
import { DELPHI_DPF_MONITORING } from '@/constants/delphiDS150E';

export interface DPFMonitoringData {
  inletTemperature: number;
  outletTemperature: number;
  differentialPressure: number;
  sootLoad: number;
  sootMass: number;
  ashLoad: number;
  exhaustTemp1: number;
  exhaustTemp2: number;
  regenerationStatus: number;
  regenerationStage: string;
  distanceLastRegen: number;
  timeLastRegen: number;
  regenCount: number;
  dpfEfficiency: number;
  cleanlinessPercentage: number;
  isRegenRequired: boolean;
  isRegenActive: boolean;
  isRegenBlocked: boolean;
}

export interface DPFRegenerationControl {
  canStartRegen: boolean;
  isRegenInProgress: boolean;
  currentStage: number;
  stageProgress: number;
  estimatedTimeRemaining: number;
  regenType: 'stationary' | 'driving' | 'forced';
  preconditionsMet: boolean;
  blockingFactors: string[];
}

export interface DPFServiceHistory {
  lastRegenDate: Date;
  lastServiceDate: Date;
  totalRegenCount: number;
  forcedRegenCount: number;
  serviceRegenCount: number;
  dpfReplacementDate?: Date;
  maintenanceWarnings: string[];
}

export class DelphiDPFService {
  private monitoringCallbacks: Set<(data: DPFMonitoringData) => void> = new Set();
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private regenControl: DPFRegenerationControl | null = null;

  constructor() {}

  // Start DPF monitoring with live data
  async startDPFMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log('DPF monitoring already active');
      return;
    }

    this.isMonitoring = true;
    console.log('Starting DPF live monitoring...');

    this.monitoringInterval = setInterval(async () => {
      try {
        const dpfData = await this.collectDPFData();
        this.notifyMonitoringCallbacks(dpfData);
      } catch (error) {
        console.error('DPF monitoring error:', error);
      }
    }, 2000); // Update every 2 seconds during monitoring
  }

  // Stop DPF monitoring
  stopDPFMonitoring(): void {
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    console.log('DPF monitoring stopped');
  }

  // Collect comprehensive DPF data
  private async collectDPFData(): Promise<DPFMonitoringData> {
    const data: Partial<DPFMonitoringData> = {};

    // Collect all DPF parameters
    for (const param of DELPHI_DPF_MONITORING.parameters) {
      try {
        const response = await enhancedOBD2Service.sendCommand(param.pid);
        const value = this.parseDPFResponse(param.pid, response);
        
        switch (param.name) {
          case 'DPF Inlet Temperature':
            data.inletTemperature = value;
            break;
          case 'DPF Outlet Temperature':
            data.outletTemperature = value;
            break;
          case 'DPF Differential Pressure':
            data.differentialPressure = value;
            break;
          case 'DPF Soot Load':
            data.sootLoad = value;
            break;
          case 'DPF Soot Mass':
            data.sootMass = value;
            break;
          case 'DPF Ash Load':
            data.ashLoad = value;
            break;
          case 'Exhaust Gas Temperature 1':
            data.exhaustTemp1 = value;
            break;
          case 'Exhaust Gas Temperature 2':
            data.exhaustTemp2 = value;
            break;
          case 'DPF Regeneration Status':
            data.regenerationStatus = value;
            break;
        }
      } catch (error) {
        console.warn(`Failed to read ${param.name}:`, error);
      }
    }

    // Get additional DPF info
    try {
      data.distanceLastRegen = await this.getDistanceLastRegen();
      data.timeLastRegen = await this.getTimeLastRegen();
      data.regenCount = await this.getRegenCount();
    } catch (error) {
      console.warn('Failed to get DPF history data:', error);
    }

    // Calculate derived values
    data.dpfEfficiency = this.calculateDPFEfficiency(data.sootLoad || 0, data.differentialPressure || 0);
    data.cleanlinessPercentage = this.calculateCleanlinessPercentage(data.sootLoad || 0, data.ashLoad || 0);
    data.isRegenRequired = this.isDPFRegenRequired(data.sootLoad || 0, data.differentialPressure || 0);
    data.isRegenActive = (data.regenerationStatus || 0) >= 2 && (data.regenerationStatus || 0) <= 4;
    data.isRegenBlocked = this.isDPFRegenBlocked(data);
    data.regenerationStage = this.getRegenerationStageDescription(data.regenerationStatus || 0);

    return data as DPFMonitoringData;
  }

  // Parse DPF-specific responses
  private parseDPFResponse(pid: string, response: string): number {
    try {
      const cleaned = response.replace(/\s/g, '');
      if (cleaned.includes('NODATA') || cleaned.includes('ERROR')) {
        return 0;
      }

      const bytes = cleaned.match(/.{2}/g);
      if (!bytes || bytes.length < 4) return 0;

      const A = parseInt(bytes[2], 16);
      const B = parseInt(bytes[3], 16);

      switch (pid) {
        case '22F604': // DPF Inlet Temperature
        case '22F605': // DPF Outlet Temperature
        case '221140': // Exhaust Temp 1
        case '221141': // Exhaust Temp 2
          return ((A * 256) + B) * 0.1 - 273.15; // Convert from Kelvin to Celsius
        case '22F602': // DPF Differential Pressure
          return ((A * 256) + B) * 0.1; // mbar
        case '22F603': // DPF Soot Load
          return (A * 100) / 255; // Percentage
        case '22F606': // DPF Soot Mass
          return ((A * 256) + B) * 0.1; // grams
        case '22F607': // DPF Ash Load
          return (A * 100) / 255; // Percentage
        case '22F608': // Regeneration Status
          return A; // Status code
        default:
          return A;
      }
    } catch (error) {
      return 0;
    }
  }

  // Get distance since last regeneration
  private async getDistanceLastRegen(): Promise<number> {
    try {
      const response = await enhancedOBD2Service.sendCommand('22F609');
      const bytes = response.replace(/\s/g, '').match(/.{2}/g);
      if (bytes && bytes.length >= 4) {
        const A = parseInt(bytes[2], 16);
        const B = parseInt(bytes[3], 16);
        return (A * 256) + B; // km
      }
    } catch (error) {
      console.warn('Failed to get distance last regen:', error);
    }
    return 0;
  }

  // Get time since last regeneration
  private async getTimeLastRegen(): Promise<number> {
    try {
      const response = await enhancedOBD2Service.sendCommand('22F60A');
      const bytes = response.replace(/\s/g, '').match(/.{2}/g);
      if (bytes && bytes.length >= 4) {
        const A = parseInt(bytes[2], 16);
        const B = parseInt(bytes[3], 16);
        return (A * 256) + B; // hours
      }
    } catch (error) {
      console.warn('Failed to get time last regen:', error);
    }
    return 0;
  }

  // Get total regeneration count
  private async getRegenCount(): Promise<number> {
    try {
      const response = await enhancedOBD2Service.sendCommand('22F60B');
      const bytes = response.replace(/\s/g, '').match(/.{2}/g);
      if (bytes && bytes.length >= 4) {
        const A = parseInt(bytes[2], 16);
        const B = parseInt(bytes[3], 16);
        return (A * 256) + B; // count
      }
    } catch (error) {
      console.warn('Failed to get regen count:', error);
    }
    return 0;
  }

  // Calculate DPF efficiency
  private calculateDPFEfficiency(sootLoad: number, pressure: number): number {
    // Simple efficiency calculation based on soot load and pressure
    const maxEfficiency = 100;
    const sootPenalty = (sootLoad / 100) * 40; // Up to 40% penalty for full soot
    const pressurePenalty = Math.min((pressure / 200) * 30, 30); // Up to 30% penalty for high pressure
    
    return Math.max(maxEfficiency - sootPenalty - pressurePenalty, 0);
  }

  // Calculate cleanliness percentage
  private calculateCleanlinessPercentage(sootLoad: number, ashLoad: number): number {
    const sootCleanliness = Math.max(100 - sootLoad, 0);
    const ashCleanliness = Math.max(100 - ashLoad, 0);
    
    // Weighted average (soot has more impact on immediate cleanliness)
    return (sootCleanliness * 0.7) + (ashCleanliness * 0.3);
  }

  // Check if DPF regeneration is required
  private isDPFRegenRequired(sootLoad: number, pressure: number): boolean {
    return sootLoad > 75 || pressure > 150;
  }

  // Check if DPF regeneration is blocked
  private isDPFRegenBlocked(data: Partial<DPFMonitoringData>): boolean {
    // Check for conditions that would block regeneration
    if ((data.inletTemperature || 0) < 200) return true; // Too cold
    if ((data.differentialPressure || 0) > 250) return true; // Too much pressure
    if ((data.ashLoad || 0) > 90) return true; // Too much ash
    
    return false;
  }

  // Get regeneration stage description
  private getRegenerationStageDescription(status: number): string {
    const stages = DELPHI_DPF_MONITORING.parameters.find(p => p.name === 'DPF Regeneration Status');
    return stages?.values?.[status] || 'Unknown';
  }

  // Start forced DPF regeneration
  async startForcedRegeneration(): Promise<{ success: boolean; message: string }> {
    try {
      // Check preconditions
      const data = await this.collectDPFData();
      if (data.isRegenBlocked) {
        return {
          success: false,
          message: 'Regeneration blocked - check engine temperature and DPF condition'
        };
      }

      // Send forced regeneration command
      await enhancedOBD2Service.sendCommand('31010F42');
      
      // Initialize regeneration control
      this.regenControl = {
        canStartRegen: false,
        isRegenInProgress: true,
        currentStage: 1,
        stageProgress: 0,
        estimatedTimeRemaining: 1320, // 22 minutes total
        regenType: 'forced',
        preconditionsMet: true,
        blockingFactors: []
      };

      return {
        success: true,
        message: 'Forced DPF regeneration started successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to start regeneration: ${error}`
      };
    }
  }

  // Start stationary DPF regeneration with monitoring
  async startStationaryRegeneration(): Promise<{ success: boolean; message: string }> {
    try {
      // Check preconditions for stationary regen
      const data = await this.collectDPFData();
      if (data.isRegenBlocked) {
        return {
          success: false,
          message: 'Stationary regeneration not possible - check blocking factors'
        };
      }

      // Send stationary regeneration command
      await enhancedOBD2Service.sendCommand('31011F42');
      
      // Initialize regeneration control
      this.regenControl = {
        canStartRegen: false,
        isRegenInProgress: true,
        currentStage: 1,
        stageProgress: 0,
        estimatedTimeRemaining: 1800, // 30 minutes for stationary
        regenType: 'stationary',
        preconditionsMet: true,
        blockingFactors: []
      };

      return {
        success: true,
        message: 'Stationary DPF regeneration started - keep engine running'
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to start stationary regeneration: ${error}`
      };
    }
  }

  // Stop DPF regeneration
  async stopRegeneration(): Promise<{ success: boolean; message: string }> {
    try {
      await enhancedOBD2Service.sendCommand('31020F42'); // Stop regen command
      
      if (this.regenControl) {
        this.regenControl.isRegenInProgress = false;
        this.regenControl = null;
      }

      return {
        success: true,
        message: 'DPF regeneration stopped'
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to stop regeneration: ${error}`
      };
    }
  }

  // Get regeneration control status
  getRegenerationControl(): DPFRegenerationControl | null {
    return this.regenControl;
  }

  // Callback management
  onMonitoringData(callback: (data: DPFMonitoringData) => void): void {
    this.monitoringCallbacks.add(callback);
  }

  removeMonitoringCallback(callback: (data: DPFMonitoringData) => void): void {
    this.monitoringCallbacks.delete(callback);
  }

  private notifyMonitoringCallbacks(data: DPFMonitoringData): void {
    this.monitoringCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('DPF monitoring callback error:', error);
      }
    });
  }

  // Get service recommendations based on DPF data
  getServiceRecommendations(data: DPFMonitoringData): string[] {
    const recommendations: string[] = [];

    if (data.sootLoad > 85) {
      recommendations.push('Critical: DPF regeneration required immediately');
    } else if (data.sootLoad > 75) {
      recommendations.push('Warning: Schedule DPF regeneration soon');
    }

    if (data.ashLoad > 90) {
      recommendations.push('Critical: DPF replacement required');
    } else if (data.ashLoad > 75) {
      recommendations.push('Warning: DPF approaching end of service life');
    }

    if (data.differentialPressure > 200) {
      recommendations.push('High DPF pressure - check for blockages');
    }

    if (data.dpfEfficiency < 50) {
      recommendations.push('Poor DPF efficiency - inspect DPF condition');
    }

    if (data.distanceLastRegen > 2000) {
      recommendations.push('Long distance since last regeneration - consider forced regen');
    }

    if (recommendations.length === 0) {
      recommendations.push('DPF condition good - continue normal operation');
    }

    return recommendations;
  }
}

export const delphiDPFService = new DelphiDPFService();
