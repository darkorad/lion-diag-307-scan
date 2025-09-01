
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import ProfessionalDiagnosticSelector from './ProfessionalDiagnosticSelector';
import { AdvancedDiagnosticsPanel } from './AdvancedDiagnosticsPanel';

const ProfessionalOBD2Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmulator, setSelectedEmulator] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate initialization loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSelectEmulator = (emulator: string) => {
    setSelectedEmulator(emulator);
  };

  const handleBack = () => {
    setSelectedEmulator(null);
  };

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => setError(null)} 
          className="mt-4"
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Loading Professional Diagnostics</h3>
            <p className="text-muted-foreground text-center">
              Initializing professional diagnostic tools...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {!selectedEmulator ? (
        <ProfessionalDiagnosticSelector 
          onSelectEmulator={handleSelectEmulator}
          onBack={handleBack}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold">
                {selectedEmulator === 'peugeot-diagbox' ? 'Peugeot Diagbox Professional' : 'Professional Emulator'}
              </h2>
            </div>
            <Button variant="outline" onClick={handleBack}>
              Back to Selection
            </Button>
          </div>

          {selectedEmulator === 'peugeot-diagbox' ? (
            <AdvancedDiagnosticsPanel 
              vehicleMake="Peugeot"
              isConnected={false}
            />
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This emulator is coming soon. Currently only Peugeot Diagbox is available.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfessionalOBD2Dashboard;
