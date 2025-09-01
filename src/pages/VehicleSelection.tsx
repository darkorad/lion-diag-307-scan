import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { vehicles } from '@/data/vehicles';

interface Vehicle {
  id: string;
  name: string;
  manufacturer: string;
  year?: number;
  engine?: string;
  image: string;
}

const VehicleSelection = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const navigate = useNavigate();

  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleVehicleSelect = () => {
    if (selectedVehicle) {
      localStorage.setItem('selectedVehicle', JSON.stringify(selectedVehicle));
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <header className="py-6 px-4 text-center text-white">
        <h1 className="text-3xl font-semibold">Select Your Vehicle</h1>
        <p className="mt-2 text-lg">Choose your vehicle to get started.</p>
      </header>

      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} onClick={() => handleVehicleClick(vehicle)} className="cursor-pointer hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{vehicle.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <img src={vehicle.image} alt={vehicle.name} className="w-full h-32 object-contain rounded-md" />
                <p className="text-sm text-muted-foreground mt-2">{vehicle.manufacturer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Vehicle Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">{selectedVehicle.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedVehicle.manufacturer}</p>
                {selectedVehicle.year && (
                  <p className="text-sm">Year: {selectedVehicle.year}</p>
                )}
                {selectedVehicle.engine && (
                  <p className="text-sm">Engine: {selectedVehicle.engine}</p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleVehicleSelect} 
                  className="flex-1"
                >
                  Select Vehicle
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedVehicle(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default VehicleSelection;
