"use client";

import * as React from "react";
import { motion } from "motion/react";
import { LayoutGrid, Map as MapIcon } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DestinationCard,
  type DestinationCardData,
} from "@/components/destinations/destination-card";
import { DestinationsMapLoader } from "@/components/map/destinations-map-loader";
import type { MapDestination } from "@/components/map/destinations-map";

export function DestinationsView({
  cards,
  mapPoints,
}: {
  cards: DestinationCardData[];
  mapPoints: MapDestination[];
}) {
  const [view, setView] = React.useState<"grid" | "map">("grid");

  return (
    <div>
      <Tabs value={view} onValueChange={(v) => setView(v as "grid" | "map")}>
        <TabsList>
          <TabsTrigger value="grid">
            <LayoutGrid className="size-3.5" />
            Grid
          </TabsTrigger>
          <TabsTrigger value="map">
            <MapIcon className="size-3.5" />
            Map
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {view === "grid" ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((d, i) => (
            <motion.div
              key={d.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
            >
              <DestinationCard destination={d} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="mt-6 h-[560px] overflow-hidden rounded-xl border">
          {mapPoints.length > 0 ? (
            <DestinationsMapLoader destinations={mapPoints} />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
              No destinations with location data yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
