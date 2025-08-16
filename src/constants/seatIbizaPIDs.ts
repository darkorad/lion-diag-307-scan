
export interface SeatIbizaPID {
  id: string;
  name: string;
  pid: string;
  module: string;
  description: string;
  unit: string;
  formula: string;
  category: 'engine' | 'body' | 'comfort' | 'climate' | 'abs' | 'airbag' | 'window' | 'fabric';
}

export const SEAT_IBIZA_PIDS: SeatIbizaPID[] = [
  // ENGINE CONTROL PIDS
  {
    id: 'engine_rpm',
    name: 'Engine RPM',
    pid: '010C',
    module: 'Engine ECU',
    description: 'Engine revolution per minute',
    unit: 'rpm',
    formula: '(A*256+B)/4',
    category: 'engine'
  },
  {
    id: 'vehicle_speed',
    name: 'Vehicle Speed',
    pid: '010D',
    module: 'Engine ECU',
    description: 'Vehicle speed from ECU',
    unit: 'km/h',
    formula: 'A',
    category: 'engine'
  },
  {
    id: 'coolant_temp',
    name: 'Coolant Temperature',
    pid: '0105',
    module: 'Engine ECU',
    description: 'Engine coolant temperature',
    unit: '°C',
    formula: 'A-40',
    category: 'engine'
  },
  {
    id: 'dpf_inlet_temp',
    name: 'DPF Inlet Temperature',
    pid: '22F604',
    module: 'Engine ECU',
    description: 'Diesel particulate filter inlet temperature',
    unit: '°C',
    formula: '(A*256+B)*0.75-48',
    category: 'engine'
  },
  {
    id: 'dpf_outlet_temp',
    name: 'DPF Outlet Temperature',
    pid: '22F605',
    module: 'Engine ECU',
    description: 'Diesel particulate filter outlet temperature',
    unit: '°C',
    formula: '(A*256+B)*0.75-48',
    category: 'engine'
  },
  {
    id: 'dpf_soot_load',
    name: 'DPF Soot Load',
    pid: '22F603',
    module: 'Engine ECU',
    description: 'DPF accumulated soot load',
    unit: 'g',
    formula: '(A*256+B)/100',
    category: 'engine'
  },
  {
    id: 'turbo_pressure',
    name: 'Turbo Pressure',
    pid: '22F40C',
    module: 'Engine ECU',
    description: 'Turbocharger boost pressure',
    unit: 'mbar',
    formula: '(A*256+B)/100',
    category: 'engine'
  },
  {
    id: 'rail_pressure',
    name: 'Rail Pressure',
    pid: '221132',
    module: 'Engine ECU',
    description: 'Common rail fuel pressure',
    unit: 'bar',
    formula: '(A*256+B)/100',
    category: 'engine'
  },
  {
    id: 'egr_position',
    name: 'EGR Position',
    pid: '22F446',
    module: 'Engine ECU',
    description: 'EGR valve position percentage',
    unit: '%',
    formula: 'A*100/255',
    category: 'engine'
  },

  // BODY CONTROL MODULE PIDS
  {
    id: 'central_locking_status',
    name: 'Central Locking Status',
    pid: '225001',
    module: 'Body Control',
    description: 'Central locking system status',
    unit: 'status',
    formula: 'A',
    category: 'body'
  },
  {
    id: 'window_fl_status',
    name: 'Front Left Window Status',
    pid: '225002',
    module: 'Body Control',
    description: 'Driver window position and status',
    unit: '%',
    formula: 'A*100/255',
    category: 'window'
  },
  {
    id: 'window_fr_status',
    name: 'Front Right Window Status',
    pid: '225003',
    module: 'Body Control',
    description: 'Passenger window position and status',
    unit: '%',
    formula: 'A*100/255',
    category: 'window'
  },
  {
    id: 'window_rl_status',
    name: 'Rear Left Window Status',
    pid: '225004',
    module: 'Body Control',
    description: 'Rear left window position and status',
    unit: '%',
    formula: 'A*100/255',
    category: 'window'
  },
  {
    id: 'window_rr_status',
    name: 'Rear Right Window Status',
    pid: '225005',
    module: 'Body Control',
    description: 'Rear right window position and status',
    unit: '%',
    formula: 'A*100/255',
    category: 'window'
  },
  {
    id: 'mirror_fold_status',
    name: 'Mirror Fold Status',
    pid: '225006',
    module: 'Body Control',
    description: 'Electric mirror folding status',
    unit: 'status',
    formula: 'A',
    category: 'body'
  },
  {
    id: 'interior_light_status',
    name: 'Interior Light Status',
    pid: '225008',
    module: 'Body Control',
    description: 'Interior lighting system status',
    unit: 'status',
    formula: 'A',
    category: 'body'
  },
  {
    id: 'exterior_light_status',
    name: 'Exterior Light Status',
    pid: '225009',
    module: 'Body Control',
    description: 'Exterior lighting system status',
    unit: 'status',
    formula: 'A',
    category: 'body'
  },
  {
    id: 'turn_signal_status',
    name: 'Turn Signal Status',
    pid: '22500A',
    module: 'Body Control',
    description: 'Turn signal indicators status',
    unit: 'status',
    formula: 'A',
    category: 'body'
  },
  {
    id: 'wiper_status',
    name: 'Wiper Status',
    pid: '22500C',
    module: 'Body Control',
    description: 'Windshield wiper system status',
    unit: 'status',
    formula: 'A',
    category: 'body'
  },

  // WINDOW CONTROL MODULE SPECIFIC PIDS
  {
    id: 'window_fl_position',
    name: 'FL Window Position',
    pid: '225010',
    module: 'Window FL',
    description: 'Precise driver window position',
    unit: 'mm',
    formula: '(A*256+B)/10',
    category: 'window'
  },
  {
    id: 'window_fl_motor_current',
    name: 'FL Window Motor Current',
    pid: '225011',
    module: 'Window FL',
    description: 'Driver window motor current draw',
    unit: 'A',
    formula: '(A*256+B)/1000',
    category: 'window'
  },
  {
    id: 'window_fl_auto_status',
    name: 'FL Window Auto Status',
    pid: '225012',
    module: 'Window FL',
    description: 'Driver window auto up/down status',
    unit: 'status',
    formula: 'A',
    category: 'window'
  },
  {
    id: 'window_fr_position',
    name: 'FR Window Position',
    pid: '225020',
    module: 'Window FR',
    description: 'Precise passenger window position',
    unit: 'mm',
    formula: '(A*256+B)/10',
    category: 'window'
  },
  {
    id: 'window_fr_motor_current',
    name: 'FR Window Motor Current',
    pid: '225021',
    module: 'Window FR',
    description: 'Passenger window motor current draw',
    unit: 'A',
    formula: '(A*256+B)/1000',
    category: 'window'
  },
  {
    id: 'window_fr_auto_status',
    name: 'FR Window Auto Status',
    pid: '225022',
    module: 'Window FR',
    description: 'Passenger window auto up/down status',
    unit: 'status',
    formula: 'A',
    category: 'window'
  },

  // CLIMATE CONTROL PIDS
  {
    id: 'ac_compressor_status',
    name: 'A/C Compressor Status',
    pid: '226001',
    module: 'Climate Control',
    description: 'Air conditioning compressor status',
    unit: 'status',
    formula: 'A',
    category: 'climate'
  },
  {
    id: 'blower_speed',
    name: 'Blower Fan Speed',
    pid: '226002',
    module: 'Climate Control',
    description: 'Climate control blower speed',
    unit: '%',
    formula: 'A*100/255',
    category: 'climate'
  },
  {
    id: 'cabin_temperature',
    name: 'Cabin Temperature',
    pid: '226003',
    module: 'Climate Control',
    description: 'Interior cabin temperature',
    unit: '°C',
    formula: 'A*0.5-40',
    category: 'climate'
  },
  {
    id: 'outside_temperature',
    name: 'Outside Temperature',
    pid: '226004',
    module: 'Climate Control',
    description: 'External ambient temperature',
    unit: '°C',
    formula: 'A*0.5-40',
    category: 'climate'
  },
  {
    id: 'ac_pressure_high',
    name: 'A/C High Pressure',
    pid: '226005',
    module: 'Climate Control',
    description: 'A/C system high side pressure',
    unit: 'bar',
    formula: '(A*256+B)/100',
    category: 'climate'
  },
  {
    id: 'ac_pressure_low',
    name: 'A/C Low Pressure',
    pid: '226006',
    module: 'Climate Control',
    description: 'A/C system low side pressure',
    unit: 'bar',
    formula: '(A*256+B)/100',
    category: 'climate'
  },

  // ABS/ESP SYSTEM PIDS
  {
    id: 'abs_status',
    name: 'ABS System Status',
    pid: '224001',
    module: 'ABS/ESP',
    description: 'Anti-lock braking system status',
    unit: 'status',
    formula: 'A',
    category: 'abs'
  },
  {
    id: 'esp_status',
    name: 'ESP System Status',
    pid: '224002',
    module: 'ABS/ESP',
    description: 'Electronic stability program status',
    unit: 'status',
    formula: 'A',
    category: 'abs'
  },
  {
    id: 'wheel_speed_fl',
    name: 'Front Left Wheel Speed',
    pid: '224003',
    module: 'ABS/ESP',
    description: 'Front left wheel speed sensor',
    unit: 'km/h',
    formula: '(A*256+B)/100',
    category: 'abs'
  },
  {
    id: 'wheel_speed_fr',
    name: 'Front Right Wheel Speed',
    pid: '224004',
    module: 'ABS/ESP',
    description: 'Front right wheel speed sensor',
    unit: 'km/h',
    formula: '(A*256+B)/100',
    category: 'abs'
  },
  {
    id: 'wheel_speed_rl',
    name: 'Rear Left Wheel Speed',
    pid: '224005',
    module: 'ABS/ESP',
    description: 'Rear left wheel speed sensor',
    unit: 'km/h',
    formula: '(A*256+B)/100',
    category: 'abs'
  },
  {
    id: 'wheel_speed_rr',
    name: 'Rear Right Wheel Speed',
    pid: '224006',
    module: 'ABS/ESP',
    description: 'Rear right wheel speed sensor',
    unit: 'km/h',
    formula: '(A*256+B)/100',
    category: 'abs'
  },
  {
    id: 'brake_pressure',
    name: 'Brake System Pressure',
    pid: '224007',
    module: 'ABS/ESP',
    description: 'Brake system hydraulic pressure',
    unit: 'bar',
    formula: '(A*256+B)/100',
    category: 'abs'
  },
  {
    id: 'steering_angle',
    name: 'Steering Wheel Angle',
    pid: '224008',
    module: 'ABS/ESP',
    description: 'Steering wheel position sensor',
    unit: '°',
    formula: '(A*256+B)-32768',
    category: 'abs'
  },

  // AIRBAG SYSTEM PIDS
  {
    id: 'airbag_status',
    name: 'Airbag System Status',
    pid: '223001',
    module: 'Airbag',
    description: 'Overall airbag system status',
    unit: 'status',
    formula: 'A',
    category: 'airbag'
  },
  {
    id: 'driver_airbag_status',
    name: 'Driver Airbag Status',
    pid: '223002',
    module: 'Airbag',
    description: 'Driver airbag status',
    unit: 'status',
    formula: 'A',
    category: 'airbag'
  },
  {
    id: 'passenger_airbag_status',
    name: 'Passenger Airbag Status',
    pid: '223003',
    module: 'Airbag',
    description: 'Passenger airbag status',
    unit: 'status',
    formula: 'A',
    category: 'airbag'
  },
  {
    id: 'side_airbag_status',
    name: 'Side Airbag Status',
    pid: '223004',
    module: 'Airbag',
    description: 'Side airbags status',
    unit: 'status',
    formula: 'A',
    category: 'airbag'
  },
  {
    id: 'curtain_airbag_status',
    name: 'Curtain Airbag Status',
    pid: '223005',
    module: 'Airbag',
    description: 'Curtain airbags status',
    unit: 'status',
    formula: 'A',
    category: 'airbag'
  },

  // FABRIC ROOF PIDS (for convertible models)
  {
    id: 'roof_position',
    name: 'Fabric Roof Position',
    pid: '224601',
    module: 'Fabric Roof',
    description: 'Current fabric roof position',
    unit: '%',
    formula: 'A*100/255',
    category: 'fabric'
  },
  {
    id: 'roof_motor1_current',
    name: 'Roof Motor 1 Current',
    pid: '224602',
    module: 'Fabric Roof',
    description: 'Roof motor 1 current draw',
    unit: 'A',
    formula: '(A*256+B)/1000',
    category: 'fabric'
  },
  {
    id: 'roof_motor2_current',
    name: 'Roof Motor 2 Current',
    pid: '224603',
    module: 'Fabric Roof',
    description: 'Roof motor 2 current draw',
    unit: 'A',
    formula: '(A*256+B)/1000',
    category: 'fabric'
  },
  {
    id: 'roof_latch_status',
    name: 'Roof Latch Status',
    pid: '224604',
    module: 'Fabric Roof',
    description: 'Fabric roof latch mechanisms status',
    unit: 'status',
    formula: 'A',
    category: 'fabric'
  },
  {
    id: 'window_sync_status',
    name: 'Window Synchronization Status',
    pid: '224605',
    module: 'Fabric Roof',
    description: 'Window sync for roof operation',
    unit: 'status',
    formula: 'A',
    category: 'fabric'
  },

  // INSTRUMENT CLUSTER PIDS
  {
    id: 'fuel_gauge',
    name: 'Fuel Level Gauge',
    pid: '227001',
    module: 'Instrument Cluster',
    description: 'Fuel tank level display',
    unit: '%',
    formula: 'A*100/255',
    category: 'comfort'
  },
  {
    id: 'temperature_gauge',
    name: 'Temperature Gauge',
    pid: '227002',
    module: 'Instrument Cluster',
    description: 'Engine temperature gauge reading',
    unit: '°C',
    formula: 'A*0.75-48',
    category: 'comfort'
  },
  {
    id: 'odometer_reading',
    name: 'Odometer Reading',
    pid: '227005',
    module: 'Instrument Cluster',
    description: 'Total vehicle mileage',
    unit: 'km',
    formula: '(A*16777216+B*65536+C*256+D)',
    category: 'comfort'
  },
  {
    id: 'service_interval',
    name: 'Service Interval',
    pid: '227007',
    module: 'Instrument Cluster',
    description: 'Distance to next service',
    unit: 'km',
    formula: '(A*256+B)*10',
    category: 'comfort'
  }
];

export const getSeatIbizaPIDsByModule = (module: string) => {
  return SEAT_IBIZA_PIDS.filter(pid => pid.module === module);
};

export const getSeatIbizaPIDsByCategory = (category: string) => {
  return SEAT_IBIZA_PIDS.filter(pid => pid.category === category);
};

export const getSeatIbizaWindowPIDs = () => {
  return SEAT_IBIZA_PIDS.filter(pid => pid.category === 'window');
};

export const getSeatIbizaFabricPIDs = () => {
  return SEAT_IBIZA_PIDS.filter(pid => pid.category === 'fabric');
};
