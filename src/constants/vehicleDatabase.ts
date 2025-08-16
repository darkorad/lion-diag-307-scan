
import { VehicleMake } from '@/types/vehicle';
import { COMPREHENSIVE_VEHICLE_DATABASE } from './comprehensiveVehicleDatabase2000Plus';

export const VEHICLE_DATABASE: VehicleMake[] = COMPREHENSIVE_VEHICLE_DATABASE;

export const getVehicleMakeById = (id: string): VehicleMake | undefined => {
  return VEHICLE_DATABASE.find(make => make.id === id);
};

export type { VehicleMake, VehicleModel, VehicleGeneration, VehicleEngine } from '@/types/vehicle';
