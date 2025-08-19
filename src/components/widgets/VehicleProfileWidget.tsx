import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car } from 'lucide-react';
import { VEHICLE_DATABASE } from '@/constants/vehicleDatabase';

const VehicleProfileWidget = () => {
  const { make, model, generation, engine } = useParams();
  const [vehicleInfo, setVehicleInfo] = useState<any>(null);

  useEffect(() => {
    if (make && model && generation && engine) {
      const makeData = VEHICLE_DATABASE.find(m => m.id === make);
      const modelData = makeData?.models?.find(m => m.id === model);
      const generationData = modelData?.generations?.find(g => g.id === generation);
      const engineData = generationData?.engines?.find(e => e.id === engine);

      if (engineData) {
        setVehicleInfo({
          manufacturer: makeData.name,
          model: modelData.name,
          year: `${generationData.yearRange.start}-${generationData.yearRange.end}`,
          engine: engineData.name,
        });
      }
    }
  }, [make, model, generation, engine]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Selected Vehicle
        </CardTitle>
      </CardHeader>
      <CardContent>
        {vehicleInfo ? (
          <div className="space-y-1">
            <p className="font-semibold">{vehicleInfo.manufacturer} {vehicleInfo.model}</p>
            <p className="text-sm text-muted-foreground">{vehicleInfo.year}</p>
            <p className="text-sm text-muted-foreground">{vehicleInfo.engine}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No vehicle selected.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default VehicleProfileWidget;
