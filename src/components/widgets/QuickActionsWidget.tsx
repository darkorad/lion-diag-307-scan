import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, Car, Settings } from 'lucide-react';

const QuickActionsWidget = () => {
  const navigate = useNavigate();

  const actions = [
    { label: 'Diagnostics', to: '/diagnostics', icon: Wrench },
    { label: 'Select Vehicle', to: '/vehicle-selection', icon: Car },
    { label: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="w-full justify-start"
            onClick={() => navigate(action.to)}
          >
            <action.icon className="h-4 w-4 mr-2" />
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default QuickActionsWidget;
