import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const Settings = () => {
  const handleReset = () => {
    localStorage.clear();
    toast.success('All settings have been reset.');
    window.location.reload();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>App Settings</CardTitle>
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
  );
};

export default Settings;
