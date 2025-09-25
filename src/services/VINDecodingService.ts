import { databaseService, VINDecodeRecord } from '@/services/DatabaseService';

// VIN decoding rules based on WMI (World Manufacturer Identifier)
const VIN_DECODING_RULES = {
  // European manufacturers
  'VF': { make: 'Peugeot', country: 'France' },
  'VW': { make: 'Volkswagen', country: 'Germany' },
  'VSS': { make: 'SEAT', country: 'Spain' },
  'VS': { make: 'SEAT', country: 'Spain' },
  'WV': { make: 'Volkswagen', country: 'Germany' },
  'WU': { make: 'Volkswagen', country: 'Germany' },
  'WA': { make: 'Audi', country: 'Germany' },
  'WB': { make: 'BMW', country: 'Germany' },
  'WM': { make: 'MINI', country: 'UK' },
  
  // French manufacturers
  'VF3': { make: 'Peugeot', country: 'France' },
  'VF7': { make: 'Citroën', country: 'France' },
  
  // Italian manufacturers
  'ZFA': { make: 'Fiat', country: 'Italy' },
  'ZFF': { make: 'Ferrari', country: 'Italy' },
  
  // Japanese manufacturers
  'JH': { make: 'Honda', country: 'Japan' },
  'JM': { make: 'Mazda', country: 'Japan' },
  'JN': { make: 'Nissan', country: 'Japan' },
  'JT': { make: 'Toyota', country: 'Japan' },
  
  // American manufacturers
  '1H': { make: 'Honda', country: 'USA' },
  '1N': { make: 'Nissan', country: 'USA' },
  '2T': { make: 'Toyota', country: 'Canada' },
  '3H': { make: 'Honda', country: 'Canada' },
  
  // Korean manufacturers
  'KMH': { make: 'Hyundai', country: 'South Korea' },
  'KNA': { make: 'Kia', country: 'South Korea' }
};

// Model year codes (1980-2039)
const MODEL_YEAR_CODES: { [key: string]: number } = {
  'A': 1980, 'B': 1981, 'C': 1982, 'D': 1983, 'E': 1984, 'F': 1985, 'G': 1986, 'H': 1987, 'J': 1988, 'K': 1989,
  'L': 1990, 'M': 1991, 'N': 1992, 'P': 1993, 'R': 1994, 'S': 1995, 'T': 1996, 'V': 1997, 'W': 1998, 'X': 1999,
  'Y': 2000, '1': 2001, '2': 2002, '3': 2003, '4': 2004, '5': 2005, '6': 2006, '7': 2007, '8': 2008, '9': 2009,
  'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014, 'F': 2015, 'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019,
  'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023, 'R': 2024, 'S': 2025, 'T': 2026, 'V': 2027, 'W': 2028, 'X': 2029,
  'Y': 2030, '1': 2031, '2': 2032, '3': 2033, '4': 2034, '5': 2035, '6': 2036, '7': 2037, '8': 2038, '9': 2039
};

export interface DecodedVIN {
  vin: string;
  make: string;
  model?: string;
  year?: number;
  engine?: string;
  fuelType?: string;
  country?: string;
  plant?: string;
  serial?: string;
  confidence: number; // 0-100 confidence score
}

export class VINDecodingService {
  private static instance: VINDecodingService;
  
  private constructor() {}
  
  static getInstance(): VINDecodingService {
    if (!VINDecodingService.instance) {
      VINDecodingService.instance = new VINDecodingService();
    }
    return VINDecodingService.instance;
  }
  
  /**
   * Decode a VIN number
   */
  async decodeVIN(vin: string): Promise<DecodedVIN> {
    // Clean the VIN
    const cleanVIN = vin.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Validate VIN length
    if (cleanVIN.length !== 17) {
      throw new Error('Invalid VIN length. VIN must be 17 characters.');
    }
    
    // Check if we have a cached decode result
    const cachedResult = await this.getCachedDecode(cleanVIN);
    if (cachedResult) {
      return cachedResult;
    }
    
    // Decode using rules
    const decoded = this.decodeVINWithRules(cleanVIN);
    
    // Save to cache
    await this.cacheDecodeResult(cleanVIN, decoded);
    
    return decoded;
  }
  
  /**
   * Decode VIN using rule-based approach
   */
  private decodeVINWithRules(vin: string): DecodedVIN {
    const wmi = vin.substring(0, 3); // World Manufacturer Identifier
    const vds = vin.substring(3, 9); // Vehicle Descriptor Section
    const vis = vin.substring(9, 17); // Vehicle Identifier Section
    const yearCode = vin.charAt(9); // Model year
    const plantCode = vin.charAt(10); // Assembly plant
    
    // Initialize result
    const result: DecodedVIN = {
      vin,
      make: 'Unknown',
      confidence: 0
    };
    
    // Decode manufacturer from WMI
    const manufacturer = this.decodeManufacturer(wmi);
    if (manufacturer) {
      result.make = manufacturer.make;
      result.country = manufacturer.country;
      result.confidence += 40; // High confidence for manufacturer
    }
    
    // Decode model year
    const year = MODEL_YEAR_CODES[yearCode];
    if (year) {
      result.year = year;
      result.confidence += 20; // Medium confidence for year
    }
    
    // Extract plant and serial information
    result.plant = plantCode;
    result.serial = vis.substring(2); // Last 6 characters of VIS
    
    // Try to decode model based on make and VDS
    const model = this.decodeModel(result.make, vds);
    if (model) {
      result.model = model;
      result.confidence += 20; // Medium confidence for model
    }
    
    // Try to decode engine based on VDS
    const engine = this.decodeEngine(vds);
    if (engine) {
      result.engine = engine.engine;
      result.fuelType = engine.fuelType;
      result.confidence += 20; // Medium confidence for engine
    }
    
    return result;
  }
  
  /**
   * Decode manufacturer from WMI
   */
  private decodeManufacturer(wmi: string): { make: string; country: string } | null {
    // Check exact match first
    if (VIN_DECODING_RULES[wmi]) {
      return VIN_DECODING_RULES[wmi];
    }
    
    // Check 2-character match
    const wmi2 = wmi.substring(0, 2);
    if (VIN_DECODING_RULES[wmi2]) {
      return VIN_DECODING_RULES[wmi2];
    }
    
    return null;
  }
  
  /**
   * Decode model based on make and VDS
   */
  private decodeModel(make: string, vds: string): string | null {
    // This is a simplified model decoder
    // In a real implementation, this would be much more comprehensive
    
    switch (make) {
      case 'Peugeot':
        if (vds.startsWith('B')) return '206';
        if (vds.startsWith('C')) return '307';
        if (vds.startsWith('D')) return '308';
        if (vds.startsWith('E')) return '508';
        break;
        
      case 'SEAT':
        if (vds.startsWith('6L')) return 'Ibiza';
        if (vds.startsWith('6J')) return 'Ibiza';
        if (vds.startsWith('1M')) return 'León';
        if (vds.startsWith('1P')) return 'León';
        break;
        
      case 'Volkswagen':
        if (vds.startsWith('1H')) return 'Golf';
        if (vds.startsWith('3A')) return 'Golf';
        if (vds.startsWith('3B')) return 'Golf';
        if (vds.startsWith('1N')) return 'Passat';
        break;
        
      case 'Audi':
        if (vds.startsWith('8L')) return 'A3';
        if (vds.startsWith('8P')) return 'A3';
        if (vds.startsWith('8V')) return 'A3';
        if (vds.startsWith('B6')) return 'A4';
        break;
    }
    
    return null;
  }
  
  /**
   * Decode engine based on VDS
   */
  private decodeEngine(vds: string): { engine: string; fuelType: string } | null {
    // This is a simplified engine decoder
    // In a real implementation, this would be much more comprehensive
    
    // Check engine codes in VDS
    const engineCode = vds.substring(5, 7);
    
    switch (engineCode) {
      case 'AL':
        return { engine: '1.4L TDI', fuelType: 'Diesel' };
      case 'AM':
        return { engine: '1.4L TDI', fuelType: 'Diesel' };
      case 'BK':
        return { engine: '1.9L TDI', fuelType: 'Diesel' };
      case 'CR':
        return { engine: '2.0L TDI', fuelType: 'Diesel' };
      case 'TU':
        return { engine: '1.6L Petrol', fuelType: 'Petrol' };
      case 'EP':
        return { engine: '1.6L THP', fuelType: 'Petrol' };
    }
    
    return null;
  }
  
  /**
   * Get cached decode result
   */
  private async getCachedDecode(vin: string): Promise<DecodedVIN | null> {
    try {
      const records = await databaseService.getVINDecodeHistory(vin);
      if (records.length > 0) {
        const latest = records[0];
        return {
          vin: latest.vin,
          ...latest.decodedData,
          confidence: 100 // Cached results have high confidence
        };
      }
    } catch (error) {
      console.warn('Failed to get cached VIN decode:', error);
    }
    
    return null;
  }
  
  /**
   * Cache decode result
   */
  private async cacheDecodeResult(vin: string, decoded: DecodedVIN): Promise<void> {
    try {
      const decodedData = { ...decoded };
      delete (decodedData as any).vin; // Remove VIN from decoded data
      
      await databaseService.saveVINDecode(vin, decodedData);
    } catch (error) {
      console.warn('Failed to cache VIN decode result:', error);
    }
  }
  
  /**
   * Validate VIN checksum (for North American VINs)
   */
  validateVINChecksum(vin: string): boolean {
    // Only validate checksum for North American VINs (1st char is 1, 2, 3, 4, or 5)
    const firstChar = vin.charAt(0);
    if (!['1', '2', '3', '4', '5'].includes(firstChar)) {
      return true; // Skip checksum validation for non-North American VINs
    }
    
    // Weights for each position
    const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
    
    // Character values
    const charValues: { [key: string]: number } = {
      'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8,
      'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'P': 7, 'R': 9,
      'S': 2, 'T': 3, 'U': 4, 'V': 5, 'W': 6, 'X': 7, 'Y': 8, 'Z': 9
    };
    
    // Add numeric characters
    for (let i = 0; i <= 9; i++) {
      charValues[i.toString()] = i;
    }
    
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      if (i === 8) continue; // Skip check digit position
      
      const char = vin.charAt(i).toUpperCase();
      const value = charValues[char];
      
      if (value === undefined) {
        return false; // Invalid character
      }
      
      sum += value * weights[i];
    }
    
    const checkDigit = sum % 11;
    const expectedCheckDigit = checkDigit === 10 ? 'X' : checkDigit.toString();
    const actualCheckDigit = vin.charAt(8).toUpperCase();
    
    return expectedCheckDigit === actualCheckDigit;
  }
  
  /**
   * Get decode history for a VIN
   */
  async getDecodeHistory(vin: string): Promise<VINDecodeRecord[]> {
    return await databaseService.getVINDecodeHistory(vin);
  }
  
  /**
   * Get all decode history
   */
  async getAllDecodeHistory(): Promise<VINDecodeRecord[]> {
    return await databaseService.getAllVINDecodes();
  }
}

// Export singleton instance
export const vinDecodingService = VINDecodingService.getInstance();