import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Download, 
  Upload, 
  Save, 
  Trash2, 
  FileText, 
  Car, 
  Settings, 
  Search,
  Edit,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  databaseService, 
  VehicleRecord, 
  PIDRecord 
} from '@/services/DatabaseService';
import { 
  enhancedVehicleService 
} from '@/services/EnhancedVehicleService';
import { VehicleMake, VehicleProfile } from '@/types/vehicle';
import { VehicleModule } from '@/types/vehicleModules';

interface VehicleFormData {
  id?: number;
  vin: string;
  make: string;
  model: string;
  year: number;
  engine: string;
  fuelType: string;
}

interface PIDFormData {
  id?: number;
  mode: string;
  pid: string;
  name: string;
  formula: string;
  unit: string;
  description: string;
  category?: string;
}

const AdminVehicleProfileManager: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [pids, setPids] = useState<PIDRecord[]>([]);
  const [makes, setMakes] = useState<VehicleMake[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [engines, setEngines] = useState<any[]>([]);
  const [modules, setModules] = useState<VehicleModule[]>([]);
  
  const [currentVehicle, setCurrentVehicle] = useState<VehicleFormData>({
    vin: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    engine: '',
    fuelType: ''
  });
  
  const [currentPID, setCurrentPID] = useState<PIDFormData>({
    mode: '01',
    pid: '',
    name: '',
    formula: '(A*256+B)/4',
    unit: '',
    description: '',
    category: 'engine'
  });
  
  const [editingVehicleIndex, setEditingVehicleIndex] = useState<number | null>(null);
  const [editingPIDIndex, setEditingPIDIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('vehicles');
  const [searchQuery, setSearchQuery] = useState('');

  // Load data on component mount
  useEffect(() => {
    loadData();
    setMakes(enhancedVehicleService.getAllMakes());
    setModules(enhancedVehicleService.getAllModules());
  }, []);

  const loadData = async () => {
    try {
      const [vehiclesData, pidsData] = await Promise.all([
        databaseService.getAllVehicles(),
        databaseService.getAllPIDs()
      ]);
      
      setVehicles(vehiclesData);
      setPids(pidsData);
    } catch (err) {
      toast.error('Failed to load database records');
    }
  };

  // Handle make selection
  const handleMakeChange = (makeId: string) => {
    setCurrentVehicle({...currentVehicle, make: makeId, model: '', engine: ''});
    const models = enhancedVehicleService.getModelsByMake(makeId);
    setModels(models);
    setEngines([]);
  };

  // Handle model selection
  const handleModelChange = (modelId: string) => {
    setCurrentVehicle({...currentVehicle, model: modelId, engine: ''});
    const generations = enhancedVehicleService.getGenerationsByModel(currentVehicle.make, modelId);
    // For simplicity, we'll use the first generation's engines
    if (generations.length > 0) {
      setEngines(generations[0].engines);
    } else {
      setEngines([]);
    }
  };

  // Handle vehicle save
  const handleSaveVehicle = async () => {
    if (!currentVehicle.vin || !currentVehicle.make || !currentVehicle.model) {
      toast.error('VIN, Make, and Model are required');
      return;
    }

    try {
      if (editingVehicleIndex !== null) {
        // Update existing vehicle
        const vehicle = vehicles[editingVehicleIndex];
        await databaseService.updateVehicle(vehicle.id!, {
          vin: currentVehicle.vin,
          make: currentVehicle.make,
          model: currentVehicle.model,
          year: currentVehicle.year,
          engine: currentVehicle.engine,
          fuelType: currentVehicle.fuelType
        });
        toast.success('Vehicle updated successfully');
      } else {
        // Add new vehicle
        await databaseService.saveVehicle({
          vin: currentVehicle.vin,
          make: currentVehicle.make,
          model: currentVehicle.model,
          year: currentVehicle.year,
          engine: currentVehicle.engine,
          fuelType: currentVehicle.fuelType
        });
        toast.success('Vehicle added successfully');
      }

      await loadData();
      resetVehicleForm();
    } catch (err) {
      toast.error('Failed to save vehicle');
    }
  };

  // Handle PID save
  const handleSavePID = async () => {
    if (!currentPID.pid || !currentPID.name) {
      toast.error('PID and Name are required');
      return;
    }

    try {
      if (editingPIDIndex !== null) {
        // Update existing PID
        const pid = pids[editingPIDIndex];
        await databaseService.updatePID(pid.id!, {
          mode: currentPID.mode,
          pid: currentPID.pid,
          name: currentPID.name,
          formula: currentPID.formula,
          unit: currentPID.unit,
          description: currentPID.description,
          category: currentPID.category
        });
        toast.success('PID updated successfully');
      } else {
        // Add new PID
        await databaseService.savePID({
          mode: currentPID.mode,
          pid: currentPID.pid,
          name: currentPID.name,
          formula: currentPID.formula,
          unit: currentPID.unit,
          description: currentPID.description,
          category: currentPID.category
        });
        toast.success('PID added successfully');
      }

      await loadData();
      resetPIDForm();
    } catch (err) {
      toast.error('Failed to save PID');
    }
  };

  // Handle vehicle edit
  const handleEditVehicle = (index: number) => {
    const vehicle = vehicles[index];
    setCurrentVehicle({
      id: vehicle.id,
      vin: vehicle.vin,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      engine: vehicle.engine,
      fuelType: vehicle.fuelType
    });
    setEditingVehicleIndex(index);
    
    // Load models and engines for the selected make
    const models = enhancedVehicleService.getModelsByMake(vehicle.make);
    setModels(models);
    
    if (vehicle.model) {
      const generations = enhancedVehicleService.getGenerationsByModel(vehicle.make, vehicle.model);
      if (generations.length > 0) {
        setEngines(generations[0].engines);
      }
    }
  };

  // Handle PID edit
  const handleEditPID = (index: number) => {
    const pid = pids[index];
    setCurrentPID({
      id: pid.id,
      mode: pid.mode,
      pid: pid.pid,
      name: pid.name,
      formula: pid.formula,
      unit: pid.unit,
      description: pid.description,
      category: pid.category
    });
    setEditingPIDIndex(index);
  };

  // Handle vehicle delete
  const handleDeleteVehicle = async (index: number) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }

    try {
      const vehicle = vehicles[index];
      await databaseService.deleteVehicle(vehicle.id!);
      await loadData();
      toast.success('Vehicle deleted successfully');
    } catch (err) {
      toast.error('Failed to delete vehicle');
    }
  };

  // Handle PID delete
  const handleDeletePID = async (index: number) => {
    if (!window.confirm('Are you sure you want to delete this PID?')) {
      return;
    }

    try {
      const pid = pids[index];
      await databaseService.deletePID(pid.id!);
      await loadData();
      toast.success('PID deleted successfully');
    } catch (err) {
      toast.error('Failed to delete PID');
    }
  };

  // Reset vehicle form
  const resetVehicleForm = () => {
    setCurrentVehicle({
      vin: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      engine: '',
      fuelType: ''
    });
    setEditingVehicleIndex(null);
    setModels([]);
    setEngines([]);
  };

  // Reset PID form
  const resetPIDForm = () => {
    setCurrentPID({
      mode: '01',
      pid: '',
      name: '',
      formula: '(A*256+B)/4',
      unit: '',
      description: '',
      category: 'engine'
    });
    setEditingPIDIndex(null);
  };

  // Filter vehicles based on search query
  const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter PIDs based on search query
  const filteredPIDs = pids.filter(pid => 
    pid.pid.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pid.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (pid.category && pid.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Admin Vehicle Profile Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Manage vehicle profiles and PIDs for the diagnostic system. Add, edit, or delete vehicle records and PID definitions.
          </p>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicles or PIDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vehicles" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Vehicle Profiles
          </TabsTrigger>
          <TabsTrigger value="pids" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            PID Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{editingVehicleIndex !== null ? 'Edit Vehicle' : 'Add New Vehicle'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehicle-vin">VIN</Label>
                  <Input
                    id="vehicle-vin"
                    value={currentVehicle.vin}
                    onChange={(e) => setCurrentVehicle({...currentVehicle, vin: e.target.value})}
                    placeholder="Enter 17-character VIN"
                  />
                </div>
                <div>
                  <Label htmlFor="vehicle-year">Year</Label>
                  <Input
                    id="vehicle-year"
                    type="number"
                    value={currentVehicle.year}
                    onChange={(e) => setCurrentVehicle({...currentVehicle, year: parseInt(e.target.value) || 0})}
                    placeholder="e.g., 2020"
                  />
                </div>
                <div>
                  <Label htmlFor="vehicle-make">Make</Label>
                  <Select value={currentVehicle.make} onValueChange={handleMakeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select make" />
                    </SelectTrigger>
                    <SelectContent>
                      {makes.map(make => (
                        <SelectItem key={make.id} value={make.id}>{make.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="vehicle-model">Model</Label>
                  <Select 
                    value={currentVehicle.model} 
                    onValueChange={handleModelChange}
                    disabled={!currentVehicle.make}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map(model => (
                        <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="vehicle-engine">Engine</Label>
                  <Select 
                    value={currentVehicle.engine} 
                    onValueChange={(value) => setCurrentVehicle({...currentVehicle, engine: value})}
                    disabled={!currentVehicle.model}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select engine" />
                    </SelectTrigger>
                    <SelectContent>
                      {engines.map(engine => (
                        <SelectItem key={engine.id} value={engine.id}>{engine.name} ({engine.engineCode})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="vehicle-fuel">Fuel Type</Label>
                  <Select 
                    value={currentVehicle.fuelType} 
                    onValueChange={(value) => setCurrentVehicle({...currentVehicle, fuelType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Petrol">Petrol</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                      <SelectItem value="Electric">Electric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveVehicle} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingVehicleIndex !== null ? 'Update Vehicle' : 'Add Vehicle'}
                </Button>
                {editingVehicleIndex !== null && (
                  <Button variant="outline" onClick={resetVehicleForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle Profiles ({filteredVehicles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {filteredVehicles.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No vehicles found. {searchQuery ? 'Try a different search.' : 'Add a vehicle using the form above.'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredVehicles.map((vehicle, index) => (
                      <div key={vehicle.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{vehicle.make} {vehicle.model}</h4>
                            <p className="text-sm text-muted-foreground">{vehicle.vin}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline">{vehicle.year}</Badge>
                            <Badge variant="secondary">{vehicle.fuelType}</Badge>
                          </div>
                        </div>
                        <p className="text-sm mb-2">{vehicle.engine}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            Added: {new Date(vehicle.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditVehicle(index)}>
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteVehicle(index)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pids" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{editingPIDIndex !== null ? 'Edit PID' : 'Add New PID'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pid-mode">Mode</Label>
                  <Select 
                    value={currentPID.mode} 
                    onValueChange={(value) => setCurrentPID({...currentPID, mode: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="01">01 - Current Data</SelectItem>
                      <SelectItem value="02">02 - Freeze Frame Data</SelectItem>
                      <SelectItem value="03">03 - Stored DTCs</SelectItem>
                      <SelectItem value="04">04 - Clear DTCs</SelectItem>
                      <SelectItem value="06">06 - On-Board Monitoring</SelectItem>
                      <SelectItem value="07">07 - Pending DTCs</SelectItem>
                      <SelectItem value="09">09 - Vehicle Information</SelectItem>
                      <SelectItem value="22">22 - Manufacturer Mode</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="pid-code">PID Code</Label>
                  <Input
                    id="pid-code"
                    value={currentPID.pid}
                    onChange={(e) => setCurrentPID({...currentPID, pid: e.target.value})}
                    placeholder="e.g., 0C, 221A"
                  />
                </div>
                <div>
                  <Label htmlFor="pid-name">PID Name</Label>
                  <Input
                    id="pid-name"
                    value={currentPID.name}
                    onChange={(e) => setCurrentPID({...currentPID, name: e.target.value})}
                    placeholder="e.g., Engine RPM"
                  />
                </div>
                <div>
                  <Label htmlFor="pid-unit">Unit</Label>
                  <Input
                    id="pid-unit"
                    value={currentPID.unit}
                    onChange={(e) => setCurrentPID({...currentPID, unit: e.target.value})}
                    placeholder="e.g., RPM, °C, kPa"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="pid-formula">Formula</Label>
                  <Input
                    id="pid-formula"
                    value={currentPID.formula}
                    onChange={(e) => setCurrentPID({...currentPID, formula: e.target.value})}
                    placeholder="e.g., (A*256+B)/4"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="pid-category">Category</Label>
                  <Select 
                    value={currentPID.category || ''} 
                    onValueChange={(value) => setCurrentPID({...currentPID, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engine">Engine</SelectItem>
                      <SelectItem value="transmission">Transmission</SelectItem>
                      <SelectItem value="abs">ABS/ESP</SelectItem>
                      <SelectItem value="airbag">Airbag/SRS</SelectItem>
                      <SelectItem value="climate">Climate Control</SelectItem>
                      <SelectItem value="body">Body Control</SelectItem>
                      <SelectItem value="comfort">Comfort Systems</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="pid-description">Description</Label>
                  <Textarea
                    id="pid-description"
                    value={currentPID.description}
                    onChange={(e) => setCurrentPID({...currentPID, description: e.target.value})}
                    placeholder="Detailed description of this PID..."
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSavePID} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingPIDIndex !== null ? 'Update PID' : 'Add PID'}
                </Button>
                {editingPIDIndex !== null && (
                  <Button variant="outline" onClick={resetPIDForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>PID Definitions ({filteredPIDs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {filteredPIDs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No PIDs found. {searchQuery ? 'Try a different search.' : 'Add a PID using the form above.'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredPIDs.map((pid, index) => (
                      <div key={pid.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{pid.name}</h4>
                            <p className="text-sm text-muted-foreground">PID: {pid.mode}{pid.pid}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline">{pid.unit}</Badge>
                            {pid.category && <Badge variant="secondary">{pid.category}</Badge>}
                          </div>
                        </div>
                        <p className="text-sm mb-2">{pid.description}</p>
                        <div className="text-xs text-muted-foreground mb-2">
                          Formula: {pid.formula}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            Added: {new Date(pid.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditPID(index)}>
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeletePID(index)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminVehicleProfileManager;