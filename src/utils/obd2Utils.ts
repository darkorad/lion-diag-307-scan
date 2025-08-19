
export const parseHexResponse = (response: string): number[] => {
  // Remove spaces and convert hex pairs to numbers
  const cleanResponse = response.replace(/\s+/g, '').replace(/[^0-9A-Fa-f]/g, '');
  const bytes: number[] = [];
  
  for (let i = 0; i < cleanResponse.length; i += 2) {
    const hexByte = cleanResponse.substring(i, i + 2);
    if (hexByte.length === 2) {
      bytes.push(parseInt(hexByte, 16));
    }
  }
  
  return bytes;
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const parseObdResponse = (pid: string, rawData: string): { value: any; unit: string } => {
  // Assuming the response is in the format "41 0C 1A B3"
  const bytes = parseHexResponse(rawData);

  // Expecting at least 3 bytes for a valid response (e.g., 41 0C 1A)
  if (bytes.length < 3 || bytes[0] !== 0x41) {
    // 0x41 is the response mode for "Show current data"
    throw new Error('Invalid or unsupported OBD2 response');
  }

  const returnedPid = bytes[1].toString(16).padStart(2, '0').toUpperCase();
  const expectedPidCode = pid.substring(2).toUpperCase();

  if (returnedPid !== expectedPidCode) {
    console.warn(`PID mismatch in response. Expected ${expectedPidCode}, got ${returnedPid}`);
    // Depending on strictness, you might want to throw an error here.
  }

  const data = bytes.slice(2); // Get the actual data bytes

  switch (pid.toUpperCase()) {
    case '010C': // Engine RPM
      // Formula: ((A * 256) + B) / 4
      return { value: ((data[0] * 256) + data[1]) / 4, unit: 'rpm' };
    case '010D': // Vehicle Speed
      // Formula: A
      return { value: data[0], unit: 'km/h' };
    case '0110': // MAF air flow rate
      // Formula: ((A * 256) + B) / 100
      return { value: ((data[0] * 256) + data[1]) / 100, unit: 'g/s' };
    case '0105': // Engine Coolant Temperature
      // Formula: A - 40
      return { value: data[0] - 40, unit: '°C' };
    case '0104': // Calculated Engine Load
      // Formula: A * 100 / 255
      return { value: data[0] * 100 / 255, unit: '%' };
    case '221C80': // Engine Oil Temperature
      // Formula: A*0.75-48
      return { value: data[0] * 0.75 - 48, unit: '°C' };
    case '221C34': // DPF Soot Load
      // Formula: (A*256+B)/100
      return { value: (data[0] * 256 + data[1]) / 100, unit: 'g' };
    case '015C': // Engine Oil Temperature
      // Formula: A-40
      return { value: data[0] - 40, unit: '°C' };
    case '22F603': // DPF Soot Mass (VAG)
      // Formula: (A*256+B)*0.1
      return { value: (data[0] * 256 + data[1]) * 0.1, unit: 'g' };
    default:
      // Return raw hex for unhandled PIDs
      return { value: data.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase(), unit: 'raw' };
  }
};
