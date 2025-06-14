
import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { Trip } from '@/types/trip';

export const useMapMarkers = (
  map: mapboxgl.Map | null,
  trips: Trip[],
  mapReady: boolean,
  onTripSelect: (trip: Trip) => void
) => {
  useEffect(() => {
    if (!map || !mapReady) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Clear existing route layers and sources
    const layers = map.getStyle().layers;
    if (layers) {
      layers.forEach((layer) => {
        if (layer.id.startsWith('route-')) {
          try {
            map.removeLayer(layer.id);
          } catch (e) {
            // Layer might not exist, ignore error
          }
        }
      });
    }

    const sources = map.getStyle().sources;
    if (sources) {
      Object.keys(sources).forEach((sourceId) => {
        if (sourceId.startsWith('route-')) {
          try {
            map.removeSource(sourceId);
          } catch (e) {
            // Source might not exist, ignore error
          }
        }
      });
    }

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
            .addTo(map);

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
            onTripSelect(trip);
            popup.addTo(map);
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

        map.addSource(routeId, {
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

        map.addLayer({
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
  }, [trips, mapReady, map, onTripSelect]);
};
