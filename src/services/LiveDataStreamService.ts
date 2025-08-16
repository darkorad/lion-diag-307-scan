export interface LiveDataStream {
  id: string;
  name: string;
  unit: string;
  pid: string;
  category: 'engine' | 'fuel' | 'emission' | 'transmission' | 'climate' | 'electrical';
  formula?: (value: number) => number;
  isGraphable: boolean;
  normalRange?: { min: number; max: number };
  warningThresholds?: { low?: number; high?: number };
}

export interface StreamingSession {
  id: string;
  streams: LiveDataStream[];
  isActive: boolean;
  startTime: Date;
  sampleRate: number; // samples per second
  dataPoints: Map<string, Array<{ timestamp: Date; value: number }>>;
}

export class LiveDataStreamService {
  private sendCommand: (command: string) => Promise<string>;
  private activeSessions: Map<string, StreamingSession> = new Map();
  private streamingInterval: NodeJS.Timeout | null = null;

  constructor(sendCommandFn: (command: string) => Promise<string>) {
    this.sendCommand = sendCommandFn;
  }

  // Get all available live data streams
  getAvailableStreams(): LiveDataStream[] {
    return [
      // Engine parameters
      {
        id: 'engine_rpm',
        name: 'Engine RPM',
        unit: 'rpm',
        pid: '010C',
        category: 'engine',
        formula: (value) => ((value * 256) + value) / 4,
        isGraphable: true,
        normalRange: { min: 700, max: 6500 },
        warningThresholds: { high: 7000 }
      },
      {
        id: 'engine_temp',
        name: 'Engine Temperature',
        unit: '°C',
        pid: '0105',
        category: 'engine',
        formula: (value) => value - 40,
        isGraphable: true,
        normalRange: { min: 80, max: 105 },
        warningThresholds: { high: 110 }
      },
      {
        id: 'vehicle_speed',
        name: 'Vehicle Speed',
        unit: 'km/h',
        pid: '010D',
        category: 'engine',
        isGraphable: true,
        normalRange: { min: 0, max: 200 }
      },
      {
        id: 'throttle_position',
        name: 'Throttle Position',
        unit: '%',
        pid: '0111',
        category: 'engine',
        formula: (value) => (value * 100) / 255,
        isGraphable: true,
        normalRange: { min: 0, max: 100 }
      },
      {
        id: 'maf_rate',
        name: 'Mass Air Flow',
        unit: 'g/s',
        pid: '0110',
        category: 'engine',
        formula: (value) => ((value * 256) + value) / 100,
        isGraphable: true,
        normalRange: { min: 2, max: 400 }
      },
      
      // Fuel system
      {
        id: 'fuel_pressure',
        name: 'Fuel Pressure',
        unit: 'kPa',
        pid: '010A',
        category: 'fuel',
        formula: (value) => value * 3,
        isGraphable: true,
        normalRange: { min: 200, max: 600 }
      },
      {
        id: 'fuel_level',
        name: 'Fuel Level',
        unit: '%',
        pid: '012F',
        category: 'fuel',
        formula: (value) => (value * 100) / 255,
        isGraphable: true,
        normalRange: { min: 0, max: 100 },
        warningThresholds: { low: 15 }
      },
      {
        id: 'fuel_trim_st',
        name: 'Fuel Trim Short Term',
        unit: '%',
        pid: '0106',
        category: 'fuel',
        formula: (value) => (value - 128) * (100 / 128),
        isGraphable: true,
        normalRange: { min: -10, max: 10 },
        warningThresholds: { low: -25, high: 25 }
      },
      
      // Emissions
      {
        id: 'o2_sensor_1',
        name: 'O2 Sensor Bank 1',
        unit: 'V',
        pid: '0114',
        category: 'emission',
        formula: (value) => value / 200,
        isGraphable: true,
        normalRange: { min: 0.1, max: 0.9 }
      },
      
      // Advanced parameters (manufacturer specific)
      {
        id: 'turbo_pressure',
        name: 'Turbo Boost Pressure',
        unit: 'bar',
        pid: '2200', // Example manufacturer PID
        category: 'engine',
        formula: (value) => value / 100,
        isGraphable: true,
        normalRange: { min: -0.5, max: 2.5 }
      },
      {
        id: 'dpf_temp_inlet',
        name: 'DPF Inlet Temperature',
        unit: '°C',
        pid: '227C',
        category: 'emission',
        formula: (value) => value - 40,
        isGraphable: true,
        normalRange: { min: 200, max: 800 },
        warningThresholds: { high: 850 }
      },
      {
        id: 'egr_position',
        name: 'EGR Valve Position',
        unit: '%',
        pid: '2202',
        category: 'emission',
        formula: (value) => (value * 100) / 255,
        isGraphable: true,
        normalRange: { min: 0, max: 100 }
      }
    ];
  }

  // Start a new streaming session
  async startStreamingSession(
    streamIds: string[], 
    sampleRate: number = 1,
    onDataUpdate?: (sessionId: string, data: Map<string, number>) => void
  ): Promise<string> {
    const sessionId = `session_${Date.now()}`;
    const streams = this.getAvailableStreams().filter(s => streamIds.includes(s.id));
    
    const session: StreamingSession = {
      id: sessionId,
      streams,
      isActive: true,
      startTime: new Date(),
      sampleRate,
      dataPoints: new Map()
    };
    
    // Initialize data points arrays
    streams.forEach(stream => {
      session.dataPoints.set(stream.id, []);
    });
    
    this.activeSessions.set(sessionId, session);
    
    // Start data collection
    this.startDataCollection(sessionId, onDataUpdate);
    
    console.log(`Started streaming session: ${sessionId} with ${streams.length} streams`);
    return sessionId;
  }

  // Stop a streaming session
  stopStreamingSession(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;
    
    session.isActive = false;
    this.activeSessions.delete(sessionId);
    
    if (this.activeSessions.size === 0 && this.streamingInterval) {
      clearInterval(this.streamingInterval);
      this.streamingInterval = null;
    }
    
    console.log(`Stopped streaming session: ${sessionId}`);
    return true;
  }

  // Get session data
  getSessionData(sessionId: string): StreamingSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  // Get current values for all active streams
  getCurrentValues(sessionId: string): Map<string, number> | undefined {
    const session = this.activeSessions.get(sessionId);
    if (!session) return undefined;
    
    const currentValues = new Map<string, number>();
    
    session.streams.forEach(stream => {
      const dataPoints = session.dataPoints.get(stream.id);
      if (dataPoints && dataPoints.length > 0) {
        const latestPoint = dataPoints[dataPoints.length - 1];
        currentValues.set(stream.id, latestPoint.value);
      }
    });
    
    return currentValues;
  }

  // Start data collection for active sessions
  private startDataCollection(sessionId: string, onDataUpdate?: (sessionId: string, data: Map<string, number>) => void): void {
    if (this.streamingInterval) return; // Already running
    
    const interval = 1000; // Base interval of 1 second
    
    this.streamingInterval = setInterval(async () => {
      for (const [id, session] of this.activeSessions) {
        if (!session.isActive) continue;
        
        try {
          const currentData = new Map<string, number>();
          
          // Collect data for each stream in the session
          for (const stream of session.streams) {
            try {
              const rawValue = await this.readPID(stream.pid);
              const processedValue = stream.formula ? stream.formula(rawValue) : rawValue;
              
              // Store data point
              const dataPoints = session.dataPoints.get(stream.id) || [];
              dataPoints.push({
                timestamp: new Date(),
                value: processedValue
              });
              
              // Limit stored data points (keep last 1000 points)
              if (dataPoints.length > 1000) {
                dataPoints.splice(0, dataPoints.length - 1000);
              }
              
              session.dataPoints.set(stream.id, dataPoints);
              currentData.set(stream.id, processedValue);
              
            } catch (error) {
              console.warn(`Failed to read PID ${stream.pid}:`, error);
            }
          }
          
          // Notify callback with current data
          if (onDataUpdate && currentData.size > 0) {
            onDataUpdate(id, currentData);
          }
          
        } catch (error) {
          console.error(`Data collection error for session ${id}:`, error);
        }
      }
    }, interval);
  }

  // Read a single PID value
  private async readPID(pid: string): Promise<number> {
    try {
      const response = await this.sendCommand(pid);
      
      // Parse the response (simplified - real implementation would be more robust)
      const hexBytes = response.replace(/\s/g, '').replace(pid.substring(2), '');
      
      if (hexBytes.length >= 2) {
        return parseInt(hexBytes.substring(0, 2), 16);
      }
      
      return 0;
    } catch (error) {
      throw new Error(`Failed to read PID ${pid}: ${error}`);
    }
  }

  // Export session data
  exportSessionData(sessionId: string, format: 'csv' | 'json'): string {
    const session = this.activeSessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    
    if (format === 'csv') {
      let csv = 'Timestamp';
      session.streams.forEach(stream => {
        csv += `,${stream.name} (${stream.unit})`;
      });
      csv += '\n';
      
      // Find the maximum number of data points across all streams
      let maxPoints = 0;
      session.streams.forEach(stream => {
        const points = session.dataPoints.get(stream.id) || [];
        maxPoints = Math.max(maxPoints, points.length);
      });
      
      // Export data rows
      for (let i = 0; i < maxPoints; i++) {
        let row = '';
        let timestamp = '';
        
        session.streams.forEach((stream, index) => {
          const points = session.dataPoints.get(stream.id) || [];
          const point = points[i];
          
          if (index === 0 && point) {
            timestamp = point.timestamp.toISOString();
            row = timestamp;
          }
          
          row += `,${point ? point.value.toFixed(2) : ''}`;
        });
        
        if (timestamp) {
          csv += row + '\n';
        }
      }
      
      return csv;
    } else {
      // JSON format
      const exportData = {
        sessionId: session.id,
        startTime: session.startTime,
        streams: session.streams.map(stream => ({
          id: stream.id,
          name: stream.name,
          unit: stream.unit,
          data: session.dataPoints.get(stream.id) || []
        }))
      };
      
      return JSON.stringify(exportData, null, 2);
    }
  }
}
