
export interface Vehicle {
  id: string;
  name: string;
  manufacturer: string;
  year?: number;
  engine?: string;
  image: string;
}

export const vehicles: Vehicle[] = [
  {
    id: 'peugeot-307-2004',
    name: 'Peugeot 307',
    manufacturer: 'Peugeot',
    year: 2004,
    engine: '1.6L HDi',
    image: '/placeholder.svg'
  },
  {
    id: 'seat-ibiza-2010',
    name: 'Seat Ibiza',
    manufacturer: 'Seat',
    year: 2010,
    engine: '1.4L TSI',
    image: '/placeholder.svg'
  },
  {
    id: 'vw-golf-2015',
    name: 'Volkswagen Golf',
    manufacturer: 'Volkswagen',
    year: 2015,
    engine: '2.0L TDI',
    image: '/placeholder.svg'
  }
];
