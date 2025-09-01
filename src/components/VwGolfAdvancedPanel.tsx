import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { vwGolfDiagnosticService } from '@/services/VwGolfDiagnosticService';

interface VwGolfAdvancedPanelProps {
  isConnected: boolean;
  onBack?: () => void;
}

const VwGolfAdvancedPanel: React.FC<VwGolfAdvancedPanelProps> = ({ isConnected, onBack }) => {
  const [boostPressure, setBoostPressure] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetBoostPressure = async () => {
    if (!isConnected) {
      toast.error('Not connected to OBD2 device');
      return;
    }
    setIsLoading(true);
    try {
      const pressure = await vwGolfDiagnosticService.getBoostPressure('vw-golf-mk5-2.0-tfsi');
      setBoostPressure(pressure);
      if (pressure !== null) {
        toast.success(`Boost pressure: ${pressure} mbar`);
      } else {
        toast.error('Failed to get boost pressure');
      }
    } catch (error) {
      toast.error('Failed to get boost pressure');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Specific Readings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Boost Pressure</h4>
              <p className="text-sm text-muted-foreground">
                {boostPressure !== null ? `${boostPressure} mbar` : 'N/A'}
              </p>
            </div>
            <Button onClick={handleGetBoostPressure} disabled={!isConnected || isLoading}>
              {isLoading ? 'Reading...' : 'Read Boost Pressure'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VwGolfAdvancedPanel;
