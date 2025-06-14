
import React, { useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';
import { useMapbox } from '@/hooks/useMapbox';
import { useMapMarkers } from '@/hooks/useMapMarkers';
import MapStatsOverlay from './MapStatsOverlay';
import TripSidebar from './TripSidebar';
import { Trip } from '@/types/trip';

interface TripMapProps {
  trips: Trip[];
  mapboxToken?: string;
}

const TripMap: React.FC<TripMapProps> = ({ trips, mapboxToken }) => {
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const { mapContainer, map, mapReady } = useMapbox(mapboxToken);

  useMapMarkers(map, trips, mapReady, setSelectedTrip);

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
    <div className="flex h-full bg-gray-50">
      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0" />
        <MapStatsOverlay trips={trips} />
      </div>

      {/* Trip Details Sidebar */}
      <TripSidebar
        trips={trips}
        selectedTrip={selectedTrip}
        onTripSelect={setSelectedTrip}
      />
    </div>
  );
};

export default TripMap;
