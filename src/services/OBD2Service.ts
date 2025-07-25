
import { enhancedBluetoothService as bluetoothService, BluetoothDevice } from '@/obd2/enhanced-bluetooth-service';
import { OBD2Data, DPFData } from '@/types/obd2';
import { VehicleProfile } from '@/types/vehicle';
import { StandardOBD2DataService } from '@/services/StandardOBD2DataService';
import { DPFDataService } from '@/services/DPFDataService';
import { VehicleDetectionService } from '@/services/VehicleDetectionService';
import { delay } from '@/utils/obd2Utils';

class OBD2Service {
  private device: BluetoothDevice | null = null;
  private isConnected = false;
  private dataCallbacks: ((data: OBD2Data) => void)[] = [];
  private dpfCallbacks: ((data: DPFData) => void)[] = [];
  private vehicleProfileCallbacks: ((profile: VehicleProfile | null) => void)[] = [];
  private standardDataService: StandardOBD2DataService;
  private dpfDataService: DPFDataService;
  private detectionService: VehicleDetectionService;
  private currentVehicleProfile: VehicleProfile | null = null;

  constructor() {
    this.standardDataService = new StandardOBD2DataService(this.sendCommand.bind(this));
    this.dpfDataService = new DPFDataService(this.sendCommand.bind(this));
    this.detectionService = new VehicleDetectionService(this.sendCommand.bind(this));
  }

  async initialize(): Promise<void> {
    try {
      console.log('Bluetooth Serial initialized');
    } catch (error) {
      console.error('Failed to initialize Bluetooth:', error);
      throw error;
    }
  }

  async scanForDevices(): Promise<BluetoothDevice[]> {
    try {
      console.log('Scanning for Bluetooth devices (paired and discoverable)...');
      const allDevices = await bluetoothService.getAllDevices();
      
      console.log('Found OBD2-compatible devices:', allDevices);
      return allDevices;
    } catch (error) {
      console.error('Scan failed:', error);
      throw error;
    }
  }

  async connect(device: BluetoothDevice): Promise<void> {
    try {
      console.log('Connecting to device:', device.name, `(${device.isPaired ? 'Paired' : 'Discoverable'})`);
      await bluetoothService.connectToDevice(device);
      this.device = device;
      this.isConnected = true;
      
      await this.initializeELM327();
      console.log('Successfully connected and initialized ELM327');
    } catch (error) {
      console.error('Connection failed:', error);
      this.isConnected = false;
      throw new Error(`Failed to connect to ${device.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.device) {
      try {
        await bluetoothService.disconnect();
        this.device = null;
        this.isConnected = false;
        console.log('Disconnected from OBD2 device');
      } catch (error) {
        console.error('Disconnect failed:', error);
      }
    }
  }

  private async initializeELM327(): Promise<void> {
    if (!this.device) throw new Error('No device connected');

    try {
      await bluetoothService.initializeELM327CarScannerStyle();
      console.log('ELM327 initialized successfully');
    } catch (error) {
      console.error('ELM327 initialization failed:', error);
      throw error;
    }
  }

  private async sendCommand(command: string): Promise<string> {
    if (!this.device || !this.isConnected) {
      throw new Error('Device not connected');
    }

    try {
      return await bluetoothService.sendObdCommand(command);
    } catch (error) {
      console.error('Command failed:', command, error);
      throw error;
    }
  }

  async startLiveData(): Promise<void> {
    if (!this.isConnected) return;

    console.log('Starting live data collection...');
    this.collectLiveData();
  }

  private async collectLiveData(): Promise<void> {
    if (!this.isConnected) return;

    try {
      const obd2Data: Partial<OBD2Data> = {};
      const dpfData: Partial<DPFData> = {};

      try {
        obd2Data.engineRPM = await this.standardDataService.getEngineRPM();
        obd2Data.vehicleSpeed = await this.standardDataService.getVehicleSpeed();
        obd2Data.engineTemp = await this.standardDataService.getEngineTemp();
        obd2Data.mafSensorRate = await this.standardDataService.getMAFRate();
        obd2Data.throttlePosition = await this.standardDataService.getThrottlePosition();
        obd2Data.intakeAirTemp = await this.standardDataService.getIntakeAirTemp();
        obd2Data.fuelTrim = await this.standardDataService.getFuelTrim();
        obd2Data.oxygenSensor = await this.standardDataService.getOxygenSensor();
        obd2Data.fuelLevel = await this.standardDataService.getFuelLevel();
      } catch (error) {
        console.warn('Some standard PIDs failed:', error);
      }

      try {
        dpfData.dpfInletTemperature = await this.dpfDataService.getDPFInletTemp();
        dpfData.dpfOutletTemperature = await this.dpfDataService.getDPFOutletTemp();
        dpfData.dpfDifferentialPressure = await this.dpfDataService.getDPFDiffPressure();
        dpfData.dpfSootLoadCalculated = await this.dpfDataService.getDPFSootLoad();
      } catch (error) {
        console.warn('DPF PIDs not supported or failed:', error);
        dpfData.dpfInletTemperature = (obd2Data.engineTemp || 90) * 5;
        dpfData.dpfOutletTemperature = (dpfData.dpfInletTemperature || 450) + 50;
      }

      if (Object.keys(obd2Data).length > 0) {
        this.dataCallbacks.forEach(callback => {
          callback(obd2Data as OBD2Data);
        });
      }

      if (Object.keys(dpfData).length > 0) {
        this.dpfCallbacks.forEach(callback => {
          callback(dpfData as DPFData);
        });
      }

      if (this.isConnected) {
        setTimeout(() => this.collectLiveData(), 1000);
      }
    } catch (error) {
      console.error('Live data collection error:', error);
      if (this.isConnected) {
        setTimeout(() => this.collectLiveData(), 2000);
      }
    }
  }

  onDataReceived(callback: (data: OBD2Data) => void): void {
    this.dataCallbacks.push(callback);
  }

  onDPFDataReceived(callback: (data: DPFData) => void): void {
    this.dpfCallbacks.push(callback);
  }

  isDeviceConnected(): boolean {
    return this.isConnected;
  }

  getConnectedDevice(): BluetoothDevice | null {
    return this.device;
  }

  // Vehicle Profile Management
  async detectVehicle() {
    if (!this.isConnected) {
      throw new Error('Device not connected');
    }
    
    const vehicleInfo = await this.detectionService.detectVehicle();
    if (vehicleInfo.profile) {
      this.setVehicleProfile(vehicleInfo.profile);
    }
    return vehicleInfo;
  }

  setVehicleProfile(profile: VehicleProfile | null): void {
    this.currentVehicleProfile = profile;
    console.log('Vehicle profile set:', profile?.displayName || 'None');
    
    // Update data services with new profile
    if (profile) {
      this.standardDataService.setVehicleProfile(profile);
      this.dpfDataService.setVehicleProfile(profile);
    }
    
    // Notify callbacks
    this.vehicleProfileCallbacks.forEach(callback => {
      callback(profile);
    });
  }

  getCurrentVehicleProfile(): VehicleProfile | null {
    return this.currentVehicleProfile;
  }

  onVehicleProfileChanged(callback: (profile: VehicleProfile | null) => void): void {
    this.vehicleProfileCallbacks.push(callback);
  }

  async sendCommandPublic(command: string): Promise<string> {
    return this.sendCommand(command);
  }
}

export const obd2Service = new OBD2Service();
