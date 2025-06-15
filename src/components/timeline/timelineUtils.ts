
import { Trip } from '@/types/trip';

export interface TimelineEvent {
  id: string;
  time: string;
  type: 'pickup' | 'delivery';
  orderId: number;
  driverId: number;
  location: { lat: number; lon: number };
  service: string[];
  tripId: number;
}

export const getAllEvents = (trips: Trip[]): TimelineEvent[] => {
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
  
  return events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
};

export const getDrivers = (trips: Trip[]): number[] => {
  const drivers = new Set<number>();
  trips.forEach(trip => drivers.add(trip.json.driver_id));
  return Array.from(drivers).sort();
};

export const getExpandedTimeRange = (events: TimelineEvent[]): { minTime: string; maxTime: string } => {
  if (events.length === 0) return { minTime: '', maxTime: '' };
  
  const times = events.map(e => new Date(e.time).getTime());
  const minTimestamp = Math.min(...times);
  const maxTimestamp = Math.max(...times);
  
  const duration = maxTimestamp - minTimestamp;
  const oneHour = 60 * 60 * 1000;
  const minExpansion = oneHour;
  
  let expandedMin = minTimestamp;
  let expandedMax = maxTimestamp;
  
  if (duration < minExpansion) {
    const center = (minTimestamp + maxTimestamp) / 2;
    expandedMin = center - minExpansion / 2;
    expandedMax = center + minExpansion / 2;
  } else {
    const padding = duration * 0.1;
    expandedMin = minTimestamp - padding;
    expandedMax = maxTimestamp + padding;
  }
  
  return {
    minTime: new Date(expandedMin).toISOString(),
    maxTime: new Date(expandedMax).toISOString()
  };
};

export const getTimePosition = (eventTime: string, minTime: string, maxTime: string): number => {
  const eventTimestamp = new Date(eventTime).getTime();
  const minTimestamp = new Date(minTime).getTime();
  const maxTimestamp = new Date(maxTime).getTime();
  
  if (maxTimestamp === minTimestamp) return 50;
  
  const position = ((eventTimestamp - minTimestamp) / (maxTimestamp - minTimestamp)) * 100;
  return Math.max(2, Math.min(98, position));
};

export const formatTime = (timeString: string): string => {
  return new Date(timeString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const generateTimeMarkers = (minTime: string, maxTime: string): string[] => {
  const minTimestamp = new Date(minTime).getTime();
  const maxTimestamp = new Date(maxTime).getTime();
  const duration = maxTimestamp - minTimestamp;
  
  const markerCount = 5;
  const markers: string[] = [];
  
  for (let i = 0; i <= markerCount; i++) {
    const timestamp = minTimestamp + (duration * i / markerCount);
    markers.push(new Date(timestamp).toISOString());
  }
  
  return markers;
};
