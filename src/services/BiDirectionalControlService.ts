import { enhancedNativeBluetoothService } from '@/services/EnhancedNativeBluetoothService';
import { VehicleModule, ModuleFunction } from '@/types/vehicleModules';

export interface ActuatorTestResult {
  success: boolean;
  functionName: string;
  moduleId: string;
  response: string;
  timestamp: Date;
  duration: number;
}

export interface ActuatorTestProgress {
  functionName: string;
  moduleId: string;
  progress: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  message: string;
}

export class BiDirectionalControlService {
  private static instance: BiDirectionalControlService;
  private isTesting = false;
  private currentTest: string | null = null;
  
  private constructor() {}
  
  static getInstance(): BiDirectionalControlService {
    if (!BiDirectionalControlService.instance) {
      BiDirectionalControlService.instance = new BiDirectionalControlService();
    }
    return BiDirectionalControlService.instance;
  }
  
  /**
   * Execute an actuator test function
   */
  async executeActuatorTest(
    module: VehicleModule, 
    func: ModuleFunction
  ): Promise<ActuatorTestResult> {
    if (this.isTesting) {
      throw new Error('Another test is already in progress');
    }
    
    this.isTesting = true;
    this.currentTest = func.id;
    const startTime = Date.now();
    
    try {
      console.log(`Executing actuator test: ${func.name} on module ${module.name}`);
      
      // Check if we're connected
      const isConnected = await enhancedNativeBluetoothService.isConnected();
      if (!isConnected) {
        throw new Error('Not connected to vehicle. Please connect to a vehicle first.');
      }
      
      // Validate that this is an actuator function
      if (func.type !== 'actuator') {
        throw new Error('Function is not an actuator test');
      }
      
      // Send the command to the vehicle
      let response: string;
      if (func.command) {
        response = await enhancedNativeBluetoothService.sendCommand(func.command);
      } else {
        // If no specific command, send a generic test command
        response = await enhancedNativeBluetoothService.sendCommand(`3101${module.ecuAddress || '01'}`);
      }
      
      const duration = Date.now() - startTime;
      
      // Parse the response to determine success
      const success = this.parseActuatorResponse(response);
      
      return {
        success,
        functionName: func.name,
        moduleId: module.id,
        response,
        timestamp: new Date(),
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      throw {
        success: false,
        functionName: func.name,
        moduleId: module.id,
        response: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        duration
      };
    } finally {
      this.isTesting = false;
      this.currentTest = null;
    }
  }
  
  /**
   * Execute multiple actuator tests in sequence
   */
  async executeMultipleTests(
    tests: { module: VehicleModule; func: ModuleFunction }[],
    onProgress?: (progress: ActuatorTestProgress) => void
  ): Promise<ActuatorTestResult[]> {
    const results: ActuatorTestResult[] = [];
    
    for (let i = 0; i < tests.length; i++) {
      const { module, func } = tests[i];
      
      // Report progress
      if (onProgress) {
        onProgress({
          functionName: func.name,
          moduleId: module.id,
          progress: (i / tests.length) * 100,
          status: 'running',
          message: `Executing ${func.name}`
        });
      }
      
      try {
        const result = await this.executeActuatorTest(module, func);
        results.push(result);
        
        // Report completion
        if (onProgress) {
          onProgress({
            functionName: func.name,
            moduleId: module.id,
            progress: ((i + 1) / tests.length) * 100,
            status: 'completed',
            message: `Completed ${func.name}`
          });
        }
      } catch (error) {
        // Add error result
        results.push(error as ActuatorTestResult);
        
        // Report failure
        if (onProgress) {
          onProgress({
            functionName: func.name,
            moduleId: module.id,
            progress: ((i + 1) / tests.length) * 100,
            status: 'failed',
            message: `Failed ${func.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
        }
      }
    }
    
    return results;
  }
  
  /**
   * Stop the current test
   */
  async stopCurrentTest(): Promise<boolean> {
    if (!this.isTesting) {
      return false;
    }
    
    try {
      // Send stop command
      await enhancedNativeBluetoothService.sendCommand('04'); // Stop command
      this.isTesting = false;
      this.currentTest = null;
      return true;
    } catch (error) {
      console.error('Error stopping test:', error);
      return false;
    }
  }
  
  /**
   * Check if a test is currently running
   */
  isTestRunning(): boolean {
    return this.isTesting;
  }
  
  /**
   * Get the current test ID
   */
  getCurrentTest(): string | null {
    return this.currentTest;
  }
  
  /**
   * Parse actuator response to determine success
   */
  private parseActuatorResponse(response: string): boolean {
    // This is a simplified parser - in a real implementation, 
    // this would be much more sophisticated based on the protocol
    
    // Check for common success indicators
    if (response.includes('OK') || response.includes('SUCCESS') || response.includes('41')) {
      return true;
    }
    
    // Check for error indicators
    if (response.includes('ERROR') || response.includes('NO DATA') || response.includes('STOPPED')) {
      return false;
    }
    
    // If response is not empty, assume success
    return response.trim().length > 0;
  }
  
  /**
   * Get supported actuator functions for a module
   */
  getActuatorFunctions(module: VehicleModule): ModuleFunction[] {
    return module.supportedFunctions.filter(func => func.type === 'actuator');
  }
  
  /**
   * Get all actuator functions across all modules
   */
  getAllActuatorFunctions(modules: VehicleModule[]): { module: VehicleModule; func: ModuleFunction }[] {
    const actuatorFunctions: { module: VehicleModule; func: ModuleFunction }[] = [];
    
    for (const module of modules) {
      const funcs = this.getActuatorFunctions(module);
      for (const func of funcs) {
        actuatorFunctions.push({ module, func });
      }
    }
    
    return actuatorFunctions;
  }
  
  /**
   * Validate if a function can be executed based on required level
   */
  validateFunctionAccess(func: ModuleFunction, userLevel: 'basic' | 'advanced' | 'dealer' = 'basic'): boolean {
    if (!func.requiredLevel) {
      return true; // No level required
    }
    
    // Define access hierarchy
    const levelHierarchy = {
      'basic': 1,
      'advanced': 2,
      'dealer': 3
    };
    
    return levelHierarchy[userLevel] >= levelHierarchy[func.requiredLevel];
  }
  
  /**
   * Get test history
   */
  getTestHistory(): ActuatorTestResult[] {
    try {
      const history = localStorage.getItem('actuator_test_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.warn('Failed to load test history:', error);
      return [];
    }
  }
  
  /**
   * Save test result to history
   */
  private saveTestResult(result: ActuatorTestResult): void {
    try {
      const history = this.getTestHistory();
      history.unshift(result); // Add to beginning
      
      // Keep only the last 50 tests
      if (history.length > 50) {
        history.splice(50);
      }
      
      localStorage.setItem('actuator_test_history', JSON.stringify(history));
    } catch (error) {
      console.warn('Failed to save test result:', error);
    }
  }
  
  /**
   * Clear test history
   */
  clearTestHistory(): void {
    try {
      localStorage.removeItem('actuator_test_history');
    } catch (error) {
      console.warn('Failed to clear test history:', error);
    }
  }
}

// Export singleton instance
export const biDirectionalControlService = BiDirectionalControlService.getInstance();