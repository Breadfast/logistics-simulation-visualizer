
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Truck } from 'lucide-react';
import EventMarker from './EventMarker';
import { TimelineEvent, getTimePosition } from './timelineUtils';

interface DriverLaneProps {
  driverId: number;
  events: TimelineEvent[];
  minTime: string;
  maxTime: string;
  timeMarkers: string[];
}

const DriverLane: React.FC<DriverLaneProps> = ({ 
  driverId, 
  events, 
  minTime, 
  maxTime, 
  timeMarkers 
}) => {
  return (
    <div className="relative">
      <div className="flex items-center gap-3 mb-3">
        <Truck className="h-5 w-5 text-gray-600" />
        <span className="text-base font-semibold text-gray-800">
          Driver {driverId}
        </span>
        <Badge variant="outline" className="text-xs">
          {events.length} events
        </Badge>
      </div>
      
      <div className="relative h-16 bg-gray-50 rounded-lg border-2 border-gray-200">
        {/* Vertical gridlines for this lane */}
        {timeMarkers.map((markerTime, index) => {
          const position = getTimePosition(markerTime, minTime, maxTime);
          return (
            <div 
              key={index}
              className="absolute top-0 h-full w-px bg-gray-300 opacity-50"
              style={{ left: `${position}%` }}
            />
          );
        })}
        
        {/* Events for this driver */}
        {events.map((event) => (
          <EventMarker
            key={event.id}
            event={event}
            minTime={minTime}
            maxTime={maxTime}
          />
        ))}
      </div>
    </div>
  );
};

export default DriverLane;
