
import { VehicleProfile } from '@/types/vehicle';

export interface VINInfo {
  vin: string;
  make: string;
  model: string;
  year: number;
  engine: string;
  transmission: string;
  fuelType: string;
  country: string;
  manufacturer: string;
  displacement: string;
  bodyStyle: string;
  driveTrain: string;
  plantCode: string;
  serialNumber: string;
  recalls: RecallInfo[];
  serviceIntervals: ServiceInterval[];
  specifications: VehicleSpecs;
}

export interface RecallInfo {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  dateIssued: string;
  affectedVehicles: string;
  remedy: string;
  status: 'open' | 'completed' | 'superseded';
}

export interface ServiceInterval {
  service: string;
  intervalKm: number;
  intervalMonths: number;
  description: string;
  parts: string[];
  estimatedCost: string;
  criticality: 'routine' | 'important' | 'critical';
}

export interface VehicleSpecs {
  enginePower: string;
  engineTorque: string;
  fuelCapacity: string;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
    wheelbase: string;
  };
  performance: {
    topSpeed: string;
    acceleration: string;
    fuelConsumption: {
      city: string;
      highway: string;
      combined: string;
    };
  };
  emissions: {
    co2: string;
    euroStandard: string;
    particleFilter: boolean;
  };
}

class VINDecoderService {
  private readonly vinDatabase: { [key: string]: Partial<VINInfo> } = {
    // Peugeot VINs
    'VF3': {
      make: 'Peugeot',
      country: 'France',
      manufacturer: 'PSA Peugeot Citroën'
    },
    'VR3': {
      make: 'Peugeot',
      country: 'France', 
      manufacturer: 'PSA Peugeot Citroën'
    },
    // BMW VINs
    'WBA': {
      make: 'BMW',
      country: 'Germany',
      manufacturer: 'BMW AG'
    },
    'WBS': {
      make: 'BMW',
      country: 'Germany',
      manufacturer: 'BMW AG'
    },
    // VAG VINs
    'WVW': {
      make: 'Volkswagen',
      country: 'Germany',
      manufacturer: 'Volkswagen AG'
    },
    'VSS': {
      make: 'SEAT',
      country: 'Spain',
      manufacturer: 'SEAT S.A.'
    },
    'TMB': {
      make: 'Skoda',
      country: 'Czech Republic',
      manufacturer: 'Škoda Auto'
    }
  };

  private readonly serviceIntervals: { [make: string]: ServiceInterval[] } = {
    'Peugeot': [
      {
        service: 'Oil Change',
        intervalKm: 15000,
        intervalMonths: 12,
        description: 'Engine oil and filter replacement',
        parts: ['Engine Oil 5L', 'Oil Filter', 'Drain Plug Gasket'],
        estimatedCost: '€80-120',
        criticality: 'routine'
      },
      {
        service: 'Major Service',
        intervalKm: 30000,
        intervalMonths: 24,
        description: 'Comprehensive vehicle inspection and maintenance',
        parts: ['Air Filter', 'Fuel Filter', 'Spark Plugs', 'Brake Fluid'],
        estimatedCost: '€200-350',
        criticality: 'important'
      },
      {
        service: 'Timing Belt',
        intervalKm: 120000,
        intervalMonths: 60,
        description: 'Timing belt and water pump replacement',
        parts: ['Timing Belt Kit', 'Water Pump', 'Tensioner'],
        estimatedCost: '€400-800',
        criticality: 'critical'
      }
    ],
    'BMW': [
      {
        service: 'Inspection 1',
        intervalKm: 15000,
        intervalMonths: 12,
        description: 'Basic inspection and oil service',
        parts: ['Engine Oil', 'Oil Filter'],
        estimatedCost: '€150-250',
        criticality: 'routine'
      },
      {
        service: 'Inspection 2',
        intervalKm: 30000,
        intervalMonths: 24,
        description: 'Extended inspection with additional checks',
        parts: ['Air Filter', 'Fuel Filter', 'Brake Fluid'],
        estimatedCost: '€300-500',
        criticality: 'important'
      }
    ]
  };

  decodeVIN(vin: string): VINInfo | null {
    if (!this.isValidVIN(vin)) {
      return null;
    }

    const wmi = vin.substring(0, 3); // World Manufacturer Identifier
    const vds = vin.substring(3, 9); // Vehicle Descriptor Section
    const vis = vin.substring(9, 17); // Vehicle Identifier Section
    
    const year = this.decodeYear(vin.charAt(9));
    const plantCode = vin.charAt(10);
    const serialNumber = vin.substring(11, 17);

    const baseInfo = this.vinDatabase[wmi] || {};
    
    return {
      vin,
      make: baseInfo.make || 'Unknown',
      model: this.decodeModel(vin, baseInfo.make || ''),
      year,
      engine: this.decodeEngine(vin, baseInfo.make || ''),
      transmission: 'Manual', // Would need more VIN decoding logic
      fuelType: this.decodeFuelType(vin, baseInfo.make || ''),
      country: baseInfo.country || 'Unknown',
      manufacturer: baseInfo.manufacturer || 'Unknown',
      displacement: this.decodeDisplacement(vin),
      bodyStyle: this.decodeBodyStyle(vin),
      driveTrain: 'FWD', // Default assumption
      plantCode,
      serialNumber,
      recalls: this.getRecalls(baseInfo.make || '', year),
      serviceIntervals: this.getServiceIntervals(baseInfo.make || ''),
      specifications: this.getSpecifications(baseInfo.make || '', vin)
    };
  }

  private isValidVIN(vin: string): boolean {
    if (vin.length !== 17) return false;
    
    // Check for invalid characters
    const invalidChars = /[IOQ]/;
    if (invalidChars.test(vin)) return false;
    
    // Calculate check digit (position 9)
    const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
    const translationTable: { [key: string]: number } = {
      'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8,
      'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'P': 7, 'R': 9, 'S': 2,
      'T': 3, 'U': 4, 'V': 5, 'W': 6, 'X': 7, 'Y': 8, 'Z': 9
    };
    
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      const char = vin.charAt(i);
      const value = isNaN(Number(char)) ? translationTable[char] || 0 : Number(char);
      sum += value * weights[i];
    }
    
    const checkDigit = sum % 11;
    const expectedCheck = checkDigit === 10 ? 'X' : checkDigit.toString();
    
    return vin.charAt(8) === expectedCheck;
  }

  private decodeYear(char: string): number {
    const yearCodes: { [key: string]: number } = {
      'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014, 'F': 2015,
      'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019, 'L': 2020, 'M': 2021,
      'N': 2022, 'P': 2023, 'R': 2024, 'S': 2025, 'T': 2026, 'V': 2027,
      '1': 2001, '2': 2002, '3': 2003, '4': 2004, '5': 2005, '6': 2006,
      '7': 2007, '8': 2008, '9': 2009
    };
    
    return yearCodes[char] || new Date().getFullYear();
  }

  private decodeModel(vin: string, make: string): string {
    // Simplified model decoding - would need extensive database
    const modelCodes: { [key: string]: { [key: string]: string } } = {
      'Peugeot': {
        '3C': '307',
        '4C': '407',
        '5C': '508',
        'TU': '3008',
        'TS': '2008'
      },
      'BMW': {
        'AY': '3 Series',
        'BL': '5 Series',
        'DN': 'X3',
        'FE': 'X5'
      }
    };
    
    const code = vin.substring(4, 6);
    return modelCodes[make]?.[code] || 'Unknown Model';
  }

  private decodeEngine(vin: string, make: string): string {
    // Simplified engine decoding
    const engineCodes: { [key: string]: { [key: string]: string } } = {
      'Peugeot': {
        'H': '1.6L HDI',
        'R': '2.0L HDI',
        'P': '1.5L BlueHDi'
      }
    };
    
    const code = vin.charAt(7);
    return engineCodes[make]?.[code] || 'Unknown Engine';
  }

  private decodeFuelType(vin: string, make: string): string {
    // Basic fuel type detection
    const char8 = vin.charAt(7);
    if (['H', 'R', 'P'].includes(char8)) return 'Diesel';
    if (['G', 'T', 'S'].includes(char8)) return 'Gasoline';
    return 'Unknown';
  }

  private decodeDisplacement(vin: string): string {
    // Simplified displacement decoding
    return '1.6L'; // Default
  }

  private decodeBodyStyle(vin: string): string {
    return 'Sedan'; // Default
  }

  private getRecalls(make: string, year: number): RecallInfo[] {
    // Mock recall data - in production would query official databases
    const recalls: RecallInfo[] = [];
    
    if (make === 'Peugeot' && year >= 2005 && year <= 2010) {
      recalls.push({
        id: 'PEU-2024-001',
        title: 'DPF System Software Update',
        description: 'Software update for DPF regeneration system',
        severity: 'medium',
        dateIssued: '2024-01-15',
        affectedVehicles: '2005-2010 Peugeot 307 HDI',
        remedy: 'ECU software update at authorized dealer',
        status: 'open'
      });
    }
    
    return recalls;
  }

  private getServiceIntervals(make: string): ServiceInterval[] {
    return this.serviceIntervals[make] || [];
  }

  private getSpecifications(make: string, vin: string): VehicleSpecs {
    // Mock specifications - would be populated from vehicle database
    return {
      enginePower: '110 hp',
      engineTorque: '240 Nm',
      fuelCapacity: '60L',
      weight: '1350 kg',
      dimensions: {
        length: '4.40m',
        width: '1.75m',
        height: '1.50m',
        wheelbase: '2.65m'
      },
      performance: {
        topSpeed: '195 km/h',
        acceleration: '10.5s (0-100 km/h)',
        fuelConsumption: {
          city: '6.2L/100km',
          highway: '4.8L/100km',
          combined: '5.3L/100km'
        }
      },
      emissions: {
        co2: '139 g/km',
        euroStandard: 'Euro 4',
        particleFilter: true
      }
    };
  }

  async fetchOnlineVINData(vin: string): Promise<VINInfo | null> {
    // In production, this would call real VIN decoder APIs
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return this.decodeVIN(vin);
    } catch (error) {
      console.error('Failed to fetch online VIN data:', error);
      return null;
    }
  }

  createVehicleProfile(vinInfo: VINInfo): VehicleProfile {
    return {
      id: `profile_${vinInfo.vin}`,
      make: vinInfo.make,
      model: vinInfo.model,
      year: vinInfo.year,
      engine: vinInfo.engine,
      fuel: vinInfo.fuelType,
      displayName: `${vinInfo.make} ${vinInfo.model} ${vinInfo.year}`,
      vinPatterns: [vinInfo.vin.substring(0, 3) + '*'],
      supportedPids: {
        standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F'],
        manufacturer: [],
        dpf: vinInfo.specifications.emissions.particleFilter ? ['227C', '227D'] : []
      },
      pidMappings: {},
      specificParameters: {
        hasDPF: vinInfo.specifications.emissions.particleFilter,
        hasEGR: true,
        hasTurbo: vinInfo.fuelType === 'Diesel',
        fuelType: vinInfo.fuelType.toLowerCase(),
        emissionStandard: vinInfo.specifications.emissions.euroStandard,
        manufacturerProtocol: vinInfo.make === 'Peugeot' ? 'PSA' : 'Generic'
      }
    };
  }
}

export const vinDecoderService = new VINDecoderService();
