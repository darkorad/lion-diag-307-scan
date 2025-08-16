
import { VehicleProfile } from '@/types/vehicle';

export const SEAT_IBIZA_PROFILES: VehicleProfile[] = [
  {
    id: 'seat-ibiza-2008-1.4-tdi',
    make: 'Seat',
    model: 'Ibiza',
    year: 2008,
    engine: '1.4L TDI',
    fuel: 'Diesel',
    displayName: 'Seat Ibiza 2008 1.4 TDI',
    vinPatterns: ['VSS*', 'VSE*'],
    supportedPids: {
      standard: [
        '010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F',
        '0133', '013C', '0142', '0143', '0144', '0145', '0146', '0147', '0149', '014A',
        '014C', '014D', '014E', '0151', '0152', '0159', '015A', '015B', '015C', '015D', '015E'
      ],
      manufacturer: [
        // VAG Group PIDs for SEAT
        '22F40C', '22F40D', '22F446', '22F447', '22F602', '22F603', '22F604', '22F605',
        '22F190', '22F191', '22F1A0', '22F1A1', '22F1A2', '22F1A3',
        // SEAT Specific PIDs
        '221132', '221133', '221134', '221135', '221136', '221137', '221138', '221139',
        '22113A', '22113B', '22113C', '22113D', '22113E', '22113F',
        // Comfort & Body Control
        '225001', '225002', '225003', '225004', '225005', '225006', '225007', '225008',
        '225009', '22500A', '22500B', '22500C', '22500D', '22500E', '22500F',
        // ABS/ESP System
        '224001', '224002', '224003', '224004', '224005', '224006', '224007', '224008',
        // Airbag System
        '223001', '223002', '223003', '223004', '223005',
        // Climate Control
        '226001', '226002', '226003', '226004', '226005', '226006',
        // Instrument Cluster
        '227001', '227002', '227003', '227004', '227005', '227006', '227007'
      ],
      dpf: ['22F602', '22F603', '22F604', '22F605', '22F606', '22F607', '22F608', '22F609']
    },
    pidMappings: {
      // Engine Management
      DPF_INLET_TEMP: '22F604',
      DPF_OUTLET_TEMP: '22F605',
      DPF_DIFF_PRESSURE: '22F602',
      DPF_SOOT_LOAD: '22F603',
      DPF_SOOT_MASS: '22F606',
      DPF_ASH_LOAD: '22F607',
      DPF_REGEN_STATUS: '22F608',
      DPF_DISTANCE_LAST_REGEN: '22F609',
      TURBO_PRESSURE: '22F40C',
      TURBO_PRESSURE_DESIRED: '22F40D',
      RAIL_PRESSURE: '221132',
      RAIL_PRESSURE_DESIRED: '221133',
      EGR_POSITION: '22F446',
      EGR_DUTY_CYCLE: '22F447',
      BOOST_PRESSURE: '221134',
      INTAKE_MANIFOLD_PRESSURE: '221135',
      FUEL_TEMPERATURE: '221136',
      INJECTION_QUANTITY: '221137',
      INJECTION_TIMING: '221138',
      GLOW_PLUG_STATUS: '22F190',
      
      // Body Control Module
      CENTRAL_LOCKING_STATUS: '225001',
      WINDOW_STATUS_FL: '225002',
      WINDOW_STATUS_FR: '225003',
      WINDOW_STATUS_RL: '225004',
      WINDOW_STATUS_RR: '225005',
      MIRROR_FOLD_STATUS: '225006',
      SUNROOF_POSITION: '225007',
      INTERIOR_LIGHT_STATUS: '225008',
      EXTERIOR_LIGHT_STATUS: '225009',
      TURN_SIGNAL_STATUS: '22500A',
      HAZARD_LIGHTS_STATUS: '22500B',
      WIPER_STATUS: '22500C',
      WASHER_FLUID_LEVEL: '22500D',
      HOOD_STATUS: '22500E',
      TRUNK_STATUS: '22500F',
      
      // ABS/ESP System
      ABS_STATUS: '224001',
      ESP_STATUS: '224002',
      WHEEL_SPEED_FL: '224003',
      WHEEL_SPEED_FR: '224004',
      WHEEL_SPEED_RL: '224005',
      WHEEL_SPEED_RR: '224006',
      BRAKE_PRESSURE: '224007',
      STEERING_ANGLE: '224008',
      
      // Airbag System
      AIRBAG_STATUS: '223001',
      DRIVER_AIRBAG_STATUS: '223002',
      PASSENGER_AIRBAG_STATUS: '223003',
      SIDE_AIRBAG_STATUS: '223004',
      CURTAIN_AIRBAG_STATUS: '223005',
      
      // Climate Control
      AC_COMPRESSOR_STATUS: '226001',
      BLOWER_SPEED: '226002',
      CABIN_TEMPERATURE: '226003',
      OUTSIDE_TEMPERATURE: '226004',
      AC_PRESSURE_HIGH: '226005',
      AC_PRESSURE_LOW: '226006',
      
      // Instrument Cluster
      FUEL_GAUGE: '227001',
      TEMPERATURE_GAUGE: '227002',
      TACHOMETER: '227003',
      SPEEDOMETER: '227004',
      ODOMETER: '227005',
      TRIP_METER: '227006',
      SERVICE_INTERVAL: '227007'
    },
    specificParameters: {
      hasDPF: true,
      hasEGR: true,
      hasTurbo: true,
      fuelType: 'diesel',
      emissionStandard: 'Euro5',
      manufacturerProtocol: 'VAG',
      useOlderProtocol: true,
      dpfRegenerationSupported: true,
      advancedDiagnostics: true,
      maxPower: 90, // HP
      maxTorque: 230, // Nm
      displacement: 1.4, // L
      cylinders: 4,
      compressionRatio: 19.5,
      fuelSystem: 'Common Rail',
      turboType: 'VTG',
      dpfType: 'Cordierite',
      dpfVolume: 1.2, // L
      supportedSystems: [
        'Engine', 'Transmission', 'ABS', 'ESP', 'Airbag', 'Climate', 'BCM', 'Instrument'
      ]
    }
  },
  {
    id: 'seat-ibiza-2010-1.6-tdi',
    make: 'Seat',
    model: 'Ibiza',
    year: 2010,
    engine: '1.6L TDI',
    fuel: 'Diesel',
    displayName: 'Seat Ibiza 2010 1.6 TDI',
    vinPatterns: ['VSS*', 'VSE*'],
    supportedPids: {
      standard: [
        '010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F',
        '0133', '013C', '0142', '0143', '0144', '0145', '0146', '0147', '0149', '014A',
        '014C', '014D', '014E', '0151', '0152', '0159', '015A', '015B', '015C', '015D', '015E'
      ],
      manufacturer: [
        '22F40C', '22F40D', '22F446', '22F447', '22F602', '22F603', '22F604', '22F605',
        '22F190', '22F191', '22F1A0', '22F1A1', '22F1A2', '22F1A3',
        '221132', '221133', '221134', '221135', '221136', '221137', '221138', '221139',
        '22113A', '22113B', '22113C', '22113D', '22113E', '22113F',
        '225001', '225002', '225003', '225004', '225005', '225006', '225007', '225008',
        '224001', '224002', '224003', '224004', '224005', '224006', '224007', '224008',
        '223001', '223002', '223003', '223004', '223005',
        '226001', '226002', '226003', '226004', '226005', '226006',
        '227001', '227002', '227003', '227004', '227005', '227006', '227007'
      ],
      dpf: ['22F602', '22F603', '22F604', '22F605', '22F606', '22F607', '22F608', '22F609', '22F60A', '22F60B']
    },
    pidMappings: {
      // Enhanced DPF monitoring for 1.6 TDI
      DPF_INLET_TEMP: '22F604',
      DPF_OUTLET_TEMP: '22F605',
      DPF_DIFF_PRESSURE: '22F602',
      DPF_SOOT_LOAD: '22F603',
      DPF_SOOT_MASS: '22F606',
      DPF_ASH_LOAD: '22F607',
      DPF_REGEN_STATUS: '22F608',
      DPF_DISTANCE_LAST_REGEN: '22F609',
      DPF_TIME_LAST_REGEN: '22F60A',
      DPF_REGEN_COUNT: '22F60B',
      
      // Enhanced engine control
      TURBO_PRESSURE: '22F40C',
      TURBO_PRESSURE_DESIRED: '22F40D',
      RAIL_PRESSURE: '221132',
      EGR_POSITION: '22F446',
      BOOST_PRESSURE: '221134',
      
      // All other mappings same as 1.4 TDI
      CENTRAL_LOCKING_STATUS: '225001',
      ABS_STATUS: '224001',
      AIRBAG_STATUS: '223001',
      AC_COMPRESSOR_STATUS: '226001',
      FUEL_GAUGE: '227001'
    },
    specificParameters: {
      hasDPF: true,
      hasEGR: true,
      hasTurbo: true,
      fuelType: 'diesel',
      emissionStandard: 'Euro5',
      manufacturerProtocol: 'VAG',
      maxPower: 105, // HP
      maxTorque: 250, // Nm
      displacement: 1.6, // L
      cylinders: 4,
      compressionRatio: 16.5,
      fuelSystem: 'Common Rail',
      turboType: 'VTG',
      dpfType: 'SiC',
      dpfVolume: 1.4, // L
      supportedSystems: [
        'Engine', 'Transmission', 'ABS', 'ESP', 'Airbag', 'Climate', 'BCM', 'Instrument',
        'Radio', 'Navigation', 'Parking'
      ]
    }
  }
];
