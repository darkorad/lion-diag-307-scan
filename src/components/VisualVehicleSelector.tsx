import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Car, Calendar, Fuel, Zap, Settings, Info, Activity } from 'lucide-react';
import { 
  VEHICLE_DATABASE, 
  VehicleMake, 
  VehicleModel, 
  VehicleGeneration, 
  VehicleEngine
} from '@/constants/vehicleDatabase';
import { VehicleProfile } from '@/types/vehicle';
import Peugeot307AdvancedSelector from './Peugeot307AdvancedSelector';
import { AdvancedDiagnosticsPanel } from './AdvancedDiagnosticsPanel';

// Import logos
import peugeotLogo from '@/assets/logos/peugeot-logo.png';
import seatLogo from '@/assets/logos/seat-logo.png';
import volkswagenLogo from '@/assets/logos/volkswagen-logo.png';
import renaultLogo from '@/assets/logos/renault-logo.png';
import skodaLogo from '@/assets/logos/skoda-logo.png';
import toyotaLogo from '@/assets/logos/toyota-logo.png';
import audiLogo from '@/assets/logos/audi-logo.png';
import bmwLogo from '@/assets/logos/bmw-logo.png';
import mercedesLogo from '@/assets/logos/mercedes-logo.png';
import fordLogo from '@/assets/logos/ford-logo.png';
import opelLogo from '@/assets/logos/opel-logo.png';
import fiatLogo from '@/assets/logos/fiat-logo.png';

const logoMap: { [key: string]: string } = {
  '/src/assets/logos/peugeot-logo.png': peugeotLogo,
  '/src/assets/logos/seat-logo.png': seatLogo,
  '/src/assets/logos/volkswagen-logo.png': volkswagenLogo,
  '/src/assets/logos/renault-logo.png': renaultLogo,
  '/src/assets/logos/skoda-logo.png': skodaLogo,
  '/src/assets/logos/toyota-logo.png': toyotaLogo,
  '/src/assets/logos/audi-logo.png': audiLogo,
  '/src/assets/logos/bmw-logo.png': bmwLogo,
  '/src/assets/logos/mercedes-logo.png': mercedesLogo,
  '/src/assets/logos/ford-logo.png': fordLogo,
  '/src/assets/logos/opel-logo.png': opelLogo,
  '/src/assets/logos/fiat-logo.png': fiatLogo,
};

interface VisualVehicleSelectorProps {
  onVehicleSelected: (profile: VehicleProfile) => void;
  selectedProfile: VehicleProfile | null;
  isConnected?: boolean;
  onCommand?: (command: string) => Promise<string>;
}

type SelectionStep = 'make' | 'model' | 'generation' | 'engine' | 'confirm' | 'peugeot307-advanced' | 'advanced-diagnostics';

interface SelectionState {
  step: SelectionStep;
  selectedMake: VehicleMake | null;
  selectedModel: VehicleModel | null;
  selectedGeneration: VehicleGeneration | null;
  selectedEngine: VehicleEngine | null;
}

export function VisualVehicleSelector({ onVehicleSelected, selectedProfile, isConnected = false, onCommand }: VisualVehicleSelectorProps) {
  const [selection, setSelection] = useState<SelectionState>({
    step: 'make',
    selectedMake: null,
    selectedModel: null,
    selectedGeneration: null,
    selectedEngine: null,
  });

  const handleMakeSelect = (make: VehicleMake) => {
    setSelection({
      step: 'model',
      selectedMake: make,
      selectedModel: null,
      selectedGeneration: null,
      selectedEngine: null,
    });
  };

  const handleModelSelect = (model: VehicleModel) => {
    setSelection(prev => ({
      ...prev,
      step: 'generation',
      selectedModel: model,
      selectedGeneration: null,
      selectedEngine: null,
    }));
  };

  const handleGenerationSelect = (generation: VehicleGeneration) => {
    setSelection(prev => ({
      ...prev,
      step: 'engine',
      selectedGeneration: generation,
      selectedEngine: null,
    }));
  };

  const handleEngineSelect = (engine: VehicleEngine) => {
    setSelection(prev => ({
      ...prev,
      step: 'confirm',
      selectedEngine: engine,
    }));
  };

  const handleConfirmSelection = () => {
    if (!selection.selectedMake || !selection.selectedModel || !selection.selectedGeneration || !selection.selectedEngine) {
      return;
    }

    // Convert the selection to VehicleProfile format
    const profile: VehicleProfile = {
      id: selection.selectedEngine.id,
      make: selection.selectedMake.name,
      model: selection.selectedModel.name,
      year: selection.selectedGeneration.yearRange.start, // Use start year
      engine: selection.selectedEngine.name,
      fuel: selection.selectedEngine.fuelType,
      displayName: `${selection.selectedMake.name} ${selection.selectedModel.name} ${selection.selectedGeneration.yearRange.start} ${selection.selectedEngine.name}`,
      vinPatterns: [], // Will be populated later
      supportedPids: selection.selectedEngine.supportedPids,
      pidMappings: selection.selectedEngine.pidMappings,
      specificParameters: selection.selectedEngine.specificParameters
    };

    onVehicleSelected(profile);
  };

  const handleBack = () => {
    switch (selection.step) {
      case 'model':
        setSelection(prev => ({ ...prev, step: 'make', selectedMake: null }));
        break;
      case 'generation':
        setSelection(prev => ({ ...prev, step: 'model', selectedModel: null }));
        break;
      case 'engine':
        setSelection(prev => ({ ...prev, step: 'generation', selectedGeneration: null }));
        break;
      case 'confirm':
        setSelection(prev => ({ ...prev, step: 'engine', selectedEngine: null }));
        break;
      case 'peugeot307-advanced':
        setSelection(prev => ({ ...prev, step: 'engine' }));
        break;
      case 'advanced-diagnostics':
        setSelection(prev => ({ ...prev, step: 'confirm' }));
        break;
    }
  };

  const renderBreadcrumb = () => {
    const items = [];
    
    if (selection.selectedMake) {
      items.push(selection.selectedMake.name);
    }
    if (selection.selectedModel) {
      items.push(selection.selectedModel.name);
    }
    if (selection.selectedGeneration) {
      items.push(`${selection.selectedGeneration.yearRange.start}-${selection.selectedGeneration.yearRange.end}`);
    }
    if (selection.selectedEngine) {
      items.push(selection.selectedEngine.name);
    }

    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Car className="h-4 w-4" />
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight className="h-3 w-3" />}
            <span className={index === items.length - 1 ? 'text-foreground font-medium' : ''}>
              {item}
            </span>
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderMakeSelection = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Select Vehicle Make</h3>
        <p className="text-muted-foreground">Choose your car manufacturer</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {VEHICLE_DATABASE.map((make) => (
          <Card 
            key={make.id}
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-primary"
            onClick={() => handleMakeSelect(make)}
          >
            <CardContent className="p-6 text-center">
              <div className="mb-4 flex justify-center">
                <img 
                  src={logoMap[make.logo] || make.logo} 
                  alt={`${make.name} logo`}
                  className="w-16 h-16 object-contain"
                />
              </div>
              <h4 className="font-semibold text-lg">{make.name}</h4>
              <p className="text-sm text-muted-foreground">{make.country}</p>
              <Badge variant="outline" className="mt-2">
                {make.models.length} model{make.models.length !== 1 ? 's' : ''}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderModelSelection = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Select Model</h3>
        <p className="text-muted-foreground">Choose your {selection.selectedMake?.name} model</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selection.selectedMake?.models.map((model) => (
          <Card 
            key={model.id}
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-primary"
            onClick={() => handleModelSelect(model)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src={logoMap[selection.selectedMake!.logo] || selection.selectedMake!.logo} 
                  alt={`${selection.selectedMake!.name} logo`}
                  className="w-8 h-8 object-contain"
                />
                <h4 className="font-semibold text-lg">{model.name}</h4>
              </div>
              <div className="space-y-2">
                <Badge variant="outline">
                  {model.generations.length} generation{model.generations.length !== 1 ? 's' : ''}
                </Badge>
                <div className="text-sm text-muted-foreground">
                  Years: {Math.min(...model.generations.map(g => g.yearRange.start))} - {Math.max(...model.generations.map(g => g.yearRange.end))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderGenerationSelection = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Select Generation</h3>
        <p className="text-muted-foreground">Choose your {selection.selectedModel?.name} generation</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {selection.selectedModel?.generations.map((generation) => (
          <Card 
            key={generation.id}
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-primary"
            onClick={() => handleGenerationSelect(generation)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="h-6 w-6 text-primary" />
                <h4 className="font-semibold text-lg">{generation.name}</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Years:</span>
                  <Badge variant="secondary">{generation.yearRange.start} - {generation.yearRange.end}</Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {generation.bodyTypes.map((bodyType, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {bodyType}
                    </Badge>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  {generation.engines.length} engine option{generation.engines.length !== 1 ? 's' : ''}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderEngineSelection = () => {
    // Check if this is Peugeot 307
    const isPeugeot307 = selection.selectedMake?.name === 'Peugeot' && 
                        selection.selectedModel?.name === '307';

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Select Engine</h3>
          <p className="text-muted-foreground">Choose your engine specification</p>
        </div>
        
        {/* Peugeot 307 Advanced Functions Button */}
        {isPeugeot307 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="h-6 w-6 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Peugeot 307 Advanced Functions</h4>
                    <p className="text-sm text-blue-700">Access BSI control, comfort functions, and advanced diagnostics</p>
                  </div>
                </div>
                <Button 
                  onClick={() => setSelection(prev => ({ ...prev, step: 'peugeot307-advanced' }))}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Advanced Panel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {selection.selectedGeneration?.engines.map((engine) => (
            <Card 
              key={engine.id}
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-primary"
              onClick={() => handleEngineSelect(engine)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Fuel className="h-6 w-6 text-primary" />
                  <h4 className="font-semibold text-lg">{engine.name}</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm font-medium">Displacement:</span>
                    <p className="text-sm text-muted-foreground">{engine.displacement}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Fuel:</span>
                    <p className="text-sm text-muted-foreground">{engine.fuelType}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Power:</span>
                    <p className="text-sm text-muted-foreground">{engine.power.hp} HP / {engine.power.kw} kW</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Engine Code:</span>
                    <p className="text-sm text-muted-foreground">{engine.engineCode}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">{engine.emissionStandard}</Badge>
                  <Badge variant="outline">{engine.specificParameters.manufacturerProtocol}</Badge>
                  {engine.specificParameters.hasDPF && <Badge variant="outline">DPF</Badge>}
                  {engine.specificParameters.hasEGR && <Badge variant="outline">EGR</Badge>}
                  {engine.specificParameters.hasTurbo && <Badge variant="outline">Turbo</Badge>}
                  {engine.specificParameters.hasAdvancedFunctions && (
                    <Badge className="bg-blue-100 text-blue-800">Advanced Functions</Badge>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>Standard PIDs: {engine.supportedPids.standard.length}</p>
                  <p>Manufacturer PIDs: {engine.supportedPids.manufacturer.length}</p>
                  {engine.supportedPids.dpf && <p>DPF PIDs: {engine.supportedPids.dpf.length}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderConfirmation = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Confirm Selection</h3>
        <p className="text-muted-foreground">Review your vehicle details</p>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <img 
              src={logoMap[selection.selectedMake!.logo] || selection.selectedMake!.logo} 
              alt={`${selection.selectedMake!.name} logo`}
              className="w-12 h-12 object-contain"
            />
            <div>
              <CardTitle className="text-xl">
                {selection.selectedMake?.name} {selection.selectedModel?.name}
              </CardTitle>
              <CardDescription>
                {selection.selectedGeneration?.name} • {selection.selectedEngine?.name}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium">Generation:</span>
              <p className="text-sm text-muted-foreground">{selection.selectedGeneration?.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Years:</span>
              <p className="text-sm text-muted-foreground">
                {selection.selectedGeneration?.yearRange.start} - {selection.selectedGeneration?.yearRange.end}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium">Engine:</span>
              <p className="text-sm text-muted-foreground">{selection.selectedEngine?.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Engine Code:</span>
              <p className="text-sm text-muted-foreground">{selection.selectedEngine?.engineCode}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Power:</span>
              <p className="text-sm text-muted-foreground">
                {selection.selectedEngine?.power.hp} HP / {selection.selectedEngine?.power.kw} kW
              </p>
            </div>
            <div>
              <span className="text-sm font-medium">Emission Standard:</span>
              <p className="text-sm text-muted-foreground">{selection.selectedEngine?.emissionStandard}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Supported Features:</h4>
            <div className="flex flex-wrap gap-2">
              {selection.selectedEngine?.specificParameters.hasDPF && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Settings className="h-3 w-3" />
                  DPF System
                </Badge>
              )}
              {selection.selectedEngine?.specificParameters.hasEGR && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Settings className="h-3 w-3" />
                  EGR System
                </Badge>
              )}
              {selection.selectedEngine?.specificParameters.hasTurbo && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Turbocharger
                </Badge>
              )}
              {selection.selectedEngine?.specificParameters.dpfRegenerationSupported && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Settings className="h-3 w-3" />
                  DPF Regeneration
                </Badge>
              )}
              {selection.selectedEngine?.specificParameters.advancedDiagnostics && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Advanced Diagnostics
                </Badge>
              )}
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Diagnostic Capabilities:</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Standard PIDs:</span>
                <p className="text-muted-foreground">{selection.selectedEngine?.supportedPids.standard.length}</p>
              </div>
              <div>
                <span className="font-medium">Manufacturer PIDs:</span>
                <p className="text-muted-foreground">{selection.selectedEngine?.supportedPids.manufacturer.length}</p>
              </div>
              {selection.selectedEngine?.supportedPids.dpf && (
                <div>
                  <span className="font-medium">DPF PIDs:</span>
                  <p className="text-muted-foreground">{selection.selectedEngine.supportedPids.dpf.length}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleConfirmSelection}
              className="flex-1"
              size="lg"
            >
              Confirm & Use This Vehicle
            </Button>
            {isConnected && onCommand && (
              <Button 
                onClick={() => setSelection(prev => ({ ...prev, step: 'advanced-diagnostics' }))}
                variant="outline"
                size="lg"
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                Professional Diagnostics
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Selection
            </CardTitle>
            <CardDescription>
              Visual selection with car logos and detailed specifications
            </CardDescription>
          </div>
          
          {selection.step !== 'make' && (
            <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {renderBreadcrumb()}
        
        {selection.step === 'make' && renderMakeSelection()}
        {selection.step === 'model' && renderModelSelection()}
        {selection.step === 'generation' && renderGenerationSelection()}
        {selection.step === 'engine' && renderEngineSelection()}
        {selection.step === 'confirm' && renderConfirmation()}
        {selection.step === 'peugeot307-advanced' && (
          <Peugeot307AdvancedSelector 
            isConnected={isConnected}
            onBack={handleBack}
            selectedEngine={selection.selectedEngine}
          />
        )}
        {selection.step === 'advanced-diagnostics' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Professional Diagnostics</h3>
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
            <AdvancedDiagnosticsPanel 
              vehicleMake={selection.selectedMake?.name}
              onCommand={onCommand}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
