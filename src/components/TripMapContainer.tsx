
import React, { useState } from 'react';
import TripMap from './TripMap';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, AlertCircle } from 'lucide-react';

const TripMapContainer = () => {
  const [mapboxToken, setMapboxToken] = useState('');
  const [tokenSubmitted, setTokenSubmitted] = useState(false);

  // Dummy data based on your provided structure
  const dummyTrips = [
    {
      id: 24092,
      json: {
        orders: [
          {
            id: 34643006,
            tasks: [
              {
                id: "pickup_34643006_1",
                lat: 29.974462,
                lon: 31.278598,
                service: ["Grocery"],
                end_time: "2025-04-10T00:03:33.000Z",
                ready_at: "2025-04-09T23:56:26.000Z",
                late_time: 0.0,
                task_type: "pickup" as const,
                start_time: "2025-04-10T00:02:32.999Z"
              },
              {
                id: "delivery_34643006_1",
                lat: 29.964791,
                lon: 31.275774,
                service: ["Grocery"],
                end_time: "2025-04-10T00:12:42.200Z",
                late_time: 0.0,
                task_type: "delivery" as const,
                start_time: "2025-04-10T00:10:44.600Z"
              }
            ],
            customer: { lat: 29.964791, lon: 31.275774 },
            end_time: "2025-04-10T00:12:42.200Z",
            late_time: 0.0,
            has_coffee: false,
            start_time: "2025-04-10T00:02:32.999Z",
            has_grocery: true,
            received_at: "2025-04-09T23:46:26.000Z",
            segment_sla: "2025-04-10T00:31:26.000Z",
            has_hot_food: false,
            deadline_date: "2025-04-10T00:31:26.000Z"
          },
          {
            id: 34643068,
            tasks: [
              {
                id: "pickup_34643068_1",
                lat: 29.974462,
                lon: 31.278598,
                service: ["Grocery"],
                end_time: "2025-04-10T00:04:33.000Z",
                ready_at: "2025-04-10T00:03:33.000Z",
                late_time: 0.0,
                task_type: "pickup" as const,
                start_time: "2025-04-10T00:03:33.000Z"
              },
              {
                id: "delivery_34643068_1",
                lat: 29.982216,
                lon: 31.279891,
                service: ["Grocery"],
                end_time: "2025-04-10T00:08:14.600Z",
                late_time: 0.0,
                task_type: "delivery" as const,
                start_time: "2025-04-10T00:06:17.000Z"
              }
            ],
            customer: { lat: 29.982216, lon: 31.279891 },
            end_time: "2025-04-10T00:08:14.600Z",
            late_time: 0.0,
            has_coffee: false,
            start_time: "2025-04-10T00:03:33.000Z",
            has_grocery: true,
            received_at: "2025-04-09T23:53:33.000Z",
            segment_sla: "2025-04-10T00:38:33.000Z",
            has_hot_food: false,
            deadline_date: "2025-04-10T00:38:33.000Z"
          }
        ],
        distance: 5.073,
        duration: 774,
        end_time: "2025-04-10T00:15:27.800Z",
        driver_id: 1627358,
        late_time: 0.0,
        start_time: "2025-04-10T00:02:32.999Z",
        order_of_events: ["start_fp", "pickup_34643006_1", "pickup_34643068_1", "delivery_34643068_1", "delivery_34643006_1", "end_fp"]
      }
    },
    // Additional dummy trip for demonstration
    {
      id: 24093,
      json: {
        orders: [
          {
            id: 34643100,
            tasks: [
              {
                id: "pickup_34643100_1",
                lat: 29.960000,
                lon: 31.270000,
                service: ["Hot Food"],
                end_time: "2025-04-10T00:25:00.000Z",
                ready_at: "2025-04-10T00:20:00.000Z",
                late_time: 0.0,
                task_type: "pickup" as const,
                start_time: "2025-04-10T00:22:00.000Z"
              },
              {
                id: "delivery_34643100_1",
                lat: 29.950000,
                lon: 31.280000,
                service: ["Hot Food"],
                end_time: "2025-04-10T00:35:00.000Z",
                late_time: 0.0,
                task_type: "delivery" as const,
                start_time: "2025-04-10T00:33:00.000Z"
              }
            ],
            customer: { lat: 29.950000, lon: 31.280000 },
            end_time: "2025-04-10T00:35:00.000Z",
            late_time: 0.0,
            has_coffee: false,
            start_time: "2025-04-10T00:22:00.000Z",
            has_grocery: false,
            received_at: "2025-04-10T00:15:00.000Z",
            segment_sla: "2025-04-10T00:50:00.000Z",
            has_hot_food: true,
            deadline_date: "2025-04-10T00:50:00.000Z"
          }
        ],
        distance: 3.2,
        duration: 480,
        end_time: "2025-04-10T00:35:00.000Z",
        driver_id: 1627359,
        late_time: 0.0,
        start_time: "2025-04-10T00:22:00.000Z",
        order_of_events: ["start_fp", "pickup_34643100_1", "delivery_34643100_1", "end_fp"]
      }
    }
  ];

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setTokenSubmitted(true);
    }
  };

  if (!tokenSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full p-6">
          <div className="text-center mb-6">
            <MapPin className="mx-auto h-12 w-12 text-blue-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Trip Visualization Map</h1>
            <p className="text-gray-600">
              Enter your Mapbox public token to visualize route optimization trips
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Mapbox Public Token
              </label>
              <Input
                type="text"
                placeholder="pk.eyJ1IjoieW91ci11c2VybmFtZSI..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">How to get your token:</p>
                <p>
                  Visit <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="underline">mapbox.com</a>, 
                  create an account, and find your public token in the Tokens section of your dashboard.
                </p>
              </div>
            </div>
            
            <Button 
              onClick={handleTokenSubmit}
              disabled={!mapboxToken.trim()}
              className="w-full"
            >
              Load Map
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <TripMap trips={dummyTrips} mapboxToken={mapboxToken} />;
};

export default TripMapContainer;
