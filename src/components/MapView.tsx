import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useMemo } from 'react';
import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
import marker1x from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

type Props = {
  lat: number;
  lng: number;
  zoom?: number;
};

// Fix default icon paths for bundlers (Vite)
L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker1x,
  shadowUrl: markerShadow,
});

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export default function MapView({ lat, lng, zoom = 13 }: Props) {
  const center = useMemo<[number, number]>(() => [lat, lng], [lat, lng]);

  return (
    <MapContainer
      {...({
        center,
        zoom,
        className: 'h-full w-full',
        scrollWheelZoom: true,
      } as any)}
    >
      <TileLayer
        {...({
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        } as any)}
      />
      <Marker position={center as any} />
      <Recenter lat={lat} lng={lng} />
    </MapContainer>
  );
}
