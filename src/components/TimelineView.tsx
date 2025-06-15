
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Package, Truck } from 'lucide-react';
import { Trip } from '@/types/trip';

interface TimelineEvent {
  id: string;
  time: string;
  type: 'pickup' | 'delivery';
  orderId: number;
  driverId: number;
  location: { lat: number; lon: number };
  service: string[];
  tripId: number;
}

interface TimelineViewProps {
  trips: Trip[];
  currentTick: number;
}

const TimelineView: React.FC<TimelineViewProps> = ({ trips, currentTick }) => {
  // Convert all events to timeline events
  const getAllEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    
    trips.forEach((trip) => {
      trip.json.orders.forEach((order) => {
        order.tasks.forEach((task) => {
          events.push({
            id: task.id,
            time: task.start_time,
            type: task.task_type,
            orderId: order.id,
            driverId: trip.json.driver_id,
            location: { lat: task.lat, lon: task.lon },
            service: task.service,
            tripId: trip.id
          });
        });
      });
    });
    
    // Sort events by time
    return events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  };

  // Get unique drivers
  const getDrivers = (): number[] => {
    const drivers = new Set<number>();
    trips.forEach(trip => drivers.add(trip.json.driver_id));
    return Array.from(drivers).sort();
  };

  // Convert time to position on timeline (0-100%)
  const getTimePosition = (eventTime: string, minTime: string, maxTime: string): number => {
    const eventTimestamp = new Date(eventTime).getTime();
    const minTimestamp = new Date(minTime).getTime();
    const maxTimestamp = new Date(maxTime).getTime();
    
    if (maxTimestamp === minTimestamp) return 0;
    
    return ((eventTimestamp - minTimestamp) / (maxTimestamp - minTimestamp)) * 100;
  };

  // Format time for display
  const formatTime = (timeString: string): string => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const events = getAllEvents();
  const drivers = getDrivers();
  
  if (events.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600">No events to display in timeline</p>
      </Card>
    );
  }

  const minTime = events[0]?.time || '';
  const maxTime = events[events.length - 1]?.time || '';

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Timeline View</h3>
          <Badge variant="secondary">{events.length} events</Badge>
        </div>

        {/* Time axis */}
        <div className="relative h-8 bg-gray-100 rounded-lg mb-6">
          <div className="absolute inset-x-0 top-0 h-full flex items-center justify-between px-4 text-xs text-gray-600">
            <span>{formatTime(minTime)}</span>
            <span>{formatTime(maxTime)}</span>
          </div>
          {/* Current time indicator */}
          <div 
            className="absolute top-0 w-0.5 h-full bg-red-500 z-10"
            style={{ left: `${(currentTick - 1) * 100 / 10}%` }}
          />
        </div>

        {/* Driver lanes */}
        <div className="space-y-4">
          {drivers.map((driverId) => {
            const driverEvents = events.filter(event => event.driverId === driverId);
            
            return (
              <div key={driverId} className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <Truck className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Driver {driverId}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {driverEvents.length} events
                  </Badge>
                </div>
                
                {/* Timeline lane */}
                <div className="relative h-12 bg-gray-50 rounded-lg border">
                  {driverEvents.map((event) => {
                    const position = getTimePosition(event.time, minTime, maxTime);
                    
                    return (
                      <div
                        key={event.id}
                        className="absolute top-1 group cursor-pointer"
                        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                      >
                        <div className={`
                          w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center
                          ${event.type === 'pickup' 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'bg-red-500 hover:bg-red-600'
                          }
                        `}>
                          {event.type === 'pickup' ? (
                            <Package className="h-3 w-3 text-white" />
                          ) : (
                            <MapPin className="h-3 w-3 text-white" />
                          )}
                        </div>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                            <div className="font-medium">
                              {event.type.toUpperCase()} - Order {event.orderId}
                            </div>
                            <div>{formatTime(event.time)}</div>
                            <div>{event.service.join(', ')}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <Package className="h-2 w-2 text-white" />
            </div>
            <span className="text-sm text-gray-600">Pickup</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <MapPin className="h-2 w-2 text-white" />
            </div>
            <span className="text-sm text-gray-600">Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-red-500"></div>
            <span className="text-sm text-gray-600">Current Time</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TimelineView;
