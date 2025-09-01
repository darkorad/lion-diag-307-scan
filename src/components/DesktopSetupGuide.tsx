
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Wifi, Usb, Bluetooth, Download, Pin } from 'lucide-react';
import { desktopConnectionService } from '@/services/DesktopConnectionService';
import { toast } from 'sonner';

const DesktopSetupGuide: React.FC = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [availableMethods, setAvailableMethods] = useState<string[]>([]);

  useEffect(() => {
    const checkDesktop = async () => {
      const desktop = await desktopConnectionService.isDesktop();
      const methods = await desktopConnectionService.getAvailableConnectionMethods();
      setIsDesktop(desktop);
      setAvailableMethods(methods);
    };

    checkDesktop();
  }, []);

  const handleShowInstructions = async () => {
    await desktopConnectionService.showDesktopConnectionInstructions();
    toast.info('Connection instructions displayed in console');
  };

  const handleCreateShortcut = async () => {
    const instructions = await desktopConnectionService.createDesktopShortcutInstructions();
    alert(instructions);
  };

  if (!isDesktop) {
    return null;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Windows 7 Desktop Setup Guide
        </CardTitle>
        <CardDescription>
          Set up OBD2 diagnostics on your Windows 7 computer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Badge variant="secondary">Windows 7 Compatible</Badge>
          <Badge variant="outline">No Installation Required</Badge>
        </div>

        <Tabs defaultValue="shortcut" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="shortcut">Desktop App</TabsTrigger>
            <TabsTrigger value="wifi">WiFi Setup</TabsTrigger>
            <TabsTrigger value="usb">USB Setup</TabsTrigger>
            <TabsTrigger value="bluetooth">Bluetooth</TabsTrigger>
          </TabsList>

          <TabsContent value="shortcut" className="space-y-4">
            <div className="flex items-start gap-4">
              <Pin className="h-6 w-6 text-blue-500 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Create Desktop Application</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Turn this web app into a desktop application that runs like a native Windows program.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">Chrome</span>
                    <span>Menu → More tools → Create shortcut → Check "Open as window"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-500/10 text-blue-500 px-2 py-1 rounded text-xs">Edge</span>
                    <span>Menu → Apps → Install this site as an app</span>
                  </div>
                </div>
                <Button onClick={handleCreateShortcut} className="mt-4">
                  <Download className="h-4 w-4 mr-2" />
                  Show Detailed Instructions
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="wifi" className="space-y-4">
            <div className="flex items-start gap-4">
              <Wifi className="h-6 w-6 text-green-500 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">WiFi OBD2 Connection (Recommended)</h3>
                <div className="space-y-3 text-sm">
                  <div className="border-l-4 border-green-500 pl-4">
                    <p className="font-medium">Step 1: Hardware</p>
                    <p className="text-muted-foreground">Get an ELM327 WiFi adapter (about $15-25)</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <p className="font-medium">Step 2: Connect</p>
                    <p className="text-muted-foreground">Plug adapter into car's OBD2 port (usually under dashboard)</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <p className="font-medium">Step 3: WiFi</p>
                    <p className="text-muted-foreground">Connect computer to adapter's WiFi network (usually "WiFi_OBD2")</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <p className="font-medium">Step 4: Configure</p>
                    <p className="text-muted-foreground">Default IP: 192.168.0.10:35000 or 192.168.1.5:35000</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="usb" className="space-y-4">
            <div className="flex items-start gap-4">
              <Usb className="h-6 w-6 text-blue-500 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">USB OBD2 Connection</h3>
                <div className="space-y-3 text-sm">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="font-medium">Step 1: Hardware</p>
                    <p className="text-muted-foreground">Get an ELM327 USB cable adapter</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="font-medium">Step 2: Drivers</p>
                    <p className="text-muted-foreground">Install CH340 or CP2102 drivers if Windows doesn't auto-detect</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="font-medium">Step 3: COM Port</p>
                    <p className="text-muted-foreground">Check Device Manager for COM port (COM3, COM4, etc.)</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="font-medium">Step 4: Configure</p>
                    <p className="text-muted-foreground">Enter COM port in app connection settings</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bluetooth" className="space-y-4">
            <div className="flex items-start gap-4">
              <Bluetooth className="h-6 w-6 text-purple-500 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Bluetooth Connection</h3>
                {availableMethods.includes('Bluetooth') ? (
                  <div className="space-y-3 text-sm">
                    <Badge variant="outline" className="text-green-600">Bluetooth Available</Badge>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className="font-medium">Step 1: Hardware</p>
                      <p className="text-muted-foreground">Get an ELM327 Bluetooth adapter</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className="font-medium">Step 2: Pair Device</p>
                      <p className="text-muted-foreground">Use Windows Bluetooth settings to pair adapter</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className="font-medium">Step 3: Connect</p>
                      <p className="text-muted-foreground">Select paired device in app</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <Badge variant="secondary" className="text-yellow-600 mb-2">Bluetooth Not Available</Badge>
                    <p className="text-sm text-yellow-700">
                      Your system doesn't support Web Bluetooth. Use WiFi or USB connection instead.
                      You can also use a Bluetooth dongle with Windows Bluetooth pairing.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-6 border-t">
          <Button onClick={handleShowInstructions} variant="outline" className="w-full">
            <Monitor className="h-4 w-4 mr-2" />
            Show Complete Setup Instructions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DesktopSetupGuide;
