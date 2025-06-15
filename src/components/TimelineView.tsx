
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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

  // Get expanded time range to ensure good spacing
  const getExpandedTimeRange = (events: TimelineEvent[]): { minTime: string; maxTime: string } => {
    if (events.length === 0) return { minTime: '', maxTime: '' };
    
    const times = events.map(e => new Date(e.time).getTime());
    const minTimestamp = Math.min(...times);
    const maxTimestamp = Math.max(...times);
    
    // Calculate the duration
    const duration = maxTimestamp - minTimestamp;
    
    // If all events are within a very short time (less than 1 hour), expand the range
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    const minExpansion = oneHour; // Minimum 1 hour range
    
    let expandedMin = minTimestamp;
    let expandedMax = maxTimestamp;
    
    if (duration < minExpansion) {
      // Expand range to at least 1 hour, centered around the events
      const center = (minTimestamp + maxTimestamp) / 2;
      expandedMin = center - minExpansion / 2;
      expandedMax = center + minExpansion / 2;
    } else {
      // Add 10% padding on each side
      const padding = duration * 0.1;
      expandedMin = minTimestamp - padding;
      expandedMax = maxTimestamp + padding;
    }
    
    return {
      minTime: new Date(expandedMin).toISOString(),
      maxTime: new Date(expandedMax).toISOString()
    };
  };

  // Convert time to position on timeline (0-100%)
  const getTimePosition = (eventTime: string, minTime: string, maxTime: string): number => {
    const eventTimestamp = new Date(eventTime).getTime();
    const minTimestamp = new Date(minTime).getTime();
    const maxTimestamp = new Date(maxTime).getTime();
    
    if (maxTimestamp === minTimestamp) return 50; // Center if no range
    
    const position = ((eventTimestamp - minTimestamp) / (maxTimestamp - minTimestamp)) * 100;
    
    // Ensure position is within bounds and add some margin
    return Math.max(2, Math.min(98, position));
  };

  // Format time for display
  const formatTime = (timeString: string): string => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Generate time markers for the timeline
  const generateTimeMarkers = (minTime: string, maxTime: string): string[] => {
    const minTimestamp = new Date(minTime).getTime();
    const maxTimestamp = new Date(maxTime).getTime();
    const duration = maxTimestamp - minTimestamp;
    
    // Create 6 evenly spaced time markers
    const markerCount = 5; // This creates 6 markers (0 through 5)
    const markers: string[] = [];
    
    for (let i = 0; i <= markerCount; i++) {
      const timestamp = minTimestamp + (duration * i / markerCount);
      markers.push(new Date(timestamp).toISOString());
    }
    
    return markers;
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

  const { minTime, maxTime } = getExpandedTimeRange(events);
  const timeMarkers = generateTimeMarkers(minTime, maxTime);

  console.log('Timeline Debug:', {
    eventsCount: events.length,
    minTime,
    maxTime,
    firstEventTime: events[0]?.time,
    lastEventTime: events[events.length - 1]?.time,
    timeRange: new Date(maxTime).getTime() - new Date(minTime).getTime(),
    samplePositions: events.slice(0, 3).map(e => ({
      time: e.time,
      position: getTimePosition(e.time, minTime, maxTime)
    }))
  });

  return (
    <TooltipProvider>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Timeline View</h3>
            <Badge variant="secondary">{events.length} events</Badge>
          </div>

          {/* Enhanced Time axis with gridlines */}
          <div className="relative mb-8">
            {/* Main timeline container */}
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

          {/* Driver lanes with enhanced gridlines */}
          <div className="space-y-6">
            {drivers.map((driverId) => {
              const driverEvents = events.filter(event => event.driverId === driverId);
              
              return (
                <div key={driverId} className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <Truck className="h-5 w-5 text-gray-600" />
                    <span className="text-base font-semibold text-gray-800">
                      Driver {driverId}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {driverEvents.length} events
                    </Badge>
                  </div>
                  
                  {/* Timeline lane with gridlines */}
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
                    {driverEvents.map((event, eventIndex) => {
                      const position = getTimePosition(event.time, minTime, maxTime);
                      
                      return (
                        <Tooltip key={event.id}>
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
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
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
        </div>
      </Card>
    </TooltipProvider>
  );
};

export default TimelineView;
