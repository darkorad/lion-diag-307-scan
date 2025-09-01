
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  MapPin, 
  Activity,
  Database,
  Navigation
} from 'lucide-react';
import { dataLoggingService } from '@/services/DataLoggingService';
import { toast } from 'sonner';

interface SessionManagerProps {
  isConnected: boolean;
  onSessionChange?: (sessionId: string | null) => void;
}

const SessionManager: React.FC<SessionManagerProps> = ({ isConnected, onSessionChange }) => {
  const [isLogging, setIsLogging] = useState(false);
  const [currentSession, setCurrentSession] = useState(dataLoggingService.getCurrentSession());
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [dataPoints, setDataPoints] = useState(0);

  useEffect(() => {
    // Get GPS location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!isLogging || !currentSession) return;

    // Simulate data logging
    const interval = setInterval(() => {
      const mockData = {
        engineRPM: Math.floor(Math.random() * 1000) + 1500,
        vehicleSpeed: Math.floor(Math.random() * 60) + 20,
        engineTemp: Math.floor(Math.random() * 15) + 85,
        throttlePosition: Math.floor(Math.random() * 60) + 20,
        fuelLevel: Math.floor(Math.random() * 20) + 60,
        mafRate: Math.floor(Math.random() * 30) + 10
      };

      dataLoggingService.logData(mockData, location || undefined);
      setDataPoints(currentSession.entries.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLogging, currentSession, location]);

  const startSession = () => {
    if (!isConnected) {
      toast.error('Please connect to OBD2 device first');
      return;
    }

    const session = dataLoggingService.startSession('peugeot_307');
    setCurrentSession(session);
    setIsLogging(true);
    setDataPoints(0);
    
    if (onSessionChange) {
      onSessionChange(session.id);
    }
    
    toast.success('Data logging session started');
  };

  const stopSession = () => {
    const stoppedSession = dataLoggingService.stopSession();
    setIsLogging(false);
    
    if (stoppedSession) {
      toast.success(`Session completed with ${stoppedSession.entries.length} data points`);
      if (onSessionChange) {
        onSessionChange(null);
      }
    }
  };

  const formatDuration = (): string => {
    if (!currentSession) return '0:00';
    
    const now = new Date();
    const start = currentSession.startTime;
    const duration = Math.floor((now.getTime() - start.getTime()) / 1000);
    
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-primary" />
          <span>Data Logging Session</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!currentSession && (
          <Alert>
            <Activity className="h-4 w-4" />
            <AlertDescription>
              Start a new session to begin logging diagnostic data. Make sure your vehicle is running for best results.
            </AlertDescription>
          </Alert>
        )}

        {currentSession && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {formatDuration()}
                </div>
                <p className="text-sm text-muted-foreground">Duration</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {dataPoints}
                </div>
                <p className="text-sm text-muted-foreground">Data Points</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {currentSession.maxSpeed}
                </div>
                <p className="text-sm text-muted-foreground">Max Speed (km/h)</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">
                  {currentSession.maxRPM}
                </div>
                <p className="text-sm text-muted-foreground">Max RPM</p>
              </div>
            </div>

            {location && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center space-x-2">
          {!currentSession ? (
            <Button
              onClick={startSession}
              disabled={!isConnected}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Start New Session
            </Button>
          ) : (
            <>
              <Button
                onClick={stopSession}
                variant="destructive"
                className="flex-1"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Session
              </Button>
            </>
          )}

          <Badge variant={isLogging ? "default" : "secondary"}>
            {isLogging ? (
              <>
                <Activity className="h-3 w-3 mr-1 animate-pulse" />
                Recording
              </>
            ) : (
              <>
                <Pause className="h-3 w-3 mr-1" />
                Stopped
              </>
            )}
          </Badge>
        </div>

        {!isConnected && (
          <Alert>
            <AlertDescription>
              Connect to your ELM327 device to start logging diagnostic data.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default SessionManager;
