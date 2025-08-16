
export interface LogEntry {
  id: string;
  timestamp: Date;
  vehicleId: string;
  sessionId: string;
  data: Record<string, any>;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface DiagnosticSession {
  id: string;
  vehicleId: string;
  startTime: Date;
  endTime?: Date;
  totalDistance: number;
  averageSpeed: number;
  fuelConsumed: number;
  maxRPM: number;
  maxSpeed: number;
  entries: LogEntry[];
}

class DataLoggingService {
  private sessions: DiagnosticSession[] = [];
  private currentSession: DiagnosticSession | null = null;
  private isLogging = false;

  startSession(vehicleId: string): DiagnosticSession {
    const session: DiagnosticSession = {
      id: `session_${Date.now()}`,
      vehicleId,
      startTime: new Date(),
      totalDistance: 0,
      averageSpeed: 0,
      fuelConsumed: 0,
      maxRPM: 0,
      maxSpeed: 0,
      entries: []
    };

    this.currentSession = session;
    this.sessions.push(session);
    this.isLogging = true;
    
    console.log('Started logging session:', session.id);
    return session;
  }

  stopSession(): DiagnosticSession | null {
    if (this.currentSession) {
      this.currentSession.endTime = new Date();
      this.isLogging = false;
      console.log('Stopped logging session:', this.currentSession.id);
      return this.currentSession;
    }
    return null;
  }

  logData(data: Record<string, any>, location?: { latitude: number; longitude: number }): void {
    if (!this.currentSession || !this.isLogging) return;

    const entry: LogEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      vehicleId: this.currentSession.vehicleId,
      sessionId: this.currentSession.id,
      data,
      location
    };

    this.currentSession.entries.push(entry);
    this.updateSessionStats(data);
  }

  private updateSessionStats(data: Record<string, any>): void {
    if (!this.currentSession) return;

    if (data.vehicleSpeed && data.vehicleSpeed > this.currentSession.maxSpeed) {
      this.currentSession.maxSpeed = data.vehicleSpeed;
    }

    if (data.engineRPM && data.engineRPM > this.currentSession.maxRPM) {
      this.currentSession.maxRPM = data.engineRPM;
    }
  }

  exportSessionToCSV(sessionId: string): string {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) return '';

    const headers = ['Timestamp', 'RPM', 'Speed', 'Engine Temp', 'Throttle Position', 'Fuel Level'];
    const csvData = [headers.join(',')];

    session.entries.forEach(entry => {
      const row = [
        entry.timestamp.toISOString(),
        entry.data.engineRPM || '',
        entry.data.vehicleSpeed || '',
        entry.data.engineTemp || '',
        entry.data.throttlePosition || '',
        entry.data.fuelLevel || ''
      ];
      csvData.push(row.join(','));
    });

    return csvData.join('\n');
  }

  exportSessionToJSON(sessionId: string): string {
    const session = this.sessions.find(s => s.id === sessionId);
    return session ? JSON.stringify(session, null, 2) : '';
  }

  getAllSessions(): DiagnosticSession[] {
    return this.sessions;
  }

  getCurrentSession(): DiagnosticSession | null {
    return this.currentSession;
  }

  isCurrentlyLogging(): boolean {
    return this.isLogging;
  }
}

export const dataLoggingService = new DataLoggingService();
