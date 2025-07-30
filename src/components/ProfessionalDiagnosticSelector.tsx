
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Car,
  Wrench,
  Database,
  Settings,
  Shield,
  Activity,
  ArrowRight
} from 'lucide-react';

interface ProfessionalDiagnosticSelectorProps {
  onSelectEmulator: (emulator: string) => void;
  onBack: () => void;
}

interface DiagnosticTool {
  id: string;
  name: string;
  manufacturer: string;
  description: string;
  features: string[];
  icon: React.ElementType;
  supported: boolean;
  comingSoon?: boolean;
}

const ProfessionalDiagnosticSelector: React.FC<ProfessionalDiagnosticSelectorProps> = ({ 
  onSelectEmulator, 
  onBack 
}) => {
  const diagnosticTools: DiagnosticTool[] = [
    {
      id: 'peugeot-diagbox',
      name: 'Diagbox Professional',
      manufacturer: 'Peugeot/Citroën',
      description: 'Complete diagnostic solution for PSA Group vehicles. Access all ECU modules, hidden functions, and professional coding capabilities.',
      features: [
        'All ECU Module Access',
        'Hidden Function Activation',
        'Advanced Coding & Programming',
        'Bi-directional Controls',
        'Service Functions',
        'Real-time Data Logging'
      ],
      icon: Car,
      supported: true
    },
    {
      id: 'vag-vcds',
      name: 'VAG-COM (VCDS)',
      manufacturer: 'Volkswagen Group',
      description: 'Professional diagnostic tool for VW, Audi, Seat, and Skoda vehicles with comprehensive coding capabilities.',
      features: [
        'Long Coding Functions',
        'Adaptation Channels',
        'Output Tests',
        'Basic Settings',
        'Security Access',
        'Module Programming'
      ],
      icon: Settings,
      supported: false,
      comingSoon: true
    },
    {
      id: 'bmw-inpa',
      name: 'BMW INPA/DIS',
      manufacturer: 'BMW Group',
      description: 'BMW diagnostic and programming interface with advanced coding and adaptation functions.',
      features: [
        'E-Sys Coding',
        'Hidden Feature Activation',
        'Module Programming',
        'Service Functions',
        'Real-time Monitoring',
        'Fault Memory Management'
      ],
      icon: Shield,
      supported: false,
      comingSoon: true
    },
    {
      id: 'mercedes-star',
      name: 'Mercedes STAR Diagnostic',
      manufacturer: 'Mercedes-Benz',
      description: 'Professional Mercedes-Benz diagnostic system with comprehensive vehicle access.',
      features: [
        'SCN Coding',
        'Variant Coding',
        'Control Unit Programming',
        'Service Reset Functions',
        'Component Testing',
        'System Calibration'
      ],
      icon: Database,
      supported: false,
      comingSoon: true
    },
    {
      id: 'toyota-techstream',
      name: 'Toyota Techstream',
      manufacturer: 'Toyota/Lexus',
      description: 'Official Toyota diagnostic software for professional vehicle servicing.',
      features: [
        'Customization Functions',
        'Learning Procedures',
        'System Reset Functions',
        'Active Tests',
        'Data Recording',
        'ECU Reprogramming'
      ],
      icon: Activity,
      supported: false,
      comingSoon: true
    },
    {
      id: 'ford-ids',
      name: 'Ford IDS',
      manufacturer: 'Ford Motor Company',
      description: 'Integrated Diagnostic Software for Ford and Lincoln vehicles.',
      features: [
        'Module Programming',
        'Parameter Reset',
        'System Configuration',
        'Component Testing',
        'Service Procedures',
        'Technical Service Bulletins'
      ],
      icon: Wrench,
      supported: false,
      comingSoon: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Professional Diagnostic Emulators</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Access manufacturer-specific diagnostic tools and unlock advanced vehicle functions. 
          These emulators provide professional-grade capabilities for comprehensive vehicle servicing.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {diagnosticTools.map((tool) => {
          const IconComponent = tool.icon;
          return (
            <Card 
              key={tool.id} 
              className={`transition-all hover:shadow-lg ${
                !tool.supported ? 'opacity-75' : 'hover:scale-105'
              }`}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <IconComponent className="h-6 w-6" />
                  <div>
                    <div className="text-lg">{tool.name}</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      {tool.manufacturer}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {tool.description}
                </p>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Key Features:</h4>
                  <div className="grid gap-1">
                    {tool.features.slice(0, 4).map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-xs">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {feature}
                      </div>
                    ))}
                    {tool.features.length > 4 && (
                      <div className="text-xs text-muted-foreground">
                        +{tool.features.length - 4} more features
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {tool.supported ? (
                      <Badge variant="default" className="text-xs bg-green-600">
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        {tool.comingSoon ? 'Coming Soon' : 'Not Available'}
                      </Badge>
                    )}
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => onSelectEmulator(tool.id)}
                    disabled={!tool.supported}
                    className="flex items-center gap-2"
                  >
                    {tool.supported ? 'Launch' : 'Preview'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Professional Notice</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-blue-700">
            <p>
              <strong>Important:</strong> These diagnostic emulators provide access to professional-grade vehicle functions. 
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Some functions may permanently alter vehicle behavior</li>
              <li>Always verify compatibility with your specific vehicle model</li>
              <li>Use caution when modifying security or safety-related systems</li>
              <li>Keep records of all changes made for future reference</li>
            </ul>
            <p className="font-medium">
              These tools are intended for professional technicians and experienced enthusiasts only.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button variant="outline" onClick={onBack}>
          Back to Main Menu
        </Button>
      </div>
    </div>
  );
};

export default ProfessionalDiagnosticSelector;
