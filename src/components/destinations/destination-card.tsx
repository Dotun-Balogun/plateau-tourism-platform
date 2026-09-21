"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Images, MapPin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export type DestinationCardData = {
  slug: string;
  name: string;
  summary: string | null;
  region: string | null;
  cover_image_url: string | null;
  avg_rating: number;
  review_count: number;
  category_name?: string | null;
};

export function DestinationCard({ destination }: { destination: DestinationCardData }) {
  return (
    <Link href={`/destinations/${destination.slug}`} className="block">
      <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
        <Card className="group overflow-hidden py-0 transition-shadow hover:shadow-lg">
          <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
            {destination.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={destination.cover_image_url}
                alt={destination.name}
                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                No image yet
              </div>
            )}

            {/*
              Always-visible gallery badge — this is what tells a mobile
              visitor (no hover state on touch) that tapping opens a gallery.
              The bigger center overlay below is a bonus for mouse users.
            */}
            <div className="absolute right-2 bottom-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm sm:right-3 sm:bottom-3 sm:px-2.5 sm:py-1.5 sm:text-xs">
              <Images className="size-3 sm:size-3.5" />
              <span>Gallery</span>
            </div>

            {/* Extra hover-only emphasis for mouse users — decorative, not load-bearing */}
            <div className="absolute inset-0 hidden items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/20 group-hover:opacity-100 sm:flex">
              <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-foreground shadow">
                <Images className="size-3.5" />
                View gallery
              </span>
            </div>

            {destination.category_name && (
              <Badge className="absolute top-2 left-2 text-[11px] sm:top-3 sm:left-3 sm:text-xs" variant="secondary">
                {destination.category_name}
              </Badge>
            )}
          </div>

          <CardContent className="space-y-1.5 px-3 pb-4 sm:space-y-2 sm:px-6 sm:pb-6">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold leading-tight sm:text-base">
                {destination.name}
              </h3>
              {destination.review_count > 0 && (
                <div className="flex shrink-0 items-center gap-1 text-xs sm:text-sm">
                  <Star className="size-3 fill-current text-amber-500 sm:size-3.5" />
                  <span>{destination.avg_rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {destination.summary && (
              <p className="line-clamp-2 text-xs text-muted-foreground sm:text-sm">
                {destination.summary}
              </p>
            )}

            {destination.region && (
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground sm:text-xs">
                <MapPin className="size-3 sm:size-3.5" />
                <span>{destination.region}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}