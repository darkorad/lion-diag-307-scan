
// Standard OBD2 PIDs
export const OBD2_PIDS = {
  ENGINE_RPM: '010C',
  VEHICLE_SPEED: '010D',
  ENGINE_TEMP: '0105',
  MAF_RATE: '0110',
  THROTTLE_POS: '0111',
  FUEL_PRESSURE: '010A',
  INTAKE_TEMP: '010F',
  FUEL_TRIM_LONG: '0107',
  O2_SENSOR: '0114',
  FUEL_LEVEL: '012F',
} as const;

// DPF specific PIDs (manufacturer specific - Mode 22)
export const DPF_PIDS = {
  DPF_INLET_TEMP: '227C',
  DPF_OUTLET_TEMP: '227D',
  DPF_DIFF_PRESSURE: '227E',
  DPF_SOOT_LOAD: '227F',
} as const;
