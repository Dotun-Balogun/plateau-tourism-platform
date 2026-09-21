"use client";

import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import Link from "next/link";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";

import { categoryColor } from "@/lib/map-colors";

export type MapDestination = {
  slug: string;
  name: string;
  region: string | null;
  latitude: number;
  longitude: number;
  categorySlug: string | null;
  categoryName: string | null;
};

function pinIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 26px; height: 26px; border-radius: 50% 50% 50% 0;
        background: ${color}; transform: rotate(-45deg);
        border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.4);
      "></div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -26],
  });
}

export default function DestinationsMap({
  destinations,
  center,
  zoom = 9,
}: {
  destinations: MapDestination[];
  center?: [number, number];
  zoom?: number;
}) {
  const mapCenter: [number, number] =
    center ??
    (destinations.length > 0
      ? [destinations[0].latitude, destinations[0].longitude]
      : [9.8965, 8.8583]); // Jos, Plateau State fallback

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoom}
      scrollWheelZoom={false}
      className="size-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerClusterGroup chunkedLoading>
        {destinations.map((d) => (
          <Marker
            key={d.slug}
            position={[d.latitude, d.longitude]}
            icon={pinIcon(categoryColor(d.categorySlug))}
          >
            <Popup>
              <div className="min-w-40">
                <p className="font-medium">{d.name}</p>
                {d.region && (
                  <p className="text-xs text-muted-foreground">{d.region}</p>
                )}
                <Link
                  href={`/destinations/${d.slug}`}
                  className="mt-1 inline-block text-xs font-medium text-primary underline underline-offset-2"
                >
                  View destination →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
