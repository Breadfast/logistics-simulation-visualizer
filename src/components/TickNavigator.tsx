
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
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

  const handleSliderChange = (value: number[]) => {
    onTickChange(value[0]);
  };

  // Convert tick to time display (each tick = 5 minutes, starting from 00:00)
  const getTimeFromTick = (tick: number) => {
    const totalMinutes = (tick - 1) * 5; // tick 1 = 00:00, so subtract 1
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const currentTime = getTimeFromTick(currentTick);
  const maxTime = getTimeFromTick(maxTick);

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">Time Navigation</span>
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
            <div className="text-lg font-semibold">{currentTime}</div>
            <div className="text-xs text-gray-500">Tick {currentTick} of {maxTick}</div>
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

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>00:00</span>
            <span>{maxTime}</span>
          </div>
          <Slider
            value={[currentTick]}
            onValueChange={handleSliderChange}
            max={maxTick}
            min={1}
            step={1}
            disabled={isLoading}
            className="w-full"
          />
          <div className="text-center text-xs text-gray-500">
            Each tick = 5 minutes
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TickNavigator;
