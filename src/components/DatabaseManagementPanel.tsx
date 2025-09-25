import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Upload, 
  Download, 
  Trash2, 
  Search, 
  Car, 
  FileJson 
} from 'lucide-react';
import { 
  databaseService, 
  VehicleRecord, 
  PIDRecord, 
  ScanRecord 
} from '@/services/DatabaseService';
import { 
  vinDecodingService, 
  DecodedVIN 
} from '@/services/VINDecodingService';

const DatabaseManagementPanel: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [pids, setPids] = useState<PIDRecord[]>([]);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [vinInput, setVinInput] = useState('');
  const [decodedVIN, setDecodedVIN] = useState<DecodedVIN | null>(null);
  const [importData, setImportData] = useState('');
  const [exportData, setExportData] = useState('');
  const [activeTab, setActiveTab] = useState('vehicles');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vehiclesData, pidsData, scansData] = await Promise.all([
        databaseService.getAllVehicles(),
        databaseService.getAllPIDs(),
        databaseService.getRecentScans(10)
      ]);
      
      setVehicles(vehiclesData);
      setPids(pidsData);
      setScans(scansData);
    } catch (err) {
      setError('Failed to load database records');
    }
  };

  // Handle VIN decode
  const handleDecodeVIN = async () => {
    if (!vinInput.trim()) {
      setError('Please enter a VIN');
      return;
    }
    
    try {
      setError(null);
      setSuccess(null);
      setDecodedVIN(null);
      
      const decoded = await vinDecodingService.decodeVIN(vinInput);
      setDecodedVIN(decoded);
      
      if (decoded.confidence < 50) {
        setError('Low confidence in VIN decoding. Please verify the information.');
      } else {
        setSuccess('VIN decoded successfully');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to decode VIN';
      setError(errorMessage);
    }
  };

  // Handle database export
  const handleExport = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      const data = await databaseService.exportDatabase();
      setExportData(data);
      
      // Trigger download
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lion-diag-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSuccess('Database exported successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export database';
      setError(errorMessage);
    }
  };

  // Handle database import
  const handleImport = async () => {
    if (!importData.trim()) {
      setError('Please provide import data');
      return;
    }
    
    try {
      setError(null);
      setSuccess(null);
      
      await databaseService.importDatabase(importData);
      await loadData();
      
      setSuccess('Database imported successfully');
      setImportData('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import database';
      setError(errorMessage);
    }
  };

  // Handle clear database
  const handleClearDatabase = async () => {
    if (!window.confirm('Are you sure you want to clear all database records? This cannot be undone.')) {
      return;
    }
    
    try {
      setError(null);
      setSuccess(null);
      
      await databaseService.clearAllData();
      await loadData();
      
      setSuccess('Database cleared successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear database';
      setError(errorMessage);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Database Management</span>
            <Badge variant="outline">Admin</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Manage vehicle database, PIDs, and scan records. Import/export data or clear the database.
          </p>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-4">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* VIN Decoder */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="h-5 w-5 mr-2" />
                    VIN Decoder
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="vin-input">Enter VIN</Label>
                      <div className="flex space-x-2 mt-1">
                        <Input
                          id="vin-input"
                          value={vinInput}
                          onChange={(e) => setVinInput(e.target.value)}
                          placeholder="Enter 17-character VIN"
                        />
                        <Button onClick={handleDecodeVIN}>
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {decodedVIN && (
                      <div className="p-4 border rounded-lg bg-muted">
                        <h3 className="font-medium mb-2">Decoded Information</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Make:</span>
                            <span>{decodedVIN.make}</span>
                          </div>
                          {decodedVIN.model && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Model:</span>
                              <span>{decodedVIN.model}</span>
                            </div>
                          )}
                          {decodedVIN.year && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Year:</span>
                              <span>{decodedVIN.year}</span>
                            </div>
                          )}
                          {decodedVIN.engine && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Engine:</span>
                              <span>{decodedVIN.engine}</span>
                            </div>
                          )}
                          {decodedVIN.fuelType && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Fuel:</span>
                              <span>{decodedVIN.fuelType}</span>
                            </div>
                          )}
                          {decodedVIN.country && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Country:</span>
                              <span>{decodedVIN.country}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Confidence:</span>
                            <Badge variant={decodedVIN.confidence > 70 ? "default" : "secondary"}>
                              {decodedVIN.confidence}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Database Stats */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    Database Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <Car className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{vehicles.length}</p>
                      <p className="text-sm text-muted-foreground">Vehicles</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <FileJson className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{pids.length}</p>
                      <p className="text-sm text-muted-foreground">PIDs</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <Search className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{scans.length}</p>
                      <p className="text-sm text-muted-foreground">Scans</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <Database className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">4</p>
                      <p className="text-sm text-muted-foreground">Tables</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Button onClick={handleExport} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Database
                    </Button>
                    <Button onClick={handleClearDatabase} variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Database
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Import/Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Import/Export Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="import-data">Import Data (JSON)</Label>
              <Textarea
                id="import-data"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste JSON data to import"
                className="min-h-[200px] mt-1"
              />
              <Button onClick={handleImport} className="mt-2">
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
            </div>
            
            <div>
              <Label htmlFor="export-data">Export Data (JSON)</Label>
              <Textarea
                id="export-data"
                value={exportData}
                readOnly
                placeholder="Exported data will appear here"
                className="min-h-[200px] mt-1 bg-muted"
              />
              <Button onClick={handleExport} className="mt-2">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Database Records */}
      <Card>
        <CardHeader>
          <CardTitle>Database Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Button
              variant={activeTab === 'vehicles' ? 'default' : 'outline'}
              onClick={() => setActiveTab('vehicles')}
            >
              Vehicles ({vehicles.length})
            </Button>
            <Button
              variant={activeTab === 'pids' ? 'default' : 'outline'}
              onClick={() => setActiveTab('pids')}
            >
              PIDs ({pids.length})
            </Button>
            <Button
              variant={activeTab === 'scans' ? 'default' : 'outline'}
              onClick={() => setActiveTab('scans')}
            >
              Scans ({scans.length})
            </Button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {activeTab === 'vehicles' && (
              <div className="space-y-2">
                {vehicles.map(vehicle => (
                  <div key={vehicle.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{vehicle.make} {vehicle.model}</h4>
                      <Badge variant="secondary">{vehicle.vin}</Badge>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>{vehicle.year} • {vehicle.engine} • {vehicle.fuelType}</span>
                      <span>Updated: {formatDate(vehicle.lastUpdated)}</span>
                    </div>
                  </div>
                ))}
                
                {vehicles.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No vehicles in database</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'pids' && (
              <div className="space-y-2">
                {pids.map(pid => (
                  <div key={pid.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{pid.name}</h4>
                      <Badge variant="secondary">{pid.mode}{pid.pid}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{pid.description}</p>
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Unit: {pid.unit}</span>
                      {pid.category && <span>Category: {pid.category}</span>}
                      <span>Updated: {formatDate(pid.lastUpdated)}</span>
                    </div>
                  </div>
                ))}
                
                {pids.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileJson className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No PIDs in database</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'scans' && (
              <div className="space-y-2">
                {scans.map(scan => (
                  <div key={scan.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between">
                      <h4 className="font-medium">Scan #{scan.id}</h4>
                      <Badge variant="secondary">Vehicle #{scan.vehicleId}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(scan.timestamp)}
                    </p>
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Codes: {scan.dtcCodes.length}</span>
                      <span>{scan.liveData ? Object.keys(scan.liveData).length : 0} data points</span>
                    </div>
                  </div>
                ))}
                
                {scans.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No scans in database</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseManagementPanel;