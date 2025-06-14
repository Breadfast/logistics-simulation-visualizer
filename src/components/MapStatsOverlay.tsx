
import React from 'react';
import { Navigation, Package, Clock } from 'lucide-react';
import { Trip } from '@/types/trip';

interface MapStatsOverlayProps {
  trips: Trip[];
}

const MapStatsOverlay: React.FC<MapStatsOverlayProps> = ({ trips }) => {
  const totalOrders = trips.reduce((acc, trip) => acc + trip.json.orders.length, 0);
  const totalTasks = trips.reduce((acc, trip) => 
    acc + trip.json.orders.reduce((orderAcc, order) => orderAcc + order.tasks.length, 0), 0
  );

  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
      <h3 className="font-semibold text-lg mb-2">Current Tick Overview</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-blue-500" />
          <span className="text-sm">{trips.length} Active Trips</span>
        </div>
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-green-500" />
          <span className="text-sm">{totalOrders} Orders</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-orange-500" />
          <span className="text-sm">{totalTasks} Tasks</span>
        </div>
      </div>
    </div>
  );
};

export default MapStatsOverlay;
