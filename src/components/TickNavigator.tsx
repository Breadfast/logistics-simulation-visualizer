
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface TickNavigatorProps {
  currentTick: number;
  maxTick: number;
  onTickChange: (tick: number) => void;
  isLoading?: boolean;
}

const TickNavigator: React.FC<TickNavigatorProps> = ({
  currentTick,
  maxTick,
  onTickChange,
  isLoading = false,
}) => {
  const handlePrevious = () => {
    if (currentTick > 1) {
      onTickChange(currentTick - 1);
    }
  };

  const handleNext = () => {
    if (currentTick < maxTick) {
      onTickChange(currentTick + 1);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">Tick Navigation</span>
        </div>
        
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentTick <= 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-center">
            <div className="text-lg font-semibold">{currentTick}</div>
            <div className="text-xs text-gray-500">of {maxTick}</div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentTick >= maxTick || isLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default TickNavigator;
