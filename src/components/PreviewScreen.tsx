import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Wrench, 
  Settings, 
  RefreshCw, 
  FileText, 
  PlayCircle, 
  Clock, 
  Car, 
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  BookOpen,
  Cpu,
  Zap,
  Database
} from 'lucide-react';
import FunctionWizard from '@/components/ui/wizard';
import { HelpIcon } from '@/components/ui/help-tooltip';
import TutorialGuide from './TutorialGuide';
import { SpecialFunction } from '@/constants/professionalDiagnosticDatabase';

// Mock data for demonstration
const mockFunctions: SpecialFunction[] = [
  {
    id: 'dpf-regen',
    name: 'DPF Regeneration',
    description: 'Force diesel particulate filter regeneration cycle',
    category: 'DPF',
    manufacturer: ['Peugeot', 'Citroën', 'BMW', 'Mercedes'],
    procedure: [
      '1. Connect OBD2 scanner to vehicle',
      '2. Turn ignition ON, engine OFF',
      '3. Select Engine Control Module (ECM)',
      '4. Navigate to Special Functions > DPF Regeneration',
      '5. Check prerequisites: Engine temperature > 70°C, fuel level > 25%',
      '6. Start forced regeneration process',
      '7. Keep engine running during entire process (15-20 minutes)',
      '8. Monitor exhaust temperature and soot levels',
      '9. Process complete when soot level drops below 2g',
      '10. Clear DTC codes if regeneration successful'
    ],
    warnings: [
      'Vehicle must be in well-ventilated area',
      'Exhaust temperature can exceed 600°C'
    ],
    prerequisites: [
      'Engine coolant temperature > 70°C',
      'Fuel level > 25%',
      'No critical engine fault codes'
    ],
    estimatedTime: '15-25 minutes',
    difficulty: 'Intermediate',
    risksWarnings: [
      'Hot exhaust gases - keep away from flammable materials',
      'Extended idle time - ensure adequate ventilation'
    ],
    supportedAdapters: ['Professional scanners', 'Autel', 'Launch']
  },
  {
    id: 'throttle-adapt',
    name: 'Throttle Body Adaptation',
    description: 'Adapt throttle body position after cleaning or replacement',
    category: 'Adaptation',
    manufacturer: ['BMW', 'Mercedes', 'Audi', 'Volkswagen'],
    procedure: [
      '1. Engine at operating temperature',
      '2. Connect scanner to Engine Control Module',
      '3. Select Adaptations > Throttle Body',
      '4. Start basic setting procedure',
      '5. Follow on-screen prompts for throttle cycling',
      '6. Save adaptation values',
      '7. Clear adaptation codes',
      '8. Test drive to verify proper operation'
    ],
    warnings: [
      'Improper adaptation may cause idle issues'
    ],
    prerequisites: [
      'Throttle body cleaned or replaced',
      'Engine at operating temperature'
    ],
    estimatedTime: '10-15 minutes',
    difficulty: 'Intermediate',
    risksWarnings: [
      'Improper adaptation may cause idle issues'
    ],
    supportedAdapters: ['Professional scanners', 'VCDS', 'BMW INPA']
  }
];

const mockModules = [
  {
    id: 'engine-ecu',
    name: 'Engine Control Unit',
    manufacturer: 'Peugeot',
    ecuAddress: '01',
    description: 'Engine management for PSA vehicles',
    supportedFunctions: ['Engine diagnostics', 'DPF regeneration', 'Injector coding'],
    commonIssues: ['DPF clogging', 'Injector problems', 'Turbo issues'],
    diagnosticProcedures: ['Read fault codes', 'Check live data', 'Perform adaptations', 'Test actuators']
  },
  {
    id: 'abs-module',
    name: 'ABS Control Module',
    manufacturer: 'Peugeot',
    ecuAddress: '03',
    description: 'Anti-lock braking system control',
    supportedFunctions: ['ABS diagnostics', 'Component testing', 'Calibration'],
    commonIssues: ['Wheel speed sensor faults', 'Pump motor issues', 'Valve problems'],
    diagnosticProcedures: ['Read fault codes', 'Check live data', 'Perform adaptations', 'Test actuators']
  }
];

const PreviewScreen: React.FC = () => {
  const [showWizard, setShowWizard] = useState(false);
  const [wizardFunction, setWizardFunction] = useState<SpecialFunction | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleOpenWizard = (func: SpecialFunction) => {
    setWizardFunction(func);
    setShowWizard(true);
  };

  const handleWizardComplete = (result: { success: boolean; functionId: string }) => {
    setShowWizard(false);
    setWizardFunction(null);
    console.log('Wizard completed:', result);
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">LionDiag Pro Preview</h1>
            <p className="text-muted-foreground">
              Enhanced UI/UX with wizards and contextual help
            </p>
          </div>
          <Button onClick={() => setShowTutorial(true)} variant="outline">
            <BookOpen className="h-4 w-4 mr-2" />
            Show Tutorial
          </Button>
        </div>

        {/* Tutorial Modal */}
        <TutorialGuide 
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
          onComplete={handleTutorialComplete}
        />

        {/* Wizard Modal */}
        {showWizard && wizardFunction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <FunctionWizard 
              functionData={wizardFunction} 
              onClose={() => {
                setShowWizard(false);
                setWizardFunction(null);
              }}
              onComplete={handleWizardComplete}
            />
          </div>
        )}

        {/* Feature Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Wizard Feature */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Step-by-Step Wizards
                <HelpIcon 
                  content="Interactive wizards guide users through complex diagnostic procedures with step-by-step instructions, prerequisites checking, and real-time progress monitoring."
                />
              </CardTitle>
              <CardDescription>
                Guided execution of special functions with safety checks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Complex diagnostic procedures are now simplified with interactive wizards that ensure all safety requirements are met.
              </p>
              
              <div className="space-y-3">
                {mockFunctions.map((func) => (
                  <div key={func.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{func.name}</h3>
                        <p className="text-sm text-muted-foreground">{func.description}</p>
                      </div>
                      <Badge variant="secondary">{func.category}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {func.estimatedTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <Car className="h-3 w-3" />
                        {func.manufacturer.slice(0, 2).join(', ')}
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleOpenWizard(func)}
                      size="sm"
                      className="mt-3"
                    >
                      <PlayCircle className="h-3 w-3 mr-1" />
                      Try Wizard
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contextual Help Feature */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Contextual Help
                <HelpIcon 
                  content="Contextual help tooltips provide immediate assistance and explanations for all interface elements without interrupting the workflow."
                />
              </CardTitle>
              <CardDescription>
                Instant access to help and explanations throughout the interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Hover over help icons to get immediate context-specific assistance for any feature or function.
              </p>
              
              <div className="space-y-3">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">Special Functions</h3>
                    <HelpIcon 
                      content="Access special vehicle functions like DPF regeneration, service resets, adaptations, and coding operations."
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Execute advanced vehicle operations with safety checks and step-by-step guidance.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">Vehicle Modules</h3>
                    <HelpIcon 
                      content="View and interact with all vehicle control modules including engine, transmission, ABS, airbag, climate, and body control modules."
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive access to all vehicle systems with detailed information about each module.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <RefreshCw className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">System Scan</h3>
                    <HelpIcon 
                      content="Perform a complete system scan of all vehicle modules to detect fault codes and diagnose issues across all systems."
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive diagnostic scanning with detailed reporting capabilities.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Responsive Design Feature */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Responsive Design
              <HelpIcon 
                content="The interface automatically adapts to different screen sizes, from mobile phones to large desktop monitors, ensuring optimal usability on any device."
              />
            </CardTitle>
            <CardDescription>
              Optimized for all device sizes from mobile to desktop
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <div className="bg-primary/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xs">📱</span>
                </div>
                <h3 className="font-medium text-sm">Mobile</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Touch-friendly interface with collapsible panels
                </p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <div className="bg-primary/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xs">💻</span>
                </div>
                <h3 className="font-medium text-sm">Tablet</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Multi-panel layout with optimized spacing
                </p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <div className="bg-primary/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xs">🖥️</span>
                </div>
                <h3 className="font-medium text-sm">Desktop</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Full-featured layout with advanced controls
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Interface */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Diagnostic Center Demo</CardTitle>
            <CardDescription>
              Preview of the enhanced diagnostic interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm font-medium">Special Functions</CardTitle>
                      <HelpIcon 
                        content="Access special vehicle functions like DPF regeneration, service resets, adaptations, and coding operations."
                        side="right"
                      />
                    </div>
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">Available functions</p>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm font-medium">Vehicle Modules</CardTitle>
                      <HelpIcon 
                        content="View and interact with all vehicle control modules including engine, transmission, ABS, airbag, climate, and body control modules."
                        side="right"
                      />
                    </div>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">8</div>
                    <p className="text-xs text-muted-foreground">Detected modules</p>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm font-medium">System Scan</CardTitle>
                      <HelpIcon 
                        content="Perform a complete system scan of all vehicle modules to detect fault codes and diagnose issues across all systems."
                        side="right"
                      />
                    </div>
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Full</div>
                    <p className="text-xs text-muted-foreground">Complete vehicle scan</p>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm font-medium">Reports</CardTitle>
                      <HelpIcon 
                        content="View, analyze, and export detailed diagnostic reports in various formats for professional use."
                        side="right"
                      />
                    </div>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Export</div>
                    <p className="text-xs text-muted-foreground">Diagnostic reports</p>
                  </CardContent>
                </Card>
              </div>

              {/* Modules Preview */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Vehicle Modules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockModules.map((module) => (
                    <Card key={module.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{module.name}</CardTitle>
                          <Badge variant="outline">{module.manufacturer}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                        
                        <div className="space-y-2">
                          <div className="text-sm font-medium">ECU Address: {module.ecuAddress}</div>
                          
                          <div>
                            <div className="text-sm font-medium mb-1">Supported Functions:</div>
                            <div className="flex flex-wrap gap-1">
                              {module.supportedFunctions.map((func, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {func}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm font-medium mb-1">Common Issues:</div>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {module.commonIssues.slice(0, 2).map((issue, index) => (
                                <li key={index} className="flex items-start gap-1">
                                  <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                                  {issue}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1">
                            <Cpu className="h-3 w-3 mr-1" />
                            Connect
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PreviewScreen;