
import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MapPin, Package } from 'lucide-react';
import { TimelineEvent, getTimePosition, formatTime } from './timelineUtils';

interface EventMarkerProps {
  event: TimelineEvent;
  minTime: string;
  maxTime: string;
}

const EventMarker: React.FC<EventMarkerProps> = ({ event, minTime, maxTime }) => {
  const position = getTimePosition(event.time, minTime, maxTime);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="absolute top-2 group cursor-pointer z-10"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        >
          <div className={`
            w-10 h-10 rounded-full border-3 border-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110
            ${event.type === 'pickup' 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-red-500 hover:bg-red-600'
            }
          `}>
            {event.type === 'pickup' ? (
              <Package className="h-4 w-4 text-white" />
            ) : (
              <MapPin className="h-4 w-4 text-white" />
            )}
          </div>
          {/* Debug position label */}
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 bg-white px-1 rounded border">
            {position.toFixed(1)}%
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent 
        side="top" 
        align="center"
        className="max-w-xs bg-gray-900 text-white border-gray-700 shadow-xl"
      >
        <div className="space-y-2 p-1">
          <div className="flex items-center gap-2">
            <div className={`
              w-3 h-3 rounded-full
              ${event.type === 'pickup' ? 'bg-green-400' : 'bg-red-400'}
            `} />
            <span className="font-semibold text-sm">
              {event.type.toUpperCase()}
            </span>
          </div>
          <div className="text-sm space-y-1">
            <div><strong>Order:</strong> #{event.orderId}</div>
            <div><strong>Time:</strong> {formatTime(event.time)}</div>
            <div><strong>Service:</strong> {event.service.join(', ')}</div>
            <div className="text-xs text-gray-300">
              Trip #{event.tripId}
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default EventMarker;
