
import { useState, useCallback } from 'react';
import { ObdPid } from './psa-pids';
import { enhancedBluetoothService as bluetoothService } from './enhanced-bluetooth-service';

export interface PidTestResult {
  raw: string;
  bytes: { [key: string]: number };
  vars: { [key: string]: number };
  value: number | string;
  error?: string;
}

export interface PidFetcherState {
  loading: boolean;
  result: PidTestResult | null;
  error: string | null;
}

export const useObdPidFetcher = () => {
  const [state, setState] = useState<PidFetcherState>({
    loading: false,
    result: null,
    error: null
  });

  const parseHexResponse = (response: string): number[] => {
    // Remove spaces and non-hex characters
    const cleanResponse = response.replace(/\s+/g, '').replace(/[^0-9A-Fa-f]/g, '');
    const bytes: number[] = [];
    
    for (let i = 0; i < cleanResponse.length; i += 2) {
      const hexByte = cleanResponse.substr(i, 2);
      if (hexByte.length === 2) {
        bytes.push(parseInt(hexByte, 16));
      }
    }
    
    return bytes;
  };

  const evaluateFormula = (formula: string, vars: { [key: string]: number }): number | string => {
    try {
      // Replace variables in formula
      let expression = formula;
      Object.keys(vars).forEach(varName => {
        const regex = new RegExp(`\\b${varName}\\b`, 'g');
        expression = expression.replace(regex, vars[varName].toString());
      });

      // Simple expression evaluator for basic math
      // This is a simplified version - in production you might want a proper expression parser
      const result = Function(`"use strict"; return (${expression})`)();
      
      return typeof result === 'number' ? Math.round(result * 100) / 100 : result;
    } catch (error) {
      console.error('Formula evaluation error:', error);
      return 'Error';
    }
  };

  const extractBytes = (responseBytes: number[], mode: string, pid: string): { [key: string]: number } => {
    const vars: { [key: string]: number } = {};
    
    // Skip the mode and PID echo in response
    let dataStartIndex = 0;
    
    if (mode === '01') {
      // Standard OBD2 response format: 41 [PID] [DATA...]
      dataStartIndex = 2;
    } else if (mode === '22') {
      // Mode 22 response format: 62 [PID_HIGH] [PID_LOW] [DATA...]
      dataStartIndex = 3;
    }

    // Extract data bytes as A, B, C, D, etc.
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = dataStartIndex; i < responseBytes.length && i - dataStartIndex < alphabet.length; i++) {
      const varName = alphabet[i - dataStartIndex];
      vars[varName] = responseBytes[i];
    }

    return vars;
  };

  const fetchPid = useCallback(async (pid: ObdPid): Promise<void> => {
    setState({ loading: true, result: null, error: null });

    try {
      // Check connection
      const connectionInfo = bluetoothService.getConnectionInfo();
      if (!connectionInfo.isConnected) {
        throw new Error('Not connected to Bluetooth device');
      }

      // Build command
      const command = pid.mode + pid.pid;
      console.log(`Sending OBD2 command: ${command}`);

      // Send command and get response
      const rawResponse = await bluetoothService.sendObdCommand(command);
      console.log(`Raw response: ${rawResponse}`);

      // Parse response
      const responseBytes = parseHexResponse(rawResponse);
      console.log(`Response bytes:`, responseBytes);

      // Extract variables from response
      const vars = extractBytes(responseBytes, pid.mode, pid.pid);
      console.log(`Extracted variables:`, vars);

      // Calculate final value
      const calculatedValue = evaluateFormula(pid.formula, vars);
      console.log(`Calculated value: ${calculatedValue}`);

      // Create byte labels for display
      const byteLabels: { [key: string]: number } = {};
      Object.keys(vars).forEach((key, index) => {
        byteLabels[`${key} (${responseBytes[index + (pid.mode === '01' ? 2 : 3)].toString(16).toUpperCase().padStart(2, '0')})`] = vars[key];
      });

      const result: PidTestResult = {
        raw: rawResponse,
        bytes: byteLabels,
        vars,
        value: calculatedValue
      };

      setState({ loading: false, result, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('PID fetch error:', errorMessage);
      setState({ loading: false, result: null, error: errorMessage });
    }
  }, []);

  return {
    ...state,
    fetchPid
  };
};
