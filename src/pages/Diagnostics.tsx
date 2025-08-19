import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { obd2Service } from '@/services/OBD2Service';
import { toast } from 'sonner';
import { OBD2_PIDS } from '@/constants/obd2Pids';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

const Diagnostics = () => {
  const navigate = useNavigate();
  const [dtcs, setDtcs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPid, setSelectedPid] = useState<string | null>(null);
  const [pidData, setPidData] = useState<{ name: string; value: string; unit: string } | null>(null);

  const obd2Pids = Object.entries(OBD2_PIDS).map(([name, pid]) => ({ name, pid }));

  const handleReadPid = async () => {
    if (!selectedPid) return;
    setIsLoading(true);
    toast.info(`Reading PID: ${selectedPid}`);
    try {
      const pidInfo = obd2Pids.find(p => p.pid === selectedPid);
      if (!pidInfo) throw new Error('PID not found');

      // Note: The obd2Service.readPID method might need adjustment
      // if it doesn't return a simple value.
      // For now, we assume it returns a string representation of the value.
      const result = await obd2Service.readPID(selectedPid);

      // We don't have unit info in the new OBD2_PIDS object, so we'll omit it for now.
      setPidData({
        name: pidInfo.name,
        value: result,
        unit: '',
      });
      toast.success(`Successfully read PID: ${pidInfo.name}`);
    } catch (error) {
      toast.error('Failed to read PID.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadDtcs = async () => {
    setIsLoading(true);
    toast.info('Reading DTCs...');
    try {
      const result = await obd2Service.getDTCs();
      setDtcs(result);
      toast.success(`Found ${result.length} DTCs.`);
    } catch (error) {
      toast.error('Failed to read DTCs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearDtcs = async () => {
    setIsLoading(true);
    toast.info('Clearing DTCs...');
    try {
      await obd2Service.clearDTCs();
      setDtcs([]);
      toast.success('DTCs cleared successfully.');
    } catch (error) {
      toast.error('Failed to clear DTCs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Diagnostics</h1>
      <Tabs defaultValue="dtcs">
        <TabsList>
          <TabsTrigger value="dtcs">DTCs</TabsTrigger>
          <TabsTrigger value="live-data">Live Data</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        <TabsContent value="dtcs">
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic Trouble Codes (DTCs)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-x-2 mb-4">
                <Button onClick={handleReadDtcs} disabled={isLoading}>
                  {isLoading ? 'Reading...' : 'Read DTCs'}
                </Button>
                <Button onClick={handleClearDtcs} disabled={isLoading} variant="destructive">
                  Clear DTCs
                </Button>
              </div>
              <div className="mt-4 space-y-2">
                {dtcs.map((dtc, index) => (
                  <div key={index} className="p-2 border rounded-md">
                    <p className="font-semibold">{dtc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="live-data">
          <Card>
            <CardHeader>
              <CardTitle>Live Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Select onValueChange={setSelectedPid}>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select a PID" />
                  </SelectTrigger>
                  <SelectContent>
                    {obd2Pids.map((pid) => (
                      <SelectItem key={pid.pid} value={pid.pid}>
                        {pid.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleReadPid} disabled={!selectedPid || isLoading}>
                  Read PID
                </Button>
              </div>
              {pidData && (
                <Card>
                  <CardHeader>
                    <CardTitle>{pidData.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold">{pidData.value} <span className="text-lg font-normal">{pidData.unit}</span></p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Functions</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Advanced functions are specific to your vehicle's make and model.
                Select your vehicle to access these functions.
              </p>
              <Button onClick={() => navigate('/vehicle-selection')} className="mt-4">
                Go to Vehicle Selection
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Diagnostics;
