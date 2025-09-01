
import { OBD2_PIDS, DPF_PIDS } from '@/constants/obd2Pids';

export interface ELM327Command {
  command: string;
  description: string;
  responsePattern?: RegExp;
  timeout?: number;
}

export interface PIDData {
  pid: string;
  value: number;
  unit: string;
  timestamp: number;
  raw: string;
}

export interface DTCInfo {
  code: string;
  description: string;
  status: 'current' | 'pending' | 'permanent';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class ProfessionalELM327Service {
  private static instance: ProfessionalELM327Service;
  private isInitialized = false;
  private elmVersion = '';
  private supportedProtocols: string[] = [];
  private vehicleProtocol = '';
  private commandQueue: ELM327Command[] = [];
  private isProcessingQueue = false;

  static getInstance(): ProfessionalELM327Service {
    if (!ProfessionalELM327Service.instance) {
      ProfessionalELM327Service.instance = new ProfessionalELM327Service();
    }
    return ProfessionalELM327Service.instance;
  }

  // Professional ELM327 initialization sequence
  async initializeELM327Professional(): Promise<boolean> {
    try {
      console.log('🚗 Starting professional ELM327 initialization...');
      
      // Reset and basic setup
      await this.sendCommand('ATZ', 'Reset ELM327', 3000);
      await this.delay(2000);
      
      // Get ELM327 version and capabilities
      const versionResponse = await this.sendCommand('ATI', 'Get ELM327 version');
      this.elmVersion = this.parseVersion(versionResponse);
      console.log(`ELM327 Version: ${this.elmVersion}`);
      
      // Professional configuration sequence
      const initCommands = [
        { cmd: 'ATE0', desc: 'Echo off' },
        { cmd: 'ATL1', desc: 'Line feeds on' },
        { cmd: 'ATS0', desc: 'Spaces off' },
        { cmd: 'ATH1', desc: 'Headers on' },
        { cmd: 'ATSP0', desc: 'Auto protocol selection' },
        { cmd: 'ATAT1', desc: 'Adaptive timing auto' },
        { cmd: 'ATST62', desc: 'Set timeout to 98*4ms' },
        { cmd: 'ATCAF0', desc: 'CAN Auto Format off' },
        { cmd: 'ATS1', desc: 'Print spaces' },
        { cmd: 'ATDP', desc: 'Describe current protocol' }
      ];

      for (const { cmd, desc } of initCommands) {
        try {
          const response = await this.sendCommand(cmd, desc);
          console.log(`✅ ${desc}: ${response}`);
          
          if (cmd === 'ATDP') {
            this.vehicleProtocol = response.trim();
          }
          
          await this.delay(200);
        } catch (error) {
          console.warn(`⚠️ ${desc} failed:`, error);
        }
      }

      // Test vehicle communication
      const testPid = await this.sendCommand('0100', 'Test PID support');
      if (testPid && !testPid.includes('NO DATA') && !testPid.includes('ERROR')) {
        console.log('✅ Vehicle communication established');
        this.isInitialized = true;
        return true;
      } else {
        throw new Error('Vehicle communication test failed');
      }
      
    } catch (error) {
      console.error('❌ ELM327 initialization failed:', error);
      this.isInitialized = false;
      return false;
    }
  }

  // Send raw ELM327 command with proper error handling
  private async sendCommand(command: string, description: string, timeout: number = 5000): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!window.bluetoothSerial) {
        reject(new Error('Bluetooth Serial not available'));
        return;
      }

      const timeoutId = setTimeout(() => {
        reject(new Error(`Command timeout: ${command}`));
      }, timeout);

      let responseData = '';
      let promptReceived = false;

      const onData = (data: string) => {
        responseData += data;
        console.log(`📡 Raw response for ${command}:`, data);
        
        // Check for ELM327 prompt or completion indicators
        if (data.includes('>') || data.includes('OK') || data.includes('ERROR') || 
            data.includes('NO DATA') || data.includes('UNABLE TO CONNECT')) {
          promptReceived = true;
          clearTimeout(timeoutId);
          window.bluetoothSerial.unsubscribe(() => {}, () => {});
          
          // Clean response
          const cleanResponse = responseData
            .replace(/>/g, '')
            .replace(/\r/g, '')
            .replace(/\n/g, ' ')
            .trim();
            
          resolve(cleanResponse);
        }
      };

      // Subscribe to incoming data
      window.bluetoothSerial.subscribe('\r', onData, (error) => {
        clearTimeout(timeoutId);
        reject(new Error(`Subscription error: ${error}`));
      });

      // Send command
      const formattedCommand = command.endsWith('\r') ? command : command + '\r';
      window.bluetoothSerial.write(formattedCommand, () => {
        console.log(`📤 Sent command: ${command} (${description})`);
      }, (error) => {
        clearTimeout(timeoutId);
        window.bluetoothSerial.unsubscribe(() => {}, () => {});
        reject(new Error(`Write error: ${error}`));
      });
    });
  }

  // Read standard OBD2 PID with professional parsing
  async readPID(pid: string): Promise<PIDData | null> {
    try {
      if (!this.isInitialized) {
        throw new Error('ELM327 not initialized');
      }

      const response = await this.sendCommand(pid, `Read PID ${pid}`);
      
      if (response.includes('NO DATA') || response.includes('ERROR')) {
        return null;
      }

      const parsedValue = this.parsePIDResponse(pid, response);
      
      return {
        pid,
        value: parsedValue.value,
        unit: parsedValue.unit,
        timestamp: Date.now(),
        raw: response
      };
      
    } catch (error) {
      console.error(`Failed to read PID ${pid}:`, error);
      return null;
    }
  }

  // Parse PID response based on standard formulas
  private parsePIDResponse(pid: string, response: string): { value: number; unit: string } {
    // Remove spaces and convert to bytes
    const cleanResponse = response.replace(/\s/g, '');
    const bytes: number[] = [];
    
    for (let i = 0; i < cleanResponse.length; i += 2) {
      const byte = cleanResponse.substr(i, 2);
      if (byte.length === 2) {
        bytes.push(parseInt(byte, 16));
      }
    }

    // Standard PID calculations
    switch (pid.toUpperCase()) {
      case '010C': // Engine RPM
        if (bytes.length >= 4) {
          const rpm = ((bytes[2] * 256) + bytes[3]) / 4;
          return { value: rpm, unit: 'rpm' };
        }
        break;
        
      case '010D': // Vehicle Speed
        if (bytes.length >= 3) {
          return { value: bytes[2], unit: 'km/h' };
        }
        break;
        
      case '0105': // Engine Coolant Temperature
        if (bytes.length >= 3) {
          const temp = bytes[2] - 40;
          return { value: temp, unit: '°C' };
        }
        break;
        
      case '0111': // Throttle Position
        if (bytes.length >= 3) {
          const throttle = (bytes[2] * 100) / 255;
          return { value: Math.round(throttle), unit: '%' };
        }
        break;
        
      case '0110': // MAF Air Flow Rate
        if (bytes.length >= 4) {
          const maf = ((bytes[2] * 256) + bytes[3]) / 100;
          return { value: maf, unit: 'g/s' };
        }
        break;
        
      case '012F': // Fuel Tank Level Input
        if (bytes.length >= 3) {
          const fuel = (bytes[2] * 100) / 255;
          return { value: Math.round(fuel), unit: '%' };
        }
        break;
    }

    return { value: 0, unit: 'unknown' };
  }

  // Read Diagnostic Trouble Codes
  async readDTCs(): Promise<DTCInfo[]> {
    try {
      const dtcs: DTCInfo[] = [];
      
      // Read current DTCs
      const currentResponse = await this.sendCommand('03', 'Read stored DTCs');
      const currentDTCs = this.parseDTCResponse(currentResponse, 'current');
      dtcs.push(...currentDTCs);
      
      // Read pending DTCs
      const pendingResponse = await this.sendCommand('07', 'Read pending DTCs');
      const pendingDTCs = this.parseDTCResponse(pendingResponse, 'pending');
      dtcs.push(...pendingDTCs);
      
      // Read permanent DTCs (if supported)
      try {
        const permanentResponse = await this.sendCommand('0A', 'Read permanent DTCs');
        const permanentDTCs = this.parseDTCResponse(permanentResponse, 'permanent');
        dtcs.push(...permanentDTCs);
      } catch (error) {
        console.log('Permanent DTCs not supported');
      }
      
      return dtcs;
      
    } catch (error) {
      console.error('Failed to read DTCs:', error);
      return [];
    }
  }

  // Parse DTC response
  private parseDTCResponse(response: string, status: 'current' | 'pending' | 'permanent'): DTCInfo[] {
    const dtcs: DTCInfo[] = [];
    
    if (response.includes('NO DATA') || response.includes('ERROR')) {
      return dtcs;
    }
    
    // Remove spaces and parse hex pairs
    const cleanResponse = response.replace(/\s/g, '');
    
    // Skip first 4 characters (service response), then parse DTCs in pairs
    for (let i = 4; i < cleanResponse.length; i += 4) {
      const dtcHex = cleanResponse.substr(i, 4);
      if (dtcHex.length === 4) {
        const dtcCode = this.hexToDTCCode(dtcHex);
        if (dtcCode !== 'P0000') {
          dtcs.push({
            code: dtcCode,
            description: this.getDTCDescription(dtcCode),
            status,
            severity: this.getDTCSeverity(dtcCode)
          });
        }
      }
    }
    
    return dtcs;
  }

  // Convert hex to DTC code
  private hexToDTCCode(hex: string): string {
    const firstByte = parseInt(hex.substr(0, 2), 16);
    const secondByte = parseInt(hex.substr(2, 2), 16);
    
    const systemMap = ['P', 'C', 'B', 'U'];
    const system = systemMap[(firstByte >> 6) & 0x03];
    
    const code = ((firstByte & 0x3F) << 8) | secondByte;
    
    return `${system}${code.toString().padStart(4, '0')}`;
  }

  // Get DTC description (simplified - in real app, use comprehensive database)
  private getDTCDescription(code: string): string {
    const descriptions: { [key: string]: string } = {
      'P0171': 'System Too Lean (Bank 1)',
      'P0172': 'System Too Rich (Bank 1)',
      'P0420': 'Catalyst System Efficiency Below Threshold (Bank 1)',
      'P0430': 'Catalyst System Efficiency Below Threshold (Bank 2)',
      'P0101': 'Mass or Volume Air Flow Circuit Range/Performance Problem',
      'P0300': 'Random/Multiple Cylinder Misfire Detected',
      'P0301': 'Cylinder 1 Misfire Detected',
      'P0302': 'Cylinder 2 Misfire Detected',
      'P0441': 'Evaporative Emission Control System Incorrect Purge Flow'
    };
    
    return descriptions[code] || 'Unknown trouble code';
  }

  // Get DTC severity
  private getDTCSeverity(code: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalCodes = ['P0300', 'P0301', 'P0302', 'P0303', 'P0304'];
    const highCodes = ['P0420', 'P0430', 'P0171', 'P0172'];
    const mediumCodes = ['P0101', 'P0441'];
    
    if (criticalCodes.includes(code)) return 'critical';
    if (highCodes.includes(code)) return 'high';
    if (mediumCodes.includes(code)) return 'medium';
    return 'low';
  }

  // Clear DTCs
  async clearDTCs(): Promise<boolean> {
    try {
      const response = await this.sendCommand('04', 'Clear DTCs');
      return !response.includes('ERROR');
    } catch (error) {
      console.error('Failed to clear DTCs:', error);
      return false;
    }
  }

  // Advanced bidirectional commands
  async performDPFRegeneration(): Promise<boolean> {
    try {
      console.log('🔥 Starting DPF regeneration process...');
      
      // This is a simplified example - real implementation would vary by manufacturer
      const commands = [
        '22F40C', // Read DPF status
        '2EF40C01', // Command DPF regeneration (example)
      ];
      
      for (const cmd of commands) {
        const response = await this.sendCommand(cmd, `DPF command: ${cmd}`);
        console.log(`DPF response: ${response}`);
      }
      
      return true;
    } catch (error) {
      console.error('DPF regeneration failed:', error);
      return false;
    }
  }

  // Utility methods
  private parseVersion(response: string): string {
    const match = response.match(/ELM327\s+v(\d+\.\d+)/i);
    return match ? match[1] : 'Unknown';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Getters
  isReady(): boolean {
    return this.isInitialized;
  }

  getELMVersion(): string {
    return this.elmVersion;
  }

  getVehicleProtocol(): string {
    return this.vehicleProtocol;
  }
}

export const professionalELM327Service = ProfessionalELM327Service.getInstance();
