
export interface OBD2Data {
  engineRPM: number;
  vehicleSpeed: number;
  engineTemp: number;
  mafSensorRate: number;
  throttlePosition: number;
  fuelPressure: number;
  boostPressure: number;
  intakeAirTemp: number;
  fuelTrim: number;
  oxygenSensor: number;
  batteryVoltage: number;
  fuelLevel: number;
  // Additional properties
  oilTemp: number;
  loadValue: number;
  ambientAirTemp: number;
  acceleratorPedal: number;
  commandedThrottleActuator: number;
  fuelType: number;
  ethanolFuelPercent: number;
  engineFuelRate: number;
  turbochargerPressure: number;
  fuelRailPressure: number;
}

export interface DPFData {
  sootLevel: number;
  dpfInletTemperature: number;
  dpfOutletTemperature: number;
  dpfDifferentialPressure: number;
  dpfSootLoadCalculated: number;
  dpfSootLoadMeasured: number;
  exhaustGasTemperature1: number;
  exhaustGasTemperature2: number;
  activeRegenStatus: boolean;
  passiveRegenStatus: boolean;
  dpfRegenRequest: boolean;
}
