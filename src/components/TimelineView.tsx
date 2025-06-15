
import React from 'react';
import { Card } from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Clock } from 'lucide-react';
import { Trip } from '@/types/trip';
import TimelineHeader from './timeline/TimelineHeader';
import TimelineAxis from './timeline/TimelineAxis';
import DriverLane from './timeline/DriverLane';
import TimelineLegend from './timeline/TimelineLegend';
import { 
  getAllEvents, 
  getDrivers, 
  getExpandedTimeRange
} from './timeline/timelineUtils';

interface TimelineViewProps {
  trips: Trip[];
  currentTick: number;
}

const TimelineView: React.FC<TimelineViewProps> = ({ trips, currentTick }) => {
  const events = getAllEvents(trips);
  const drivers = getDrivers(trips);
  
  if (events.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600">No events to display in timeline</p>
      </Card>
    );
  }

  const { minTime, maxTime } = getExpandedTimeRange(events);

  return (
    <TooltipProvider>
      <Card className="p-6">
        <div className="space-y-4">
          <TimelineHeader eventCount={events.length} />

          <TimelineAxis
            minTime={minTime}
            maxTime={maxTime}
            currentTick={currentTick}
          />

          <div className="space-y-6">
            {drivers.map((driverId) => {
              const driverEvents = events.filter(event => event.driverId === driverId);
              
              return (
                <DriverLane
                  key={driverId}
                  driverId={driverId}
                  events={driverEvents}
                  minTime={minTime}
                  maxTime={maxTime}
                />
              );
            })}
          </div>

          <TimelineLegend currentTick={currentTick} />
        </div>
      </Card>
    </TooltipProvider>
  );
};

export default TimelineView;
