
import { OBD2_PIDS } from '@/constants/obd2Pids';
import { VehicleProfile } from '@/types/vehicle';
import { parseHexResponse } from '@/utils/obd2Utils';

export interface AdvancedOBD2Data {
  // Standard parameters
  engineRPM: number;
  vehicleSpeed: number;
  engineTemp: number;
  mafSensorRate: number;
  throttlePosition: number;
  intakeAirTemp: number;
  fuelTrim: number;
  oxygenSensor: number;
  fuelLevel: number;
  
  // Advanced parameters
  fuelPressure: number;
  manifoldPressure: number;
  timingAdvance: number;
  intakeManifoldTemp: number;
  airFlowRate: number;
  fuelTrimShort: number;
  fuelTrimLong: number;
  o2SensorVoltage: number;
  commandedEGR: number;
  egrError: number;
  commandedEvapPurge: number;
  fuelTankLevelInput: number;
  warmUpsSinceCodesCleared: number;
  distanceTraveledSinceCodesCleared: number;
  evapSystemVaporPressure: number;
  barometricPressure: number;
  o2SensorCurrent: number;
  catalystTemperatureBank1: number;
  catalystTemperatureBank2: number;
  controlModuleVoltage: number;
  absoluteLoadValue: number;
  commandedAirFuelRatio: number;
  relativeThrottlePosition: number;
  ambientAirTemp: number;
  absoluteThrottlePositionB: number;
  acceleratorPedalPositionD: number;
  acceleratorPedalPositionE: number;
  commandedThrottleActuator: number;
  timeRunWithMILOn: number;
  timeSinceTroubleCodesCleared: number;
  maxAirFlowRate: number;
  fuelType: number;
  ethanolFuelPercentage: number;
  
  // Real-time calculated values
  engineLoad: number;
  fuelEconomy: number;
  powerOutput: number;
  torqueOutput: number;
  
  // Vehicle status
  realOdometer: number;
  operatingTime: number;
  idleTime: number;
  averageSpeed: number;
}

export class StandardOBD2DataService {
  private vehicleProfile: VehicleProfile | null = null;
  private sendCommand: (command: string) => Promise<string>;

  constructor(sendCommandFn: (command: string) => Promise<string>) {
    this.sendCommand = sendCommandFn;
  }

  setVehicleProfile(profile: VehicleProfile | null): void {
    this.vehicleProfile = profile;
  }

  async getAllData(): Promise<Partial<AdvancedOBD2Data>> {
    const data: Partial<AdvancedOBD2Data> = {};
    
    try {
      // Basic engine parameters
      data.engineRPM = await this.getEngineRPM();
      data.vehicleSpeed = await this.getVehicleSpeed();
      data.engineTemp = await this.getEngineTemp();
      data.mafSensorRate = await this.getMAFRate();
      data.throttlePosition = await this.getThrottlePosition();
      data.intakeAirTemp = await this.getIntakeAirTemp();
      data.fuelLevel = await this.getFuelLevel();
      
      // Fuel system parameters
      data.fuelTrimShort = await this.getShortTermFuelTrim();
      data.fuelTrimLong = await this.getLongTermFuelTrim();
      data.fuelPressure = await this.getFuelPressure();
      
      // Air intake parameters
      data.manifoldPressure = await this.getManifoldPressure();
      data.barometricPressure = await this.getBarometricPressure();
      data.ambientAirTemp = await this.getAmbientAirTemp();
      
      // Engine control parameters
      data.timingAdvance = await this.getTimingAdvance();
      data.commandedEGR = await this.getCommandedEGR();
      data.egrError = await this.getEGRError();
      
      // Oxygen sensors
      data.o2SensorVoltage = await this.getOxygenSensorVoltage();
      data.o2SensorCurrent = await this.getOxygenSensorCurrent();
      
      // Vehicle operation data
      data.realOdometer = await this.getRealOdometer();
      data.operatingTime = await this.getEngineOperatingTime();
      data.averageSpeed = await this.getAverageSpeed();
      
      // Calculate derived values
      data.engineLoad = await this.getCalculatedEngineLoad();
      data.fuelEconomy = this.calculateFuelEconomy(data.mafSensorRate || 0, data.vehicleSpeed || 0);
      data.powerOutput = this.calculatePowerOutput(data.engineRPM || 0, data.engineLoad || 0);
      data.torqueOutput = this.calculateTorqueOutput(data.powerOutput || 0, data.engineRPM || 0);
      
    } catch (error) {
      console.warn('Some OBD2 parameters failed to read:', error);
    }
    
    return data;
  }

  // Basic parameters
  async getEngineRPM(): Promise<number> {
    const response = await this.sendCommand(OBD2_PIDS.ENGINE_RPM);
    const data = parseHexResponse(response);
    if (data.length >= 4) {
      return ((data[2] * 256) + data[3]) / 4;
    }
    throw new Error('Invalid RPM response');
  }

  async getVehicleSpeed(): Promise<number> {
    const response = await this.sendCommand(OBD2_PIDS.VEHICLE_SPEED);
    const data = parseHexResponse(response);
    if (data.length >= 3) {
      return data[2];
    }
    throw new Error('Invalid speed response');
  }

  async getEngineTemp(): Promise<number> {
    const response = await this.sendCommand(OBD2_PIDS.ENGINE_TEMP);
    const data = parseHexResponse(response);
    if (data.length >= 3) {
      return data[2] - 40;
    }
    throw new Error('Invalid temperature response');
  }

  async getMAFRate(): Promise<number> {
    const response = await this.sendCommand(OBD2_PIDS.MAF_RATE);
    const data = parseHexResponse(response);
    if (data.length >= 4) {
      return ((data[2] * 256) + data[3]) / 100;
    }
    throw new Error('Invalid MAF response');
  }

  async getThrottlePosition(): Promise<number> {
    const response = await this.sendCommand(OBD2_PIDS.THROTTLE_POS);
    const data = parseHexResponse(response);
    if (data.length >= 3) {
      return (data[2] * 100) / 255;
    }
    throw new Error('Invalid throttle response');
  }

  async getIntakeAirTemp(): Promise<number> {
    const response = await this.sendCommand(OBD2_PIDS.INTAKE_TEMP);
    const data = parseHexResponse(response);
    if (data.length >= 3) {
      return data[2] - 40;
    }
    throw new Error('Invalid intake temp response');
  }

  async getFuelLevel(): Promise<number> {
    const response = await this.sendCommand(OBD2_PIDS.FUEL_LEVEL);
    const data = parseHexResponse(response);
    if (data.length >= 3) {
      return (data[2] * 100) / 255;
    }
    throw new Error('Invalid fuel level response');
  }

  // Advanced fuel system parameters
  async getShortTermFuelTrim(): Promise<number> {
    const response = await this.sendCommand('0106'); // Short term fuel trim - Bank 1
    const data = parseHexResponse(response);
    if (data.length >= 3) {
      return (data[2] - 128) * 100 / 128;
    }
    throw new Error('Invalid short term fuel trim response');
  }

  async getLongTermFuelTrim(): Promise<number> {
    const response = await this.sendCommand('0107'); // Long term fuel trim - Bank 1
    const data = parseHexResponse(response);
    if (data.length >= 3) {
      return (data[2] - 128) * 100 / 128;
    }
    throw new Error('Invalid long term fuel trim response');
  }

  async getFuelPressure(): Promise<number> {
    const response = await this.sendCommand('010A'); // Fuel pressure
    const data = parseHexResponse(response);
    if (data.length >= 3) {
      return data[2] * 3; // kPa
    }
    throw new Error('Invalid fuel pressure response');
  }

  // Air intake parameters
  async getManifoldPressure(): Promise<number> {
    const response = await this.sendCommand('010B'); // Intake manifold absolute pressure
    const data = parseHexResponse(response);
    if (data.length >= 3) {
      return data[2]; // kPa
    }
    throw new Error('Invalid manifold pressure response');
  }

  async getBarometricPressure(): Promise<number> {
    const response = await this.sendCommand('0133'); // Barometric pressure
    const data = parseHexResponse(response);
    if (data.length >= 3) {
      return data[2]; // kPa
    }
    throw new Error('Invalid barometric pressure response');
  }

  async getAmbientAirTemp(): Promise<number> {
    const response = await this.sendCommand('0146'); // Ambient air temperature
    const data = parseHexResponse(response);
    if (data.length >= 3) {
      return data[2] - 40; // °C
    }
    throw new Error('Invalid ambient air temp response');
  }

  // Engine control parameters
  async getTimingAdvance(): Promise<number> {
    const response = await this.sendCommand('010E'); // Timing advance
    const data = parseHexResponse(response);
    if (data.length >= 3) {
      return (data[2] - 128) / 2; // degrees
    }
    throw new Error('Invalid timing advance response');
  }

  async getCommandedEGR(): Promise<number> {
    const response = await this.sendCommand('012C'); // Commanded EGR
    const data = parseHexResponse(response);
    if (data.length >= 3) {
      return (data[2] * 100) / 255; // %
    }
    throw new Error('Invalid commanded EGR response');
  }

  async getEGRError(): Promise<number> {
    const response = await this.sendCommand('012D'); // EGR Error
    const data = parseHexResponse(response);
    if (data.length >= 3) {
      return (data[2] - 128) * 100 / 128; // %
    }
    throw new Error('Invalid EGR error response');
  }

  // Oxygen sensor parameters
  async getOxygenSensorVoltage(): Promise<number> {
    const response = await this.sendCommand('0114'); // O2 Sensor 1 - Voltage
    const data = parseHexResponse(response);
    if (data.length >= 3) {
      return data[2] / 200; // V
    }
    throw new Error('Invalid O2 sensor voltage response');
  }

  async getOxygenSensorCurrent(): Promise<number> {
    const response = await this.sendCommand('0134'); // O2 Sensor 1 - Current
    const data = parseHexResponse(response);
    if (data.length >= 4) {
      return ((data[2] * 256) + data[3] - 32768) / 256; // mA
    }
    throw new Error('Invalid O2 sensor current response');
  }

  // Vehicle operation data (manufacturer-specific, may not work on all vehicles)
  async getRealOdometer(): Promise<number> {
    try {
      // This is often manufacturer-specific
      if (this.vehicleProfile?.make === 'Peugeot') {
        const response = await this.sendCommand('2280'); // PSA odometer PID
        const data = parseHexResponse(response);
        if (data.length >= 6) {
          return (data[2] * 16777216) + (data[3] * 65536) + (data[4] * 256) + data[5]; // km
        }
      }
      
      // Fallback: calculate from speed over time (not accurate for real odometer)
      return 0;
    } catch (error) {
      console.warn('Real odometer not available:', error);
      return 0;
    }
  }

  async getEngineOperatingTime(): Promise<number> {
    const response = await this.sendCommand('011F'); // Run time since engine start
    const data = parseHexResponse(response);
    if (data.length >= 4) {
      return (data[2] * 256) + data[3]; // seconds
    }
    throw new Error('Invalid operating time response');
  }

  async getAverageSpeed(): Promise<number> {
    try {
      // This is calculated from distance and time, may not be directly available
      const operatingTime = await this.getEngineOperatingTime();
      const currentSpeed = await this.getVehicleSpeed();
      
      // Simple estimation (not accurate for real average)
      return currentSpeed * 0.8; // Assume average is 80% of current
    } catch (error) {
      return 0;
    }
  }

  // Calculated engine load
  async getCalculatedEngineLoad(): Promise<number> {
    const response = await this.sendCommand('0104'); // Calculated engine load value
    const data = parseHexResponse(response);
    if (data.length >= 3) {
      return (data[2] * 100) / 255; // %
    }
    throw new Error('Invalid engine load response');
  }

  // Derived calculations
  private calculateFuelEconomy(mafRate: number, speed: number): number {
    if (speed <= 0 || mafRate <= 0) return 0;
    
    // Simplified fuel economy calculation
    // Real calculation would need air/fuel ratio, fuel density, etc.
    const fuelFlowRate = mafRate / 14.7; // Assuming stoichiometric ratio
    const fuelConsumptionLh = (fuelFlowRate * 3600) / 750; // L/h (simplified)
    
    return speed / fuelConsumptionLh; // km/L
  }

  private calculatePowerOutput(rpm: number, load: number): number {
    if (rpm <= 0 || load <= 0) return 0;
    
    // Simplified power calculation based on engine characteristics
    // Real calculation would need torque curves and engine specifications
    const maxPowerParam = this.vehicleProfile?.specificParameters?.maxPower;
    const maxPower = typeof maxPowerParam === 'number' ? maxPowerParam : 110; // HP
    return (maxPower * load * rpm) / (100 * 5500); // Simplified formula
  }

  private calculateTorqueOutput(power: number, rpm: number): number {
    if (rpm <= 0 || power <= 0) return 0;
    
    // Torque = (Power * 5252) / RPM (for HP and ft-lb)
    // Converting to Nm: multiply by 1.356
    return (power * 5252 * 1.356) / rpm;
  }

  // Utility methods
  async getFuelTrim(): Promise<number> {
    // Return long term fuel trim for compatibility
    return this.getLongTermFuelTrim();
  }

  async getOxygenSensor(): Promise<number> {
    // Return oxygen sensor voltage for compatibility
    return this.getOxygenSensorVoltage();
  }
}
