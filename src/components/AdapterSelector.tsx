import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Bluetooth, 
  Wifi, 
  Usb, 
  Search, 
  Star,
  CheckCircle,
  Info,
  DollarSign
} from 'lucide-react';
import { OBD2_ADAPTERS, getAdaptersByType } from '@/constants/adapterDatabase';
import { OBD2Adapter } from '@/types/adapters';

interface AdapterSelectorProps {
  onAdapterSelected: (adapter: OBD2Adapter) => void;
  selectedAdapter?: OBD2Adapter | null;
}

const AdapterSelector: React.FC<AdapterSelectorProps> = ({ 
  onAdapterSelected, 
  selectedAdapter 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'bluetooth' | 'wifi' | 'usb'>('all');

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'bluetooth':
        return <Bluetooth className="h-4 w-4 text-blue-500" />;
      case 'wifi':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'usb':
        return <Usb className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getConnectionColor = (type: string) => {
    switch (type) {
      case 'bluetooth':
        return 'border-blue-500/20 bg-blue-500/5';
      case 'wifi':
        return 'border-green-500/20 bg-green-500/5';
      case 'usb':
        return 'border-purple-500/20 bg-purple-500/5';
      default:
        return 'border-gray-500/20 bg-gray-500/5';
    }
  };

  const filteredAdapters = OBD2_ADAPTERS.filter(adapter => {
    const matchesSearch = adapter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         adapter.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         adapter.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || adapter.connectionType === selectedType;
    
    return matchesSearch && matchesType;
  });

  const connectionTypes = [
    { id: 'all', label: 'All Adapters', count: OBD2_ADAPTERS.length },
    { id: 'bluetooth', label: 'Bluetooth', count: getAdaptersByType('bluetooth').length },
    { id: 'wifi', label: 'WiFi', count: getAdaptersByType('wifi').length },
    { id: 'usb', label: 'USB', count: getAdaptersByType('usb').length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Select Your OBD2 Adapter</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose your OBD2 adapter model to ensure optimal compatibility and connection settings.
          We support {OBD2_ADAPTERS.length}+ popular adapter models.
        </p>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Adapters</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by brand, model, or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {connectionTypes.map(type => (
                <Button
                  key={type.id}
                  variant={selectedType === type.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type.id as 'all' | 'bluetooth' | 'wifi' | 'usb')}
                  className="flex items-center gap-2"
                >
                  {type.id !== 'all' && getConnectionIcon(type.id)}
                  {type.label}
                  <Badge variant="secondary" className="ml-1">
                    {type.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adapter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAdapters.map(adapter => (
          <Card 
            key={adapter.id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
              selectedAdapter?.id === adapter.id 
                ? 'ring-2 ring-primary shadow-lg' 
                : getConnectionColor(adapter.connectionType)
            }`}
            onClick={() => onAdapterSelected(adapter)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getConnectionIcon(adapter.connectionType)}
                  <div>
                    <CardTitle className="text-lg">{adapter.name}</CardTitle>
                    <CardDescription>{adapter.brand} • {adapter.model}</CardDescription>
                  </div>
                </div>
                {selectedAdapter?.id === adapter.id && (
                  <CheckCircle className="h-5 w-5 text-primary" />
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {adapter.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="capitalize">
                    {adapter.connectionType}
                  </Badge>
                  {adapter.price && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <DollarSign className="h-3 w-3" />
                      {adapter.price}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {adapter.compatibility.slice(0, 3).map(protocol => (
                    <Badge key={protocol} variant="secondary" className="text-xs">
                      {protocol}
                    </Badge>
                  ))}
                  {adapter.compatibility.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{adapter.compatibility.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-medium">Key Features:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {adapter.features.slice(0, 2).map((feature, index) => (
                    <li key={index} className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-current rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Connection Details */}
              {adapter.connectionType === 'bluetooth' && adapter.defaultPin && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Default PIN:</span> {adapter.defaultPin}
                </div>
              )}
              
              {adapter.connectionType === 'wifi' && (
                <div className="text-xs text-muted-foreground space-y-1">
                  {adapter.defaultIP && (
                    <div><span className="font-medium">Default IP:</span> {adapter.defaultIP}</div>
                  )}
                  {adapter.defaultPort && (
                    <div><span className="font-medium">Default Port:</span> {adapter.defaultPort}</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAdapters.length === 0 && (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <Info className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">No Adapters Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filter options.
              </p>
            </div>
            <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedType('all'); }}>
              Clear Filters
            </Button>
          </div>
        </Card>
      )}

      {/* Selected Adapter Details */}
      {selectedAdapter && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Selected: {selectedAdapter.name}
            </CardTitle>
            <CardDescription>
              Ready to connect via {selectedAdapter.connectionType.toUpperCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Compatibility:</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedAdapter.compatibility.map(protocol => (
                    <Badge key={protocol} variant="secondary" className="text-xs">
                      {protocol}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Features:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  {selectedAdapter.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-current rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdapterSelector;