// src/services/DTCService.ts

import { obd2Service } from './OBD2Service';
import { OBD2_COMMANDS } from '../obd2/obd2-commands';

export interface DTC {
  code: string;
  description: string;
}

class DTCService {
  async getDTCs(): Promise<DTC[]> {
    try {
      const response = await obd2Service.sendCommandPublic(OBD2_COMMANDS.GET_DTC);
      return this.parseDTCs(response);
    } catch (error) {
      console.error('Failed to get DTCs:', error);
      throw error;
    }
  }

  async clearDTCs(): Promise<void> {
    try {
      await obd2Service.sendCommandPublic(OBD2_COMMANDS.CLEAR_DTC);
    } catch (error) {
      console.error('Failed to clear DTCs:', error);
      throw error;
    }
  }

  private parseDTCs(response: string): DTC[] {
    const dtcs: DTC[] = [];
    const lines = response.split('\r');

    for (const line of lines) {
      if (line.startsWith('43')) {
        const cleanedLine = line.replace('43', '').trim();
        for (let i = 0; i < cleanedLine.length; i += 4) {
          const dtc = cleanedLine.substring(i, i + 4);
          if (dtc !== '0000') {
            dtcs.push({
              code: this.formatDTC(dtc),
              description: this.getDTCDescription(dtc),
            });
          }
        }
      }
    }

    return dtcs;
  }

  private formatDTC(dtc: string): string {
    const firstChar = dtc.charAt(0);
    let prefix = '';

    switch (firstChar) {
      case '0':
      case '1':
      case '2':
      case '3':
        prefix = 'P'; // Powertrain
        break;
      case '4':
      case '5':
      case '6':
      case '7':
        prefix = 'C'; // Chassis
        break;
      case '8':
      case '9':
      case 'A':
      case 'B':
        prefix = 'B'; // Body
        break;
      case 'C':
      case 'D':
      case 'E':
      case 'F':
        prefix = 'U'; // Network
        break;
    }

    return prefix + dtc;
  }

  private getDTCDescription(dtc: string): string {
    // In a real application, this would look up the DTC in a comprehensive database.
    // For now, we'll just return a placeholder.
    return `Description for ${this.formatDTC(dtc)}`;
  }
}

export const dtcService = new DTCService();
