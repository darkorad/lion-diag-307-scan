import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Download, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Car,
  Wrench,
  FileText
} from 'lucide-react';
import { FullSystemScanReport, systemScanService } from '@/services/SystemScanService';
import { toast } from 'sonner';

interface SystemScanReportProps {
  onBack?: () => void;
  initialReport?: FullSystemScanReport | null;
}

const SystemScanReport: React.FC<SystemScanReportProps> = ({ onBack, initialReport }) => {
  const [report, setReport] = useState<FullSystemScanReport | null>(initialReport || null);
  const [isScanning, setIsScanning] = useState(false);

  const performScan = async () => {
    setIsScanning(true);
    try {
      const scanReport = await systemScanService.performFullSystemScan();
      setReport(scanReport);
      toast.success('System scan completed successfully');
    } catch (error) {
      toast.error('Failed to perform system scan');
      console.error('Scan error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const exportReport = (format: 'json' | 'text') => {
    if (!report) return;
    
    try {
      let content: string;
      let filename: string;
      let mimeType: string;
      
      if (format === 'json') {
        content = systemScanService.exportReportToJSON(report);
        filename = `system-scan-report-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else {
        content = systemScanService.exportReportToText(report);
        filename = `system-scan-report-${new Date().toISOString().split('T')[0]}.txt`;
        mimeType = 'text/plain';
      }
      
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Report exported as ${filename}`);
    } catch (error) {
      toast.error('Failed to export report');
      console.error('Export error:', error);
    }
  };

  const getModuleStatusIcon = (status: string) => {
    switch (status) {
      case 'found':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'not_found':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getModuleStatusBadge = (status: string) => {
    switch (status) {
      case 'found':
        return <Badge variant="default">Found</Badge>;
      case 'not_found':
        return <Badge variant="secondary">Not Found</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Car className="h-6 w-6" />
          <h2 className="text-2xl font-bold">System Scan Report</h2>
        </div>
        <div className="flex space-x-2">
          <Button onClick={performScan} disabled={isScanning}>
            {isScanning ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Rescan
              </>
            )}
          </Button>
          {report && (
            <>
              <Button variant="outline" onClick={() => exportReport('json')}>
                <Download className="mr-2 h-4 w-4" />
                JSON
              </Button>
              <Button variant="outline" onClick={() => exportReport('text')}>
                <FileText className="mr-2 h-4 w-4" />
                Text
              </Button>
            </>
          )}
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              Back
            </Button>
          )}
        </div>
      </div>

      {!report ? (
        // Initial state - no scan performed yet
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Scan Data</h3>
            <p className="text-muted-foreground mb-4 text-center">
              Perform a full system scan to check all vehicle modules and diagnose issues.
            </p>
            <Button onClick={performScan} disabled={isScanning}>
              {isScanning ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Scanning System...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Start Full System Scan
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        // Display scan report
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Scan Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold">{report.summary.totalModules}</div>
                  <div className="text-sm text-muted-foreground">Total Modules</div>
                </div>
                <div className="text-center p-4 bg-green-500/10 rounded-lg">
                  <div className="text-2xl font-bold">{report.summary.foundModules}</div>
                  <div className="text-sm text-muted-foreground">Modules Found</div>
                </div>
                <div className="text-center p-4 bg-red-500/10 rounded-lg">
                  <div className="text-2xl font-bold">{report.summary.errorModules}</div>
                  <div className="text-sm text-muted-foreground">Error Modules</div>
                </div>
                <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
                  <div className="text-2xl font-bold">{report.summary.totalDTCs}</div>
                  <div className="text-sm text-muted-foreground">Total DTCs</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modules List */}
          <Card>
            <CardHeader>
              <CardTitle>Module Details</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {report.modules.map((module) => (
                    <div key={module.moduleId} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getModuleStatusIcon(module.status)}
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{module.moduleName}</h3>
                              {getModuleStatusBadge(module.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Address: {module.moduleAddress}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              DTCs: {module.dtcCount}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {module.supportedFunctions.length} Functions
                          </div>
                        </div>
                      </div>
                      
                      {module.dtcCount > 0 && (
                        <div className="mt-3">
                          <div className="text-sm font-medium mb-1">Diagnostic Codes:</div>
                          <div className="flex flex-wrap gap-2">
                            {module.dtcs.map((dtc, index) => (
                              <Badge key={index} variant="destructive">
                                {dtc}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {module.errorMessage && (
                        <div className="mt-3">
                          <div className="text-sm font-medium text-red-500 mb-1">Error:</div>
                          <div className="text-sm text-red-500">{module.errorMessage}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SystemScanReport;