
export interface VehiclePID {
  pid: string;
  name: string;
  unit: string;
  formula: string;
  description: string;
  category: string;
  manufacturer?: string;
  models?: string[];
  yearRange?: string;
}

export interface AdvancedFunction {
  id: string;
  name: string;
  description: string;
  command: string;
  parameters?: Record<string, unknown>;
  category: string;
  riskLevel: 'low' | 'medium' | 'high';
  requiresPin?: boolean;
  manufacturer?: string;
  models?: string[];
}

export class VehicleDatabase {
  // Universal OBD2 PIDs (all vehicles)
  static readonly UNIVERSAL_PIDS: VehiclePID[] = [
    { pid: '010C', name: 'Engine RPM', unit: 'rpm', formula: '(A*256+B)/4', description: 'Engine revolutions per minute', category: 'engine' },
    { pid: '010D', name: 'Vehicle Speed', unit: 'km/h', formula: 'A', description: 'Vehicle speed sensor', category: 'performance' },
    { pid: '0105', name: 'Engine Coolant Temperature', unit: '°C', formula: 'A-40', description: 'Engine coolant temperature', category: 'engine' },
    { pid: '010F', name: 'Intake Air Temperature', unit: '°C', formula: 'A-40', description: 'Intake air temperature', category: 'engine' },
    { pid: '0110', name: 'MAF Air Flow Rate', unit: 'g/s', formula: '(A*256+B)/100', description: 'Mass air flow rate', category: 'engine' },
    { pid: '0111', name: 'Throttle Position', unit: '%', formula: 'A*100/255', description: 'Throttle position sensor', category: 'engine' },
    { pid: '0114', name: 'Oxygen Sensor 1', unit: 'V', formula: 'A*0.005', description: 'Oxygen sensor bank 1', category: 'emissions' },
    { pid: '0115', name: 'Oxygen Sensor 2', unit: 'V', formula: 'A*0.005', description: 'Oxygen sensor bank 2', category: 'emissions' },
    { pid: '011F', name: 'Run Time Since Start', unit: 'sec', formula: 'A*256+B', description: 'Engine run time', category: 'engine' },
    { pid: '0121', name: 'Distance MIL On', unit: 'km', formula: 'A*256+B', description: 'Distance traveled with MIL on', category: 'diagnostics' },
    { pid: '0122', name: 'Fuel Rail Pressure', unit: 'kPa', formula: '(A*256+B)*10', description: 'Fuel rail pressure', category: 'fuel' },
    { pid: '0123', name: 'Fuel Rail Gauge Pressure', unit: 'kPa', formula: '(A*256+B)*10', description: 'Fuel rail gauge pressure', category: 'fuel' },
    { pid: '012F', name: 'Fuel Tank Level', unit: '%', formula: 'A*100/255', description: 'Fuel tank level input', category: 'fuel' },
    { pid: '0131', name: 'Distance Since Codes Cleared', unit: 'km', formula: 'A*256+B', description: 'Distance since codes cleared', category: 'diagnostics' },
    { pid: '0133', name: 'Barometric Pressure', unit: 'kPa', formula: 'A', description: 'Barometric pressure', category: 'environment' },
    { pid: '013C', name: 'Catalyst Temperature B1S1', unit: '°C', formula: '(A*256+B)/10-40', description: 'Catalyst temperature', category: 'emissions' },
    { pid: '0142', name: 'Control Module Voltage', unit: 'V', formula: '(A*256+B)/1000', description: 'Control module voltage', category: 'electrical' },
    { pid: '0143', name: 'Absolute Load Value', unit: '%', formula: '(A*256+B)*100/255', description: 'Absolute load value', category: 'performance' },
    { pid: '0144', name: 'Fuel-Air Commanded Equivalence Ratio', unit: 'ratio', formula: '(A*256+B)/32768', description: 'Commanded equivalence ratio', category: 'fuel' },
    { pid: '0145', name: 'Relative Throttle Position', unit: '%', formula: 'A*100/255', description: 'Relative throttle position', category: 'engine' },
    { pid: '0146', name: 'Ambient Air Temperature', unit: '°C', formula: 'A-40', description: 'Ambient air temperature', category: 'environment' },
    { pid: '0147', name: 'Absolute Throttle Position B', unit: '%', formula: 'A*100/255', description: 'Absolute throttle position B', category: 'engine' },
    { pid: '0149', name: 'Accelerator Pedal Position D', unit: '%', formula: 'A*100/255', description: 'Accelerator pedal position D', category: 'performance' },
    { pid: '014A', name: 'Accelerator Pedal Position E', unit: '%', formula: 'A*100/255', description: 'Accelerator pedal position E', category: 'performance' },
    { pid: '014C', name: 'Commanded Throttle Actuator', unit: '%', formula: 'A*100/255', description: 'Commanded throttle actuator', category: 'engine' },
    { pid: '014D', name: 'Time Run with MIL On', unit: 'min', formula: 'A*256+B', description: 'Time run with MIL on', category: 'diagnostics' },
    { pid: '014E', name: 'Time Since Codes Cleared', unit: 'min', formula: 'A*256+B', description: 'Time since trouble codes cleared', category: 'diagnostics' },
    { pid: '0151', name: 'Fuel Type', unit: 'type', formula: 'A', description: 'Fuel type coding', category: 'fuel' },
    { pid: '0152', name: 'Ethanol Fuel Percentage', unit: '%', formula: 'A*100/255', description: 'Ethanol fuel percentage', category: 'fuel' },
    { pid: '0159', name: 'Fuel Rail Absolute Pressure', unit: 'kPa', formula: '(A*256+B)*10', description: 'Fuel rail absolute pressure', category: 'fuel' },
    { pid: '015A', name: 'Relative Accelerator Pedal Position', unit: '%', formula: 'A*100/255', description: 'Relative accelerator pedal position', category: 'performance' },
    { pid: '015B', name: 'Hybrid Battery Pack Remaining Life', unit: '%', formula: 'A*100/255', description: 'Hybrid battery remaining life', category: 'hybrid' },
    { pid: '015C', name: 'Engine Oil Temperature', unit: '°C', formula: 'A-40', description: 'Engine oil temperature', category: 'engine' },
    { pid: '015D', name: 'Fuel Injection Timing', unit: 'degrees', formula: '(A*256+B)/128-210', description: 'Fuel injection timing', category: 'fuel' },
    { pid: '015E', name: 'Engine Fuel Rate', unit: 'L/h', formula: '(A*256+B)*0.05', description: 'Engine fuel rate', category: 'fuel' },
  ];

  // VAG Group (VW, Audi, Seat, Skoda) specific PIDs
  static readonly VAG_PIDS: VehiclePID[] = [
    { pid: '22F40C', name: 'Boost Pressure Actual', unit: 'mbar', formula: '(A*256+B)*0.1', description: 'Turbo boost pressure actual', category: 'turbo', manufacturer: 'VAG' },
    { pid: '22F40D', name: 'Boost Pressure Specified', unit: 'mbar', formula: '(A*256+B)*0.1', description: 'Turbo boost pressure specified', category: 'turbo', manufacturer: 'VAG' },
    { pid: '22F446', name: 'EGR Valve Position', unit: '%', formula: 'A*100/255', description: 'EGR valve position', category: 'emissions', manufacturer: 'VAG' },
    { pid: '22F447', name: 'EGR Valve Duty Cycle', unit: '%', formula: 'A*100/255', description: 'EGR valve duty cycle', category: 'emissions', manufacturer: 'VAG' },
    { pid: '22F602', name: 'DPF Differential Pressure', unit: 'mbar', formula: '(A*256+B)-32768', description: 'DPF differential pressure', category: 'emissions', manufacturer: 'VAG' },
    { pid: '22F603', name: 'DPF Soot Mass', unit: 'g', formula: '(A*256+B)*0.1', description: 'DPF soot mass calculated', category: 'emissions', manufacturer: 'VAG' },
    { pid: '22F604', name: 'DPF Exhaust Temperature Before', unit: '°C', formula: '(A*256+B)*0.1-273.15', description: 'Exhaust temperature before DPF', category: 'emissions', manufacturer: 'VAG' },
    { pid: '22F605', name: 'DPF Exhaust Temperature After', unit: '°C', formula: '(A*256+B)*0.1-273.15', description: 'Exhaust temperature after DPF', category: 'emissions', manufacturer: 'VAG' },
    { pid: '22F190', name: 'Glow Plug Relay', unit: 'state', formula: 'A', description: 'Glow plug relay status', category: 'engine', manufacturer: 'VAG' },
    { pid: '22F191', name: 'Individual Glow Plug Status', unit: 'state', formula: 'A', description: 'Individual glow plug status', category: 'engine', manufacturer: 'VAG' },
    { pid: '22F1A0', name: 'AdBlue Tank Level', unit: '%', formula: 'A*100/255', description: 'AdBlue tank level', category: 'emissions', manufacturer: 'VAG' },
    { pid: '22F1A1', name: 'AdBlue Quality', unit: '%', formula: 'A*100/255', description: 'AdBlue quality', category: 'emissions', manufacturer: 'VAG' },
    { pid: '22F1A2', name: 'NOx Sensor 1', unit: 'ppm', formula: '(A*256+B)', description: 'NOx sensor upstream', category: 'emissions', manufacturer: 'VAG' },
    { pid: '22F1A3', name: 'NOx Sensor 2', unit: 'ppm', formula: '(A*256+B)', description: 'NOx sensor downstream', category: 'emissions', manufacturer: 'VAG' },
  ];

  // PSA Group (Peugeot, Citroen) specific PIDs
  static readonly PSA_PIDS: VehiclePID[] = [
    { pid: '221C30', name: 'DPF Inlet Temperature', unit: '°C', formula: '(A*256+B)*0.75-48', description: 'DPF inlet temperature', category: 'emissions', manufacturer: 'PSA' },
    { pid: '221C31', name: 'DPF Outlet Temperature', unit: '°C', formula: '(A*256+B)*0.75-48', description: 'DPF outlet temperature', category: 'emissions', manufacturer: 'PSA' },
    { pid: '221C32', name: 'DPF Differential Pressure', unit: 'Pa', formula: '(A*256+B)-32768', description: 'DPF differential pressure', category: 'emissions', manufacturer: 'PSA' },
    { pid: '221C34', name: 'DPF Soot Load', unit: 'g', formula: '(A*256+B)/100', description: 'DPF soot load', category: 'emissions', manufacturer: 'PSA' },
    { pid: '221C40', name: 'EGR Position', unit: '%', formula: 'A*100/255', description: 'EGR valve position', category: 'emissions', manufacturer: 'PSA' },
    { pid: '221C41', name: 'EGR Temperature', unit: '°C', formula: 'A*0.75-48', description: 'EGR temperature', category: 'emissions', manufacturer: 'PSA' },
    { pid: '221C50', name: 'Turbo Pressure', unit: 'mbar', formula: '(A*256+B)/100', description: 'Turbocharger pressure', category: 'turbo', manufacturer: 'PSA' },
    { pid: '221C60', name: 'Fuel Rail Pressure', unit: 'bar', formula: '(A*256+B)*10', description: 'Common rail pressure', category: 'fuel', manufacturer: 'PSA' },
    { pid: '221C61', name: 'Fuel Temperature', unit: '°C', formula: 'A*0.75-48', description: 'Fuel temperature', category: 'fuel', manufacturer: 'PSA' },
    { pid: '221C70', name: 'AdBlue Level', unit: '%', formula: 'A*100/255', description: 'AdBlue tank level', category: 'emissions', manufacturer: 'PSA' },
    { pid: '221C71', name: 'NOx Sensor Upstream', unit: 'ppm', formula: '(A*256+B)/100', description: 'NOx sensor before SCR', category: 'emissions', manufacturer: 'PSA' },
    { pid: '221C72', name: 'NOx Sensor Downstream', unit: 'ppm', formula: '(A*256+B)/100', description: 'NOx sensor after SCR', category: 'emissions', manufacturer: 'PSA' },
    { pid: '221C80', name: 'Oil Temperature', unit: '°C', formula: 'A*0.75-48', description: 'Engine oil temperature', category: 'engine', manufacturer: 'PSA' },
    { pid: '221C81', name: 'Oil Pressure', unit: 'bar', formula: '(A*256+B)/100', description: 'Engine oil pressure', category: 'engine', manufacturer: 'PSA' },
    { pid: '221C90', name: 'Glow Plug Status', unit: 'state', formula: 'A', description: 'Glow plug heating status', category: 'engine', manufacturer: 'PSA' },
    { pid: '222260', name: 'BSI Battery Voltage', unit: 'V', formula: '(A*256+B)/1000', description: 'BSI battery voltage', category: 'electrical', manufacturer: 'PSA' },
    { pid: '222270', name: 'Radio Status', unit: 'state', formula: 'A', description: 'Radio/infotainment status', category: 'comfort', manufacturer: 'PSA' },
    { pid: '222280', name: 'Central Locking Status', unit: 'state', formula: 'A', description: 'Central locking status', category: 'comfort', manufacturer: 'PSA' },
    { pid: '222290', name: 'Immobilizer Status', unit: 'state', formula: 'A', description: 'Immobilizer status', category: 'security', manufacturer: 'PSA' },
  ];

  // BMW/Mercedes/Audi luxury features
  static readonly LUXURY_PIDS: VehiclePID[] = [
    { pid: '22F300', name: 'Suspension Position FL', unit: 'mm', formula: '(A*256+B)*0.1', description: 'Front left suspension position', category: 'suspension', manufacturer: 'BMW' },
    { pid: '22F301', name: 'Suspension Position FR', unit: 'mm', formula: '(A*256+B)*0.1', description: 'Front right suspension position', category: 'suspension', manufacturer: 'BMW' },
    { pid: '22F302', name: 'Suspension Position RL', unit: 'mm', formula: '(A*256+B)*0.1', description: 'Rear left suspension position', category: 'suspension', manufacturer: 'BMW' },
    { pid: '22F303', name: 'Suspension Position RR', unit: 'mm', formula: '(A*256+B)*0.1', description: 'Rear right suspension position', category: 'suspension', manufacturer: 'BMW' },
    { pid: '22F310', name: 'Steering Angle', unit: 'degrees', formula: '(A*256+B)*0.1-3276.8', description: 'Steering wheel angle', category: 'steering', manufacturer: 'BMW' },
    { pid: '22F320', name: 'Brake Pedal Position', unit: '%', formula: 'A*100/255', description: 'Brake pedal position', category: 'brakes', manufacturer: 'BMW' },
    { pid: '22F330', name: 'Tire Pressure FL', unit: 'bar', formula: '(A*256+B)*0.01', description: 'Front left tire pressure', category: 'tires', manufacturer: 'BMW' },
    { pid: '22F331', name: 'Tire Pressure FR', unit: 'bar', formula: '(A*256+B)*0.01', description: 'Front right tire pressure', category: 'tires', manufacturer: 'BMW' },
    { pid: '22F332', name: 'Tire Pressure RL', unit: 'bar', formula: '(A*256+B)*0.01', description: 'Rear left tire pressure', category: 'tires', manufacturer: 'BMW' },
    { pid: '22F333', name: 'Tire Pressure RR', unit: 'bar', formula: '(A*256+B)*0.01', description: 'Rear right tire pressure', category: 'tires', manufacturer: 'BMW' },
  ];

  // Advanced functions for all manufacturers
  static readonly ADVANCED_FUNCTIONS: AdvancedFunction[] = [
    // Universal functions
    { id: 'oil_reset', name: 'Oil Service Reset', description: 'Reset oil service interval', command: '31030000FF', category: 'service', riskLevel: 'low' },
    { id: 'throttle_adaptation', name: 'Throttle Body Adaptation', description: 'Adapt throttle body position', command: '31030100FF', category: 'adaptation', riskLevel: 'medium' },
    { id: 'clear_adaptations', name: 'Clear All Adaptations', description: 'Clear all ECU adaptations', command: '31030200FF', category: 'adaptation', riskLevel: 'high' },
    
    // PSA specific functions
    { id: 'psa_radio_aux', name: 'Enable Radio AUX', description: 'Enable AUX input on radio', command: '220F41', category: 'comfort', riskLevel: 'low', manufacturer: 'PSA' },
    { id: 'psa_dpf_regen', name: 'Force DPF Regeneration', description: 'Force DPF regeneration cycle', command: '31010F', category: 'emissions', riskLevel: 'medium', manufacturer: 'PSA' },
    { id: 'psa_egr_test', name: 'EGR Valve Test', description: 'Test EGR valve operation', command: '2F110E01', category: 'emissions', riskLevel: 'medium', manufacturer: 'PSA' },
    { id: 'psa_immobilizer', name: 'Immobilizer Control', description: 'Control immobilizer system', command: '3B8301', category: 'security', riskLevel: 'high', requiresPin: true, manufacturer: 'PSA' },
    { id: 'psa_auto_wipers', name: 'Auto Wipers Config', description: 'Configure auto wipers', command: '3B8401', category: 'comfort', riskLevel: 'low', manufacturer: 'PSA' },
    { id: 'psa_auto_lights', name: 'Auto Lights Config', description: 'Configure auto lights', command: '3B8501', category: 'comfort', riskLevel: 'low', manufacturer: 'PSA' },
    { id: 'psa_central_locking', name: 'Central Locking Config', description: 'Configure central locking', command: '3B8601', category: 'comfort', riskLevel: 'medium', requiresPin: true, manufacturer: 'PSA' },
    
    // VAG specific functions
    { id: 'vag_dpf_regen', name: 'VAG DPF Regeneration', description: 'VAG DPF regeneration', command: '31010F', category: 'emissions', riskLevel: 'medium', manufacturer: 'VAG' },
    { id: 'vag_basic_settings', name: 'Basic Settings', description: 'VAG basic settings adaptation', command: '2804', category: 'adaptation', riskLevel: 'medium', manufacturer: 'VAG' },
    { id: 'vag_output_tests', name: 'Output Tests', description: 'VAG output tests', command: '2806', category: 'testing', riskLevel: 'medium', manufacturer: 'VAG' },
    { id: 'vag_long_coding', name: 'Long Coding', description: 'VAG long coding', command: '2701', category: 'coding', riskLevel: 'high', manufacturer: 'VAG' },
    { id: 'vag_security_access', name: 'Security Access', description: 'VAG security access', command: '2701', category: 'security', riskLevel: 'high', requiresPin: true, manufacturer: 'VAG' },
    
    // BMW specific functions
    { id: 'bmw_service_reset', name: 'BMW Service Reset', description: 'BMW service reset', command: '31010203FF', category: 'service', riskLevel: 'low', manufacturer: 'BMW' },
    { id: 'bmw_steering_angle', name: 'Steering Angle Reset', description: 'BMW steering angle reset', command: '31010403FF', category: 'calibration', riskLevel: 'medium', manufacturer: 'BMW' },
    { id: 'bmw_suspension_cal', name: 'Suspension Calibration', description: 'BMW suspension calibration', command: '31010503FF', category: 'calibration', riskLevel: 'medium', manufacturer: 'BMW' },
    
    // Mercedes specific functions
    { id: 'mb_service_reset', name: 'Mercedes Service Reset', description: 'Mercedes service reset', command: '31010204FF', category: 'service', riskLevel: 'low', manufacturer: 'Mercedes' },
    { id: 'mb_brake_adaptation', name: 'Brake Adaptation', description: 'Mercedes brake adaptation', command: '31010601FF', category: 'adaptation', riskLevel: 'medium', manufacturer: 'Mercedes' },
    
    // Japanese manufacturers
    { id: 'toyota_hybrid_reset', name: 'Hybrid System Reset', description: 'Toyota hybrid system reset', command: '31010701FF', category: 'hybrid', riskLevel: 'medium', manufacturer: 'Toyota' },
    { id: 'honda_idle_learn', name: 'Idle Learn Procedure', description: 'Honda idle learn procedure', command: '31010801FF', category: 'adaptation', riskLevel: 'medium', manufacturer: 'Honda' },
    { id: 'nissan_throttle_reset', name: 'Throttle Reset', description: 'Nissan throttle reset', command: '31010901FF', category: 'adaptation', riskLevel: 'medium', manufacturer: 'Nissan' },
  ];

  static getAllPidsForManufacturer(manufacturer?: string): VehiclePID[] {
    let pids = [...this.UNIVERSAL_PIDS];
    
    if (manufacturer) {
      switch (manufacturer.toUpperCase()) {
        case 'VAG':
        case 'VW':
        case 'AUDI':
        case 'SEAT':
        case 'SKODA':
          pids = [...pids, ...this.VAG_PIDS];
          break;
        case 'PSA':
        case 'PEUGEOT':
        case 'CITROEN':
          pids = [...pids, ...this.PSA_PIDS];
          break;
        case 'BMW':
        case 'MERCEDES':
          pids = [...pids, ...this.LUXURY_PIDS];
          break;
      }
    }
    
    return pids;
  }

  static getAdvancedFunctionsForManufacturer(manufacturer?: string): AdvancedFunction[] {
    if (!manufacturer) {
      return this.ADVANCED_FUNCTIONS.filter(f => !f.manufacturer);
    }
    
    return this.ADVANCED_FUNCTIONS.filter(f => 
      !f.manufacturer || f.manufacturer.toUpperCase() === manufacturer.toUpperCase()
    );
  }

  static detectManufacturerFromVin(vin: string): string {
    if (!vin || vin.length < 3) return 'Unknown';
    
    const wmi = vin.substring(0, 3).toUpperCase();
    
    // VIN World Manufacturer Identifier lookup
    const manufacturers: { [key: string]: string } = {
      // VAG Group
      'WAU': 'AUDI', 'WVW': 'VW', 'WBA': 'BMW', 'WDB': 'Mercedes',
      'VF7': 'PEUGEOT', 'VF3': 'PEUGEOT', 'VF1': 'PEUGEOT',
      'VSS': 'SEAT', 'TMB': 'SKODA', 'VF6': 'CITROEN',
      'JTD': 'TOYOTA', 'JHM': 'HONDA', 'JN1': 'NISSAN',
      'SAL': 'LAND ROVER', 'SAJ': 'JAGUAR', 'ZFA': 'FIAT',
      'ZAR': 'ALFA ROMEO', 'WME': 'MERCEDES', 'WF0': 'FORD',
      'SHH': 'HONDA', 'SB1': 'TOYOTA', 'YV1': 'VOLVO',
      'YS3': 'SAAB', 'VF8': 'VOLVO', 'TRU': 'AUDI',
      'TMA': 'SKODA', 'VF2': 'PEUGEOT', 'VF4': 'PEUGEOT',
      'VF5': 'PEUGEOT', 'VF9': 'PEUGEOT', 'VFA': 'PEUGEOT',
      'VFB': 'PEUGEOT', 'VFC': 'PEUGEOT', 'VFD': 'PEUGEOT',
      'VFE': 'PEUGEOT', 'VFF': 'PEUGEOT', 'VFG': 'PEUGEOT',
      'VFH': 'PEUGEOT', 'VFJ': 'PEUGEOT', 'VFK': 'PEUGEOT',
      'VFL': 'PEUGEOT', 'VFM': 'PEUGEOT', 'VFN': 'PEUGEOT',
      'VFP': 'PEUGEOT', 'VFR': 'PEUGEOT', 'VFS': 'PEUGEOT',
      'VFT': 'PEUGEOT', 'VFU': 'PEUGEOT', 'VFV': 'PEUGEOT',
      'VFW': 'PEUGEOT', 'VFX': 'PEUGEOT', 'VFY': 'PEUGEOT',
      'VFZ': 'PEUGEOT'
    };
    
    return manufacturers[wmi] || 'Unknown';
  }

  static getModelFromVin(vin: string): string {
    if (!vin || vin.length < 11) return 'Unknown';
    
    const manufacturer = this.detectManufacturerFromVin(vin);
    const modelCode = vin.substring(4, 8);
    
    // Model code lookup (expanded)
    const models: { [key: string]: { [key: string]: string } } = {
      'PEUGEOT': {
        '307': '307', '308': '308', '207': '207', '206': '206', '407': '407', '607': '607', '807': '807', '3008': '3008', '5008': '5008',
      },
      'SEAT': {
        'IBIZ': 'Ibiza', 'LEON': 'Leon', 'ALTE': 'Altea', 'CORD': 'Cordoba', 'TOLE': 'Toledo', 'AROSA': 'Arosa',
      },
      'VW': {
        'GOLF': 'Golf', 'POLO': 'Polo', 'PASS': 'Passat', 'TUAR': 'Touareg', 'TOUC': 'Touran', 'CADA': 'Caddy',
      },
      'FORD': {
        'FOCU': 'Focus', 'FIES': 'Fiesta', 'MOND': 'Mondeo', 'KUGA': 'Kuga', 'S-MA': 'S-Max', 'C-MA': 'C-Max',
      },
      'TOYOTA': {
        'CORO': 'Corolla', 'YARI': 'Yaris', 'AVEN': 'Avensis', 'AURI': 'Auris', 'PRIU': 'Prius', 'RAV4': 'RAV4',
      },
      'HONDA': {
        'CIVI': 'Civic', 'ACCO': 'Accord', 'JAZZ': 'Jazz', 'CR-V': 'CR-V', 'HR-V': 'HR-V',
      },
      'NISSAN': {
        'QASH': 'Qashqai', 'JUKE': 'Juke', 'X-TR': 'X-Trail', 'ALME': 'Almera', 'MICR': 'Micra',
      },
      'HYUNDAI': {
        'I20': 'i20', 'I30': 'i30', 'I40': 'i40', 'TUCSON': 'Tucson', 'SANTA': 'Santa Fe',
      },
      'KIA': {
        'CEED': 'Ceed', 'RIO': 'Rio', 'SPORT': 'Sportage', 'SOREN': 'Sorento',
      },
      'MAZDA': {
        'MAZ3': 'Mazda3', 'MAZ6': 'Mazda6', 'CX-5': 'CX-5', 'CX-3': 'CX-3',
      },
      'SUBARU': {
        'IMPR': 'Impreza', 'FORE': 'Forester', 'OUTB': 'Outback', 'XV': 'XV',
      },
      'GM': {
        'ASTR': 'Astra', 'CORSA': 'Corsa', 'INSIG': 'Insignia', 'ZAFIR': 'Zafira',
      },
      'CHRYSLER': {
        '300C': '300C', 'VOYA': 'Voyager', 'PTCR': 'PT Cruiser',
      },
      'FIAT': {
        'PUNTO': 'Punto', '500': '500', 'BRAVO': 'Bravo', 'DOBLO': 'Doblo',
      },
      'VOLVO': {
        'S60': 'S60', 'S80': 'S80', 'V40': 'V40', 'V60': 'V60', 'XC60': 'XC60',
      },
      'MERCEDES': {
        'C200': 'C200', 'E220': 'E220', 'S350': 'S350', 'GLA2': 'GLA 200',
      },
      'BMW': {
        '320D': '320d', '520D': '520d', 'X3': 'X3', 'X5': 'X5',
      },
      'AUDI': {
        'A3': 'A3', 'A4': 'A4', 'A6': 'A6', 'Q5': 'Q5',
      }
    };
    
    return models[manufacturer]?.[modelCode] || 'Unknown';
  }
}
