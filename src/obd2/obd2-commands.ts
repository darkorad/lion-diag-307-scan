// src/obd2/obd2-commands.ts

/**
 * Standard OBD2 Commands
 */
export const OBD2_COMMANDS = {
  // ELM327 Commands
  AT_RESET: 'ATZ', // Reset ELM327
  AT_ECHO_OFF: 'ATE0', // Disable echo
  AT_LINEFEEDS_OFF: 'ATL0', // Disable linefeeds
  AT_SET_PROTOCOL_AUTO: 'ATSP0', // Set protocol to auto
  AT_HEADERS_ON: 'ATH1', // Enable headers
  AT_DESCRIBE_PROTOCOL: 'ATDP', // Describe current protocol
  AT_GET_VOLTAGE: 'ATRV', // Get voltage
  AT_READ_VERSION: 'ATI', // Get ELM327 version

  // Standard PIDs (Service 01)
  SHOW_CURRENT_DATA: '01',
  GET_DTC: '03', // Get stored Diagnostic Trouble Codes (DTCs)
  CLEAR_DTC: '04', // Clear stored DTCs and freeze data

  // PID codes
  PID_ENGINE_LOAD: '04',
  PID_COOLANT_TEMP: '05',
  PID_FUEL_PRESSURE: '0A',
  PID_INTAKE_MANIFOLD_PRESSURE: '0B',
  PID_RPM: '0C',
  PID_SPEED: '0D',
  PID_TIMING_ADVANCE: '0E',
  PID_INTAKE_AIR_TEMP: '0F',
  PID_MAF_AIR_FLOW: '10',
  PID_THROTTLE_POSITION: '11',
  PID_O2_SENSORS_PRESENT: '13',
  PID_O2_BANK1_SENSOR1: '14',
  PID_RUNTIME_SINCE_ENGINE_START: '1F',
  PID_DISTANCE_WITH_MIL: '21',
  PID_FUEL_LEVEL: '2F',
  PID_BAROMETRIC_PRESSURE: '33',
  PID_CONTROL_MODULE_VOLTAGE: '42',
  PID_ABSOLUTE_LOAD_VALUE: '43',
  PID_COMMANDED_EQUIV_RATIO: '44',
  PID_RELATIVE_THROTTLE_POSITION: '45',
  PID_AMBIENT_AIR_TEMP: '46',
  PID_ETHANOL_FUEL_PERCENTAGE: '52',
  PID_FUEL_RAIL_ABSOLUTE_PRESSURE: '59',
  PID_HYBRID_BATTERY_REMAINING_LIFE: '5B',
  PID_ENGINE_OIL_TEMP: '5C',
  PID_FUEL_INJECTION_TIMING: '5D',
  PID_ENGINE_FUEL_RATE: '5E',

  // Service 09 PIDs
  VIN: '0902',
};

/**
 * Manufacturer-specific commands and PIDs
 */
export const VAG_COMMANDS = {
  // Example VAG-specific command
  READ_TRANSMISSION_TEMP: '2101',
};

export const PSA_COMMANDS = {
  // DPF-related PIDs for PSA group
  DPF_INLET_TEMP: '221942',
  DPF_OUTLET_TEMP: '221943',
  DPF_SOOT_MASS: '22B001',
};

/**
 * Command Groups for Initialization
 */
export const ELM327_INIT_COMMANDS = [
  OBD2_COMMANDS.AT_RESET,
  OBD2_COMMANDS.AT_ECHO_OFF,
  OBD2_COMMANDS.AT_LINEFEEDS_OFF,
  OBD2_COMMANDS.AT_SET_PROTOCOL_AUTO,
  OBD2_COMMANDS.AT_HEADERS_ON,
];

/**
 * Function to get a command by its key
 * @param key The key of the command in OBD2_COMMANDS
 * @returns The command string
 */
export const getCommand = (key: keyof typeof OBD2_COMMANDS): string => {
  return OBD2_COMMANDS[key];
};
