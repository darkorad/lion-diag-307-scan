import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Check, AlertTriangle, Bluetooth, Car, Activity, Gauge, Zap, Shield, BarChart3, Clock, Star } from "lucide-react";
import { Progress } from "./ui/progress";
import VehicleHealthMonitor from "./VehicleHealthMonitor";

export const Dashboard = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState({
    make: "Peugeot",
    model: "307",
    year: "2007",
    engine: "2.0 HDi",
    vin: "VF3..."
  });

  // Simulate connection after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnected(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">LionDiag Pro</h1>
          <p className="text-muted-foreground">Professional OBD2 Diagnostics</p>
        </div>
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Pro Version
          </Badge>
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Premium Support
          </Badge>
        </div>
      </div>

      {/* Connection Status */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isConnected ? 'bg-green-100 dark:bg-green-900' : 'bg-amber-100 dark:bg-amber-900'}`}>
              <Bluetooth className={`h-6 w-6 ${isConnected ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`} />
            </div>
            <div>
              <h3 className="font-medium">{isConnected ? 'Connected' : 'Not Connected'}</h3>
              <p className="text-sm text-muted-foreground">
                {isConnected ? 'ELM327 v1.5 - Ready for diagnostics' : 'Please connect to an OBD2 adapter'}
              </p>
            </div>
            <div className="ml-auto">
              <Button variant={isConnected ? "outline" : "default"} className={isConnected ? "border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950" : ""}>
                {isConnected ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connect to Vehicle Section */}
      {!isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Bluetooth className="h-5 w-5 text-primary" />
                <CardTitle>Quick Connect</CardTitle>
              </div>
              <CardDescription>Connect to your vehicle's OBD2 port</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                Plug your OBD2 adapter into your vehicle's diagnostic port, then click the button below to scan for devices.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Bluetooth className="mr-2 h-4 w-4" />
                Scan for Devices
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle>Recent Vehicles</CardTitle>
              </div>
              <CardDescription>Quickly connect to previously used vehicles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">Peugeot 307</p>
                    <p className="text-xs text-muted-foreground">Last connected: Today</p>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">VW Golf</p>
                    <p className="text-xs text-muted-foreground">Last connected: Yesterday</p>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Stats */}
      {isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="border-t-4 border-t-blue-500 hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-full dark:bg-blue-900">
                  <Car className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Vehicle Info</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Make:</span>
                  <span className="text-sm font-medium">{vehicleInfo.make}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Model:</span>
                  <span className="text-sm font-medium">{vehicleInfo.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Year:</span>
                  <span className="text-sm font-medium">{vehicleInfo.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Engine:</span>
                  <span className="text-sm font-medium">{vehicleInfo.engine}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-amber-500 hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="bg-amber-100 p-2 rounded-full dark:bg-amber-900">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <CardTitle>Trouble Codes</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-24">
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">No issues detected</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Scan for Codes
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-t-4 border-t-green-500 hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="bg-green-100 p-2 rounded-full dark:bg-green-900">
                  <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Live Data</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Engine RPM</span>
                    <span className="text-sm font-medium">820 RPM</span>
                  </div>
                  <Progress value={12} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Engine Temp</span>
                    <span className="text-sm font-medium">87°C</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Data
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Premium Features */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">Premium Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="overflow-hidden border-t-4 border-t-blue-500 hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-full dark:bg-blue-900">
                  <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg">Advanced Diagnostics</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Access manufacturer-specific codes and advanced parameter monitoring.</p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" size="sm" className="w-full">
                Explore
              </Button>
            </CardFooter>
          </Card>

          <Card className="overflow-hidden border-t-4 border-t-green-500 hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="bg-green-100 p-2 rounded-full dark:bg-green-900">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-lg">Used Car Check</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Verify vehicle history and detect potential hidden issues before purchase.</p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" size="sm" className="w-full">
                Start Check
              </Button>
            </CardFooter>
          </Card>

          <Card className="overflow-hidden border-t-4 border-t-purple-500 hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="bg-purple-100 p-2 rounded-full dark:bg-purple-900">
                  <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-lg">Performance Tests</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Measure 0-60 times, engine performance, and real-time power output.</p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" size="sm" className="w-full">
                Run Tests
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* LionDiag Pro Advantages */}
      <div className="mt-6">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              LionDiag Pro Advantages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <div className="mt-1 bg-green-100 p-1 rounded-full dark:bg-green-900">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium">Real-time Parameter Monitoring</p>
                  <p className="text-sm text-muted-foreground">Monitor dozens of vehicle parameters simultaneously</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 bg-green-100 p-1 rounded-full dark:bg-green-900">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium">Manufacturer-Specific Diagnostics</p>
                  <p className="text-sm text-muted-foreground">Access codes and functions specific to your vehicle brand</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 bg-green-100 p-1 rounded-full dark:bg-green-900">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium">Maintenance Reset Tools</p>
                  <p className="text-sm text-muted-foreground">Reset service indicators and maintenance reminders</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 bg-green-100 p-1 rounded-full dark:bg-green-900">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium">Cloud Backup & Sync</p>
                  <p className="text-sm text-muted-foreground">Save your diagnostic history securely in the cloud</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Health Monitor */}
      {isConnected && (
        <div className="mt-6">
          <VehicleHealthMonitor />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
