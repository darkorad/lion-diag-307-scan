
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  engine?: string;
  fuelType?: string;
  transmission?: string;
}

export const vehicles: Vehicle[] = [
  {
    id: 'peugeot-307-2004',
    make: 'Peugeot',
    model: '307',
    year: 2004,
    engine: '1.6L HDi',
    fuelType: 'Diesel',
    transmission: 'Manual'
  },
  {
    id: 'seat-ibiza-2010',
    make: 'Seat',
    model: 'Ibiza',
    year: 2010,
    engine: '1.4L TSI',
    fuelType: 'Petrol',
    transmission: 'Manual'
  },
  {
    id: 'vw-golf-2015',
    make: 'Volkswagen',
    model: 'Golf',
    year: 2015,
    engine: '2.0L TDI',
    fuelType: 'Diesel',
    transmission: 'Automatic'
  }
];
