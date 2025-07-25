// Comprehensive Vehicle Database with Advanced Diagnostic Features
import { VehicleProfile } from '@/types/vehicle';

export interface EnhancedPidDefinition {
  pid: string;
  name: string;
  description: string;
  unit: string;
  formula: string;
  minValue?: number;
  maxValue?: number;
  length: number;
  category: string;
  manufacturerSpecific?: boolean;
  supportedVehicles?: string[];
}

export interface DiagnosticFunction {
  id: string;
  name: string;
  description: string;
  category: string;
  command: string;
  dataLength: number;
  responseParser: string;
  supportedSystems: string[];
}

export interface VehicleSystemModule {
  id: string;
  name: string;
  description: string;
  ecuAddress: string;
  supportedFunctions: string[];
  diagnosticCodes: DTCDefinition[];
}

export interface DTCDefinition {
  code: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: 'ENGINE' | 'TRANSMISSION' | 'ABS' | 'AIRBAG' | 'BODY' | 'CLIMATE' | 'NETWORK' | 'EMISSIONS';
  symptoms: string[];
  possibleCauses: string[];
  diagnosticSteps: string[];
}

// Standard OBD2 PIDs (Mode 01)
export const STANDARD_OBD2_PIDS: EnhancedPidDefinition[] = [
  {
    pid: '0100', name: 'PIDs Supported (01-20)', description: 'Bit-encoded list of supported PIDs', 
    unit: 'bitmap', formula: 'A*16777216+B*65536+C*256+D', length: 4, category: 'System'
  },
  {
    pid: '0101', name: 'Monitor Status', description: 'Number of DTCs and status of emission monitors', 
    unit: 'bitmap', formula: 'A*16777216+B*65536+C*256+D', length: 4, category: 'System'
  },
  {
    pid: '0102', name: 'Freeze DTC', description: 'DTC that caused the freeze frame', 
    unit: 'bitmap', formula: 'A*256+B', length: 2, category: 'System'
  },
  {
    pid: '0103', name: 'Fuel System Status', description: 'Status of fuel system', 
    unit: 'bitmap', formula: 'A*256+B', length: 2, category: 'Fuel'
  },
  {
    pid: '0104', name: 'Engine Load', description: 'Calculated engine load value', 
    unit: '%', formula: 'A*100/255', minValue: 0, maxValue: 100, length: 1, category: 'Engine'
  },
  {
    pid: '0105', name: 'Engine Coolant Temperature', description: 'Engine coolant temperature', 
    unit: '°C', formula: 'A-40', minValue: -40, maxValue: 215, length: 1, category: 'Engine'
  },
  {
    pid: '0106', name: 'Short Term Fuel Trim Bank 1', description: 'Short term fuel trim for bank 1', 
    unit: '%', formula: '(A-128)*100/128', minValue: -100, maxValue: 99.2, length: 1, category: 'Fuel'
  },
  {
    pid: '0107', name: 'Long Term Fuel Trim Bank 1', description: 'Long term fuel trim for bank 1', 
    unit: '%', formula: '(A-128)*100/128', minValue: -100, maxValue: 99.2, length: 1, category: 'Fuel'
  },
  {
    pid: '0108', name: 'Short Term Fuel Trim Bank 2', description: 'Short term fuel trim for bank 2', 
    unit: '%', formula: '(A-128)*100/128', minValue: -100, maxValue: 99.2, length: 1, category: 'Fuel'
  },
  {
    pid: '0109', name: 'Long Term Fuel Trim Bank 2', description: 'Long term fuel trim for bank 2', 
    unit: '%', formula: '(A-128)*100/128', minValue: -100, maxValue: 99.2, length: 1, category: 'Fuel'
  },
  {
    pid: '010A', name: 'Fuel Rail Pressure', description: 'Fuel rail pressure (gauge)', 
    unit: 'kPa', formula: 'A*3', minValue: 0, maxValue: 765, length: 1, category: 'Fuel'
  },
  {
    pid: '010B', name: 'Intake MAP', description: 'Intake manifold absolute pressure', 
    unit: 'kPa', formula: 'A', minValue: 0, maxValue: 255, length: 1, category: 'Engine'
  },
  {
    pid: '010C', name: 'Engine RPM', description: 'Engine RPM', 
    unit: 'rpm', formula: '(A*256+B)/4', minValue: 0, maxValue: 16383.75, length: 2, category: 'Engine'
  },
  {
    pid: '010D', name: 'Vehicle Speed', description: 'Vehicle speed', 
    unit: 'km/h', formula: 'A', minValue: 0, maxValue: 255, length: 1, category: 'Vehicle'
  },
  {
    pid: '010E', name: 'Timing Advance', description: 'Timing advance', 
    unit: '° before TDC', formula: 'A/2-64', minValue: -64, maxValue: 63.5, length: 1, category: 'Engine'
  },
  {
    pid: '010F', name: 'Intake Air Temperature', description: 'Intake air temperature', 
    unit: '°C', formula: 'A-40', minValue: -40, maxValue: 215, length: 1, category: 'Engine'
  },
  {
    pid: '0110', name: 'MAF Air Flow Rate', description: 'Mass air flow rate', 
    unit: 'g/s', formula: '(A*256+B)/100', minValue: 0, maxValue: 655.35, length: 2, category: 'Engine'
  },
  {
    pid: '0111', name: 'Throttle Position', description: 'Throttle position', 
    unit: '%', formula: 'A*100/255', minValue: 0, maxValue: 100, length: 1, category: 'Engine'
  },
  {
    pid: '0112', name: 'Secondary Air Status', description: 'Commanded secondary air status', 
    unit: 'bitmap', formula: 'A', length: 1, category: 'Emissions'
  },
  {
    pid: '0113', name: 'Oxygen Sensors Present', description: 'Oxygen sensors present (in 2 banks)', 
    unit: 'bitmap', formula: 'A', length: 1, category: 'Emissions'
  },
  {
    pid: '0114', name: 'O2 Sensor Bank 1 Sensor 1', description: 'Oxygen sensor voltage and fuel trim', 
    unit: 'V, %', formula: 'A/200, (B-128)*100/128', length: 2, category: 'Emissions'
  },
  {
    pid: '0115', name: 'O2 Sensor Bank 1 Sensor 2', description: 'Oxygen sensor voltage and fuel trim', 
    unit: 'V, %', formula: 'A/200, (B-128)*100/128', length: 2, category: 'Emissions'
  },
  {
    pid: '0116', name: 'O2 Sensor Bank 1 Sensor 3', description: 'Oxygen sensor voltage and fuel trim', 
    unit: 'V, %', formula: 'A/200, (B-128)*100/128', length: 2, category: 'Emissions'
  },
  {
    pid: '0117', name: 'O2 Sensor Bank 1 Sensor 4', description: 'Oxygen sensor voltage and fuel trim', 
    unit: 'V, %', formula: 'A/200, (B-128)*100/128', length: 2, category: 'Emissions'
  },
  {
    pid: '0118', name: 'O2 Sensor Bank 2 Sensor 1', description: 'Oxygen sensor voltage and fuel trim', 
    unit: 'V, %', formula: 'A/200, (B-128)*100/128', length: 2, category: 'Emissions'
  },
  {
    pid: '0119', name: 'O2 Sensor Bank 2 Sensor 2', description: 'Oxygen sensor voltage and fuel trim', 
    unit: 'V, %', formula: 'A/200, (B-128)*100/128', length: 2, category: 'Emissions'
  },
  {
    pid: '011A', name: 'O2 Sensor Bank 2 Sensor 3', description: 'Oxygen sensor voltage and fuel trim', 
    unit: 'V, %', formula: 'A/200, (B-128)*100/128', length: 2, category: 'Emissions'
  },
  {
    pid: '011B', name: 'O2 Sensor Bank 2 Sensor 4', description: 'Oxygen sensor voltage and fuel trim', 
    unit: 'V, %', formula: 'A/200, (B-128)*100/128', length: 2, category: 'Emissions'
  },
  {
    pid: '011C', name: 'OBD Standards', description: 'OBD standards this vehicle conforms to', 
    unit: 'bitmap', formula: 'A', length: 1, category: 'System'
  },
  {
    pid: '011D', name: 'O2 Sensors Present (4 banks)', description: 'Oxygen sensors present (in 4 banks)', 
    unit: 'bitmap', formula: 'A', length: 1, category: 'Emissions'
  },
  {
    pid: '011E', name: 'Auxiliary Input Status', description: 'Auxiliary input status', 
    unit: 'bitmap', formula: 'A', length: 1, category: 'System'
  },
  {
    pid: '011F', name: 'Runtime Since Engine Start', description: 'Runtime since engine start', 
    unit: 'seconds', formula: 'A*256+B', minValue: 0, maxValue: 65535, length: 2, category: 'Engine'
  },
  {
    pid: '0120', name: 'PIDs Supported (21-40)', description: 'Bit-encoded list of supported PIDs', 
    unit: 'bitmap', formula: 'A*16777216+B*65536+C*256+D', length: 4, category: 'System'
  },
  {
    pid: '0121', name: 'Distance MIL On', description: 'Distance traveled with malfunction indicator lamp on', 
    unit: 'km', formula: 'A*256+B', minValue: 0, maxValue: 65535, length: 2, category: 'System'
  },
  {
    pid: '0122', name: 'Fuel Rail Pressure', description: 'Fuel rail pressure (relative to manifold vacuum)', 
    unit: 'kPa', formula: '(A*256+B)*0.079', minValue: 0, maxValue: 5177.265, length: 2, category: 'Fuel'
  },
  {
    pid: '0123', name: 'Fuel Rail Gauge Pressure', description: 'Fuel rail gauge pressure (diesel or gasoline direct injection)', 
    unit: 'kPa', formula: '(A*256+B)*10', minValue: 0, maxValue: 655350, length: 2, category: 'Fuel'
  },
  {
    pid: '0124', name: 'O2S1_WR_lambda(1)', description: 'Oxygen sensor 1 lambda current', 
    unit: 'ratio, mA', formula: '(A*256+B)/32768, (C*256+D)/256-128', length: 4, category: 'Emissions'
  },
  {
    pid: '0125', name: 'O2S2_WR_lambda(1)', description: 'Oxygen sensor 2 lambda current', 
    unit: 'ratio, mA', formula: '(A*256+B)/32768, (C*256+D)/256-128', length: 4, category: 'Emissions'
  },
  {
    pid: '0126', name: 'O2S3_WR_lambda(1)', description: 'Oxygen sensor 3 lambda current', 
    unit: 'ratio, mA', formula: '(A*256+B)/32768, (C*256+D)/256-128', length: 4, category: 'Emissions'
  },
  {
    pid: '0127', name: 'O2S4_WR_lambda(1)', description: 'Oxygen sensor 4 lambda current', 
    unit: 'ratio, mA', formula: '(A*256+B)/32768, (C*256+D)/256-128', length: 4, category: 'Emissions'
  },
  {
    pid: '0128', name: 'O2S5_WR_lambda(1)', description: 'Oxygen sensor 5 lambda current', 
    unit: 'ratio, mA', formula: '(A*256+B)/32768, (C*256+D)/256-128', length: 4, category: 'Emissions'
  },
  {
    pid: '0129', name: 'O2S6_WR_lambda(1)', description: 'Oxygen sensor 6 lambda current', 
    unit: 'ratio, mA', formula: '(A*256+B)/32768, (C*256+D)/256-128', length: 4, category: 'Emissions'
  },
  {
    pid: '012A', name: 'O2S7_WR_lambda(1)', description: 'Oxygen sensor 7 lambda current', 
    unit: 'ratio, mA', formula: '(A*256+B)/32768, (C*256+D)/256-128', length: 4, category: 'Emissions'
  },
  {
    pid: '012B', name: 'O2S8_WR_lambda(1)', description: 'Oxygen sensor 8 lambda current', 
    unit: 'ratio, mA', formula: '(A*256+B)/32768, (C*256+D)/256-128', length: 4, category: 'Emissions'
  },
  {
    pid: '012C', name: 'Commanded EGR', description: 'Commanded EGR', 
    unit: '%', formula: 'A*100/255', minValue: 0, maxValue: 100, length: 1, category: 'Emissions'
  },
  {
    pid: '012D', name: 'EGR Error', description: 'EGR Error', 
    unit: '%', formula: '(A-128)*100/128', minValue: -100, maxValue: 99.2, length: 1, category: 'Emissions'
  },
  {
    pid: '012E', name: 'Commanded Evaporative Purge', description: 'Commanded evaporative purge', 
    unit: '%', formula: 'A*100/255', minValue: 0, maxValue: 100, length: 1, category: 'Emissions'
  },
  {
    pid: '012F', name: 'Fuel Tank Level Input', description: 'Fuel tank level input', 
    unit: '%', formula: 'A*100/255', minValue: 0, maxValue: 100, length: 1, category: 'Fuel'
  },
  {
    pid: '0130', name: 'Warm-ups Since DTCs Cleared', description: 'Number of warm-ups since codes cleared', 
    unit: 'count', formula: 'A', minValue: 0, maxValue: 255, length: 1, category: 'System'
  },
  {
    pid: '0131', name: 'Distance Since DTCs Cleared', description: 'Distance traveled since codes cleared', 
    unit: 'km', formula: 'A*256+B', minValue: 0, maxValue: 65535, length: 2, category: 'System'
  },
  {
    pid: '0132', name: 'Evap System Vapor Pressure', description: 'Evap. system vapor pressure', 
    unit: 'Pa', formula: '(A*256+B)/4', minValue: -8192, maxValue: 8191.75, length: 2, category: 'Emissions'
  },
  {
    pid: '0133', name: 'Absolute Barometric Pressure', description: 'Absolute barometric pressure', 
    unit: 'kPa', formula: 'A', minValue: 0, maxValue: 255, length: 1, category: 'Environment'
  },
  {
    pid: '0134', name: 'O2S1_WR_lambda(2)', description: 'Oxygen sensor 1 lambda current (bank 2)', 
    unit: 'ratio, mA', formula: '(A*256+B)/32768, (C*256+D)/256-128', length: 4, category: 'Emissions'
  },
  {
    pid: '0135', name: 'O2S2_WR_lambda(2)', description: 'Oxygen sensor 2 lambda current (bank 2)', 
    unit: 'ratio, mA', formula: '(A*256+B)/32768, (C*256+D)/256-128', length: 4, category: 'Emissions'
  },
  {
    pid: '0136', name: 'O2S3_WR_lambda(2)', description: 'Oxygen sensor 3 lambda current (bank 2)', 
    unit: 'ratio, mA', formula: '(A*256+B)/32768, (C*256+D)/256-128', length: 4, category: 'Emissions'
  },
  {
    pid: '0137', name: 'O2S4_WR_lambda(2)', description: 'Oxygen sensor 4 lambda current (bank 2)', 
    unit: 'ratio, mA', formula: '(A*256+B)/32768, (C*256+D)/256-128', length: 4, category: 'Emissions'
  },
  {
    pid: '0138', name: 'O2S5_WR_lambda(2)', description: 'Oxygen sensor 5 lambda current (bank 2)', 
    unit: 'ratio, mA', formula: '(A*256+B)/32768, (C*256+D)/256-128', length: 4, category: 'Emissions'
  },
  {
    pid: '0139', name: 'O2S6_WR_lambda(2)', description: 'Oxygen sensor 6 lambda current (bank 2)', 
    unit: 'ratio, mA', formula: '(A*256+B)/32768, (C*256+D)/256-128', length: 4, category: 'Emissions'
  },
  {
    pid: '013A', name: 'O2S7_WR_lambda(2)', description: 'Oxygen sensor 7 lambda current (bank 2)', 
    unit: 'ratio, mA', formula: '(A*256+B)/32768, (C*256+D)/256-128', length: 4, category: 'Emissions'
  },
  {
    pid: '013B', name: 'O2S8_WR_lambda(2)', description: 'Oxygen sensor 8 lambda current (bank 2)', 
    unit: 'ratio, mA', formula: '(A*256+B)/32768, (C*256+D)/256-128', length: 4, category: 'Emissions'
  },
  {
    pid: '013C', name: 'Catalyst Temperature Bank 1 Sensor 1', description: 'Catalyst temperature Bank 1, Sensor 1', 
    unit: '°C', formula: '(A*256+B)/10-40', minValue: -40, maxValue: 6513.5, length: 2, category: 'Emissions'
  },
  {
    pid: '013D', name: 'Catalyst Temperature Bank 2 Sensor 1', description: 'Catalyst temperature Bank 2, Sensor 1', 
    unit: '°C', formula: '(A*256+B)/10-40', minValue: -40, maxValue: 6513.5, length: 2, category: 'Emissions'
  },
  {
    pid: '013E', name: 'Catalyst Temperature Bank 1 Sensor 2', description: 'Catalyst temperature Bank 1, Sensor 2', 
    unit: '°C', formula: '(A*256+B)/10-40', minValue: -40, maxValue: 6513.5, length: 2, category: 'Emissions'
  },
  {
    pid: '013F', name: 'Catalyst Temperature Bank 2 Sensor 2', description: 'Catalyst temperature Bank 2, Sensor 2', 
    unit: '°C', formula: '(A*256+B)/10-40', minValue: -40, maxValue: 6513.5, length: 2, category: 'Emissions'
  },
  {
    pid: '0140', name: 'PIDs Supported (41-60)', description: 'Bit-encoded list of supported PIDs', 
    unit: 'bitmap', formula: 'A*16777216+B*65536+C*256+D', length: 4, category: 'System'
  },
  {
    pid: '0141', name: 'Monitor Status This Drive Cycle', description: 'Monitor status this drive cycle', 
    unit: 'bitmap', formula: 'A*16777216+B*65536+C*256+D', length: 4, category: 'System'
  },
  {
    pid: '0142', name: 'Control Module Voltage', description: 'Control module voltage', 
    unit: 'V', formula: '(A*256+B)/1000', minValue: 0, maxValue: 65.535, length: 2, category: 'System'
  },
  {
    pid: '0143', name: 'Absolute Load Value', description: 'Absolute load value', 
    unit: '%', formula: '(A*256+B)*100/255', minValue: 0, maxValue: 25700, length: 2, category: 'Engine'
  },
  {
    pid: '0144', name: 'Fuel Air Commanded Equivalence Ratio', description: 'Fuel–air commanded equivalence ratio', 
    unit: 'ratio', formula: '(A*256+B)/32768', minValue: 0, maxValue: 2, length: 2, category: 'Fuel'
  },
  {
    pid: '0145', name: 'Relative Throttle Position', description: 'Relative throttle position', 
    unit: '%', formula: 'A*100/255', minValue: 0, maxValue: 100, length: 1, category: 'Engine'
  },
  {
    pid: '0146', name: 'Ambient Air Temperature', description: 'Ambient air temperature', 
    unit: '°C', formula: 'A-40', minValue: -40, maxValue: 215, length: 1, category: 'Environment'
  },
  {
    pid: '0147', name: 'Absolute Throttle Position B', description: 'Absolute throttle position B', 
    unit: '%', formula: 'A*100/255', minValue: 0, maxValue: 100, length: 1, category: 'Engine'
  },
  {
    pid: '0148', name: 'Absolute Throttle Position C', description: 'Absolute throttle position C', 
    unit: '%', formula: 'A*100/255', minValue: 0, maxValue: 100, length: 1, category: 'Engine'
  },
  {
    pid: '0149', name: 'Accelerator Pedal Position D', description: 'Accelerator pedal position D', 
    unit: '%', formula: 'A*100/255', minValue: 0, maxValue: 100, length: 1, category: 'Engine'
  },
  {
    pid: '014A', name: 'Accelerator Pedal Position E', description: 'Accelerator pedal position E', 
    unit: '%', formula: 'A*100/255', minValue: 0, maxValue: 100, length: 1, category: 'Engine'
  },
  {
    pid: '014B', name: 'Accelerator Pedal Position F', description: 'Accelerator pedal position F', 
    unit: '%', formula: 'A*100/255', minValue: 0, maxValue: 100, length: 1, category: 'Engine'
  },
  {
    pid: '014C', name: 'Commanded Throttle Actuator', description: 'Commanded throttle actuator', 
    unit: '%', formula: 'A*100/255', minValue: 0, maxValue: 100, length: 1, category: 'Engine'
  },
  {
    pid: '014D', name: 'Time Run with MIL On', description: 'Time run with MIL on', 
    unit: 'minutes', formula: 'A*256+B', minValue: 0, maxValue: 65535, length: 2, category: 'System'
  },
  {
    pid: '014E', name: 'Time Since DTCs Cleared', description: 'Time since trouble codes cleared', 
    unit: 'minutes', formula: 'A*256+B', minValue: 0, maxValue: 65535, length: 2, category: 'System'
  },
  {
    pid: '014F', name: 'Maximum Values', description: 'Maximum value for fuel air equivalence ratio, O2 sensor voltage, O2 sensor current, and intake manifold absolute pressure', 
    unit: 'ratio, V, mA, kPa', formula: 'A, B, C, D*10', length: 4, category: 'System'
  },
  {
    pid: '0150', name: 'Maximum MAF Rate', description: 'Maximum value for air flow rate from mass air flow sensor', 
    unit: 'g/s', formula: 'A*10', minValue: 0, maxValue: 2550, length: 1, category: 'Engine'
  },
  {
    pid: '0151', name: 'Fuel Type', description: 'Fuel Type', 
    unit: 'bitmap', formula: 'A', length: 1, category: 'Fuel'
  },
  {
    pid: '0152', name: 'Ethanol Fuel %', description: 'Ethanol fuel %', 
    unit: '%', formula: 'A*100/255', minValue: 0, maxValue: 100, length: 1, category: 'Fuel'
  },
  {
    pid: '0153', name: 'Absolute Evap System Vapor Pressure', description: 'Absolute Evap system vapor pressure', 
    unit: 'kPa', formula: '(A*256+B)/200', minValue: 0, maxValue: 327.675, length: 2, category: 'Emissions'
  },
  {
    pid: '0154', name: 'Evap System Vapor Pressure', description: 'Evap system vapor pressure', 
    unit: 'Pa', formula: 'A*256+B-32767', minValue: -32767, maxValue: 32768, length: 2, category: 'Emissions'
  },
  {
    pid: '0155', name: 'Short Term Secondary O2 Trim Bank 1', description: 'Short term secondary oxygen sensor fuel trim, bank 1', 
    unit: '%', formula: '(A-128)*100/128', minValue: -100, maxValue: 99.2, length: 1, category: 'Emissions'
  },
  {
    pid: '0156', name: 'Long Term Secondary O2 Trim Bank 1', description: 'Long term secondary oxygen sensor fuel trim, bank 1', 
    unit: '%', formula: '(A-128)*100/128', minValue: -100, maxValue: 99.2, length: 1, category: 'Emissions'
  },
  {
    pid: '0157', name: 'Short Term Secondary O2 Trim Bank 2', description: 'Short term secondary oxygen sensor fuel trim, bank 2', 
    unit: '%', formula: '(A-128)*100/128', minValue: -100, maxValue: 99.2, length: 1, category: 'Emissions'
  },
  {
    pid: '0158', name: 'Long Term Secondary O2 Trim Bank 2', description: 'Long term secondary oxygen sensor fuel trim, bank 2', 
    unit: '%', formula: '(A-128)*100/128', minValue: -100, maxValue: 99.2, length: 1, category: 'Emissions'
  },
  {
    pid: '0159', name: 'Fuel Rail Absolute Pressure', description: 'Fuel rail absolute pressure', 
    unit: 'kPa', formula: '(A*256+B)*10', minValue: 0, maxValue: 655350, length: 2, category: 'Fuel'
  },
  {
    pid: '015A', name: 'Relative Accelerator Pedal Position', description: 'Relative accelerator pedal position', 
    unit: '%', formula: 'A*100/255', minValue: 0, maxValue: 100, length: 1, category: 'Engine'
  },
  {
    pid: '015B', name: 'Hybrid Battery Pack Remaining Life', description: 'Hybrid battery pack remaining life', 
    unit: '%', formula: 'A*100/255', minValue: 0, maxValue: 100, length: 1, category: 'Hybrid'
  },
  {
    pid: '015C', name: 'Engine Oil Temperature', description: 'Engine oil temperature', 
    unit: '°C', formula: 'A-40', minValue: -40, maxValue: 215, length: 1, category: 'Engine'
  },
  {
    pid: '015D', name: 'Fuel Injection Timing', description: 'Fuel injection timing', 
    unit: '°', formula: '(A*256+B)/128-210', minValue: -210, maxValue: 301.992, length: 2, category: 'Engine'
  },
  {
    pid: '015E', name: 'Engine Fuel Rate', description: 'Engine fuel rate', 
    unit: 'L/h', formula: '(A*256+B)*0.05', minValue: 0, maxValue: 3276.75, length: 2, category: 'Fuel'
  },
  {
    pid: '015F', name: 'Emission Requirements', description: 'Emission requirements to which vehicle is designed', 
    unit: 'bitmap', formula: 'A', length: 1, category: 'Emissions'
  },
  {
    pid: '0160', name: 'PIDs Supported (61-80)', description: 'Bit-encoded list of supported PIDs', 
    unit: 'bitmap', formula: 'A*16777216+B*65536+C*256+D', length: 4, category: 'System'
  },
  {
    pid: '0161', name: 'Driver Demand Engine Torque', description: 'Driver demand engine - percent torque', 
    unit: '%', formula: 'A-125', minValue: -125, maxValue: 130, length: 1, category: 'Engine'
  },
  {
    pid: '0162', name: 'Actual Engine Torque', description: 'Actual engine - percent torque', 
    unit: '%', formula: 'A-125', minValue: -125, maxValue: 130, length: 1, category: 'Engine'
  },
  {
    pid: '0163', name: 'Engine Reference Torque', description: 'Engine reference torque', 
    unit: 'Nm', formula: 'A*256+B', minValue: 0, maxValue: 65535, length: 2, category: 'Engine'
  },
  {
    pid: '0164', name: 'Engine Percent Torque Data', description: 'Engine percent torque data', 
    unit: '%', formula: 'A-125,B-125,C-125,D-125,E-125', length: 5, category: 'Engine'
  },
  {
    pid: '0165', name: 'Auxiliary Input/Output Supported', description: 'Auxiliary input / output supported', 
    unit: 'bitmap', formula: 'A*256+B', length: 2, category: 'System'
  },
  {
    pid: '0166', name: 'Mass Air Flow Sensor', description: 'Mass air flow sensor', 
    unit: 'g/s', formula: 'A*256+B*0.03125', length: 5, category: 'Engine'
  },
  {
    pid: '0167', name: 'Engine Coolant Temperature', description: 'Engine coolant temperature', 
    unit: '°C', formula: 'A*256+B*0.03125', length: 5, category: 'Engine'
  },
  {
    pid: '0168', name: 'Intake Air Temperature Sensor', description: 'Intake air temperature sensor', 
    unit: '°C', formula: 'A*256+B*0.03125', length: 5, category: 'Engine'
  },
  {
    pid: '0169', name: 'Commanded EGR and EGR Error', description: 'Commanded EGR and EGR Error', 
    unit: '%', formula: 'A*100/255,(B-128)*100/128', length: 5, category: 'Emissions'
  },
  {
    pid: '016A', name: 'Commanded Diesel Intake Air Flow Control', description: 'Commanded diesel intake air flow control and relative intake air flow position', 
    unit: '%', formula: 'A*100/255,B*100/255', length: 5, category: 'Engine'
  },
  {
    pid: '016B', name: 'Exhaust Gas Recirculation Temperature', description: 'Exhaust gas recirculation temperature', 
    unit: '°C', formula: 'A*256+B*0.03125', length: 5, category: 'Emissions'
  },
  {
    pid: '016C', name: 'Commanded Throttle Actuator Control', description: 'Commanded throttle actuator control and relative throttle position', 
    unit: '%', formula: 'A*100/255,B*100/255', length: 5, category: 'Engine'
  },
  {
    pid: '016D', name: 'Fuel Pressure Control System', description: 'Fuel pressure control system', 
    unit: 'kPa,%', formula: 'A*256+B*10,(C-128)*100/128', length: 5, category: 'Fuel'
  },
  {
    pid: '016E', name: 'Injection Pressure Control System', description: 'Injection pressure control system', 
    unit: 'kPa,%', formula: 'A*256+B*10,(C-128)*100/128', length: 5, category: 'Fuel'
  },
  {
    pid: '016F', name: 'Turbocharger Compressor Inlet Pressure', description: 'Turbocharger compressor inlet pressure', 
    unit: 'kPa', formula: 'A', length: 1, category: 'Engine'
  },
  {
    pid: '0170', name: 'Boost Pressure Control', description: 'Boost pressure control', 
    unit: 'kPa,%', formula: 'A*256+B,(C-128)*100/128', length: 5, category: 'Engine'
  },
  {
    pid: '0171', name: 'Variable Geometry Turbo Control', description: 'Variable geometry turbo (VGT) control', 
    unit: '%', formula: 'A*100/255,(B-128)*100/128', length: 5, category: 'Engine'
  },
  {
    pid: '0172', name: 'Wastegate Control', description: 'Wastegate control', 
    unit: '%', formula: 'A*100/255,(B-128)*100/128', length: 5, category: 'Engine'
  },
  {
    pid: '0173', name: 'Exhaust Pressure', description: 'Exhaust pressure', 
    unit: 'kPa', formula: 'A*256+B*0.03125', length: 5, category: 'Engine'
  },
  {
    pid: '0174', name: 'Turbocharger RPM', description: 'Turbocharger RPM', 
    unit: 'rpm', formula: 'A*256+B*0.25', length: 5, category: 'Engine'
  },
  {
    pid: '0175', name: 'Turbocharger Temperature', description: 'Turbocharger temperature', 
    unit: '°C', formula: 'A*256+B*0.03125', length: 5, category: 'Engine'
  },
  {
    pid: '0176', name: 'Turbocharger Temperature', description: 'Turbocharger temperature', 
    unit: '°C', formula: 'A*256+B*0.03125', length: 5, category: 'Engine'
  },
  {
    pid: '0177', name: 'Charge Air Cooler Temperature', description: 'Charge air cooler temperature (CACT)', 
    unit: '°C', formula: 'A*256+B*0.03125', length: 5, category: 'Engine'
  },
  {
    pid: '0178', name: 'Exhaust Gas Temperature Bank 1', description: 'Exhaust Gas temperature (EGT) Bank 1', 
    unit: '°C', formula: 'A*256+B*0.03125', length: 5, category: 'Emissions'
  },
  {
    pid: '0179', name: 'Exhaust Gas Temperature Bank 2', description: 'Exhaust Gas temperature (EGT) Bank 2', 
    unit: '°C', formula: 'A*256+B*0.03125', length: 5, category: 'Emissions'
  },
  {
    pid: '017A', name: 'Diesel Particulate Filter (DPF)', description: 'Diesel particulate filter (DPF) differential pressure', 
    unit: 'kPa', formula: 'A*256+B*0.03125', length: 5, category: 'Emissions'
  },
  {
    pid: '017B', name: 'Diesel Particulate Filter', description: 'Diesel particulate filter', 
    unit: 'kPa', formula: 'A*256+B*0.03125', length: 5, category: 'Emissions'
  },
  {
    pid: '017C', name: 'Diesel Particulate Filter Temperature', description: 'Diesel Particulate filter (DPF) temperature', 
    unit: '°C', formula: 'A*256+B*0.03125', length: 5, category: 'Emissions'
  },
  {
    pid: '017D', name: 'NOx NTE Control Area Status', description: 'NOx NTE (Not-To-Exceed) control area status', 
    unit: 'bitmap', formula: 'A', length: 1, category: 'Emissions'
  },
  {
    pid: '017E', name: 'PM NTE Control Area Status', description: 'PM NTE (Not-To-Exceed) control area status', 
    unit: 'bitmap', formula: 'A', length: 1, category: 'Emissions'
  },
  {
    pid: '017F', name: 'Engine Run Time', description: 'Engine run time for Auxiliary Emissions Control Device(AECD)', 
    unit: 'seconds', formula: 'A*16777216+B*65536+C*256+D', length: 4, category: 'Emissions'
  },
  {
    pid: '0180', name: 'PIDs Supported (81-A0)', description: 'Bit-encoded list of supported PIDs', 
    unit: 'bitmap', formula: 'A*16777216+B*65536+C*256+D', length: 4, category: 'System'
  },
  {
    pid: '0181', name: 'Engine Run Time for AECD', description: 'Engine run time for Auxiliary Emissions Control Device(AECD)', 
    unit: 'seconds', formula: 'A*16777216+B*65536+C*256+D', length: 4, category: 'Emissions'
  },
  {
    pid: '0182', name: 'Engine Run Time for AECD', description: 'Engine run time for Auxiliary Emissions Control Device(AECD)', 
    unit: 'seconds', formula: 'A*16777216+B*65536+C*256+D', length: 4, category: 'Emissions'
  },
  {
    pid: '0183', name: 'NOx Sensor', description: 'NOx sensor', 
    unit: 'ppm', formula: 'A*256+B', length: 2, category: 'Emissions'
  },
  {
    pid: '0184', name: 'Manifold Surface Temperature', description: 'Manifold surface temperature', 
    unit: '°C', formula: 'A-40', minValue: -40, maxValue: 215, length: 1, category: 'Engine'
  },
  {
    pid: '0185', name: 'NOx Reagent System', description: 'NOx reagent system', 
    unit: '%', formula: 'A*100/255', length: 1, category: 'Emissions'
  },
  {
    pid: '0186', name: 'Particulate Matter Sensor', description: 'Particulate matter (PM) sensor', 
    unit: 'mg/m³', formula: 'A*256+B*0.004', length: 2, category: 'Emissions'
  },
  {
    pid: '0187', name: 'Intake Manifold Absolute Pressure', description: 'Intake manifold absolute pressure', 
    unit: 'kPa', formula: 'A*256+B*0.03125', length: 5, category: 'Engine'
  },
  {
    pid: '0188', name: 'SCR Induce System', description: 'SCR Induce System', 
    unit: 'bitmap', formula: 'A*256+B', length: 2, category: 'Emissions'
  },
  {
    pid: '0189', name: 'Run Time for AECD #11-#15', description: 'Run Time for AECD #11-#15', 
    unit: 'seconds', formula: 'A*256+B', length: 2, category: 'Emissions'
  },
  {
    pid: '018A', name: 'Run Time for AECD #16-#20', description: 'Run Time for AECD #16-#20', 
    unit: 'seconds', formula: 'A*256+B', length: 2, category: 'Emissions'
  },
  {
    pid: '018B', name: 'Diesel Aftertreatment', description: 'Diesel Aftertreatment', 
    unit: '°C', formula: 'A*256+B*0.03125', length: 5, category: 'Emissions'
  },
  {
    pid: '018C', name: 'O2 Sensor (Wide Range)', description: 'O2 Sensor (Wide Range)', 
    unit: 'V', formula: 'A*256+B/32768', length: 2, category: 'Emissions'
  },
  {
    pid: '018D', name: 'Throttle Position G', description: 'Throttle Position G', 
    unit: '%', formula: 'A*100/255', minValue: 0, maxValue: 100, length: 1, category: 'Engine'
  },
  {
    pid: '018E', name: 'Engine Friction - Percent Torque', description: 'Engine Friction - Percent Torque', 
    unit: '%', formula: 'A-125', minValue: -125, maxValue: 130, length: 1, category: 'Engine'
  },
  {
    pid: '018F', name: 'PM Sensor Bank 1 & 2', description: 'PM Sensor Bank 1 & 2', 
    unit: 'mg/m³', formula: 'A*256+B*0.004', length: 2, category: 'Emissions'
  },
  {
    pid: '0190', name: 'WWH-OBD Vehicle OBD System Information', description: 'WWH-OBD Vehicle OBD System Information', 
    unit: 'bitmap', formula: 'A', length: 1, category: 'System'
  },
  {
    pid: '0191', name: 'WWH-OBD Vehicle OBD System Information', description: 'WWH-OBD Vehicle OBD System Information', 
    unit: 'bitmap', formula: 'A', length: 1, category: 'System'
  },
  {
    pid: '0192', name: 'Fuel System Control', description: 'Fuel System Control', 
    unit: '%', formula: 'A*100/255,(B-128)*100/128', length: 2, category: 'Fuel'
  },
  {
    pid: '0193', name: 'WWH-OBD Vehicle OBD Counters support', description: 'WWH-OBD Vehicle OBD Counters support', 
    unit: 'bitmap', formula: 'A*16777216+B*65536+C*256+D', length: 4, category: 'System'
  },
  {
    pid: '0194', name: 'NOx Warning And Inducement System', description: 'NOx Warning And Inducement System', 
    unit: 'bitmap', formula: 'A', length: 1, category: 'Emissions'
  },
  {
    pid: '0198', name: 'Exhaust Gas Temperature Sensor', description: 'Exhaust Gas Temperature Sensor', 
    unit: '°C', formula: 'A*256+B*0.03125', length: 5, category: 'Emissions'
  },
  {
    pid: '0199', name: 'Exhaust Gas Temperature Sensor', description: 'Exhaust Gas Temperature Sensor', 
    unit: '°C', formula: 'A*256+B*0.03125', length: 5, category: 'Emissions'
  },
  {
    pid: '019A', name: 'Hybrid/EV Vehicle System Data, Battery, Voltage', description: 'Hybrid/EV Vehicle System Data, Battery, Voltage', 
    unit: 'V', formula: 'A*256+B*0.1', length: 2, category: 'Hybrid'
  },
  {
    pid: '019B', name: 'Diesel Exhaust Fluid Sensor', description: 'Diesel Exhaust Fluid Sensor', 
    unit: '%', formula: 'A*100/255', length: 1, category: 'Emissions'
  },
  {
    pid: '019C', name: 'O2 Sensor Data', description: 'O2 Sensor Data', 
    unit: 'V, ratio', formula: 'A/200, (B*256+C)/32768', length: 3, category: 'Emissions'
  },
  {
    pid: '019D', name: 'Engine Fuel Rate', description: 'Engine Fuel Rate', 
    unit: 'L/h', formula: '(A*256+B)*0.001', length: 2, category: 'Fuel'
  },
  {
    pid: '019E', name: 'Engine Exhaust Flow Rate', description: 'Engine Exhaust Flow Rate', 
    unit: 'kg/h', formula: '(A*256+B)*0.1', length: 2, category: 'Engine'
  },
  {
    pid: '019F', name: 'Fuel System Percentage Use', description: 'Fuel System Percentage Use', 
    unit: '%', formula: 'A*100/255', length: 1, category: 'Fuel'
  },
  {
    pid: '01A0', name: 'PIDs Supported (A1-C0)', description: 'Bit-encoded list of supported PIDs', 
    unit: 'bitmap', formula: 'A*16777216+B*65536+C*256+D', length: 4, category: 'System'
  },
  {
    pid: '01A1', name: 'NOx Sensor Corrected Data', description: 'NOx Sensor Corrected Data', 
    unit: 'ppm', formula: 'A*256+B-40960', length: 2, category: 'Emissions'
  },
  {
    pid: '01A2', name: 'Cylinder Fuel Rate', description: 'Cylinder Fuel Rate', 
    unit: 'mg/stroke', formula: '(A*256+B)*0.032', length: 2, category: 'Fuel'
  },
  {
    pid: '01A3', name: 'Evap System Vapor Pressure', description: 'Evap System Vapor Pressure', 
    unit: 'Pa', formula: 'A*256+B-32767', length: 2, category: 'Emissions'
  },
  {
    pid: '01A4', name: 'Transmission Actual Gear', description: 'Transmission Actual Gear', 
    unit: 'ratio', formula: '(A*256+B)/1000', length: 2, category: 'Transmission'
  },
  {
    pid: '01A5', name: 'Diesel Exhaust Fluid Dosing', description: 'Diesel Exhaust Fluid Dosing', 
    unit: '%', formula: 'A*100/255', length: 1, category: 'Emissions'
  },
  {
    pid: '01A6', name: 'Odometer', description: 'Odometer', 
    unit: 'km', formula: 'A*16777216+B*65536+C*256+D*0.1', length: 4, category: 'Vehicle'
  },
  {
    pid: '01C0', name: 'PIDs Supported (C1-E0)', description: 'Bit-encoded list of supported PIDs', 
    unit: 'bitmap', formula: 'A*16777216+B*65536+C*256+D', length: 4, category: 'System'
  }
];

// Manufacturer-specific Enhanced PIDs
export const MANUFACTURER_SPECIFIC_PIDS: { [manufacturer: string]: EnhancedPidDefinition[] } = {
  'Audi': [
    {
      pid: '221101', name: 'Engine Temperature', description: 'Enhanced engine temperature reading', 
      unit: '°C', formula: '(A*256+B)*0.1-273.15', length: 2, category: 'Engine', manufacturerSpecific: true,
      supportedVehicles: ['A3', 'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'TT']
    },
    {
      pid: '221102', name: 'Turbo Pressure', description: 'Turbocharger boost pressure', 
      unit: 'mbar', formula: '(A*256+B)*0.1', length: 2, category: 'Engine', manufacturerSpecific: true,
      supportedVehicles: ['A3', 'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'TT']
    },
    {
      pid: '221103', name: 'Lambda Bank 1', description: 'Lambda sensor bank 1 value', 
      unit: 'lambda', formula: '(A*256+B)/32768', length: 2, category: 'Emissions', manufacturerSpecific: true
    },
    {
      pid: '221104', name: 'Lambda Bank 2', description: 'Lambda sensor bank 2 value', 
      unit: 'lambda', formula: '(A*256+B)/32768', length: 2, category: 'Emissions', manufacturerSpecific: true
    },
    {
      pid: '221105', name: 'Injection Timing', description: 'Fuel injection timing', 
      unit: '°BTDC', formula: '(A*256+B)*0.023437-720', length: 2, category: 'Engine', manufacturerSpecific: true
    },
    {
      pid: '221106', name: 'Rail Pressure', description: 'Common rail fuel pressure', 
      unit: 'bar', formula: '(A*256+B)*0.1', length: 2, category: 'Fuel', manufacturerSpecific: true
    }
  ],
  'BMW': [
    {
      pid: '120101', name: 'DME Temperature', description: 'Digital Motor Electronics temperature', 
      unit: '°C', formula: 'A-48', length: 1, category: 'Engine', manufacturerSpecific: true,
      supportedVehicles: ['3 Series', '5 Series', '7 Series', 'X3', 'X5', 'Z4']
    },
    {
      pid: '120102', name: 'Intake Air Mass', description: 'Mass air flow sensor reading', 
      unit: 'kg/h', formula: '(A*256+B)*0.25', length: 2, category: 'Engine', manufacturerSpecific: true
    },
    {
      pid: '120103', name: 'Throttle Valve Angle', description: 'Electronic throttle position', 
      unit: '°', formula: 'A*0.75', length: 1, category: 'Engine', manufacturerSpecific: true
    },
    {
      pid: '120104', name: 'Ignition Timing', description: 'Ignition timing angle', 
      unit: '°BTDC', formula: 'A*0.75-48', length: 1, category: 'Engine', manufacturerSpecific: true
    },
    {
      pid: '120105', name: 'Lambda Control', description: 'Lambda control status', 
      unit: 'lambda', formula: '(A*256+B)/32768', length: 2, category: 'Emissions', manufacturerSpecific: true
    },
    {
      pid: '120106', name: 'Fuel Pressure', description: 'Fuel system pressure', 
      unit: 'bar', formula: '(A*256+B)*0.04', length: 2, category: 'Fuel', manufacturerSpecific: true
    }
  ],
  'Mercedes': [
    {
      pid: '1A0101', name: 'Engine Load Signal', description: 'Engine load calculation', 
      unit: '%', formula: 'A*0.4', length: 1, category: 'Engine', manufacturerSpecific: true,
      supportedVehicles: ['C-Class', 'E-Class', 'S-Class', 'ML-Class', 'SLK']
    },
    {
      pid: '1A0102', name: 'Pedal Position', description: 'Accelerator pedal position', 
      unit: '%', formula: 'A*0.4', length: 1, category: 'Engine', manufacturerSpecific: true
    },
    {
      pid: '1A0103', name: 'Lambda Voltage', description: 'Lambda sensor voltage', 
      unit: 'mV', formula: 'A*4', length: 1, category: 'Emissions', manufacturerSpecific: true
    },
    {
      pid: '1A0104', name: 'Intake Temperature', description: 'Intake air temperature sensor', 
      unit: '°C', formula: 'A-48', length: 1, category: 'Engine', manufacturerSpecific: true
    },
    {
      pid: '1A0105', name: 'EGR Position', description: 'EGR valve position', 
      unit: '%', formula: 'A*0.4', length: 1, category: 'Emissions', manufacturerSpecific: true
    }
  ],
  'Volkswagen': [
    {
      pid: '221101', name: 'Engine Speed', description: 'Enhanced engine speed reading', 
      unit: 'rpm', formula: '(A*256+B)*0.25', length: 2, category: 'Engine', manufacturerSpecific: true,
      supportedVehicles: ['Golf', 'Passat', 'Polo', 'Tiguan', 'Touran', 'Scirocco']
    },
    {
      pid: '221102', name: 'Vehicle Speed', description: 'Enhanced vehicle speed', 
      unit: 'km/h', formula: '(A*256+B)*0.01', length: 2, category: 'Vehicle', manufacturerSpecific: true
    },
    {
      pid: '221103', name: 'Throttle Valve Angle', description: 'Throttle position sensor', 
      unit: '°', formula: '(A*256+B)*0.1', length: 2, category: 'Engine', manufacturerSpecific: true
    },
    {
      pid: '221104', name: 'Lambda Regulation', description: 'Lambda regulation status', 
      unit: '%', formula: '(A*256+B)*0.0015259-100', length: 2, category: 'Emissions', manufacturerSpecific: true
    },
    {
      pid: '221105', name: 'Injection Time', description: 'Fuel injection duration', 
      unit: 'ms', formula: '(A*256+B)*0.01', length: 2, category: 'Fuel', manufacturerSpecific: true
    }
  ],
  'Skoda': [
    {
      pid: '221101', name: 'Engine Load', description: 'Calculated engine load', 
      unit: '%', formula: '(A*256+B)*0.0015259', length: 2, category: 'Engine', manufacturerSpecific: true,
      supportedVehicles: ['Fabia', 'Octavia', 'Superb', 'Rapid', 'Kodiaq', 'Kamiq', 'Scala']
    },
    {
      pid: '221102', name: 'Coolant Temperature', description: 'Engine coolant temperature', 
      unit: '°C', formula: '(A*256+B)*0.1-273.15', length: 2, category: 'Engine', manufacturerSpecific: true
    },
    {
      pid: '221103', name: 'Intake Pressure', description: 'Intake manifold pressure', 
      unit: 'mbar', formula: '(A*256+B)*0.1', length: 2, category: 'Engine', manufacturerSpecific: true
    },
    {
      pid: '221104', name: 'Mass Air Flow', description: 'Mass air flow measurement', 
      unit: 'kg/h', formula: '(A*256+B)*0.1', length: 2, category: 'Engine', manufacturerSpecific: true
    }
  ],
  'Peugeot': [
    {
      pid: '2180', name: 'Engine Speed', description: 'Engine RPM from ECU', 
      unit: 'rpm', formula: '(A*256+B)*0.125', length: 2, category: 'Engine', manufacturerSpecific: true,
      supportedVehicles: ['206', '207', '208', '307', '308', '407', '508', '3008', '5008']
    },
    {
      pid: '2181', name: 'Vehicle Speed', description: 'Vehicle speed from BSI', 
      unit: 'km/h', formula: 'A', length: 1, category: 'Vehicle', manufacturerSpecific: true
    },
    {
      pid: '2182', name: 'Fuel Level', description: 'Fuel tank level', 
      unit: 'L', formula: 'A*0.25', length: 1, category: 'Fuel', manufacturerSpecific: true
    },
    {
      pid: '2183', name: 'Engine Temperature', description: 'Coolant temperature', 
      unit: '°C', formula: 'A-40', length: 1, category: 'Engine', manufacturerSpecific: true
    },
    {
      pid: '2184', name: 'Battery Voltage', description: 'Vehicle battery voltage', 
      unit: 'V', formula: 'A*0.1', length: 1, category: 'Electrical', manufacturerSpecific: true
    },
    {
      pid: '218A', name: 'Air Conditioning', description: 'AC compressor status', 
      unit: 'status', formula: 'A', length: 1, category: 'Climate', manufacturerSpecific: true
    },
    {
      pid: '218B', name: 'Immobilizer Status', description: 'Anti-theft system status', 
      unit: 'status', formula: 'A', length: 1, category: 'Security', manufacturerSpecific: true
    }
  ],
  'Toyota': [
    {
      pid: '780101', name: 'Engine RPM', description: 'Engine speed sensor', 
      unit: 'rpm', formula: '(A*256+B)*0.25', length: 2, category: 'Engine', manufacturerSpecific: true,
      supportedVehicles: ['Corolla', 'Camry', 'Prius', 'RAV4', 'Highlander', 'Land Cruiser']
    },
    {
      pid: '780102', name: 'Throttle Position Sensor', description: 'Throttle position feedback', 
      unit: 'V', formula: '(A*256+B)*0.005', length: 2, category: 'Engine', manufacturerSpecific: true
    },
    {
      pid: '780103', name: 'O2 Sensor Voltage', description: 'Oxygen sensor reading', 
      unit: 'V', formula: '(A*256+B)*0.005', length: 2, category: 'Emissions', manufacturerSpecific: true
    },
    {
      pid: '780104', name: 'MAF Sensor', description: 'Mass air flow sensor', 
      unit: 'g/s', formula: '(A*256+B)*0.01', length: 2, category: 'Engine', manufacturerSpecific: true
    },
    {
      pid: '780105', name: 'Fuel Trim', description: 'Long-term fuel trim', 
      unit: '%', formula: '(A*256+B)*0.01-100', length: 2, category: 'Fuel', manufacturerSpecific: true
    }
  ],
  'Renault': [
    {
      pid: '770101', name: 'Engine Load', description: 'Calculated engine load value', 
      unit: '%', formula: 'A*0.392', length: 1, category: 'Engine', manufacturerSpecific: true,
      supportedVehicles: ['Clio', 'Megane', 'Scenic', 'Laguna', 'Espace', 'Twingo']
    },
    {
      pid: '770102', name: 'Throttle Position', description: 'Throttle valve position', 
      unit: '%', formula: 'A*0.392', length: 1, category: 'Engine', manufacturerSpecific: true
    },
    {
      pid: '770103', name: 'Injection Time', description: 'Fuel injection pulse width', 
      unit: 'ms', formula: '(A*256+B)*0.004', length: 2, category: 'Fuel', manufacturerSpecific: true
    },
    {
      pid: '770104', name: 'Ignition Advance', description: 'Ignition timing advance', 
      unit: '°', formula: 'A*0.75-48', length: 1, category: 'Engine', manufacturerSpecific: true
    }
  ],
  'Seat': [
    {
      pid: '221101', name: 'Engine Temperature', description: 'Engine coolant temperature', 
      unit: '°C', formula: '(A*256+B)*0.1-273.15', length: 2, category: 'Engine', manufacturerSpecific: true,
      supportedVehicles: ['Ibiza', 'Leon', 'Altea', 'Alhambra', 'Arona', 'Ateca']
    },
    {
      pid: '221102', name: 'Engine Speed', description: 'Engine RPM reading', 
      unit: 'rpm', formula: '(A*256+B)*0.25', length: 2, category: 'Engine', manufacturerSpecific: true
    },
    {
      pid: '221103', name: 'Lambda Sensor', description: 'Lambda sensor voltage', 
      unit: 'V', formula: '(A*256+B)*0.005', length: 2, category: 'Emissions', manufacturerSpecific: true
    }
  ]
};

// Comprehensive DTC Database
export const COMPREHENSIVE_DTC_DATABASE: DTCDefinition[] = [
  // Generic Powertrain Codes (P0XXX)
  {
    code: 'P0100', description: 'Mass or Volume Air Flow Circuit Malfunction',
    severity: 'MEDIUM', category: 'ENGINE',
    symptoms: ['Poor engine performance', 'Rough idling', 'Black smoke from exhaust'],
    possibleCauses: ['Dirty or faulty MAF sensor', 'Vacuum leak', 'Damaged wiring'],
    diagnosticSteps: ['Check MAF sensor', 'Inspect air intake system', 'Test wiring continuity']
  },
  {
    code: 'P0101', description: 'Mass or Volume Air Flow Circuit Range/Performance Problem',
    severity: 'MEDIUM', category: 'ENGINE',
    symptoms: ['Poor acceleration', 'Engine hesitation', 'Increased fuel consumption'],
    possibleCauses: ['Contaminated MAF sensor', 'Air filter restriction', 'Intake leak'],
    diagnosticSteps: ['Clean MAF sensor', 'Replace air filter', 'Check for intake leaks']
  },
  {
    code: 'P0102', description: 'Mass or Volume Air Flow Circuit Low Input',
    severity: 'MEDIUM', category: 'ENGINE',
    symptoms: ['Engine stalling', 'Poor idle quality', 'Difficulty starting'],
    possibleCauses: ['Faulty MAF sensor', 'Open circuit in MAF wiring', 'ECU malfunction'],
    diagnosticSteps: ['Test MAF sensor voltage', 'Check wiring continuity', 'Scan for additional codes']
  },
  {
    code: 'P0103', description: 'Mass or Volume Air Flow Circuit High Input',
    severity: 'MEDIUM', category: 'ENGINE',
    symptoms: ['Rich fuel mixture', 'Black smoke', 'Poor fuel economy'],
    possibleCauses: ['Contaminated MAF sensor', 'Short circuit in wiring', 'Vacuum leak'],
    diagnosticSteps: ['Clean MAF sensor', 'Check for shorts in wiring', 'Test for vacuum leaks']
  },
  {
    code: 'P0104', description: 'Mass or Volume Air Flow Circuit Intermittent',
    severity: 'LOW', category: 'ENGINE',
    symptoms: ['Intermittent rough idle', 'Occasional stalling', 'Erratic engine performance'],
    possibleCauses: ['Loose MAF connector', 'Intermittent wiring fault', 'Failing MAF sensor'],
    diagnosticSteps: ['Check connector tightness', 'Wiggle test wiring', 'Monitor MAF data']
  },
  {
    code: 'P0105', description: 'Manifold Absolute Pressure/Barometric Pressure Circuit Malfunction',
    severity: 'MEDIUM', category: 'ENGINE',
    symptoms: ['Poor engine performance', 'Hesitation on acceleration', 'Rough idle'],
    possibleCauses: ['Faulty MAP sensor', 'Vacuum leak', 'Damaged wiring'],
    diagnosticSteps: ['Test MAP sensor', 'Check vacuum lines', 'Inspect wiring']
  },
  {
    code: 'P0106', description: 'Manifold Absolute Pressure/Barometric Pressure Circuit Range/Performance Problem',
    severity: 'MEDIUM', category: 'ENGINE',
    symptoms: ['Engine lacks power', 'Poor fuel economy', 'Irregular idle'],
    possibleCauses: ['MAP sensor out of range', 'Vacuum leak', 'Intake restriction'],
    diagnosticSteps: ['Calibrate MAP sensor', 'Check for leaks', 'Inspect intake system']
  },
  {
    code: 'P0107', description: 'Manifold Absolute Pressure/Barometric Pressure Circuit Low Input',
    severity: 'MEDIUM', category: 'ENGINE',
    symptoms: ['Engine stalling', 'Hard starting', 'Poor idle'],
    possibleCauses: ['Faulty MAP sensor', 'Open circuit', 'ECU problem'],
    diagnosticSteps: ['Test MAP sensor voltage', 'Check wiring', 'Verify ECU operation']
  },
  {
    code: 'P0108', description: 'Manifold Absolute Pressure/Barometric Pressure Circuit High Input',
    severity: 'MEDIUM', category: 'ENGINE',
    symptoms: ['Rich mixture', 'Poor performance', 'Increased emissions'],
    possibleCauses: ['Shorted MAP sensor', 'Wiring short', 'Restricted vacuum line'],
    diagnosticSteps: ['Test for shorts', 'Check vacuum lines', 'Replace MAP sensor if needed']
  },
  {
    code: 'P0109', description: 'Manifold Absolute Pressure/Barometric Pressure Circuit Intermittent',
    severity: 'LOW', category: 'ENGINE',
    symptoms: ['Intermittent performance issues', 'Occasional rough idle'],
    possibleCauses: ['Loose connections', 'Intermittent sensor failure', 'Wiring issues'],
    diagnosticSteps: ['Check connections', 'Monitor sensor data', 'Perform wiggle test']
  },
  {
    code: 'P0110', description: 'Intake Air Temperature Circuit Malfunction',
    severity: 'LOW', category: 'ENGINE',
    symptoms: ['Poor cold start performance', 'Slightly reduced fuel economy'],
    possibleCauses: ['Faulty IAT sensor', 'Damaged wiring', 'Corroded connector'],
    diagnosticSteps: ['Test IAT sensor', 'Check wiring integrity', 'Clean connectors']
  },
  // Add more P-codes...
  {
    code: 'P0171', description: 'System Too Lean (Bank 1)',
    severity: 'MEDIUM', category: 'ENGINE',
    symptoms: ['Poor acceleration', 'Rough idle', 'Engine hesitation'],
    possibleCauses: ['Vacuum leak', 'Faulty fuel injector', 'Weak fuel pump', 'Dirty MAF sensor'],
    diagnosticSteps: ['Check for vacuum leaks', 'Test fuel pressure', 'Clean MAF sensor', 'Check fuel injectors']
  },
  {
    code: 'P0172', description: 'System Too Rich (Bank 1)',
    severity: 'MEDIUM', category: 'ENGINE',
    symptoms: ['Black smoke from exhaust', 'Poor fuel economy', 'Fouled spark plugs'],
    possibleCauses: ['Faulty oxygen sensor', 'Leaking fuel injector', 'High fuel pressure', 'Dirty air filter'],
    diagnosticSteps: ['Test oxygen sensors', 'Check fuel injectors', 'Test fuel pressure', 'Replace air filter']
  },
  {
    code: 'P0300', description: 'Random/Multiple Cylinder Misfire Detected',
    severity: 'HIGH', category: 'ENGINE',
    symptoms: ['Engine shaking', 'Loss of power', 'Poor acceleration', 'Rough idle'],
    possibleCauses: ['Worn spark plugs', 'Faulty ignition coils', 'Fuel system issues', 'Vacuum leaks'],
    diagnosticSteps: ['Check spark plugs', 'Test ignition coils', 'Check fuel pressure', 'Look for vacuum leaks']
  },
  {
    code: 'P0301', description: 'Cylinder 1 Misfire Detected',
    severity: 'MEDIUM', category: 'ENGINE',
    symptoms: ['Engine roughness', 'Loss of power', 'Vibration at idle'],
    possibleCauses: ['Faulty spark plug', 'Bad ignition coil', 'Fuel injector problem', 'Low compression'],
    diagnosticSteps: ['Replace spark plug', 'Test ignition coil', 'Check fuel injector', 'Perform compression test']
  },
  {
    code: 'P0420', description: 'Catalyst System Efficiency Below Threshold (Bank 1)',
    severity: 'MEDIUM', category: 'EMISSIONS',
    symptoms: ['Reduced fuel economy', 'Failed emissions test', 'Rotten egg smell'],
    possibleCauses: ['Failing catalytic converter', 'Faulty oxygen sensors', 'Engine misfires', 'Fuel contamination'],
    diagnosticSteps: ['Test oxygen sensors', 'Check for misfires', 'Inspect catalytic converter', 'Analyze fuel quality']
  },
  // Body Control Codes (B0XXX)
  {
    code: 'B1000', description: 'ECU Defective',
    severity: 'CRITICAL', category: 'BODY',
    symptoms: ['Multiple system failures', 'No communication with ECU'],
    possibleCauses: ['Internal ECU failure', 'Power supply issues', 'Severe electrical damage'],
    diagnosticSteps: ['Check ECU power and ground', 'Verify communication', 'Replace ECU if necessary']
  },
  // Chassis Codes (C0XXX)
  {
    code: 'C0035', description: 'Left Front Wheel Speed Circuit Malfunction',
    severity: 'HIGH', category: 'ABS',
    symptoms: ['ABS warning light', 'Poor braking performance', 'Vehicle pulling'],
    possibleCauses: ['Faulty wheel speed sensor', 'Damaged sensor ring', 'Wiring issues'],
    diagnosticSteps: ['Test wheel speed sensor', 'Inspect sensor ring', 'Check wiring continuity']
  },
  // Network/Communication Codes (U0XXX)
  {
    code: 'U0100', description: 'Lost Communication With ECM/PCM',
    severity: 'HIGH', category: 'NETWORK',
    symptoms: ['Multiple warning lights', 'Poor engine performance', 'Starting issues'],
    possibleCauses: ['ECM failure', 'CAN bus wiring issues', 'Power supply problems'],
    diagnosticSteps: ['Check ECM power', 'Test CAN bus integrity', 'Verify ground connections']
  }
];

// Vehicle System Modules
export const VEHICLE_SYSTEM_MODULES: VehicleSystemModule[] = [
  {
    id: 'engine_control',
    name: 'Engine Control Module (ECM)',
    description: 'Controls engine operation, fuel injection, ignition timing',
    ecuAddress: '0x7E0',
    supportedFunctions: ['read_dtc', 'clear_dtc', 'read_data_stream', 'actuator_test'],
    diagnosticCodes: COMPREHENSIVE_DTC_DATABASE.filter(dtc => dtc.category === 'ENGINE')
  },
  {
    id: 'transmission_control',
    name: 'Transmission Control Module (TCM)',
    description: 'Controls automatic transmission operation',
    ecuAddress: '0x7E1',
    supportedFunctions: ['read_dtc', 'clear_dtc', 'read_data_stream', 'adaptation'],
    diagnosticCodes: COMPREHENSIVE_DTC_DATABASE.filter(dtc => dtc.category === 'TRANSMISSION')
  },
  {
    id: 'abs_control',
    name: 'Anti-lock Braking System (ABS)',
    description: 'Controls ABS, ESC, and brake assist systems',
    ecuAddress: '0x7E2',
    supportedFunctions: ['read_dtc', 'clear_dtc', 'wheel_speed_test', 'brake_test'],
    diagnosticCodes: COMPREHENSIVE_DTC_DATABASE.filter(dtc => dtc.category === 'ABS')
  },
  {
    id: 'airbag_control',
    name: 'Airbag Control Module (ACM)',
    description: 'Controls airbag deployment and safety systems',
    ecuAddress: '0x7E3',
    supportedFunctions: ['read_dtc', 'clear_dtc', 'sensor_test'],
    diagnosticCodes: COMPREHENSIVE_DTC_DATABASE.filter(dtc => dtc.category === 'AIRBAG')
  },
  {
    id: 'body_control',
    name: 'Body Control Module (BCM)',
    description: 'Controls lighting, central locking, and comfort functions',
    ecuAddress: '0x7E4',
    supportedFunctions: ['read_dtc', 'clear_dtc', 'output_test', 'coding'],
    diagnosticCodes: COMPREHENSIVE_DTC_DATABASE.filter(dtc => dtc.category === 'BODY')
  },
  {
    id: 'climate_control',
    name: 'Climate Control Module',
    description: 'Controls heating, ventilation, and air conditioning',
    ecuAddress: '0x7E5',
    supportedFunctions: ['read_dtc', 'clear_dtc', 'actuator_test', 'calibration'],
    diagnosticCodes: COMPREHENSIVE_DTC_DATABASE.filter(dtc => dtc.category === 'CLIMATE')
  }
];

// Diagnostic Functions
export const DIAGNOSTIC_FUNCTIONS: DiagnosticFunction[] = [
  {
    id: 'read_dtc_01',
    name: 'Read Diagnostic Trouble Codes',
    description: 'Read stored diagnostic trouble codes from ECU',
    category: 'Diagnostic',
    command: '0103',
    dataLength: 0,
    responseParser: 'parseDTCResponse',
    supportedSystems: ['engine_control', 'transmission_control', 'abs_control', 'airbag_control', 'body_control']
  },
  {
    id: 'clear_dtc_01',
    name: 'Clear Diagnostic Trouble Codes',
    description: 'Clear all stored diagnostic trouble codes',
    category: 'Diagnostic',
    command: '0104',
    dataLength: 0,
    responseParser: 'parseGenericResponse',
    supportedSystems: ['engine_control', 'transmission_control', 'abs_control', 'airbag_control', 'body_control']
  },
  {
    id: 'read_freeze_frame',
    name: 'Read Freeze Frame Data',
    description: 'Read freeze frame data for stored DTCs',
    category: 'Diagnostic',
    command: '0102',
    dataLength: 1,
    responseParser: 'parseFreezeFrameResponse',
    supportedSystems: ['engine_control', 'transmission_control']
  },
  {
    id: 'read_live_data',
    name: 'Read Live Data Stream',
    description: 'Read real-time parameter data',
    category: 'Live Data',
    command: '0101',
    dataLength: 1,
    responseParser: 'parseLiveDataResponse',
    supportedSystems: ['engine_control', 'transmission_control', 'abs_control', 'body_control']
  },
  {
    id: 'oxygen_sensor_test',
    name: 'Oxygen Sensor Test',
    description: 'Test oxygen sensor response',
    category: 'Component Test',
    command: '0105',
    dataLength: 2,
    responseParser: 'parseOxygenSensorResponse',
    supportedSystems: ['engine_control']
  },
  {
    id: 'readiness_monitors',
    name: 'Readiness Monitors',
    description: 'Check emission system readiness status',
    category: 'Emission',
    command: '0101',
    dataLength: 0,
    responseParser: 'parseReadinessResponse',
    supportedSystems: ['engine_control']
  },
  {
    id: 'vin_read',
    name: 'Vehicle Identification Number',
    description: 'Read vehicle VIN',
    category: 'Vehicle Info',
    command: '0902',
    dataLength: 0,
    responseParser: 'parseVINResponse',
    supportedSystems: ['engine_control']
  },
  {
    id: 'ecu_info',
    name: 'ECU Information',
    description: 'Read ECU part number and version',
    category: 'Vehicle Info',
    command: '0904',
    dataLength: 0,
    responseParser: 'parseECUInfoResponse',
    supportedSystems: ['engine_control', 'transmission_control', 'abs_control', 'body_control']
  }
];

// Professional diagnostic features categorization
export const DIAGNOSTIC_CATEGORIES = {
  'Engine Management': [
    'Live engine data monitoring',
    'Fuel system diagnostics',
    'Ignition system testing',
    'Emission control diagnostics',
    'Turbocharger diagnostics'
  ],
  'Transmission': [
    'Gear position monitoring',
    'Transmission temperature',
    'Shift point analysis',
    'Torque converter diagnostics',
    'Transmission fluid pressure'
  ],
  'Brake System': [
    'ABS diagnostics',
    'Wheel speed sensor testing',
    'Brake pressure monitoring',
    'ESC system diagnostics',
    'Brake fluid level monitoring'
  ],
  'Body Electronics': [
    'Central locking diagnostics',
    'Lighting system testing',
    'Window control diagnostics',
    'Mirror adjustment testing',
    'Seat control diagnostics'
  ],
  'Climate Control': [
    'A/C compressor testing',
    'Temperature sensor diagnostics',
    'Fan speed control testing',
    'Refrigerant pressure monitoring',
    'Cabin air quality sensors'
  ],
  'Security Systems': [
    'Immobilizer diagnostics',
    'Alarm system testing',
    'Key programming',
    'Remote control diagnostics',
    'Theft deterrent testing'
  ]
};

export default {
  STANDARD_OBD2_PIDS,
  MANUFACTURER_SPECIFIC_PIDS,
  COMPREHENSIVE_DTC_DATABASE,
  VEHICLE_SYSTEM_MODULES,
  DIAGNOSTIC_FUNCTIONS,
  DIAGNOSTIC_CATEGORIES
};