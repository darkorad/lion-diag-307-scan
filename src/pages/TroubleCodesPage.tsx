import React, { useState, useEffect } from 'react';
import TroubleCodesPanel from '@/components/TroubleCodesPanel';
import { useNavigate } from 'react-router-dom';
import { enhancedNativeBluetoothService } from '@/services/EnhancedNativeBluetoothService';

const TroubleCodesPage: React.FC = () => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check connection status
    const checkConnection = async () => {
      const connected = await enhancedNativeBluetoothService.isConnected();
      setIsConnected(connected);
    };

    // Check initial connection status
    checkConnection();

    // Set up interval to check connection status
    const interval = setInterval(checkConnection, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <TroubleCodesPanel 
          isConnected={isConnected} 
          onBack={() => navigate('/')} 
        />
      </div>
    </div>
  );
};

export default TroubleCodesPage;