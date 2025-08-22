
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, WifiOff, Loader2, Signal, Bluetooth } from 'lucide-react';
import { bluetoothConnectionManager, ConnectionState } from '@/services/BluetoothConnectionManager';
import { toast } from 'sonner';

interface ConnectionStatusProps {
  onDisconnect?: () => Promise<void>;
  showDetails?: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  onDisconnect,
  showDetails = false
}) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    device: null,
    connectionTime: null,
    lastSeen: null,
    connectionQuality: null
  });

  useEffect(() => {
    // Subscribe to connection state changes
    const unsubscribe = bluetoothConnectionManager.subscribe(setConnectionState);
    
    return unsubscribe;
  }, []);

  const handleDisconnect = async () => {
    try {
      if (onDisconnect) {
        await onDisconnect();
      } else {
        await bluetoothConnectionManager.disconnect();
      }
      toast.info('Disconnected from device');
    } catch (error) {
      console.error('Disconnect failed:', error);
      toast.error('Disconnect failed');
    }
  };

  const getStatusText = () => {
    if (!connectionState.isConnected) {
      return 'Disconnected';
    }
    
    if (connectionState.device) {
      return `Connected to ${connectionState.device.name}`;
    }
    
    return 'Connected';
  };

  const getQualityColor = (quality: string | null) => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getConnectionDuration = () => {
    if (!connectionState.connectionTime) return null;
    
    const duration = Date.now() - connectionState.connectionTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="flex items-center gap-3">
      <Badge 
        variant={connectionState.isConnected ? "default" : "secondary"} 
        className="flex items-center gap-2"
      >
        <div className={`w-2 h-2 rounded-full ${
          connectionState.isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
        }`} />
        <Bluetooth className="h-3 w-3" />
        <span>{getStatusText()}</span>
        
        {connectionState.isConnected && connectionState.connectionQuality && (
          <Signal className={`h-3 w-3 ${getQualityColor(connectionState.connectionQuality)}`} />
        )}
      </Badge>
      
      {showDetails && connectionState.isConnected && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {getConnectionDuration() && (
            <span>Duration: {getConnectionDuration()}</span>
          )}
          {connectionState.connectionQuality && (
            <span className={getQualityColor(connectionState.connectionQuality)}>
              Signal: {connectionState.connectionQuality}
            </span>
          )}
        </div>
      )}
      
      {connectionState.isConnected && (
        <Button variant="outline" size="sm" onClick={handleDisconnect}>
          Disconnect
        </Button>
      )}
    </div>
  );
};

export default ConnectionStatus;
