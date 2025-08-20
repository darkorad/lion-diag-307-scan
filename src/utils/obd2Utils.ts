
// OBD2 utility functions for parsing responses and managing PIDs

export interface ParsedOBDResponse {
  value: number | string;
  unit: string;
}

// Parse OBD2 response based on PID
export const parseObdResponse = (pid: string, rawResponse: string): ParsedOBDResponse => {
  // Remove whitespace and convert to uppercase
  const cleanResponse = rawResponse.replace(/\s+/g, '').toUpperCase();
  
  // Extract hex values (remove PID echo and '>')
  const hexValues = cleanResponse.replace(pid.toUpperCase(), '').replace('>', '').trim();
  
  // Default response
  let result: ParsedOBDResponse = { value: 0, unit: '' };
  
  try {
    const bytes = hexValues.match(/.{1,2}/g) || [];
    const byteValues = bytes.map(byte => parseInt(byte, 16));
    
    switch (pid.toUpperCase()) {
      case '010C': // Engine RPM
        if (byteValues.length >= 2) {
          result = {
            value: ((byteValues[0] * 256) + byteValues[1]) / 4,
            unit: 'RPM'
          };
        }
        break;
        
      case '010D': // Vehicle Speed
        if (byteValues.length >= 1) {
          result = {
            value: byteValues[0],
            unit: 'km/h'
          };
        }
        break;
        
      case '0105': // Engine Coolant Temperature
        if (byteValues.length >= 1) {
          result = {
            value: byteValues[0] - 40,
            unit: '°C'
          };
        }
        break;
        
      case '0142': // Control Module Voltage
        if (byteValues.length >= 2) {
          result = {
            value: ((byteValues[0] * 256) + byteValues[1]) / 1000,
            unit: 'V'
          };
        }
        break;
        
      case '0104': // Engine Load
        if (byteValues.length >= 1) {
          result = {
            value: (byteValues[0] * 100) / 255,
            unit: '%'
          };
        }
        break;
        
      case '0110': // Mass Air Flow
        if (byteValues.length >= 2) {
          result = {
            value: ((byteValues[0] * 256) + byteValues[1]) / 100,
            unit: 'g/s'
          };
        }
        break;
        
      case '012F': // Fuel Level
        if (byteValues.length >= 1) {
          result = {
            value: (byteValues[0] * 100) / 255,
            unit: '%'
          };
        }
        break;
        
      default:
        result = {
          value: rawResponse,
          unit: 'raw'
        };
    }
  } catch (error) {
    console.error('Error parsing OBD response:', error);
    result = {
      value: rawResponse,
      unit: 'error'
    };
  }
  
  return result;
};

// Convert DTC hex code to readable format
export const formatDTCCode = (hexCode: string): string => {
  if (hexCode.length !== 4) return hexCode;
  
  const firstChar = parseInt(hexCode.charAt(0), 16);
  const secondChar = hexCode.charAt(1);
  const lastTwoChars = hexCode.substring(2);
  
  let prefix = '';
  switch (firstChar >> 2) {
    case 0: prefix = 'P'; break; // Powertrain
    case 1: prefix = 'C'; break; // Chassis
    case 2: prefix = 'B'; break; // Body
    case 3: prefix = 'U'; break; // Network
    default: prefix = 'P'; break;
  }
  
  return prefix + (firstChar & 0x03) + secondChar + lastTwoChars;
};

// Validate OBD2 PID format
export const isValidPID = (pid: string): boolean => {
  const cleanPid = pid.replace(/\s+/g, '').toUpperCase();
  return /^[0-9A-F]{4}$/.test(cleanPid);
};

// Get PID description
export const getPIDDescription = (pid: string): string => {
  const descriptions: Record<string, string> = {
    '010C': 'Engine RPM',
    '010D': 'Vehicle Speed',
    '0105': 'Engine Coolant Temperature',
    '0142': 'Control Module Voltage',
    '0104': 'Engine Load',
    '0110': 'Mass Air Flow',
    '012F': 'Fuel Level Input'
  };
  
  return descriptions[pid.toUpperCase()] || 'Unknown PID';
};
