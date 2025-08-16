
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Download, 
  Mail, 
  Printer, 
  Car, 
  User, 
  Calendar,
  Settings,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { dataLoggingService } from '@/services/DataLoggingService';
import { vehicleHealthService } from '@/services/VehicleHealthService';
import { toast } from 'sonner';

interface ReportData {
  customerName: string;
  vehicleVIN: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  mileage: string;
  technicianName: string;
  workshopName: string;
  reportDate: string;
  sessionId: string;
  findings: string;
  recommendations: string;
}

const ProfessionalReportGenerator: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData>({
    customerName: '',
    vehicleVIN: 'VF32ARHZE36******',
    vehicleMake: 'Peugeot',
    vehicleModel: '307',
    vehicleYear: '2006',
    mileage: '125000',
    technicianName: '',
    workshopName: '',
    reportDate: new Date().toISOString().split('T')[0],
    sessionId: '',
    findings: '',
    recommendations: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const sessions = dataLoggingService.getAllSessions();

  const generateHTMLReport = (): string => {
    const session = sessions.find(s => s.id === reportData.sessionId);
    if (!session) return '';

    const mockHealthMetrics = [
      { name: 'Engine Temperature', value: 87, status: 'good', unit: '°C' },
      { name: 'Battery Voltage', value: 12.8, status: 'good', unit: 'V' },
      { name: 'Fuel Level', value: 65, status: 'good', unit: '%' }
    ];

    const mockAlerts = [
      { title: 'Oil Change Due', severity: 'medium', description: 'Last changed 8,500 km ago' }
    ];

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Professional Diagnostic Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .status-good { color: #16a34a; }
        .status-warning { color: #ca8a04; }
        .status-critical { color: #dc2626; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f5f5f5; }
        .signature-section { margin-top: 50px; }
        .signature-box { border: 1px solid #ccc; height: 80px; margin: 10px 0; }
        @media print { .no-print { display: none; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>PROFESSIONAL VEHICLE DIAGNOSTIC REPORT</h1>
        <p><strong>${reportData.workshopName || 'Authorized Service Center'}</strong></p>
        <p>Date: ${new Date(reportData.reportDate).toLocaleDateString()}</p>
    </div>

    <div class="section">
        <h2>CUSTOMER INFORMATION</h2>
        <div class="grid">
            <div>
                <p><strong>Customer Name:</strong> ${reportData.customerName}</p>
                <p><strong>Service Date:</strong> ${new Date(reportData.reportDate).toLocaleDateString()}</p>
            </div>
            <div>
                <p><strong>Technician:</strong> ${reportData.technicianName}</p>
                <p><strong>Report ID:</strong> ${reportData.sessionId}</p>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>VEHICLE INFORMATION</h2>
        <div class="grid">
            <div>
                <p><strong>Make:</strong> ${reportData.vehicleMake}</p>
                <p><strong>Model:</strong> ${reportData.vehicleModel}</p>
                <p><strong>Year:</strong> ${reportData.vehicleYear}</p>
            </div>
            <div>
                <p><strong>VIN:</strong> ${reportData.vehicleVIN}</p>
                <p><strong>Mileage:</strong> ${reportData.mileage} km</p>
                <p><strong>Engine:</strong> 1.6 HDi Diesel</p>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>DIAGNOSTIC SESSION SUMMARY</h2>
        <table>
            <tr>
                <th>Parameter</th>
                <th>Value</th>
            </tr>
            <tr>
                <td>Session Duration</td>
                <td>${session ? Math.round((session.endTime ? session.endTime.getTime() - session.startTime.getTime() : Date.now() - session.startTime.getTime()) / 60000) : 0} minutes</td>
            </tr>
            <tr>
                <td>Data Points Collected</td>
                <td>${session ? session.entries.length : 0}</td>
            </tr>
            <tr>
                <td>Maximum Speed Recorded</td>
                <td>${session ? session.maxSpeed : 0} km/h</td>
            </tr>
            <tr>
                <td>Maximum RPM Recorded</td>
                <td>${session ? session.maxRPM : 0}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <h2>SYSTEM HEALTH STATUS</h2>
        <table>
            <tr>
                <th>System</th>
                <th>Status</th>
                <th>Value</th>
                <th>Unit</th>
            </tr>
            ${mockHealthMetrics.map(metric => `
            <tr>
                <td>${metric.name}</td>
                <td class="status-${metric.status}">${metric.status.toUpperCase()}</td>
                <td>${metric.value}</td>
                <td>${metric.unit}</td>
            </tr>
            `).join('')}
        </table>
    </div>

    <div class="section">
        <h2>MAINTENANCE ALERTS</h2>
        ${mockAlerts.length > 0 ? `
        <table>
            <tr>
                <th>Alert</th>
                <th>Severity</th>
                <th>Description</th>
            </tr>
            ${mockAlerts.map(alert => `
            <tr>
                <td>${alert.title}</td>
                <td class="status-warning">${alert.severity.toUpperCase()}</td>
                <td>${alert.description}</td>
            </tr>
            `).join('')}
        </table>
        ` : '<p>No maintenance alerts at this time.</p>'}
    </div>

    <div class="section">
        <h2>TECHNICIAN FINDINGS</h2>
        <p>${reportData.findings || 'No specific findings noted during this diagnostic session.'}</p>
    </div>

    <div class="section">
        <h2>RECOMMENDATIONS</h2>
        <p>${reportData.recommendations || 'Continue regular maintenance schedule. Next service recommended in 6 months or 10,000 km.'}</p>
    </div>

    <div class="signature-section">
        <div class="grid">
            <div>
                <p><strong>Technician Signature:</strong></p>
                <div class="signature-box"></div>
                <p>${reportData.technicianName}</p>
            </div>
            <div>
                <p><strong>Customer Signature:</strong></p>
                <div class="signature-box"></div>
                <p>${reportData.customerName}</p>
            </div>
        </div>
    </div>

    <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
        <p>This report was generated using Peugeot 307 OBD2 Pro diagnostic software</p>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>
    `;
  };

  const generateReport = () => {
    if (!reportData.sessionId) {
      toast.error('Please select a diagnostic session');
      return;
    }

    setIsGenerating(true);
    
    try {
      const htmlContent = generateHTMLReport();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `diagnostic_report_${reportData.vehicleVIN}_${reportData.reportDate}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Professional report generated successfully');
    } catch (error) {
      console.error('Report generation failed:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const previewReport = () => {
    if (!reportData.sessionId) {
      toast.error('Please select a diagnostic session');
      return;
    }

    const htmlContent = generateHTMLReport();
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Professional Report Generator</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Report Details</TabsTrigger>
              <TabsTrigger value="session">Session Data</TabsTrigger>
              <TabsTrigger value="generate">Generate Report</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Customer Name</label>
                    <Input
                      value={reportData.customerName}
                      onChange={(e) => setReportData({...reportData, customerName: e.target.value})}
                      placeholder="Enter customer name"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Technician Name</label>
                    <Input
                      value={reportData.technicianName}
                      onChange={(e) => setReportData({...reportData, technicianName: e.target.value})}
                      placeholder="Enter technician name"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Workshop Name</label>
                    <Input
                      value={reportData.workshopName}
                      onChange={(e) => setReportData({...reportData, workshopName: e.target.value})}
                      placeholder="Enter workshop/garage name"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Current Mileage (km)</label>
                    <Input
                      value={reportData.mileage}
                      onChange={(e) => setReportData({...reportData, mileage: e.target.value})}
                      placeholder="Enter current mileage"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Vehicle VIN</label>
                    <Input
                      value={reportData.vehicleVIN}
                      onChange={(e) => setReportData({...reportData, vehicleVIN: e.target.value})}
                      placeholder="Enter VIN number"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Vehicle Make</label>
                    <Input
                      value={reportData.vehicleMake}
                      onChange={(e) => setReportData({...reportData, vehicleMake: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Vehicle Model</label>
                    <Input
                      value={reportData.vehicleModel}
                      onChange={(e) => setReportData({...reportData, vehicleModel: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Vehicle Year</label>
                    <Input
                      value={reportData.vehicleYear}
                      onChange={(e) => setReportData({...reportData, vehicleYear: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Technician Findings</label>
                  <Textarea
                    value={reportData.findings}
                    onChange={(e) => setReportData({...reportData, findings: e.target.value})}
                    placeholder="Describe any issues found, test results, or observations..."
                    rows={4}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Recommendations</label>
                  <Textarea
                    value={reportData.recommendations}
                    onChange={(e) => setReportData({...reportData, recommendations: e.target.value})}
                    placeholder="Provide maintenance recommendations, suggested repairs, or follow-up actions..."
                    rows={4}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="session" className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Diagnostic Session</label>
                <select
                  value={reportData.sessionId}
                  onChange={(e) => setReportData({...reportData, sessionId: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Choose a diagnostic session</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.startTime.toLocaleDateString()} - {session.entries.length} data points
                    </option>
                  ))}
                </select>
              </div>

              {reportData.sessionId && (
                <Card>
                  <CardHeader>
                    <CardTitle>Session Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const session = sessions.find(s => s.id === reportData.sessionId);
                      if (!session) return <p>Session not found</p>;
                      
                      return (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Start Time</p>
                            <p className="font-semibold">{session.startTime.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Data Points</p>
                            <p className="font-semibold">{session.entries.length}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Max Speed</p>
                            <p className="font-semibold">{session.maxSpeed} km/h</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Max RPM</p>
                            <p className="font-semibold">{session.maxRPM}</p>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="generate" className="space-y-4">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={generateReport}
                  disabled={!reportData.sessionId || isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <FileText className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </>
                  )}
                </Button>

                <Button
                  onClick={previewReport}
                  disabled={!reportData.sessionId}
                  variant="outline"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Preview
                </Button>

                <Button
                  onClick={() => window.print()}
                  variant="outline"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Report Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>Customer:</strong> {reportData.customerName || 'Not specified'}</p>
                    <p><strong>Vehicle:</strong> {reportData.vehicleYear} {reportData.vehicleMake} {reportData.vehicleModel}</p>
                    <p><strong>VIN:</strong> {reportData.vehicleVIN}</p>
                    <p><strong>Technician:</strong> {reportData.technicianName || 'Not specified'}</p>
                    <p><strong>Workshop:</strong> {reportData.workshopName || 'Not specified'}</p>
                    <p><strong>Session:</strong> {reportData.sessionId || 'Not selected'}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalReportGenerator;
