import { toast } from '@/components/ui/sonner';

// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Error categories for better organization
export enum ErrorCategory {
  BLUETOOTH = 'bluetooth',
  OBD2 = 'obd2',
  UI = 'ui',
  NETWORK = 'network',
  PERMISSION = 'permission',
  UNKNOWN = 'unknown'
}

// Error log entry structure
export interface ErrorLogEntry {
  timestamp: Date;
  message: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  error?: Error;
  context?: Record<string, any>;
  handled: boolean;
}

class ErrorLoggingService {
  private static instance: ErrorLoggingService;
  private errorLogs: ErrorLogEntry[] = [];
  private maxLogSize = 100;
  private isDebugMode = false;

  private constructor() {
    // Override console.error to capture all errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Call original console.error
      originalConsoleError.apply(console, args);
      
      // Log the error through our service
      const errorMessage = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      this.logError(errorMessage, ErrorSeverity.ERROR, ErrorCategory.UNKNOWN);
    };
  }

  public static getInstance(): ErrorLoggingService {
    if (!ErrorLoggingService.instance) {
      ErrorLoggingService.instance = new ErrorLoggingService();
    }
    return ErrorLoggingService.instance;
  }

  // Enable/disable debug mode
  public setDebugMode(enabled: boolean): void {
    this.isDebugMode = enabled;
  }

  // Main logging method
  public logError(
    message: string,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    error?: Error,
    context?: Record<string, any>,
    showToast: boolean = true
  ): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date(),
      message,
      severity,
      category,
      error,
      context,
      handled: false
    };

    // Add to log
    this.errorLogs.unshift(entry);
    
    // Trim log if it exceeds max size
    if (this.errorLogs.length > this.maxLogSize) {
      this.errorLogs = this.errorLogs.slice(0, this.maxLogSize);
    }

    // Show toast notification for user feedback
    if (showToast) {
      this.showErrorToast(entry);
    }

    // Log to console in debug mode
    if (this.isDebugMode) {
      console.log(`[${entry.severity.toUpperCase()}][${entry.category}] ${entry.message}`, 
        error ? error : '', 
        context ? context : '');
    }
  }

  // Helper methods for different severity levels
  public logInfo(message: string, category: ErrorCategory = ErrorCategory.UNKNOWN, context?: Record<string, any>): void {
    this.logError(message, ErrorSeverity.INFO, category, undefined, context);
  }

  public logWarning(message: string, category: ErrorCategory = ErrorCategory.UNKNOWN, context?: Record<string, any>): void {
    this.logError(message, ErrorSeverity.WARNING, category, undefined, context);
  }

  public logCritical(message: string, category: ErrorCategory = ErrorCategory.UNKNOWN, error?: Error, context?: Record<string, any>): void {
    this.logError(message, ErrorSeverity.CRITICAL, category, error, context);
  }

  // Mark an error as handled
  public markAsHandled(index: number): void {
    if (index >= 0 && index < this.errorLogs.length) {
      this.errorLogs[index].handled = true;
    }
  }

  // Get all logs
  public getLogs(): ErrorLogEntry[] {
    return [...this.errorLogs];
  }

  // Get logs by category
  public getLogsByCategory(category: ErrorCategory): ErrorLogEntry[] {
    return this.errorLogs.filter(log => log.category === category);
  }

  // Get logs by severity
  public getLogsBySeverity(severity: ErrorSeverity): ErrorLogEntry[] {
    return this.errorLogs.filter(log => log.severity === severity);
  }

  // Clear logs
  public clearLogs(): void {
    this.errorLogs = [];
  }

  // Show toast notification based on error severity
  private showErrorToast(entry: ErrorLogEntry): void {
    const { message, severity } = entry;
    
    switch (severity) {
      case ErrorSeverity.INFO:
        toast.info(message);
        break;
      case ErrorSeverity.WARNING:
        toast.warning(message);
        break;
      case ErrorSeverity.ERROR:
        toast.error(message);
        break;
      case ErrorSeverity.CRITICAL:
        toast.error(`CRITICAL: ${message}`);
        break;
    }
  }
}

export const errorLoggingService = ErrorLoggingService.getInstance();