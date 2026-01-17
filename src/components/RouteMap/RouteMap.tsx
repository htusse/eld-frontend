/**
 * Route Map Component
 * 
 * Displays the trip route on a Leaflet map with markers for waypoints and stops.
 */

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography, Chip } from '@mui/material';
import type { Route, Stop } from '../../types';
import { decodePolyline, getStopTypeName, getStopTypeColor, formatDistance } from '../../utils';

// Fix for default marker icons in Leaflet with webpack/vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom marker icons
const createCustomIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">${label}</span>
      </div>
    `,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40],
  });
};

const waypointIcons = {
  current: createCustomIcon('#2196f3', 'S'),
  pickup: createCustomIcon('#ff9800', 'P'),
  dropoff: createCustomIcon('#4caf50', 'D'),
};

const stopIcon = (type: string) => {
  const labels: Record<string, string> = {
    FUEL: '⛽',
    REST_BREAK: '☕',
    OFF_DUTY: '🛏️',
  };
  return createCustomIcon(getStopTypeColor(type as Stop['type']), labels[type] || '•');
};

interface MapBoundsSetterProps {
  bounds: L.LatLngBounds;
}

const MapBoundsSetter = ({ bounds }: MapBoundsSetterProps) => {
  const map = useMap();
  
  useEffect(() => {
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, bounds]);
  
  return null;
};

interface RouteMapProps {
  route: Route;
  stops: Stop[];
}

const TEAL = 'rgb(0, 128, 128)';

const RouteMap = ({ route, stops }: RouteMapProps) => {
  // Decode the polyline to coordinates
  const routeCoordinates = useMemo(() => {
    if (!route.polyline) return [];
    return decodePolyline(route.polyline);
  }, [route.polyline]);

  // Calculate bounds for the map
  const bounds = useMemo(() => {
    const allPoints: [number, number][] = [
      ...routeCoordinates,
      ...route.waypoints.map((w) => [w.lat, w.lng] as [number, number]),
    ];
    
    if (allPoints.length === 0) {
      // Default to continental US center
      return L.latLngBounds([[25, -125], [49, -66]]);
    }
    
    return L.latLngBounds(allPoints);
  }, [routeCoordinates, route.waypoints]);

  // Default center (will be overridden by bounds)
  const center = useMemo(() => {
    if (route.waypoints.length > 0) {
      return [route.waypoints[0].lat, route.waypoints[0].lng] as [number, number];
    }
    return [39.8283, -98.5795] as [number, number]; // Center of US
  }, [route.waypoints]);

  return (
    <Box 
      className="map-container"
      sx={{ 
        height: '100%', 
        minHeight: 400, 
        borderRadius: '24px', 
        overflow: 'hidden',
        position: 'relative',
        border: `2px solid ${TEAL}`,
      }}
    >
      <MapContainer
        center={center}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBoundsSetter bounds={bounds} />
        
        {/* Route polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            color={TEAL}
            weight={5}
            opacity={0.85}
          />
        )}
        
        {/* Waypoint markers */}
        {route.waypoints.map((waypoint, index) => (
          <Marker
            key={`waypoint-${index}`}
            position={[waypoint.lat, waypoint.lng]}
            icon={waypointIcons[waypoint.type]}
          >
            <Popup>
              <Box sx={{ minWidth: 160 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                  {waypoint.type === 'current' && '📍 Start Location'}
                  {waypoint.type === 'pickup' && '📦 Pickup Location'}
                  {waypoint.type === 'dropoff' && '🏁 Dropoff Location'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {waypoint.name || `${waypoint.lat.toFixed(4)}, ${waypoint.lng.toFixed(4)}`}
                </Typography>
              </Box>
            </Popup>
          </Marker>
        ))}
        
        {/* Stop markers (fuel, rest breaks, etc.) */}
        {stops
          .filter((stop) => stop.lat && stop.lng && !['PICKUP', 'DROPOFF'].includes(stop.type))
          .map((stop, index) => (
            <Marker
              key={`stop-${index}`}
              position={[stop.lat!, stop.lng!]}
              icon={stopIcon(stop.type)}
            >
              <Popup>
                <Box sx={{ minWidth: 160 }}>
                  <Chip
                    label={getStopTypeName(stop.type)}
                    size="small"
                    sx={{
                      bgcolor: getStopTypeColor(stop.type),
                      color: 'white',
                      mb: 1,
                      fontWeight: 600,
                    }}
                  />
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    {stop.reason}
                  </Typography>
                  {stop.mileMarker && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: TEAL,
                        fontWeight: 600,
                      }}
                    >
                      📍 {formatDistance(stop.mileMarker)}
                    </Typography>
                  )}
                </Box>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </Box>
  );
};

export default RouteMap;
