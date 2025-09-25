import React from 'react';
import { useNavigate } from 'react-router-dom';
import SystemTestingPanel from '@/components/SystemTestingPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const SystemTestingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button onClick={() => navigate(-1)} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
      <SystemTestingPanel />
    </div>
  );
};

export default SystemTestingPage;