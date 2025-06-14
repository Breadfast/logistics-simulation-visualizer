
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from '@/config/api';

export const useMapbox = (mapboxToken?: string) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Use the provided token or fallback to the configured one
  const tokenToUse = mapboxToken || MAPBOX_TOKEN;

  useEffect(() => {
    if (!mapContainer.current || !tokenToUse) return;

    mapboxgl.accessToken = tokenToUse;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [31.2789, 29.9745], // Cairo coordinates
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setMapReady(true);
    });

    return () => {
      map.current?.remove();
    };
  }, [tokenToUse]);

  return { mapContainer, map: map.current, mapReady };
};
