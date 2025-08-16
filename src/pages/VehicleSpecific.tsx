
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car, Settings, Database, Wrench } from 'lucide-react';
import { VisualVehicleSelector } from '@/components/VisualVehicleSelector';
import PeugeotComprehensiveDiagnostics from '@/components/PeugeotComprehensiveDiagnostics';
import PeugeotECUCodingPanel from '@/components/PeugeotECUCodingPanel';
import { VehicleProfile } from '@/types/vehicle';

const VehicleSpecific: React.FC = () => {
  const [selectedProfile, setSelectedProfile] = useState<VehicleProfile | null>(null);

  const handleVehicleSelected = (profile: VehicleProfile) => {
    setSelectedProfile(profile);
  };

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vehicle Specific Diagnostics</h1>
          <p className="text-muted-foreground">Advanced diagnostics tailored for your vehicle</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Professional Grade
        </Badge>
      </div>

      <Tabs defaultValue="selector" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="selector" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Vehicle
          </TabsTrigger>
          <TabsTrigger value="diagnostics" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Diagnostics
          </TabsTrigger>
          <TabsTrigger value="coding" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            ECU Coding
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="selector" className="space-y-4">
          <VisualVehicleSelector 
            onVehicleSelected={handleVehicleSelected}
            selectedProfile={selectedProfile}
          />
        </TabsContent>

        <TabsContent value="diagnostics" className="space-y-4">
          <PeugeotComprehensiveDiagnostics />
        </TabsContent>

        <TabsContent value="coding" className="space-y-4">
          <PeugeotECUCodingPanel />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Advanced Functions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Service Functions</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Oil service reset</li>
                      <li>• DPF forced regeneration</li>
                      <li>• Brake bleeding procedure</li>
                      <li>• Steering angle calibration</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Actuator Tests</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• EGR valve operation</li>
                      <li>• Fuel pump activation</li>
                      <li>• Radiator fan test</li>
                      <li>• A/C compressor test</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Programming</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Key programming</li>
                      <li>• Remote control coding</li>
                      <li>• Injector coding</li>
                      <li>• Module configuration</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VehicleSpecific;
