
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, AlertCircle } from 'lucide-react';

interface MapboxTokenInputProps {
  onTokenSubmit: (token: string) => void;
}

const MapboxTokenInput: React.FC<MapboxTokenInputProps> = ({ onTokenSubmit }) => {
  const [mapboxToken, setMapboxToken] = useState('');

  const handleSubmit = () => {
    if (mapboxToken.trim()) {
      onTokenSubmit(mapboxToken.trim());
    }
  };

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
            onClick={handleSubmit}
            disabled={!mapboxToken.trim()}
            className="w-full"
          >
            Load Map
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default MapboxTokenInput;
