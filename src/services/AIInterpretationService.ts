import { toast } from 'sonner';

export interface DiagnosticIssue {
  code: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestedActions: string[];
  relatedSystems: string[];
}

export interface InterpretationResult {
  summary: string;
  issues: DiagnosticIssue[];
  recommendations: string[];
  safetyNotes: string[];
}

export class AIInterpretationService {
  private static instance: AIInterpretationService;

  static getInstance(): AIInterpretationService {
    if (!AIInterpretationService.instance) {
      AIInterpretationService.instance = new AIInterpretationService();
    }
    return AIInterpretationService.instance;
  }

  /**
   * Interpret diagnostic trouble codes and provide user-friendly explanations
   */
  async interpretDTCCodes(codes: string[]): Promise<InterpretationResult> {
    try {
      // In a real implementation, this would call an AI service
      // For now, we'll simulate intelligent interpretation
      const issues: DiagnosticIssue[] = codes.map(code => this.analyzeDTCCode(code));
      
      const result: InterpretationResult = {
        summary: this.generateSummary(issues),
        issues,
        recommendations: this.generateRecommendations(issues),
        safetyNotes: this.generateSafetyNotes(issues)
      };

      return result;
    } catch (error) {
      console.error('AI interpretation failed:', error);
      toast.error('Failed to interpret diagnostic codes');
      throw error;
    }
  }

  /**
   * Interpret live data parameters and identify potential issues
   */
  async interpretLiveData(parameters: Record<string, string | number>): Promise<InterpretationResult> {
    try {
      const issues: DiagnosticIssue[] = [];
      
      // Analyze each parameter for potential issues
      Object.entries(parameters).forEach(([pid, value]) => {
        const issue = this.analyzeLiveDataParameter(pid, value);
        if (issue) {
          issues.push(issue);
        }
      });
      
      const result: InterpretationResult = {
        summary: this.generateLiveDataSummary(issues, parameters),
        issues,
        recommendations: this.generateRecommendations(issues),
        safetyNotes: this.generateSafetyNotes(issues)
      };

      return result;
    } catch (error) {
      console.error('AI live data interpretation failed:', error);
      toast.error('Failed to interpret live data');
      throw error;
    }
  }

  /**
   * Analyze a single DTC code and provide interpretation
   */
  private analyzeDTCCode(code: string): DiagnosticIssue {
    // This is a simplified analyzer - in a real implementation, 
    // this would use a comprehensive database and AI models
    
    const issue: DiagnosticIssue = {
      code,
      description: '',
      severity: 'medium',
      suggestedActions: [],
      relatedSystems: []
    };

    // Parse the code to determine system and issue type
    if (code.startsWith('P')) {
      // Powertrain codes
      issue.relatedSystems.push('Engine', 'Transmission');
      if (code.includes('0')) {
        issue.description = 'Fuel and air metering system issue';
        issue.severity = 'medium';
        issue.suggestedActions = ['Check fuel system', 'Inspect air filter', 'Scan for additional codes'];
      } else if (code.includes('1')) {
        issue.description = 'Fuel and air metering injector circuit issues';
        issue.severity = 'medium';
        issue.suggestedActions = ['Inspect fuel injectors', 'Check fuel pressure', 'Verify injector wiring'];
      } else if (code.includes('2')) {
        issue.description = 'Fuel and air metering (injector) issues';
        issue.severity = 'high';
        issue.suggestedActions = ['Replace faulty injectors', 'Clean fuel system', 'Check fuel quality'];
      } else if (code.includes('3')) {
        issue.description = 'Ignition system or misfire issues';
        issue.severity = 'high';
        issue.suggestedActions = ['Check ignition coils', 'Inspect spark plugs', 'Verify fuel quality'];
      } else {
        issue.description = 'General powertrain issue';
        issue.severity = 'medium';
        issue.suggestedActions = ['Perform comprehensive diagnostic scan', 'Check for technical service bulletins'];
      }
    } else if (code.startsWith('C')) {
      // Chassis codes
      issue.relatedSystems.push('ABS', 'Traction Control', 'Suspension');
      issue.description = 'Chassis system issue';
      issue.severity = 'high';
      issue.suggestedActions = ['Inspect ABS sensors', 'Check brake system', 'Scan chassis modules'];
    } else if (code.startsWith('B')) {
      // Body codes
      issue.relatedSystems.push('Body Control', 'Comfort Systems', 'Lighting');
      issue.description = 'Body system issue';
      issue.severity = 'low';
      issue.suggestedActions = ['Check body control module', 'Inspect related sensors', 'Verify fuses and wiring'];
    } else {
      issue.description = 'Unknown diagnostic code';
      issue.severity = 'low';
      issue.suggestedActions = ['Verify code is valid', 'Perform manual diagnostic'];
    }

    return issue;
  }

  /**
   * Analyze a live data parameter for potential issues
   */
  private analyzeLiveDataParameter(pid: string, value: string | number): DiagnosticIssue | null {
    // Convert value to number if possible
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) {
      return null;
    }

    const issue: DiagnosticIssue = {
      code: `LIVE_${pid}`,
      description: '',
      severity: 'low',
      suggestedActions: [],
      relatedSystems: []
    };

    switch (pid) {
      case '010C': // Engine RPM
        if (numValue > 3000 && numValue < 4000) {
          issue.description = 'High engine RPM at idle';
          issue.severity = 'medium';
          issue.relatedSystems = ['Engine'];
          issue.suggestedActions = ['Check for vacuum leaks', 'Inspect idle air control valve'];
        } else if (numValue > 4000) {
          issue.description = 'Very high engine RPM - potential idle control issue';
          issue.severity = 'high';
          issue.relatedSystems = ['Engine'];
          issue.suggestedActions = ['Immediately stop vehicle', 'Check idle control system', 'Inspect for vacuum leaks'];
        }
        break;

      case '010D': // Vehicle Speed
        if (numValue > 200) {
          issue.description = 'Excessive vehicle speed detected';
          issue.severity = 'high';
          issue.relatedSystems = ['Speed Sensor'];
          issue.suggestedActions = ['Verify speed sensor accuracy', 'Check for sensor damage'];
        }
        break;

      case '0105': // Engine Coolant Temperature
        if (numValue > 105) {
          issue.description = 'Engine overheating';
          issue.severity = 'critical';
          issue.relatedSystems = ['Cooling System'];
          issue.suggestedActions = ['Stop vehicle immediately', 'Check coolant level', 'Inspect radiator and fans'];
        } else if (numValue < 60 && numValue > 0) {
          issue.description = 'Engine under normal operating temperature';
          issue.severity = 'low';
          issue.relatedSystems = ['Cooling System'];
          issue.suggestedActions = ['Check thermostat operation', 'Verify coolant level'];
        }
        break;

      case '0111': // Throttle Position
        if (numValue > 90) {
          issue.description = 'Throttle position abnormally high';
          issue.severity = 'high';
          issue.relatedSystems = ['Throttle Body'];
          issue.suggestedActions = ['Check for stuck throttle', 'Inspect throttle cable/linkage', 'Scan for related codes'];
        }
        break;

      default:
        return null;
    }

    return issue.description ? issue : null;
  }

  /**
   * Generate a summary from issues
   */
  private generateSummary(issues: DiagnosticIssue[]): string {
    if (issues.length === 0) {
      return 'No significant issues detected in the diagnostic scan.';
    }

    const critical = issues.filter(i => i.severity === 'critical').length;
    const high = issues.filter(i => i.severity === 'high').length;
    const medium = issues.filter(i => i.severity === 'medium').length;
    const low = issues.filter(i => i.severity === 'low').length;

    if (critical > 0) {
      return `Critical issues detected! Immediate attention required. Found ${critical} critical, ${high} high, ${medium} medium, and ${low} low severity issues.`;
    } else if (high > 0) {
      return `Significant issues detected. Found ${high} high, ${medium} medium, and ${low} low severity issues.`;
    } else if (medium > 0) {
      return `Minor issues detected. Found ${medium} medium and ${low} low severity issues.`;
    } else {
      return `Low severity issues detected. Found ${low} minor issues.`;
    }
  }

  /**
   * Generate a summary for live data
   */
  private generateLiveDataSummary(issues: DiagnosticIssue[], parameters: Record<string, string | number>): string {
    if (issues.length === 0) {
      return 'All live data parameters are within normal ranges.';
    }

    const critical = issues.filter(i => i.severity === 'critical').length;
    const high = issues.filter(i => i.severity === 'high').length;

    if (critical > 0) {
      return `Critical parameter values detected! Immediate attention required. Monitoring ${Object.keys(parameters).length} parameters.`;
    } else if (high > 0) {
      return `Abnormal parameter values detected. Monitoring ${Object.keys(parameters).length} parameters.`;
    } else {
      return `Minor parameter deviations detected. Monitoring ${Object.keys(parameters).length} parameters.`;
    }
  }

  /**
   * Generate recommendations based on issues
   */
  private generateRecommendations(issues: DiagnosticIssue[]): string[] {
    const recommendations: string[] = [];
    
    if (issues.length === 0) {
      recommendations.push('Continue regular vehicle maintenance as scheduled.');
      recommendations.push('Monitor vehicle performance for any changes.');
      return recommendations;
    }

    // Add system-specific recommendations
    const systems = new Set<string>();
    issues.forEach(issue => {
      issue.relatedSystems.forEach(system => systems.add(system));
    });

    if (systems.has('Engine')) {
      recommendations.push('Have engine performance inspected by a qualified technician.');
    }
    
    if (systems.has('Cooling System')) {
      recommendations.push('Check coolant level and condition.');
    }
    
    if (systems.has('Fuel System')) {
      recommendations.push('Verify fuel quality and check fuel system components.');
    }

    // Add general recommendations based on severity
    const critical = issues.filter(i => i.severity === 'critical').length;
    const high = issues.filter(i => i.severity === 'high').length;
    
    if (critical > 0) {
      recommendations.unshift('STOP DRIVING THE VEHICLE UNTIL ISSUES ARE RESOLVED!');
      recommendations.push('Have vehicle towed to a service facility immediately.');
    } else if (high > 0) {
      recommendations.push('Schedule service appointment as soon as possible.');
    } else {
      recommendations.push('Monitor these issues and schedule service if symptoms worsen.');
    }

    return recommendations;
  }

  /**
   * Generate safety notes based on issues
   */
  private generateSafetyNotes(issues: DiagnosticIssue[]): string[] {
    const safetyNotes: string[] = [];
    
    const critical = issues.filter(i => i.severity === 'critical').length;
    const high = issues.filter(i => i.severity === 'high').length;
    
    if (critical > 0) {
      safetyNotes.push('CRITICAL SAFETY ISSUE: Vehicle may not be safe to operate.');
      safetyNotes.push('Do not continue driving until the issue is resolved.');
    } else if (high > 0) {
      safetyNotes.push('SAFETY WARNING: Vehicle performance may be compromised.');
      safetyNotes.push('Use caution when driving and avoid high speeds or heavy loads.');
    }
    
    if (issues.some(i => i.relatedSystems.includes('Brake') || i.relatedSystems.includes('ABS'))) {
      safetyNotes.push('Brake system issues may affect stopping distance.');
    }
    
    if (issues.some(i => i.relatedSystems.includes('Engine'))) {
      safetyNotes.push('Engine issues may affect performance and emissions.');
    }

    return safetyNotes;
  }

  /**
   * Generate next steps based on current diagnostic results
   */
  async suggestNextSteps(currentResults: unknown): Promise<string[]> {
    const steps: string[] = [];
    
    // This would be more sophisticated in a real implementation
    steps.push('Review all diagnostic trouble codes and live data');
    steps.push('Prioritize critical and high severity issues');
    steps.push('Perform visual inspection of related components');
    steps.push('Clear codes and test drive to verify issues');
    steps.push('Consult vehicle service manual for specific diagnostics');
    
    return steps;
  }
}

export const aiInterpretationService = AIInterpretationService.getInstance();