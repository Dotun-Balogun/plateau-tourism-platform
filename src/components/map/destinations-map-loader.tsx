"use client";

import dynamic from "next/dynamic";

import type { MapDestination } from "@/components/map/destinations-map";

const DestinationsMap = dynamic(
  () => import("@/components/map/destinations-map"),
  {
    ssr: false,
    loading: () => (
      <div className="flex size-full items-center justify-center bg-muted text-sm text-muted-foreground">
        Loading map...
      </div>
    ),
  }
);

export function DestinationsMapLoader(props: {
  destinations: MapDestination[];
  center?: [number, number];
  zoom?: number;
}) {
  return <DestinationsMap {...props} />;
}
