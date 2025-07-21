
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
import { Trip } from '@/types/trip';

interface EnhancedTripCardProps {
  trip: Trip;
  colorClass: string;
  isSelected: boolean;
  onClick: () => void;
}

const EnhancedTripCard: React.FC<EnhancedTripCardProps> = ({
  trip,
  colorClass,
  isSelected,
  onClick,
}) => {
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timeString: string) => {
    return new Date(timeString).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card 
      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-3 h-3 rounded-full ${colorClass}`} />
        <h3 className="font-semibold">Driver {trip.json.driver_id || 'Unknown'}</h3>
        <Badge variant="outline" className="text-xs">Trip {trip.id}</Badge>
      </div>

      {/* Start and End Times */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="font-medium">Start:</span>
          </div>
          <div className="text-right">
            <div className="font-medium">{formatTime(trip.json.start_time)}</div>
            <div className="text-xs text-gray-500">{formatDate(trip.json.start_time)}</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-red-600">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="font-medium">End:</span>
          </div>
          <div className="text-right">
            <div className="font-medium">{formatTime(trip.json.end_time)}</div>
            <div className="text-xs text-gray-500">{formatDate(trip.json.end_time)}</div>
          </div>
        </div>
      </div>

      {/* Trip Statistics */}
      <div className="space-y-2 text-sm text-gray-600 mb-3">
        <div className="flex justify-between">
          <span>Orders:</span>
          <span className="font-medium">{trip.json.orders?.length || 0}</span>
        </div>
        <div className="flex justify-between">
          <span>Distance:</span>
          <span className="font-medium">
            {trip.json.distance ? `${trip.json.distance.toFixed(1)} km` : '0.0 km'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Duration:</span>
          <span className="font-medium">{formatDuration(trip.json.duration)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tasks:</span>
          <span className="font-medium">
            {trip.json.orders?.reduce((acc, order) => acc + (order.tasks?.length || 0), 0) || 0}
          </span>
        </div>
      </div>

      {/* Service Types */}
      <div className="flex flex-wrap gap-1">
        {trip.json.orders?.some(o => o.has_grocery) && (
          <Badge variant="secondary" className="text-xs">
            <Package className="h-3 w-3 mr-1" />
            Grocery
          </Badge>
        )}
        {trip.json.orders?.some(o => o.has_coffee) && (
          <Badge variant="secondary" className="text-xs">☕ Coffee</Badge>
        )}
        {trip.json.orders?.some(o => o.has_hot_food) && (
          <Badge variant="secondary" className="text-xs">🍕 Hot Food</Badge>
        )}
      </div>
    </Card>
  );
};

export default EnhancedTripCard;
