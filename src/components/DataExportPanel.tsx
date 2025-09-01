
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  FileText, 
  Database, 
  Mail, 
  Calendar, 
  Clock, 
  FileBarChart,
  FileSpreadsheet,
  Share2,
  Printer
} from 'lucide-react';
import { dataLoggingService, DiagnosticSession } from '@/services/DataLoggingService';
import { toast } from 'sonner';

interface DataExportPanelProps {
  isConnected: boolean;
}

const DataExportPanel: React.FC<DataExportPanelProps> = ({ isConnected }) => {
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [isExporting, setIsExporting] = useState(false);

  const sessions = dataLoggingService.getAllSessions();
  const currentSession = dataLoggingService.getCurrentSession();

  const handleExport = async () => {
    if (!selectedSession) {
      toast.error('Please select a session to export');
      return;
    }

    setIsExporting(true);
    
    try {
      let exportData: string;
      let filename: string;
      let mimeType: string;

      switch (exportFormat) {
        case 'csv':
          exportData = dataLoggingService.exportSessionToCSV(selectedSession);
          filename = `diagnostic_session_${selectedSession}.csv`;
          mimeType = 'text/csv';
          break;
        case 'json':
          exportData = dataLoggingService.exportSessionToJSON(selectedSession);
          filename = `diagnostic_session_${selectedSession}.json`;
          mimeType = 'application/json';
          break;
        case 'pdf':
          exportData = generatePDFReport(selectedSession);
          filename = `diagnostic_report_${selectedSession}.pdf`;
          mimeType = 'application/pdf';
          break;
        default:
          throw new Error('Invalid export format');
      }

      // Create download link
      const blob = new Blob([exportData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Data exported successfully as ${exportFormat.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const generatePDFReport = (sessionId: string): string => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return '';

    // Simplified PDF content (in practice, use a proper PDF library)
    return `
VEHICLE DIAGNOSTIC REPORT
========================

Session ID: ${session.id}
Vehicle ID: ${session.vehicleId}
Start Time: ${session.startTime.toLocaleString()}
End Time: ${session.endTime?.toLocaleString() || 'In Progress'}

SUMMARY STATISTICS
-----------------
Total Distance: ${session.totalDistance} km
Average Speed: ${session.averageSpeed} km/h
Maximum RPM: ${session.maxRPM}
Maximum Speed: ${session.maxSpeed} km/h
Data Points: ${session.entries.length}

DIAGNOSTIC DATA
--------------
${session.entries.slice(0, 10).map(entry => `
Time: ${entry.timestamp.toLocaleTimeString()}
RPM: ${entry.data.engineRPM || 'N/A'}
Speed: ${entry.data.vehicleSpeed || 'N/A'} km/h
Engine Temp: ${entry.data.engineTemp || 'N/A'}°C
`).join('\n')}

${session.entries.length > 10 ? `... and ${session.entries.length - 10} more entries` : ''}

Report generated on ${new Date().toLocaleString()}
    `;
  };

  const shareViaEmail = () => {
    if (!selectedSession) {
      toast.error('Please select a session first');
      return;
    }

    const session = sessions.find(s => s.id === selectedSession);
    if (!session) return;

    const subject = `Vehicle Diagnostic Report - ${session.id}`;
    const body = `
Vehicle Diagnostic Report

Session Details:
- Session ID: ${session.id}
- Start Time: ${session.startTime.toLocaleString()}
- Duration: ${session.endTime ? Math.round((session.endTime.getTime() - session.startTime.getTime()) / 60000) : 'Ongoing'} minutes
- Data Points: ${session.entries.length}

Please find the detailed diagnostic data attached.
    `;

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const formatDuration = (start: Date, end?: Date): string => {
    if (!end) return 'In Progress';
    const duration = Math.round((end.getTime() - start.getTime()) / 60000);
    return `${duration} minutes`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5 text-primary" />
            <span>Data Export & Reporting</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Session</label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a diagnostic session" />
                </SelectTrigger>
                <SelectContent>
                  {currentSession && (
                    <SelectItem value={currentSession.id}>
                      Current Session (Live)
                    </SelectItem>
                  )}
                  {sessions.filter(s => s.id !== currentSession?.id).map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.startTime.toLocaleDateString()} - {formatDuration(session.startTime, session.endTime)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Excel Compatible)</SelectItem>
                  <SelectItem value="json">JSON (Raw Data)</SelectItem>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={handleExport}
              disabled={!selectedSession || isExporting}
              className="flex-1"
            >
              {isExporting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </>
              )}
            </Button>

            <Button
              onClick={shareViaEmail}
              disabled={!selectedSession}
              variant="outline"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>

            <Button
              onClick={() => window.print()}
              variant="outline"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Session List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-blue-500" />
            <span>Available Sessions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                No diagnostic sessions found. Start logging data to create exportable sessions.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {currentSession && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Current Session</p>
                        <p className="text-sm text-muted-foreground">
                          Started: {currentSession.startTime.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Data Points: {currentSession.entries.length}
                        </p>
                      </div>
                      <Badge variant="default">
                        <Clock className="h-3 w-3 mr-1" />
                        Live
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {sessions.filter(s => s.id !== currentSession?.id).map((session) => (
                <Card key={session.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Session {session.id.split('_')[1]}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <span>Start: {session.startTime.toLocaleDateString()}</span>
                          <span>Duration: {formatDuration(session.startTime, session.endTime)}</span>
                          <span>Data Points: {session.entries.length}</span>
                          <span>Max Speed: {session.maxSpeed} km/h</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">
                          {session.entries.length} records
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedSession(session.id)}
                        >
                          Select
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Export Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{sessions.length}</div>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {sessions.reduce((acc, s) => acc + s.entries.length, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Data Points</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.round(sessions.reduce((acc, s) => acc + s.totalDistance, 0))}
              </div>
              <p className="text-sm text-muted-foreground">Total Distance (km)</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {currentSession ? 'Recording' : 'Stopped'}
              </div>
              <p className="text-sm text-muted-foreground">Current Status</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataExportPanel;
