"use client";

import * as React from "react";
import { PlayCircle } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";

export type MediaAsset = {
  id: string;
  kind: string;
  storage_path: string;
  caption: string | null;
};

export function DestinationGallery({
  media,
  destinationName,
}: {
  media: MediaAsset[];
  destinationName: string;
}) {
  const [index, setIndex] = React.useState(-1);

  const slides = media.map((m) =>
    m.kind === "video"
      ? {
          type: "video" as const,
          width: 1280,
          height: 720,
          sources: [{ src: m.storage_path, type: "video/mp4" }],
        }
      : {
          type: "image" as const,
          src: m.storage_path,
          alt: m.caption ?? destinationName,
        }
  );

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {media.map((m, i) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setIndex(i)}
            className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
          >
            {m.kind === "video" ? (
              <>
                <video
                  src={m.storage_path}
                  className="size-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/35">
                  <PlayCircle className="size-10 text-white drop-shadow" />
                </div>
              </>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.storage_path}
                alt={m.caption ?? destinationName}
                className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            )}
          </button>
        ))}
      </div>

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
        plugins={[Video]}
      />
    </>
  );
}
