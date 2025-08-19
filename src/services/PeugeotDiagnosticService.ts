import { PEUGEOT_307_PROFILES } from '../constants/peugeot307Database';
import { obd2Service } from './OBD2Service';
import { parseObdResponse } from '../utils/obd2Utils';

export class PeugeotDiagnosticService {
  constructor(private sendCommand: (command: string) => Promise<string>) {}

  async getOilTemperature(profileId: string): Promise<number | null> {
    const profile = PEUGEOT_307_PROFILES.find(p => p.id === profileId);
    if (!profile) {
      console.error('Vehicle profile not found');
      return null;
    }

    const pid = profile.pidMappings?.['ENGINE_OIL_TEMP'];
    if (!pid) {
      console.error('PID for engine oil temperature not found in profile');
      return null;
    }

    try {
      const rawData = await this.sendCommand(pid);
      const parsed = parseObdResponse(pid, rawData);
      return parsed.value;
    } catch (error) {
      console.error('Failed to get oil temperature:', error);
      return null;
    }
  }

  async getDpfSootLoad(profileId: string): Promise<number | null> {
    const profile = PEUGEOT_307_PROFILES.find(p => p.id === profileId);
    if (!profile) {
      console.error('Vehicle profile not found');
      return null;
    }

    const pid = profile.pidMappings?.['DPF_SOOT_LOAD'];
    if (!pid) {
      console.error('PID for DPF soot load not found in profile');
      return null;
    }

    try {
      const rawData = await this.sendCommand(pid);
      const parsed = parseObdResponse(pid, rawData);
      return parsed.value;
    } catch (error) {
      console.error('Failed to get DPF soot load:', error);
      return null;
    }
  }
}

export const peugeotDiagnosticService = new PeugeotDiagnosticService(
  async (command: string) => {
    return obd2Service.sendCommandPublic(command);
  }
);
