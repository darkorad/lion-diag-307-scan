import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VEHICLE_PROFILES } from '@/constants/vehicleProfiles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const VehicleSelection = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedMake, setSelectedMake] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedEngine, setSelectedEngine] = useState<string | null>(null);

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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Vehicle Selection</h1>
      <Card>
        <CardHeader>
          <CardTitle>Select Your Vehicle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Search for a vehicle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
      <div className="mt-4 space-y-4">
        {filteredProfiles.map((profile) => (
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
