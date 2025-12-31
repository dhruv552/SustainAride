import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import { MapPin, Navigation } from 'lucide-react';

// Fix for Leaflet default icon issue in React
// @ts-ignore - _getIconUrl is a private property
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom icons for source and destination
const sourceIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle the routing between two points
const RoutingMachine = ({
  sourceLocation,
  destinationLocation,
  onRouteFound
}: {
  sourceLocation: Location | null,
  destinationLocation: Location | null,
  onRouteFound?: (distance: number, duration: number) => void
}) => {
  const map = useMap();

  useEffect(() => {
    if (!sourceLocation || !destinationLocation) return;

    // Clear any existing routing control
    if ((map as any)._routingControl) {
      map.removeControl((map as any)._routingControl);
    }

    // Check if L.Routing is available
    if (!(L as any).Routing) {
      console.error('Leaflet Routing Machine not loaded');
      return;
    }

    // Create the routing control
    const routingControl = (L as any).Routing.control({
      waypoints: [
        L.latLng(sourceLocation.lat, sourceLocation.lng),
        L.latLng(destinationLocation.lat, destinationLocation.lng)
      ],
      lineOptions: {
        styles: [{ color: '#3B82F6', weight: 4, opacity: 0.7 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      },
      routeWhileDragging: false,
      show: false, // Don't show the routing instructions
      addWaypoints: false, // Don't allow adding or removing waypoints
      draggableWaypoints: false, // Don't allow dragging waypoints
      fitSelectedRoutes: true,
      createMarker: function () { return null; } // We'll create our own markers
    }).addTo(map);

    // Add route calculation event handler
    routingControl.on('routesfound', (e: any) => {
      const routes = e.routes;
      if (routes && routes.length > 0) {
        const route = routes[0]; // Get the first (best) route

        // Distance in meters, convert to kilometers
        const distanceInKm = (route.summary.totalDistance / 1000).toFixed(1);

        // Duration in seconds, convert to minutes
        const durationInMinutes = Math.round(route.summary.totalTime / 60);

        // Call the callback with the calculated values
        if (onRouteFound) {
          onRouteFound(parseFloat(distanceInKm), durationInMinutes);
        }
      }
    });

    // Store the routing control on the map instance for later cleanup
    (map as any)._routingControl = routingControl;

    return () => {
      if ((map as any)._routingControl) {
        map.removeControl((map as any)._routingControl);
      }
    };
  }, [map, sourceLocation, destinationLocation, onRouteFound]);

  return null;
};

// Component to recenter the map when locations change
const ChangeMapView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface MapViewProps {
  sourceLocation?: Location | null;
  destinationLocation?: Location | null;
  vehicleLocation?: Location | null;
  className?: string;
  height?: string;
  onRouteCalculated?: (distance: number, duration: number) => void;
}

const MapView: React.FC<MapViewProps> = ({
  sourceLocation,
  destinationLocation,
  vehicleLocation,
  className = "",
  height = "400px",
  onRouteCalculated
}) => {
  // Default center (Bangalore, India)
  const [center, setCenter] = useState<[number, number]>([12.9716, 77.5946]);

  useEffect(() => {
    // Center the map on source location if available
    if (sourceLocation) {
      setCenter([sourceLocation.lat, sourceLocation.lng]);
    }
  }, [sourceLocation]);

  return (
    <div className={`map-container ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Source marker */}
        {sourceLocation && (
          <Marker
            position={[sourceLocation.lat, sourceLocation.lng]}
            icon={sourceIcon}
          >
            <Popup>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-green-500" />
                <span>Pickup: {sourceLocation.address.split(',')[0]}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination marker */}
        {destinationLocation && (
          <Marker
            position={[destinationLocation.lat, destinationLocation.lng]}
            icon={destinationIcon}
          >
            <Popup>
              <div className="flex items-center">
                <Navigation className="h-4 w-4 mr-1 text-red-500" />
                <span>Destination: {destinationLocation.address.split(',')[0]}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Vehicle marker */}
        {vehicleLocation && (
          <Marker position={[vehicleLocation.lat, vehicleLocation.lng]}>
            <Popup>
              <div className="flex items-center">
                <span>Driver is here</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Add routing between source and destination */}
        {sourceLocation && destinationLocation && (
          <RoutingMachine
            sourceLocation={sourceLocation}
            destinationLocation={destinationLocation}
            onRouteFound={onRouteCalculated}
          />
        )}

        {/* Update map center when locations change */}
        <ChangeMapView center={center} />
      </MapContainer>
    </div>
  );
};

export default MapView;