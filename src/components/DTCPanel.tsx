
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  AlertTriangle, 
  Clock, 
  Archive, 
  Trash2, 
  RefreshCw, 
  FileSearch,
  Wrench,
  Cog,
  Shield,
  Car,
  ArrowLeft
} from 'lucide-react';
import { diagnosticService, DTCInfo } from '@/services/DiagnosticService';
import { toast } from 'sonner';

interface DTCPanelProps {
  isConnected: boolean;
  onBack?: () => void;
}

const DTCPanel: React.FC<DTCPanelProps> = ({ isConnected, onBack }) => {
  const [storedDTCs, setStoredDTCs] = useState<DTCInfo[]>([]);
  const [pendingDTCs, setPendingDTCs] = useState<DTCInfo[]>([]);
  const [permanentDTCs, setPermanentDTCs] = useState<DTCInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isClearingCodes, setIsClearingCodes] = useState(false);

  useEffect(() => {
    if (isConnected) {
      fetchAllDTCs();
    }
  }, [isConnected]);

  const fetchAllDTCs = async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    try {
      const [stored, pending, permanent] = await Promise.all([
        diagnosticService.getStoredDTCs(),
        diagnosticService.getPendingDTCs(),
        diagnosticService.getPermanentDTCs()
      ]);
      
      setStoredDTCs(stored);
      setPendingDTCs(pending);
      setPermanentDTCs(permanent);
      
      toast.success(`Found ${stored.length + pending.length + permanent.length} diagnostic codes`);
    } catch (error) {
      console.error('Failed to fetch DTCs:', error);
      toast.error('Failed to read diagnostic codes');
    } finally {
      setIsLoading(false);
    }
  };

  const clearDTCs = async () => {
    setIsClearingCodes(true);
    try {
      const success = await diagnosticService.clearDTCs();
      if (success) {
        toast.success('Diagnostic codes cleared successfully');
        await fetchAllDTCs(); // Refresh after clearing
      } else {
        toast.error('Failed to clear diagnostic codes');
      }
    } catch (error) {
      console.error('Failed to clear DTCs:', error);
      toast.error('Failed to clear diagnostic codes');
    } finally {
      setIsClearingCodes(false);
    }
  };

  const getCategoryIcon = (category: DTCInfo['category']) => {
    switch (category) {
      case 'engine':
        return <Wrench className="h-4 w-4" />;
      case 'transmission':
        return <Cog className="h-4 w-4" />;
      case 'abs':
        return <Shield className="h-4 w-4" />;
      case 'body':
        return <Car className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: DTCInfo['category']) => {
    switch (category) {
      case 'engine':
        return 'text-red-500';
      case 'transmission':
        return 'text-blue-500';
      case 'abs':
        return 'text-yellow-500';
      case 'body':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBadgeVariant = (status: DTCInfo['status']) => {
    switch (status) {
      case 'active':
        return 'destructive' as const;
      case 'pending':
        return 'secondary' as const;
      case 'permanent':
        return 'outline' as const;
      case 'stored':
        return 'default' as const;
      default:
        return 'secondary' as const;
    }
  };

  const renderDTCList = (dtcs: DTCInfo[], title: string) => (
    <div className="space-y-3">
      {dtcs.length === 0 ? (
        <Card className="diagnostic-border">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <FileSearch className="h-8 w-8 mx-auto mb-2" />
              <p>No {title.toLowerCase()} diagnostic codes found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        dtcs.map((dtc, index) => (
          <Card key={`${dtc.code}-${index}`} className="diagnostic-border">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={getCategoryColor(dtc.category)}>
                    {getCategoryIcon(dtc.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-mono font-bold text-lg">{dtc.code}</p>
                      <Badge variant={getStatusBadgeVariant(dtc.status)}>
                        {dtc.status.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {dtc.category.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {dtc.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      <p>Category: {dtc.category} | Status: {dtc.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const totalDTCs = storedDTCs.length + pendingDTCs.length + permanentDTCs.length;

  return (
    <div className="space-y-6">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      )}
      
      <Card className="diagnostic-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <span>Diagnostic Trouble Codes (DTCs)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={fetchAllDTCs}
                disabled={!isConnected || isLoading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Reading...' : 'Read DTCs'}
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={!isConnected || totalDTCs === 0 || isClearingCodes}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear DTCs
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Diagnostic Codes?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will clear all stored diagnostic trouble codes from the vehicle's ECU. 
                      Active problems may cause codes to return. Are you sure you want to continue?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={clearDTCs}>
                      {isClearingCodes ? 'Clearing...' : 'Clear DTCs'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {!isConnected && (
        <Card className="diagnostic-border">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>Connect to an OBD2 device to read diagnostic trouble codes</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* DTC Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="diagnostic-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{storedDTCs.length}</p>
              <p className="text-sm text-muted-foreground">Stored DTCs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="diagnostic-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-500">{pendingDTCs.length}</p>
              <p className="text-sm text-muted-foreground">Pending DTCs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="diagnostic-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">{permanentDTCs.length}</p>
              <p className="text-sm text-muted-foreground">Permanent DTCs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="diagnostic-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{totalDTCs}</p>
              <p className="text-sm text-muted-foreground">Total DTCs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stored" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stored" className="flex items-center space-x-2">
            <Archive className="h-4 w-4" />
            <span>Stored ({storedDTCs.length})</span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Pending ({pendingDTCs.length})</span>
          </TabsTrigger>
          <TabsTrigger value="permanent" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Permanent ({permanentDTCs.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stored" className="space-y-4">
          {renderDTCList(storedDTCs, 'Stored')}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {renderDTCList(pendingDTCs, 'Pending')}
        </TabsContent>

        <TabsContent value="permanent" className="space-y-4">
          {renderDTCList(permanentDTCs, 'Permanent')}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DTCPanel;
