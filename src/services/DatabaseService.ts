import Dexie, { Table } from 'dexie';
import { VehicleProfile } from '@/types/vehicle';
import { ObdPid } from '@/obd2/psa-pids';

// Define database tables
export interface VehicleRecord {
  id?: number;
  vin: string;
  make: string;
  model: string;
  year: number;
  engine: string;
  fuelType: string;
  createdAt: Date;
  lastUpdated: Date;
}

export interface PIDRecord {
  id?: number;
  mode: string;
  pid: string;
  name: string;
  formula: string;
  unit: string;
  description: string;
  category?: string;
  makeSpecific?: string[];
  createdAt: Date;
  lastUpdated: Date;
}

export interface ScanRecord {
  id?: number;
  vehicleId: number;
  timestamp: Date;
  dtcCodes: string[];
  liveData: { [key: string]: any };
  report: string;
  technicianNotes: string;
}

export interface VINDecodeRecord {
  id?: number;
  vin: string;
  decodedData: {
    make: string;
    model: string;
    year: number;
    engine: string;
    fuelType: string;
    [key: string]: any;
  };
  timestamp: Date;
}

class VehicleDatabase extends Dexie {
  vehicles!: Table<VehicleRecord, number>;
  pids!: Table<PIDRecord, number>;
  scans!: Table<ScanRecord, number>;
  vinDecodes!: Table<VINDecodeRecord, number>;

  constructor() {
    super('LionDiagVehicleDatabase');
    this.version(1).stores({
      vehicles: '++id, vin, make, model, year, engine, fuelType, createdAt, lastUpdated',
      pids: '++id, mode, pid, name, category, createdAt, lastUpdated',
      scans: '++id, vehicleId, timestamp',
      vinDecodes: '++id, vin, timestamp'
    });
  }
}

const db = new VehicleDatabase();

export class DatabaseService {
  private static instance: DatabaseService;
  
  private constructor() {}
  
  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }
  
  /**
   * Save a vehicle record
   */
  async saveVehicle(vehicle: Omit<VehicleRecord, 'id' | 'createdAt' | 'lastUpdated'>): Promise<number> {
    const now = new Date();
    const record: VehicleRecord = {
      ...vehicle,
      createdAt: now,
      lastUpdated: now
    };
    
    return await db.vehicles.add(record);
  }
  
  /**
   * Get all vehicles
   */
  async getAllVehicles(): Promise<VehicleRecord[]> {
    return await db.vehicles.orderBy('lastUpdated').reverse().toArray();
  }
  
  /**
   * Get vehicle by VIN
   */
  async getVehicleByVIN(vin: string): Promise<VehicleRecord | undefined> {
    return await db.vehicles.where('vin').equals(vin).first();
  }
  
  /**
   * Update a vehicle record
   */
  async updateVehicle(id: number, updates: Partial<VehicleRecord>): Promise<number> {
    return await db.vehicles.update(id, {
      ...updates,
      lastUpdated: new Date()
    });
  }
  
  /**
   * Delete a vehicle record
   */
  async deleteVehicle(id: number): Promise<void> {
    await db.vehicles.delete(id);
  }
  
  /**
   * Save a PID record
   */
  async savePID(pid: Omit<PIDRecord, 'id' | 'createdAt' | 'lastUpdated'>): Promise<number> {
    const now = new Date();
    const record: PIDRecord = {
      ...pid,
      createdAt: now,
      lastUpdated: now
    };
    
    return await db.pids.add(record);
  }
  
  /**
   * Get all PIDs
   */
  async getAllPIDs(): Promise<PIDRecord[]> {
    return await db.pids.orderBy('name').toArray();
  }
  
  /**
   * Get PIDs by category
   */
  async getPIDsByCategory(category: string): Promise<PIDRecord[]> {
    return await db.pids.where('category').equals(category).toArray();
  }
  
  /**
   * Get PID by mode and PID
   */
  async getPIDByModeAndPID(mode: string, pid: string): Promise<PIDRecord | undefined> {
    return await db.pids.where({ mode, pid }).first();
  }
  
  /**
   * Update a PID record
   */
  async updatePID(id: number, updates: Partial<PIDRecord>): Promise<number> {
    return await db.pids.update(id, {
      ...updates,
      lastUpdated: new Date()
    });
  }
  
  /**
   * Delete a PID record
   */
  async deletePID(id: number): Promise<void> {
    await db.pids.delete(id);
  }
  
  /**
   * Save a scan record
   */
  async saveScan(scan: Omit<ScanRecord, 'id'>): Promise<number> {
    const record: ScanRecord = {
      ...scan,
      id: undefined
    };
    
    return await db.scans.add(record);
  }
  
  /**
   * Get scans for a vehicle
   */
  async getScansForVehicle(vehicleId: number): Promise<ScanRecord[]> {
    return await db.scans.where('vehicleId').equals(vehicleId).reverse().sortBy('timestamp');
  }
  
  /**
   * Get recent scans
   */
  async getRecentScans(limit: number = 10): Promise<ScanRecord[]> {
    return await db.scans.orderBy('timestamp').reverse().limit(limit).toArray();
  }
  
  /**
   * Save VIN decode record
   */
  async saveVINDecode(vin: string, decodedData: VINDecodeRecord['decodedData']): Promise<number> {
    const record: VINDecodeRecord = {
      vin,
      decodedData,
      timestamp: new Date()
    };
    
    return await db.vinDecodes.add(record);
  }
  
  /**
   * Get VIN decode history
   */
  async getVINDecodeHistory(vin: string): Promise<VINDecodeRecord[]> {
    return await db.vinDecodes.where('vin').equals(vin).reverse().sortBy('timestamp');
  }
  
  /**
   * Get all VIN decode records
   */
  async getAllVINDecodes(): Promise<VINDecodeRecord[]> {
    return await db.vinDecodes.orderBy('timestamp').reverse().toArray();
  }
  
  /**
   * Clear all data (for testing purposes)
   */
  async clearAllData(): Promise<void> {
    await db.vehicles.clear();
    await db.pids.clear();
    await db.scans.clear();
    await db.vinDecodes.clear();
  }
  
  /**
   * Import PIDs from OBD2 PID definitions
   */
  async importPIDsFromDefinitions(pids: ObdPid[]): Promise<void> {
    const now = new Date();
    
    for (const pid of pids) {
      // Check if PID already exists
      const existing = await this.getPIDByModeAndPID(pid.mode, pid.pid);
      
      if (!existing) {
        // Add new PID
        await this.savePID({
          mode: pid.mode,
          pid: pid.pid,
          name: pid.name,
          formula: pid.formula,
          unit: pid.unit,
          description: pid.description,
          category: pid.category
        });
      } else {
        // Update existing PID
        await this.updatePID(existing.id!, {
          name: pid.name,
          formula: pid.formula,
          unit: pid.unit,
          description: pid.description,
          category: pid.category
        });
      }
    }
  }
  
  /**
   * Export database to JSON
   */
  async exportDatabase(): Promise<string> {
    const vehicles = await this.getAllVehicles();
    const pids = await this.getAllPIDs();
    const scans = await this.getRecentScans(100);
    const vinDecodes = await this.getAllVINDecodes();
    
    const exportData = {
      vehicles,
      pids,
      scans,
      vinDecodes,
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(exportData, null, 2);
  }
  
  /**
   * Import database from JSON
   */
  async importDatabase(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    
    // Clear existing data
    await this.clearAllData();
    
    // Import vehicles
    if (data.vehicles) {
      for (const vehicle of data.vehicles) {
        await this.saveVehicle({
          vin: vehicle.vin,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          engine: vehicle.engine,
          fuelType: vehicle.fuelType
        });
      }
    }
    
    // Import PIDs
    if (data.pids) {
      for (const pid of data.pids) {
        await this.savePID({
          mode: pid.mode,
          pid: pid.pid,
          name: pid.name,
          formula: pid.formula,
          unit: pid.unit,
          description: pid.description,
          category: pid.category
        });
      }
    }
    
    // Import scans
    if (data.scans) {
      for (const scan of data.scans) {
        await this.saveScan({
          vehicleId: scan.vehicleId,
          timestamp: new Date(scan.timestamp),
          dtcCodes: scan.dtcCodes,
          liveData: scan.liveData,
          report: scan.report,
          technicianNotes: scan.technicianNotes
        });
      }
    }
    
    // Import VIN decodes
    if (data.vinDecodes) {
      for (const decode of data.vinDecodes) {
        await this.saveVINDecode(decode.vin, decode.decodedData);
      }
    }
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();