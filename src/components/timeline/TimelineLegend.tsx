
import React from 'react';
import { MapPin, Package } from 'lucide-react';

interface TimelineLegendProps {
  currentTick: number;
}

const TimelineLegend: React.FC<TimelineLegendProps> = ({ currentTick }) => {
  return (
    <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow">
          <Package className="h-2.5 w-2.5 text-white" />
        </div>
        <span className="text-sm text-gray-700 font-medium">Pickup</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow">
          <MapPin className="h-2.5 w-2.5 text-white" />
        </div>
        <span className="text-sm text-gray-700 font-medium">Delivery</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-1 bg-red-600 rounded"></div>
        <span className="text-sm text-gray-700 font-medium">Current Time (Tick {currentTick})</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-px bg-gray-300"></div>
        <span className="text-sm text-gray-700 font-medium">Time Markers</span>
      </div>
    </div>
  );
};

export default TimelineLegend;
