import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { VEHICLE_PROFILES } from '@/constants/vehicleProfiles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { EUROPEAN_MANUFACTURERS } from '@/constants/europeanManufacturers';
import { Search, Car, Wrench, Settings, Check } from 'lucide-react';

// Import manufacturer logos
import peugeotLogo from '@/assets/logos/peugeot-logo.png';
import volkswagenLogo from '@/assets/logos/volkswagen-logo.png';
import bmwLogo from '@/assets/logos/bmw-logo.png';
import audiLogo from '@/assets/logos/audi-logo.png';
import mercedesLogo from '@/assets/logos/mercedes-logo.png';
import volvoLogo from '@/assets/logos/volvo-logo.png';
import alfaRomeoLogo from '@/assets/logos/alfa-romeo-logo.png';

// Map logos to manufacturer IDs for faster access
const MANUFACTURER_LOGOS: Record<string, string> = {
  peugeot: peugeotLogo,
  volkswagen: volkswagenLogo,
  bmw: bmwLogo,
  audi: audiLogo,
  mercedes: mercedesLogo,
  volvo: volvoLogo,
  'alfa-romeo': alfaRomeoLogo
};

const VehicleSelection = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedMake, setSelectedMake] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedEngine, setSelectedEngine] = useState<string | null>(null);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string | null>(null);

  const filteredProfiles = useMemo(() => {
    return VEHICLE_PROFILES.filter(profile =>
      profile.displayName.toLowerCase().includes(search.toLowerCase()) &&
      (!selectedMake || profile.make === selectedMake) &&
      (!selectedModel || profile.model === selectedModel) &&
      (!selectedYear || profile.year.toString() === selectedYear) &&
      (!selectedEngine || profile.engine === selectedEngine)
    );
  }, [search, selectedMake, selectedModel, selectedYear, selectedEngine]);

  const makes = [...new Set(VEHICLE_PROFILES.map(p => p.make))];
  const models = [...new Set(VEHICLE_PROFILES.filter(p => p.make === selectedMake).map(p => p.model))];
  const years = [...new Set(VEHICLE_PROFILES.filter(p => p.make === selectedMake && p.model === selectedModel).map(p => p.year.toString()))];
  const engines = [...new Set(VEHICLE_PROFILES.filter(p => p.make === selectedMake && p.model === selectedModel && p.year.toString() === selectedYear).map(p => p.engine))];

  const handleSelectVehicle = (profile: any) => {
    const [make, model, generation, engine] = profile.id.split('-');
    navigate(`/vehicle-specific/${make}/${model}/${generation}/${engine}`);
  };

  const handleSelectManufacturer = (manufacturerId: string) => {
    setSelectedManufacturer(manufacturerId);
    setSelectedMake(EUROPEAN_MANUFACTURERS.find(m => m.id === manufacturerId)?.name || null);
    navigate(`/diagnostics?manufacturer=${manufacturerId}`);
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Vehicle Selection</h1>
      
      <Tabs defaultValue="manufacturers" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="manufacturers" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Manufacturers
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Advanced Selection
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="manufacturers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>European Manufacturers</CardTitle>
              <CardDescription>
                Select a manufacturer to access specialized diagnostic features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {EUROPEAN_MANUFACTURERS.map((manufacturer) => (
                  <Card 
                    key={manufacturer.id} 
                    className={`cursor-pointer hover:border-primary transition-colors ${
                      selectedManufacturer === manufacturer.id ? 'border-primary border-2' : ''
                    }`}
                    onClick={() => handleSelectManufacturer(manufacturer.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{manufacturer.name}</CardTitle>
                        <div className="h-12 w-12 flex items-center justify-center">
                          <img 
                            src={MANUFACTURER_LOGOS[manufacturer.id] || manufacturer.logo} 
                            alt={`${manufacturer.name} logo`} 
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground mb-2">
                        Supported Years: {manufacturer.supportedYears}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {manufacturer.capabilities.slice(0, 3).map((capability, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {capability}
                          </Badge>
                        ))}
                        {manufacturer.capabilities.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{manufacturer.capabilities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        className="w-full text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectManufacturer(manufacturer.id);
                        }}
                      >
                        Select
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Vehicle Selection</CardTitle>
              <CardDescription>
                Precisely select your vehicle make, model, year and engine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for a vehicle..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                  <Select onValueChange={setSelectedMake}>
                    <SelectTrigger><SelectValue placeholder="Select Make" /></SelectTrigger>
                    <SelectContent>{makes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select onValueChange={setSelectedModel} disabled={!selectedMake}>
                    <SelectTrigger><SelectValue placeholder="Select Model" /></SelectTrigger>
                    <SelectContent>{models.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select onValueChange={setSelectedYear} disabled={!selectedModel}>
                    <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                    <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select onValueChange={setSelectedEngine} disabled={!selectedYear}>
                    <SelectTrigger><SelectValue placeholder="Select Engine" /></SelectTrigger>
                    <SelectContent>{engines.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            {filteredProfiles.map((profile) => (
              <Card key={profile.id} className="hover:border-primary transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>{profile.displayName}</CardTitle>
                    <Badge variant="outline">{profile.year}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground">
                    {profile.engine} • {profile.transmission} • {profile.fuel}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handleSelectVehicle(profile)}
                    className="w-full"
                    variant="default"
                  >
                    <Check className="mr-2 h-4 w-4" /> Select Vehicle
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VehicleSelection;
