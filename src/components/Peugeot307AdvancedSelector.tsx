import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Car,
  Shield,
  Settings,
  Wrench,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import Peugeot307AdvancedPanel from './Peugeot307AdvancedPanel';

interface Peugeot307AdvancedSelectorProps {
  isConnected: boolean;
  onBack?: () => void;
  selectedEngine?: {
    id: string;
    name: string;
    specificParameters?: {
      hasAdvancedFunctions?: boolean;
      supportsComfortFunctions?: boolean;
      supportsBSIAccess?: boolean;
    };
  };
}

const Peugeot307AdvancedSelector: React.FC<Peugeot307AdvancedSelectorProps> = ({ 
  isConnected, 
  onBack,
  selectedEngine 
}) => {
  const [showAdvancedPanel, setShowAdvancedPanel] = React.useState(false);

  // Check if the selected engine supports advanced functions
  const supportsAdvanced = selectedEngine?.specificParameters?.hasAdvancedFunctions || 
                           selectedEngine?.id.includes('307');

  if (showAdvancedPanel) {
    return (
      <Peugeot307AdvancedPanel 
        isConnected={isConnected}
        onBack={() => setShowAdvancedPanel(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      {onBack && (
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Vehicle Selection
          </Button>
          <div className="h-6 w-px bg-border" />
          <h1 className="text-2xl font-bold">Peugeot 307 Advanced Functions</h1>
        </div>
      )}

      {/* Advanced Functions Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Peugeot 307 Advanced Control Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Comfort Functions */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-blue-500" />
                <h3 className="font-semibold">Comfort Functions</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Auto wipers configuration</li>
                <li>• Auto lights control</li>
                <li>• Welcome lighting setup</li>
                <li>• Follow me home lights</li>
                <li>• DRL settings</li>
              </ul>
            </Card>

            {/* Security Functions */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-red-500" />
                <h3 className="font-semibold">Security Functions</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Immobilizer control</li>
                <li>• Central locking settings</li>
                <li>• Deadlocking configuration</li>
                <li>• Anti-theft alarm setup</li>
                <li>• PIN code management</li>
              </ul>
            </Card>

            {/* Diagnostics */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="h-4 w-4 text-green-500" />
                <h3 className="font-semibold">Advanced Diagnostics</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Complete PID monitoring</li>
                <li>• BSI system access</li>
                <li>• DPF regeneration control</li>
                <li>• EGR valve testing</li>
                <li>• Radio configuration</li>
              </ul>
            </Card>

            {/* Status */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {isConnected ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                )}
                <h3 className="font-semibold">Connection Status</h3>
              </div>
              <div className="space-y-2">
                <Badge variant={isConnected ? "default" : "secondary"}>
                  {isConnected ? "Connected" : "Disconnected"}
                </Badge>
                {supportsAdvanced && (
                  <Badge className="bg-blue-100 text-blue-800">
                    Advanced Functions Supported
                  </Badge>
                )}
              </div>
            </Card>
          </div>

          {/* Launch Button */}
          <div className="flex justify-center pt-4">
            <Button 
              onClick={() => setShowAdvancedPanel(true)}
              disabled={!isConnected}
              className="flex items-center gap-2"
              size="lg"
            >
              <Car className="h-4 w-4" />
              Launch Advanced Control Panel
            </Button>
          </div>

          {!isConnected && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Connection Required</span>
              </div>
              <p className="text-sm text-orange-700 mt-1">
                Please connect to your OBD2 device to access Peugeot 307 advanced functions.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Peugeot307AdvancedSelector;