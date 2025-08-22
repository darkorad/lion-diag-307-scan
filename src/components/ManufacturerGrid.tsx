
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Car } from 'lucide-react';
import { VehicleMake } from '@/types/vehicle';
import { VEHICLE_DATABASE } from '@/constants/vehicleDatabase';

interface ManufacturerGridProps {
  onManufacturerSelect: (make: VehicleMake) => void;
  selectedMake?: VehicleMake | null;
}

export const ManufacturerGrid: React.FC<ManufacturerGridProps> = ({
  onManufacturerSelect,
  selectedMake
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredManufacturers = VEHICLE_DATABASE.filter(make =>
    make.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    make.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getModelCount = (make: VehicleMake): number => {
    return make.models.reduce((total, model) => {
      return total + model.generations.reduce((genTotal, gen) => {
        return genTotal + gen.engines.length;
      }, 0);
    }, 0);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search manufacturers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredManufacturers.map((make) => {
          const modelCount = getModelCount(make);
          const isSelected = selectedMake?.id === make.id;
          
          return (
            <Card 
              key={make.id}
              className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                isSelected ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => onManufacturerSelect(make)}
            >
              <CardContent className="p-4 text-center space-y-3">
                <div className="h-16 w-16 mx-auto flex items-center justify-center bg-muted rounded-lg">
                  {make.logo ? (
                    <img 
                      src={make.logo} 
                      alt={`${make.name} logo`}
                      className="h-12 w-12 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <Car className={`h-8 w-8 text-muted-foreground ${make.logo ? 'hidden' : ''}`} />
                </div>
                
                <div>
                  <h3 className="font-semibold text-sm">{make.name}</h3>
                  <p className="text-xs text-muted-foreground">{make.country}</p>
                </div>
                
                <Badge variant="secondary" className="text-xs">
                  {modelCount} models
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredManufacturers.length === 0 && (
        <div className="text-center py-12">
          <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No manufacturers found</p>
        </div>
      )}
    </div>
  );
};
