import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { obd2Service } from '@/services/OBD2Service';
import { toast } from 'sonner';

const Diagnostics = () => {
  const [dtcs, setDtcs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Diagnostics</h1>
      <Card>
        <CardHeader>
          <CardTitle>Diagnostic Trouble Codes (DTCs)</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleReadDtcs} disabled={isLoading}>
            {isLoading ? 'Reading...' : 'Read DTCs'}
          </Button>
          <div className="mt-4 space-y-2">
            {dtcs.map((dtc, index) => (
              <div key={index} className="p-2 border rounded-md">
                <p className="font-semibold">{dtc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Diagnostics;
