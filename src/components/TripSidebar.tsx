
import React from 'react';
import { Card } from '@/components/ui/card';
import EnhancedTripCard from './EnhancedTripCard';
import { Package } from 'lucide-react';

interface Trip {
  id: number;
  json: {
    orders: Array<{
      id: number;
      tasks: Array<{
        id: string;
        task_type: 'pickup' | 'delivery';
      }>;
    }>;
  };
}

interface TripSidebarProps {
  trips: Trip[];
  selectedTrip: Trip | null;
  onTripSelect: (trip: Trip) => void;
}

const TripSidebar: React.FC<TripSidebarProps> = ({ trips, selectedTrip, onTripSelect }) => {
  return (
    <div className="w-80 bg-white shadow-lg overflow-y-auto">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Active Trips</h2>
        <p className="text-sm text-gray-600">{trips.length} trips in current tick</p>
      </div>
      
      <div className="p-4 space-y-4">
        {trips.map((trip, index) => {
          const colors = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
          const colorClass = colors[index % colors.length];
          
          return (
            <EnhancedTripCard
              key={trip.id}
              trip={trip}
              colorClass={colorClass}
              isSelected={selectedTrip?.id === trip.id}
              onClick={() => onTripSelect(trip)}
            />
          );
        })}
        
        {trips.length === 0 && (
          <Card className="p-6 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No trips available for this tick</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TripSidebar;
