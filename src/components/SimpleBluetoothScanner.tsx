import React, { useState, useEffect } from 'react';
import { registerPlugin } from '@capacitor/core';
import { SimpleBluetoothScannerPlugin, BluetoothDevice, BluetoothStatus, DiscoveryResult } from '../plugins/SimpleBluetoothScanner';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

// Register the plugin
const SimpleBluetoothScanner = registerPlugin<SimpleBluetoothScannerPlugin>('SimpleBluetoothScanner');

const SimpleBluetoothScannerComponent: React.FC = () => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    // Check Bluetooth status on component mount
    checkBluetoothStatus();
    
    // Set up event listeners
    const deviceDiscoveredListener = SimpleBluetoothScanner.addListener('deviceDiscovered', (device: BluetoothDevice) => {
      setDevices(prevDevices => {
        // Avoid duplicates
        if (!prevDevices.some(d => d.address === device.address)) {
          return [...prevDevices, device];
        }
        return prevDevices;
      });
    });

    const scanStartedListener = SimpleBluetoothScanner.addListener('scanStarted', () => {
      setIsScanning(true);
      setDevices([]);
      setStatusMessage('Scanning for devices...');
    });

    const scanFinishedListener = SimpleBluetoothScanner.addListener('scanFinished', (result: DiscoveryResult) => {
      setIsScanning(false);
      setStatusMessage(`Scan finished. Found ${result.count} devices.`);
    });

    // Cleanup listeners on unmount
    return () => {
      deviceDiscoveredListener.then(listener => listener.remove());
      scanStartedListener.then(listener => listener.remove());
      scanFinishedListener.then(listener => listener.remove());
    };
  }, []);

  const checkBluetoothStatus = async () => {
    try {
      const status: BluetoothStatus = await SimpleBluetoothScanner.checkBluetoothStatus();
      setIsSupported(status.supported);
      setIsEnabled(status.enabled);
      
      if (!status.supported) {
        setStatusMessage('Bluetooth is not supported on this device.');
      } else if (!status.enabled) {
        setStatusMessage('Bluetooth is supported but not enabled.');
      } else {
        setStatusMessage('Bluetooth is supported and enabled.');
      }
    } catch (error) {
      console.error('Error checking Bluetooth status:', error);
      setStatusMessage('Error checking Bluetooth status.');
    }
  };

  const enableBluetooth = async () => {
    try {
      const result = await SimpleBluetoothScanner.enableBluetooth();
      setStatusMessage(result.message);
      // Check status again after attempting to enable
      setTimeout(checkBluetoothStatus, 1000);
    } catch (error) {
      console.error('Error enabling Bluetooth:', error);
      setStatusMessage('Error enabling Bluetooth.');
    }
  };

  const startScan = async () => {
    try {
      const result = await SimpleBluetoothScanner.startScan();
      setStatusMessage(result.message);
    } catch (error) {
      console.error('Error starting scan:', error);
      setStatusMessage('Error starting scan.');
    }
  };

  const stopScan = async () => {
    try {
      const result = await SimpleBluetoothScanner.stopScan();
      setIsScanning(false);
      setStatusMessage(result.message);
    } catch (error) {
      console.error('Error stopping scan:', error);
      setStatusMessage('Error stopping scan.');
    }
  };

  const getPairedDevices = async () => {
    try {
      const result: DiscoveryResult = await SimpleBluetoothScanner.getPairedDevices();
      setDevices(result.devices);
      setStatusMessage(`Found ${result.count} paired devices.`);
    } catch (error) {
      console.error('Error getting paired devices:', error);
      setStatusMessage('Error getting paired devices.');
    }
  };

  const pairDevice = async (address: string) => {
    try {
      const result = await SimpleBluetoothScanner.pairDevice({ address });
      setStatusMessage(result.message);
    } catch (error) {
      console.error('Error pairing device:', error);
      setStatusMessage('Error pairing device.');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Simple Bluetooth Scanner</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSupported && (
          <Alert variant="destructive">
            <AlertDescription>
              Bluetooth is not supported on this device.
            </AlertDescription>
          </Alert>
        )}

        {statusMessage && (
          <Alert>
            <AlertDescription>
              {statusMessage}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={checkBluetoothStatus}
            disabled={!isSupported}
          >
            Check Status
          </Button>
          
          {!isEnabled && isSupported && (
            <Button 
              onClick={enableBluetooth}
            >
              Enable Bluetooth
            </Button>
          )}
          
          {isEnabled && (
            <>
              <Button 
                onClick={startScan}
                disabled={isScanning}
              >
                {isScanning ? 'Scanning...' : 'Start Scan'}
              </Button>
              
              <Button 
                onClick={stopScan}
                disabled={!isScanning}
                variant="secondary"
              >
                Stop Scan
              </Button>
              
              <Button 
                onClick={getPairedDevices}
                variant="outline"
              >
                Get Paired Devices
              </Button>
            </>
          )}
        </div>

        {devices.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Discovered Devices:</h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {devices.map((device, index) => (
                <div 
                  key={`${device.address}-${index}`} 
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>
                    <div className="font-medium">{device.name}</div>
                    <div className="text-sm text-gray-500">{device.address}</div>
                    {device.rssi && <div className="text-xs">RSSI: {device.rssi}</div>}
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => pairDevice(device.address)}
                    disabled={device.bonded}
                  >
                    {device.bonded ? 'Paired' : 'Pair'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimpleBluetoothScannerComponent;