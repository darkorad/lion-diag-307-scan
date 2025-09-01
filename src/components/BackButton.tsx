
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useBackNavigation } from '@/hooks/useBackNavigation';

interface BackButtonProps {
  onBack?: () => void;
  fallbackRoute?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  label?: string;
  showIcon?: boolean;
}

const BackButton: React.FC<BackButtonProps> = ({
  onBack,
  fallbackRoute,
  variant = 'ghost',
  size = 'icon',
  className = '',
  label,
  showIcon = true
}) => {
  const { goBack } = useBackNavigation({ onBack, fallbackRoute });

  return (
    <Button
      variant={variant}
      size={size}
      onClick={goBack}
      className={className}
    >
      {showIcon && <ArrowLeft className="h-5 w-5" />}
      {label && <span className="ml-2">{label}</span>}
    </Button>
  );
};

export default BackButton;
