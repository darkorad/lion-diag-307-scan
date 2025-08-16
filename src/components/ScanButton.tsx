

import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';

interface ScanButtonProps {
  isScanning: boolean;
  isConnected: boolean;
  onScan: () => void;
}

const ScanButton: React.FC<ScanButtonProps> = ({
  isScanning,
  isConnected,
  onScan
}) => {
  if (isConnected) return null;

  return (
    <Button 
      onClick={onScan} 
      disabled={isScanning}
      className="w-full flex items-center space-x-2"
    >
      {isScanning ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Search className="h-4 w-4" />
      )}
      <span>{isScanning ? 'Scanning...' : 'Scan for OBD2 Devices'}</span>
    </Button>
  );
};

export default ScanButton;

