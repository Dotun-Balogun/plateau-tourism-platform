"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, ImageUp, Loader2, Star, Trash2, Video } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { attachMedia, deleteMedia, setCoverImage } from "@/app/admin/destinations/actions";

type MediaAsset = {
  id: string;
  kind: string;
  storage_path: string;
  caption: string | null;
};

const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50MB, matches supabase/config.toml

export function MediaManager({
  destinationId,
  initialMedia,
  coverImageUrl,
}: {
  destinationId: string;
  initialMedia: MediaAsset[];
  coverImageUrl: string | null;
}) {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);
  const [isSettingCover, setIsSettingCover] = React.useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    const supabase = createClient();

    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_BYTES) {
        toast.error(`${file.name} is larger than 50MB and was skipped.`);
        continue;
      }

      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      if (!isVideo && !isImage) {
        toast.error(`${file.name} isn't an image or video and was skipped.`);
        continue;
      }

      const ext = file.name.split(".").pop();
      const path = `${destinationId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("destination-media")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        toast.error(`Failed to upload ${file.name}: ${uploadError.message}`);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("destination-media").getPublicUrl(path);

      const result = await attachMedia(
        destinationId,
        publicUrl,
        isVideo ? "video" : "image",
        null
      );

      if (result?.error) {
        toast.error(result.error);
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.success("Upload complete");
    router.refresh();
  }

  async function handleDelete(media: MediaAsset) {
    setIsDeleting(media.id);
    const result = await deleteMedia(media.id, destinationId, media.storage_path);
    setIsDeleting(null);

    if (result?.error) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  async function handleSetCover(media: MediaAsset) {
    setIsSettingCover(media.id);
    const result = await setCoverImage(destinationId, media.storage_path);
    setIsSettingCover(null);

    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Cover image updated");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ImagePlus className="size-4" />
          )}
          {isUploading ? "Uploading..." : "Upload photos or videos"}
        </Button>
        <p className="mt-1 text-xs text-muted-foreground">
          JPG, PNG, WEBP, MP4, or MOV — up to 50MB each. Select multiple files
          at once. Click the star on any photo to make it the cover image.
        </p>
      </div>

      {initialMedia.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {initialMedia.map((m) => {
            const isCover = m.kind === "image" && coverImageUrl === m.storage_path;
            return (
              <Card key={m.id} className="overflow-hidden py-0">
                <CardContent className="relative p-0">
                  {m.kind === "video" ? (
                    <div className="relative aspect-square bg-black">
                      <video
                        src={m.storage_path}
                        className="size-full object-contain"
                        controls
                        preload="metadata"
                      />
                      <Video className="pointer-events-none absolute top-2 left-2 size-4 text-white drop-shadow" />
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.storage_path}
                      alt={m.caption ?? ""}
                      className="aspect-square w-full object-cover"
                    />
                  )}

                  {isCover && (
                    <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                      <Star className="size-3 fill-current" />
                      Cover
                    </span>
                  )}

                  <div className="absolute top-2 right-2 flex gap-1">
                    {m.kind === "image" && !isCover && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="size-7"
                        title="Set as cover image"
                        disabled={isSettingCover === m.id}
                        onClick={() => handleSetCover(m)}
                      >
                        {isSettingCover === m.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <ImageUp className="size-3.5" />
                        )}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="size-7"
                      disabled={isDeleting === m.id}
                      onClick={() => handleDelete(m)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No media uploaded yet.
        </p>
      )}
    </div>
  );
}
