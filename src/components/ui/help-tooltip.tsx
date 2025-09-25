import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({ 
  content, 
  children,
  side = 'top',
  align = 'center'
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side} align={align} className="max-w-xs">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface HelpIconProps {
  content: string | React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

export const HelpIcon: React.FC<HelpIconProps> = ({ 
  content, 
  side = 'top',
  align = 'center'
}) => {
  return (
    <HelpTooltip content={content} side={side} align={align}>
      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
    </HelpTooltip>
  );
};

export default HelpTooltip;