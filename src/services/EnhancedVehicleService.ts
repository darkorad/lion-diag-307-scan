import { ENHANCED_VEHICLE_DATABASE, ENHANCED_VEHICLE_MODULES } from '@/constants/enhancedVehicleDatabase';
import { VehicleMake, VehicleProfile } from '@/types/vehicle';
import { VehicleModule } from '@/types/vehicleModules';

export class EnhancedVehicleService {
  private static instance: EnhancedVehicleService;
  
  private constructor() {}
  
  static getInstance(): EnhancedVehicleService {
    if (!EnhancedVehicleService.instance) {
      EnhancedVehicleService.instance = new EnhancedVehicleService();
    }
    return EnhancedVehicleService.instance;
  }
  
  /**
   * Get all vehicle makes from the enhanced database
   */
  getAllMakes(): VehicleMake[] {
    return [...ENHANCED_VEHICLE_DATABASE];
  }
  
  /**
   * Get a specific make by ID
   */
  getMakeById(makeId: string): VehicleMake | undefined {
    return ENHANCED_VEHICLE_DATABASE.find(make => make.id === makeId);
  }
  
  /**
   * Get all models for a specific make
   */
  getModelsByMake(makeId: string) {
    const make = this.getMakeById(makeId);
    return make ? make.models : [];
  }
  
  /**
   * Get all generations for a specific model
   */
  getGenerationsByModel(makeId: string, modelId: string) {
    const make = this.getMakeById(makeId);
    if (!make) return [];
    
    const model = make.models.find(m => m.id === modelId);
    return model ? model.generations : [];
  }
  
  /**
   * Get all engines for a specific generation
   */
  getEnginesByGeneration(makeId: string, modelId: string, generationId: string) {
    const make = this.getMakeById(makeId);
    if (!make) return [];
    
    const model = make.models.find(m => m.id === modelId);
    if (!model) return [];
    
    const generation = model.generations.find(g => g.id === generationId);
    return generation ? generation.engines : [];
  }
  
  /**
   * Find vehicle profile by VIN
   */
  findVehicleByVIN(vin: string): VehicleProfile | null {
    // This is a simplified VIN decoding - in a real implementation, 
    // this would be much more comprehensive
    for (const make of ENHANCED_VEHICLE_DATABASE) {
      for (const model of make.models) {
        for (const generation of model.generations) {
          for (const engine of generation.engines) {
            // For now, we'll use a simplified approach since VehicleEngine doesn't have vinPatterns
            // In a real implementation, this would be more sophisticated
            return {
              id: engine.id,
              make: make.name,
              model: model.name,
              year: generation.yearRange.start, // Simplified
              engine: engine.name,
              fuel: engine.fuelType,
              displayName: `${make.name} ${model.name} ${engine.name}`,
              vinPatterns: [],
              supportedPids: engine.supportedPids,
              pidMappings: engine.pidMappings,
              specificParameters: engine.specificParameters
            };
          }
        }
      }
    }
    return null;
  }
  
  /**
   * Get all vehicle modules
   */
  getAllModules(): VehicleModule[] {
    return [...ENHANCED_VEHICLE_MODULES];
  }
  
  /**
   * Get modules by category
   */
  getModulesByCategory(category: string): VehicleModule[] {
    return ENHANCED_VEHICLE_MODULES.filter(module => module.category === category);
  }
  
  /**
   * Get module by ID
   */
  getModuleById(id: string): VehicleModule | undefined {
    return ENHANCED_VEHICLE_MODULES.find(module => module.id === id);
  }
  
  /**
   * Get supported modules for a specific make
   */
  getSupportedModulesForMake(make: string): VehicleModule[] {
    return ENHANCED_VEHICLE_MODULES.filter(module => 
      !module.makeSpecific || module.makeSpecific.includes(make)
    );
  }
  
  /**
   * Search vehicles by make, model, or engine
   */
  searchVehicles(query: string): VehicleProfile[] {
    const results: VehicleProfile[] = [];
    const lowerQuery = query.toLowerCase();
    
    for (const make of ENHANCED_VEHICLE_DATABASE) {
      for (const model of make.models) {
        for (const generation of model.generations) {
          for (const engine of generation.engines) {
            // Check if query matches make, model, or engine
            if (
              make.name.toLowerCase().includes(lowerQuery) ||
              model.name.toLowerCase().includes(lowerQuery) ||
              engine.name.toLowerCase().includes(lowerQuery) ||
              engine.engineCode.toLowerCase().includes(lowerQuery)
            ) {
              results.push({
                id: engine.id,
                make: make.name,
                model: model.name,
                year: generation.yearRange.start, // Simplified
                engine: engine.name,
                fuel: engine.fuelType,
                displayName: `${make.name} ${model.name} ${engine.name}`,
                vinPatterns: [],
                supportedPids: engine.supportedPids,
                pidMappings: engine.pidMappings,
                specificParameters: engine.specificParameters
              });
            }
          }
        }
      }
    }
    
    return results;
  }
  
  /**
   * Get all available functions for a specific module
   */
  getModuleFunctions(moduleId: string) {
    const module = this.getModuleById(moduleId);
    return module ? module.supportedFunctions : [];
  }
  
  /**
   * Get advanced functions (actuator tests, adaptations, coding)
   */
  getAdvancedFunctions() {
    const advancedFunctions = [];
    for (const module of ENHANCED_VEHICLE_MODULES) {
      for (const func of module.supportedFunctions) {
        if (func.requiredLevel === 'advanced' || func.type === 'actuator' || func.type === 'adaptation' || func.type === 'coding') {
          advancedFunctions.push({
            moduleId: module.id,
            moduleName: module.name,
            ...func
          });
        }
      }
    }
    return advancedFunctions;
  }
  
  /**
   * Get reset functions (service resets, oil changes, etc.)
   */
  getResetFunctions() {
    const resetFunctions = [];
    for (const module of ENHANCED_VEHICLE_MODULES) {
      for (const func of module.supportedFunctions) {
        if (func.type === 'write' && func.name.includes('Reset')) {
          resetFunctions.push({
            moduleId: module.id,
            moduleName: module.name,
            ...func
          });
        }
      }
    }
    return resetFunctions;
  }
}

// Export singleton instance
export const enhancedVehicleService = EnhancedVehicleService.getInstance();