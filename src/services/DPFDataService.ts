
import { DPF_PIDS } from '@/constants/obd2Pids';
import { VehicleProfile } from '@/types/vehicle';
import { parseHexResponse } from '@/utils/obd2Utils';

export class DPFDataService {
  private vehicleProfile: VehicleProfile | null = null;

  constructor(private sendCommand: (command: string) => Promise<string>) {}

  setVehicleProfile(profile: VehicleProfile | null): void {
    this.vehicleProfile = profile;
  }

  async getDPFInletTemp(): Promise<number> {
    try {
      const pid = this.vehicleProfile?.pidMappings.DPF_INLET_TEMP || DPF_PIDS.DPF_INLET_TEMP;
      const response = await this.sendCommand(pid);
      const data = parseHexResponse(response);
      if (data.length >= 4) {
        return ((data[2] * 256) + data[3]) / 10;
      }
      throw new Error('Invalid DPF inlet temp response');
    } catch (error) {
      console.warn('DPF inlet temperature not available');
      return 450; // Default value
    }
  }

  async getDPFOutletTemp(): Promise<number> {
    try {
      const pid = this.vehicleProfile?.pidMappings.DPF_OUTLET_TEMP || DPF_PIDS.DPF_OUTLET_TEMP;
      const response = await this.sendCommand(pid);
      const data = parseHexResponse(response);
      if (data.length >= 4) {
        return ((data[2] * 256) + data[3]) / 10;
      }
      throw new Error('Invalid DPF outlet temp response');
    } catch (error) {
      console.warn('DPF outlet temperature not available');
      return 500; // Default value
    }
  }

  async getDPFDiffPressure(): Promise<number> {
    try {
      const pid = this.vehicleProfile?.pidMappings.DPF_DIFF_PRESSURE || DPF_PIDS.DPF_DIFF_PRESSURE;
      const response = await this.sendCommand(pid);
      const data = parseHexResponse(response);
      if (data.length >= 4) {
        return ((data[2] * 256) + data[3]) / 1000;
      }
      throw new Error('Invalid DPF pressure response');
    } catch (error) {
      console.warn('DPF differential pressure not available');
      return 5; // Default value
    }
  }

  async getDPFSootLoad(): Promise<number> {
    try {
      const pid = this.vehicleProfile?.pidMappings.DPF_SOOT_LOAD || DPF_PIDS.DPF_SOOT_LOAD;
      const response = await this.sendCommand(pid);
      const data = parseHexResponse(response);
      if (data.length >= 3) {
        return (data[2] * 100) / 255;
      }
      throw new Error('Invalid DPF soot load response');
    } catch (error) {
      console.warn('DPF soot load not available');
      return 15; // Default value
    }
  }
}
