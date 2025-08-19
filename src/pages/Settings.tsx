import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [units, setUnits] = useState('metric');

  const handleReset = () => {
    localStorage.clear();
    toast.success('All settings have been reset.');
    window.location.reload();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Theme</Label>
              <RadioGroup value={theme} onValueChange={setTheme}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light">Light</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark">Dark</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Units</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Measurement Units</Label>
              <RadioGroup value={units} onValueChange={setUnits}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="metric" id="metric" />
                  <Label htmlFor="metric">Metric</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="imperial" id="imperial" />
                  <Label htmlFor="imperial">Imperial</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>App Data</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleReset} variant="destructive">
              Reset All Settings
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              This will clear all stored data, including connection history and custom PIDs.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
