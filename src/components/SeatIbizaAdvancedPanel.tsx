import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { seatIbizaDiagnosticService } from '@/services/SeatIbizaDiagnosticService';

interface SeatIbizaAdvancedPanelProps {
  isConnected: boolean;
  onBack?: () => void;
}

const SeatIbizaAdvancedPanel: React.FC<SeatIbizaAdvancedPanelProps> = ({ isConnected, onBack }) => {
  const [fuelLevel, setFuelLevel] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetFuelLevel = async () => {
    if (!isConnected) {
      toast.error('Not connected to OBD2 device');
      return;
    }
    setIsLoading(true);
    try {
      const level = await seatIbizaDiagnosticService.getFuelLevel();
      setFuelLevel(level);
      if (level !== null) {
        toast.success(`Fuel level: ${level}%`);
      } else {
        toast.error('Failed to get fuel level');
      }
    } catch (error) {
      toast.error('Failed to get fuel level');
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
              <h4 className="font-medium">Fuel Level</h4>
              <p className="text-sm text-muted-foreground">
                {fuelLevel !== null ? `${fuelLevel}%` : 'N/A'}
              </p>
            </div>
            <Button onClick={handleGetFuelLevel} disabled={!isConnected || isLoading}>
              {isLoading ? 'Reading...' : 'Read Fuel Level'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeatIbizaAdvancedPanel;
