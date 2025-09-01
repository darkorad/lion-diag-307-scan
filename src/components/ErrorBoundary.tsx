
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Use the error logging service
    import('./services/ErrorLoggingService').then(({ errorLoggingService, ErrorCategory, ErrorSeverity }) => {
      errorLoggingService.logError(
        `UI Error: ${error.message}`,
        ErrorSeverity.ERROR,
        ErrorCategory.UI,
        error,
        { component: this.props.fallbackComponent || 'Unknown', errorInfo }
      );
    });
    
    this.setState({
      hasError: true,
      error,
      errorInfo
    });
  }
  
  handleReset = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  }
  
  handleGoHome = () => {
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                {this.props.fallbackTitle || "Something went wrong"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>
                  The application encountered an unexpected error. Please try refreshing the page or return to the home screen.
                </AlertDescription>
              </Alert>
              
              {this.state.error && (
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  <p className="font-medium mb-1">Error details:</p>
                  <p className="font-mono text-xs overflow-auto max-h-32">{this.state.error.message}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={() => window.location.reload()}
                  className="flex-1"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  className="flex-1"
                  variant="outline"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
