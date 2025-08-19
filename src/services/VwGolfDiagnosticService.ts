import { obd2Service } from './OBD2Service';
import { VW_GOLF_PROFILES } from '../constants/vwGolfDatabase';
import { parseObdResponse } from '../utils/obd2Utils';

export class VwGolfDiagnosticService {
  constructor(private sendCommand: (command: string) => Promise<string>) {}

  async getBoostPressure(profileId: string): Promise<number | null> {
    const profile = VW_GOLF_PROFILES.find(p => p.id === profileId);
    if (!profile) {
      console.error('Vehicle profile not found');
      return null;
    }

    const pid = profile.pidMappings?.['BOOST_PRESSURE'];
    if (!pid) {
      console.error('PID for boost pressure not found in profile');
      return null;
    }

    try {
      const rawData = await this.sendCommand(pid);
      const parsed = parseObdResponse(pid, rawData);
      return parsed.value;
    } catch (error) {
      console.error('Failed to get boost pressure:', error);
      return null;
    }
  }
}

export const vwGolfDiagnosticService = new VwGolfDiagnosticService(
  async (command: string) => {
    return obd2Service.sendCommandPublic(command);
  }
);
