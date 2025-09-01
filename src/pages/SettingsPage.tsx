
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Settings, Bluetooth, Bell, Shield, Database } from 'lucide-react';
import BackButton from '@/components/BackButton';

const SettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <BackButton fallbackRoute="/" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <div className="space-y-4">
          {/* Connection Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bluetooth className="h-5 w-5" />
                Connection Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-connect">Auto Connect</Label>
                <Switch id="auto-connect" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="reconnect">Auto Reconnect</Label>
                <Switch id="reconnect" defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="error-alerts">Error Alerts</Label>
                <Switch id="error-alerts" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="connection-status">Connection Status</Label>
                <Switch id="connection-status" defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="save-data">Save Diagnostic Data</Label>
                <Switch id="save-data" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="anonymous-usage">Anonymous Usage Stats</Label>
                <Switch id="anonymous-usage" />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                Export Diagnostic Data
              </Button>
              <Button variant="outline" className="w-full">
                Clear Cached Data
              </Button>
              <Button variant="destructive" className="w-full">
                Reset All Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
