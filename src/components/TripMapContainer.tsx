
import React, { useState, useEffect } from 'react';
import TripMap from './TripMap';
import RunSelector from './RunSelector';
import TickNavigator from './TickNavigator';
import MapboxTokenInput from './MapboxTokenInput';
import RunSelectionScreen from './RunSelectionScreen';
import { Card } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';

const TripMapContainer = () => {
  const [mapboxToken, setMapboxToken] = useState('');
  const [tokenSubmitted, setTokenSubmitted] = useState(false);
  const [selectedRun, setSelectedRun] = useState<number | null>(null);
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

  const fetchTrips = async (runId: number, tickNo: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Replace with actual API call
      const response = await fetch(`/api/trips?run_id=${runId}&tick_no=${tickNo}`);
      
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
    if (selectedRun) {
      fetchTrips(selectedRun, currentTick);
    }
  }, [selectedRun, currentTick]);

  const handleTokenSubmit = (token: string) => {
    setMapboxToken(token);
    setTokenSubmitted(true);
  };

  const handleRunChange = (runId: number) => {
    setSelectedRun(runId);
    setCurrentTick(1); // Reset to first tick when run changes
  };

  const handleTickChange = (tick: number) => {
    setCurrentTick(tick);
  };

  if (!tokenSubmitted) {
    return <MapboxTokenInput onTokenSubmit={handleTokenSubmit} />;
  }

  if (!selectedRun) {
    return (
      <RunSelectionScreen
        selectedRun={selectedRun}
        onRunChange={handleRunChange}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Controls Sidebar */}
      <div className="w-80 bg-white shadow-lg overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Trip Run</h2>
        </div>
        
        <div className="p-4 space-y-4">
          <RunSelector
            selectedRun={selectedRun}
            onRunChange={handleRunChange}
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
