
import React, { useState, useEffect } from 'react';
import TripMap from './TripMap';
import SimulationSelector from './SimulationSelector';
import TickNavigator from './TickNavigator';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, AlertCircle, Loader2 } from 'lucide-react';

const TripMapContainer = () => {
  const [mapboxToken, setMapboxToken] = useState('');
  const [tokenSubmitted, setTokenSubmitted] = useState(false);
  const [selectedSimulation, setSelectedSimulation] = useState<number | null>(null);
  const [currentTick, setCurrentTick] = useState(1);
  const [maxTick] = useState(10); // This should come from API
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dummy data for fallback
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
          }
        ],
        distance: 5.073,
        duration: 774,
        end_time: "2025-04-10T00:15:27.800Z",
        driver_id: 1627358,
        late_time: 0.0,
        start_time: "2025-04-10T00:02:32.999Z",
        order_of_events: ["start_fp", "pickup_34643006_1", "delivery_34643006_1", "end_fp"]
      }
    }
  ];

  const fetchTrips = async (simulationId: number, tickNo: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Replace with actual API call
      const response = await fetch(`/api/trips?simulation_id=${simulationId}&tick_no=${tickNo}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch trips');
      }
      
      const data = await response.json();
      setTrips(data.trips || []);
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('Failed to load trips. Using dummy data.');
      // Use dummy data as fallback
      setTrips(dummyTrips);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSimulation) {
      fetchTrips(selectedSimulation, currentTick);
    }
  }, [selectedSimulation, currentTick]);

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setTokenSubmitted(true);
    }
  };

  const handleSimulationChange = (simulationId: number) => {
    setSelectedSimulation(simulationId);
    setCurrentTick(1); // Reset to first tick when simulation changes
  };

  const handleTickChange = (tick: number) => {
    setCurrentTick(tick);
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

  if (!selectedSimulation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full">
          <SimulationSelector
            selectedSimulation={selectedSimulation}
            onSimulationChange={handleSimulationChange}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Controls Sidebar */}
      <div className="w-80 bg-white shadow-lg overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Trip Simulation</h2>
        </div>
        
        <div className="p-4 space-y-4">
          <SimulationSelector
            selectedSimulation={selectedSimulation}
            onSimulationChange={handleSimulationChange}
          />
          
          <TickNavigator
            currentTick={currentTick}
            maxTick={maxTick}
            onTickChange={handleTickChange}
            isLoading={isLoading}
          />

          {error && (
            <Card className="p-3 bg-yellow-50 border-yellow-200">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            </Card>
          )}

          {isLoading && (
            <Card className="p-3">
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading trips...</span>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1">
        <TripMap trips={trips} mapboxToken={mapboxToken} />
      </div>
    </div>
  );
};

export default TripMapContainer;
