
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Clock, Package } from 'lucide-react';

interface Task {
  id: string;
  lat: number;
  lon: number;
  service: string[];
  task_type: 'pickup' | 'delivery';
  start_time: string;
  end_time: string;
  late_time: number;
}

interface Order {
  id: number;
  tasks: Task[];
  customer: { lat: number; lon: number };
  start_time: string;
  end_time: string;
  has_grocery: boolean;
  has_coffee: boolean;
  has_hot_food: boolean;
}

interface Trip {
  id: number;
  json: {
    orders: Order[];
    distance: number;
    duration: number;
    driver_id: number;
    start_time: string;
    end_time: string;
    order_of_events: string[];
  };
}

interface TripMapProps {
  trips: Trip[];
  mapboxToken?: string;
}

const TripMap: React.FC<TripMapProps> = ({ trips, mapboxToken }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [31.2789, 29.9745], // Cairo coordinates based on your data
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setMapReady(true);
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (!map.current || !mapReady) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add markers and routes for each trip
    trips.forEach((trip, tripIndex) => {
      const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];
      const color = colors[tripIndex % colors.length];

      trip.json.orders.forEach((order) => {
        order.tasks.forEach((task) => {
          // Create marker element
          const markerElement = document.createElement('div');
          markerElement.className = 'trip-marker';
          markerElement.style.cssText = `
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: ${color};
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            cursor: pointer;
          `;

          // Add pickup/delivery icon
          const iconElement = document.createElement('div');
          iconElement.style.cssText = `
            position: absolute;
            top: -8px;
            right: -8px;
            width: 16px;
            height: 16px;
            background-color: ${task.task_type === 'pickup' ? '#10B981' : '#EF4444'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            color: white;
            font-weight: bold;
          `;
          iconElement.textContent = task.task_type === 'pickup' ? 'P' : 'D';
          markerElement.appendChild(iconElement);

          const marker = new mapboxgl.Marker(markerElement)
            .setLngLat([task.lon, task.lat])
            .addTo(map.current!);

          // Add popup with task details
          const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(`
            <div class="p-2">
              <h3 class="font-semibold text-sm">${task.task_type.toUpperCase()}</h3>
              <p class="text-xs text-gray-600">Order: ${order.id}</p>
              <p class="text-xs text-gray-600">Driver: ${trip.json.driver_id}</p>
              <p class="text-xs text-gray-600">Service: ${task.service.join(', ')}</p>
              <p class="text-xs text-gray-600">Time: ${new Date(task.start_time).toLocaleTimeString()}</p>
            </div>
          `);

          markerElement.addEventListener('click', () => {
            setSelectedTrip(trip);
            popup.addTo(map.current!);
          });
        });
      });

      // Draw route lines between tasks in order
      const coordinates: [number, number][] = [];
      trip.json.order_of_events.forEach((eventId) => {
        if (eventId !== 'start_fp' && eventId !== 'end_fp') {
          trip.json.orders.forEach((order) => {
            const task = order.tasks.find(t => t.id === eventId);
            if (task) {
              coordinates.push([task.lon, task.lat]);
            }
          });
        }
      });

      if (coordinates.length > 1) {
        const routeId = `route-${tripIndex}`;
        
        if (map.current!.getSource(routeId)) {
          map.current!.removeLayer(routeId);
          map.current!.removeSource(routeId);
        }

        map.current!.addSource(routeId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coordinates
            }
          }
        });

        map.current!.addLayer({
          id: routeId,
          type: 'line',
          source: routeId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': color,
            'line-width': 3,
            'line-opacity': 0.8
          }
        });
      }
    });
  }, [trips, mapReady]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (!mapboxToken) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">Please provide a Mapbox token to display the map</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {/* Trip Stats Overlay */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <h3 className="font-semibold text-lg mb-2">Trip Overview</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-blue-500" />
              <span className="text-sm">{trips.length} Active Trips</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-green-500" />
              <span className="text-sm">
                {trips.reduce((acc, trip) => acc + trip.json.orders.length, 0)} Orders
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-sm">
                {trips.reduce((acc, trip) => acc + trip.json.orders.reduce((orderAcc, order) => orderAcc + order.tasks.length, 0), 0)} Tasks
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trip Details Sidebar */}
      <div className="w-80 bg-white shadow-lg overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Trip Details</h2>
        </div>
        
        <div className="p-4 space-y-4">
          {trips.map((trip, index) => {
            const colors = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
            const colorClass = colors[index % colors.length];
            
            return (
              <Card 
                key={trip.id} 
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedTrip?.id === trip.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedTrip(trip)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${colorClass}`} />
                  <h3 className="font-semibold">Driver {trip.json.driver_id}</h3>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Orders:</span>
                    <span>{trip.json.orders.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Distance:</span>
                    <span>{trip.json.distance.toFixed(1)} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{formatDuration(trip.json.duration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Start:</span>
                    <span>{new Date(trip.json.start_time).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {trip.json.orders.some(o => o.has_grocery) && (
                    <Badge variant="secondary" className="text-xs">Grocery</Badge>
                  )}
                  {trip.json.orders.some(o => o.has_coffee) && (
                    <Badge variant="secondary" className="text-xs">Coffee</Badge>
                  )}
                  {trip.json.orders.some(o => o.has_hot_food) && (
                    <Badge variant="secondary" className="text-xs">Hot Food</Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TripMap;
