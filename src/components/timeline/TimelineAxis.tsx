
import React from 'react';
import { getTimePosition, formatTime } from './timelineUtils';

interface TimelineAxisProps {
  minTime: string;
  maxTime: string;
  timeMarkers: string[];
  currentTick: number;
}

const TimelineAxis: React.FC<TimelineAxisProps> = ({ 
  minTime, 
  maxTime, 
  timeMarkers, 
  currentTick 
}) => {
  return (
    <div className="relative mb-8">
      <div className="relative h-16 bg-gray-100 rounded-lg border-2">
        {/* Time gridlines */}
        {timeMarkers.map((markerTime, index) => {
          const position = getTimePosition(markerTime, minTime, maxTime);
          return (
            <div key={index} className="absolute top-0 h-full">
              <div 
                className="w-px bg-gray-400 h-full opacity-70"
                style={{ left: `${position}%` }}
              />
              <div 
                className="absolute -bottom-8 transform -translate-x-1/2 text-xs text-gray-600 font-medium bg-white px-1 rounded"
                style={{ left: `${position}%` }}
              >
                {formatTime(markerTime)}
              </div>
            </div>
          );
        })}
        
        {/* Current time indicator */}
        <div 
          className="absolute top-0 w-1 h-full bg-red-600 z-20 shadow-lg rounded-sm"
          style={{ left: `${(currentTick - 1) * 100 / 10}%` }}
        >
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-600 rotate-45 border border-red-700"></div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-600 rotate-45 border border-red-700"></div>
        </div>
        
        {/* Current time label */}
        <div 
          className="absolute -top-8 transform -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded font-medium z-20"
          style={{ left: `${(currentTick - 1) * 100 / 10}%` }}
        >
          Tick {currentTick}
        </div>
      </div>
    </div>
  );
};

export default TimelineAxis;
