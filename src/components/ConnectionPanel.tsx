import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from 'sonner';
import { RefreshCw, Bluetooth, BluetoothSearching, BluetoothConnected, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { nativeBluetoothService } from '@/services/NativeBluetoothService';
import { BluetoothServiceDevice, ServiceConnectionResult } from '@/services/NativeBluetoothService';

interface ConnectionPanelProps {
  onDeviceSelected: (device: BluetoothServiceDevice | null) => void;
  onConnectionStatusChange?: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void;
}

export const ConnectionPanel: React.FC<ConnectionPanelProps> = ({ 
  onDeviceSelected, 
  onConnectionStatusChange 
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<BluetoothServiceDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<BluetoothServiceDevice | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [showDeviceDetails, setShowDeviceDetails] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startScan = useCallback(async () => {
    setIsScanning(true);
    setDevices([]);
    setErrorMessage(null);

    try {
      const scannedDevices = await nativeBluetoothService.scanForDevices();
      setDevices(scannedDevices);
      toast.success(`Found ${scannedDevices.length} devices`);
    } catch (error) {
      console.error('Scan failed:', error);
      setErrorMessage((error as Error).message || 'Scan failed');
      toast.error(`Scan failed: ${(error as Error).message || 'Unknown error'}`);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const connectToDevice = useCallback(async (device: BluetoothServiceDevice) => {
    setIsConnecting(true);
    setConnectionStatus('connecting');
    setErrorMessage(null);
    onConnectionStatusChange?.('connecting');

    try {
      const result: ServiceConnectionResult = await nativeBluetoothService.connectToDevice(device);

      if (result.success && result.device) {
        setSelectedDevice(result.device);
        setConnectionStatus('connected');
        onConnectionStatusChange?.('connected');
        toast.success(`Connected to ${device.name}`);
      } else {
        setConnectionStatus('error');
        onConnectionStatusChange?.('error');
        setErrorMessage(result.error || 'Connection failed');
        toast.error(`Connection failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Connection failed:', error);
      setConnectionStatus('error');
      onConnectionStatusChange?.('error');
      setErrorMessage((error as Error).message || 'Connection failed');
      toast.error(`Connection failed: ${(error as Error).message || 'Unknown error'}`);
    } finally {
      setIsConnecting(false);
    }
  }, [onConnectionStatusChange]);

  const disconnectDevice = useCallback(async () => {
    setIsConnecting(true);
    setErrorMessage(null);

    try {
      const result = await nativeBluetoothService.disconnect();
      if (result) {
        setSelectedDevice(null);
        setConnectionStatus('disconnected');
        onConnectionStatusChange?.('disconnected');
        toast.success('Disconnected');
      } else {
        setErrorMessage('Disconnection failed');
        toast.error('Disconnection failed');
      }
    } catch (error) {
      console.error('Disconnection failed:', error);
      setErrorMessage((error as Error).message || 'Disconnection failed');
      toast.error(`Disconnection failed: ${(error as Error).message || 'Unknown error'}`);
    } finally {
      setIsConnecting(false);
    }
  }, [onConnectionStatusChange]);

  const handleDeviceSelect = (device: BluetoothServiceDevice) => {
    setSelectedDevice(device);
    setShowDeviceDetails(true);
  };

  const handleConnect = async () => {
    if (selectedDevice) {
      await connectToDevice(selectedDevice);
      onDeviceSelected(selectedDevice);
    }
  };

  const handleTroubleshooting = () => {
    setShowTroubleshooting(true);
  };

  const handlePairDevice = async (device: BluetoothServiceDevice) => {
    try {
      const success = await nativeBluetoothService.pairDevice(device);
      if (success) {
        // Update the device list to reflect the pairing
        setDevices(prevDevices =>
          prevDevices.map(d =>
            d.address === device.address ? { ...d, isPaired: true } : d
          )
        );
        toast.success(`Successfully paired with ${device.name}`);
      } else {
        toast.error(`Failed to pair with ${device.name}`);
      }
    } catch (error) {
      console.error('Pairing failed:', error);
      toast.error(`Pairing failed: ${(error as Error).message || 'Unknown error'}`);
    }
  };

  useEffect(() => {
    // Load initial data or perform initial setup here
    const init = async () => {
      try {
        await nativeBluetoothService.initialize();
      } catch (error) {
        console.error("Bluetooth init error", error);
      }
    }
    init();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Connection Panel</CardTitle>
        <CardDescription>Connect to your OBD2 device via Bluetooth</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Connection Status Display */}
        <div className="flex items-center space-x-2">
          {connectionStatus === 'connected' && (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Connected to: {selectedDevice?.name}</span>
              <Button variant="outline" size="sm" onClick={disconnectDevice} disabled={isConnecting}>
                Disconnect
              </Button>
            </>
          )}
          {connectionStatus === 'connecting' && (
            <>
              <BluetoothSearching className="h-4 w-4 animate-spin text-blue-500" />
              <span>Connecting...</span>
            </>
          )}
          {connectionStatus === 'disconnected' && (
            <>
              <Bluetooth className="h-4 w-4 text-gray-500" />
              <span>Disconnected</span>
            </>
          )}
          {connectionStatus === 'error' && (
            <>
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span>Error: {errorMessage || 'Connection failed'}</span>
            </>
          )}
        </div>

        {/* Scan and Device List */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="devices">Available Devices</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={startScan}
              disabled={isScanning || isConnecting}
            >
              {isScanning ? (
                <>
                  <BluetoothSearching className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Scan
                </>
              )}
            </Button>
          </div>

          <ScrollArea className="rounded-md border h-48 w-full p-2">
            {devices.length > 0 ? (
              <div className="space-y-1">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-secondary cursor-pointer"
                    onClick={() => handleDeviceSelect(device)}
                  >
                    <div>
                      <div className="font-medium">{device.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {device.address} - {device.deviceType} ({device.compatibility}%)
                      </div>
                    </div>
                    <div>
                      {!device.isPaired && (
                        <Button variant="ghost" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          handlePairDevice(device);
                        }}>
                          Pair
                        </Button>
                      )}
                      {device.isConnected ? (
                        <BluetoothConnected className="h-4 w-4 text-green-500" />
                      ) : (
                        <Bluetooth className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                {isScanning ? 'Scanning for devices...' : 'No devices found. Please scan.'}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Connect Button */}
        <Button onClick={handleConnect} disabled={!selectedDevice || isConnecting || connectionStatus === 'connected'} className="w-full">
          {isConnecting ? 'Connecting...' : 'Connect'}
        </Button>

        {/* Troubleshooting Section */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="link" className="text-sm">Having trouble connecting?</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Troubleshooting</AlertDialogTitle>
              <AlertDialogDescription>
                Here are some common issues and solutions:
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2">
              <p>
                1. Make sure your OBD2 device is powered on and within Bluetooth range.
              </p>
              <p>
                2. Ensure Bluetooth is enabled on your device.
              </p>
              <p>
                3. If the device requires pairing, pair it in your device's Bluetooth settings first.
              </p>
              <p>
                4. Some devices may require a specific PIN code for pairing (e.g., 1234 or 0000).
              </p>
              <p>
                5. Try restarting your device's Bluetooth.
              </p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Device Details Dialog */}
        <Dialog open={showDeviceDetails} onOpenChange={setShowDeviceDetails}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Device Details</DialogTitle>
              <DialogDescription>
                Details for {selectedDevice?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <Input type="text" id="address" value={selectedDevice?.address || ''} readOnly className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="deviceType" className="text-right">
                  Device Type
                </Label>
                <Input type="text" id="deviceType" value={selectedDevice?.deviceType || ''} readOnly className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="compatibility" className="text-right">
                  Compatibility
                </Label>
                <Input type="text" id="compatibility" value={`${selectedDevice?.compatibility || 0}%`} readOnly className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isPaired" className="text-right">
                  Is Paired
                </Label>
                <Input type="text" id="isPaired" value={selectedDevice?.isPaired ? 'Yes' : 'No'} readOnly className="col-span-3" />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};