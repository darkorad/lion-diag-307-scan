import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VEHICLE_PROFILES } from '@/constants/vehicleProfiles';
import { Button } from '@/components/ui/button';

const VehicleSelection = () => {
  const navigate = useNavigate();

  const handleSelectVehicle = (profile: any) => {
    const [make, model, generation, engine] = profile.id.split('-');
    navigate(`/vehicle-specific/${make}/${model}/${generation}/${engine}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Vehicle Selection</h1>
      <div className="space-y-4">
        {VEHICLE_PROFILES.map((profile) => (
          <Card key={profile.id}>
            <CardHeader>
              <CardTitle>{profile.displayName}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => handleSelectVehicle(profile)}>
                Select
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VehicleSelection;
