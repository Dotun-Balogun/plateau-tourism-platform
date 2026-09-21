import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { DestinationGallery, type MediaAsset } from "@/components/destinations/destination-gallery";
import { SingleDestinationMap } from "@/components/map/single-destination-map";
import { ReviewForm } from "@/components/destinations/review-form";

type Review = {
  id: string;
  user_id: string;
  rating: number;
  body: string | null;
  created_at: string;
  profiles: { full_name: string | null } | null;
};

type DestinationDetail = {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  description: string | null;
  region: string | null;
  country: string;
  cover_image_url: string | null;
  avg_rating: number;
  review_count: number;
  latitude: number | null;
  longitude: number | null;
  categories: { slug: string; name: string } | null;
};

async function getDestination(slug: string) {
  const supabase = await createClient();

  const { data: destination, error } = await supabase
    .from("destinations")
    .select(
      "id, slug, name, summary, description, region, country, cover_image_url, avg_rating, review_count, latitude, longitude, categories(slug, name)"
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle<DestinationDetail>();

  if (error || !destination) return null;

  const [{ data: media }, { data: reviews }, { data: authData }] = await Promise.all([
    supabase
      .from("media_assets")
      .select("id, kind, storage_path, caption")
      .eq("destination_id", destination.id)
      .order("position")
      .returns<MediaAsset[]>(),
    supabase
      .from("reviews")
      .select("id, user_id, rating, body, created_at, profiles(full_name)")
      .eq("destination_id", destination.id)
      .order("created_at", { ascending: false })
      .returns<Review[]>(),
    supabase.auth.getUser(),
  ]);

  return {
    destination,
    media: media ?? [],
    reviews: reviews ?? [],
    currentUserId: authData.user?.id ?? null,
  };
}

export async function generateMetadata({
  params,
}: PageProps<"/destinations/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const result = await getDestination(slug).catch(() => null);
  if (!result) return { title: "Destination not found" };

  const { destination } = result;
  const description =
    destination.summary ?? destination.description?.slice(0, 155) ?? undefined;

  return {
    title: destination.name,
    description,
    openGraph: {
      title: destination.name,
      description,
      images: destination.cover_image_url ? [destination.cover_image_url] : [],
    },
  };
}

export default async function DestinationDetailPage({
  params,
}: PageProps<"/destinations/[slug]">) {
  const { slug } = await params;

  let result: Awaited<ReturnType<typeof getDestination>> = null;
  try {
    result = await getDestination(slug);
  } catch {
    result = null;
  }

  if (!result) notFound();

  const { destination, media, reviews, currentUserId } = result;
  const myReview = reviews.find((r) => r.user_id === currentUserId) ?? null;
  const otherReviews = reviews.filter((r) => r.user_id !== currentUserId);

  return (
    <div>
      <div className="relative aspect-21/9 w-full bg-muted">
        {destination.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={destination.cover_image_url}
            alt={destination.name}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            No cover image yet
          </div>
        )}
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            {destination.categories?.name && (
              <Badge variant="secondary" className="mb-2">
                {destination.categories.name}
              </Badge>
            )}
            <h1 className="text-3xl font-bold tracking-tight">
              {destination.name}
            </h1>
            {destination.region && (
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-4" />
                {destination.region}, {destination.country}
              </p>
            )}
          </div>

          {destination.review_count > 0 && (
            <div className="flex items-center gap-1.5 text-lg font-medium">
              <Star className="size-5 fill-current text-amber-500" />
              {destination.avg_rating.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground">
                ({destination.review_count} reviews)
              </span>
            </div>
          )}
        </div>

        {destination.summary && (
          <p className="mt-4 text-lg text-muted-foreground">
            {destination.summary}
          </p>
        )}

        {destination.description && (
          <p className="mt-4 whitespace-pre-line leading-relaxed">
            {destination.description}
          </p>
        )}

        {media.length > 0 && (
          <>
            <Separator className="my-8" />
            <h2 className="mb-4 text-xl font-semibold">Gallery</h2>
            <DestinationGallery media={media} destinationName={destination.name} />
          </>
        )}

        {destination.latitude != null && destination.longitude != null && (
          <>
            <Separator className="my-8" />
            <h2 className="mb-4 text-xl font-semibold">Location</h2>
            <div className="h-80 overflow-hidden rounded-xl border">
              <SingleDestinationMap
                destination={{
                  slug: destination.slug,
                  name: destination.name,
                  region: destination.region,
                  latitude: destination.latitude,
                  longitude: destination.longitude,
                  categorySlug: destination.categories?.slug ?? null,
                  categoryName: destination.categories?.name ?? null,
                }}
              />
            </div>
          </>
        )}

        <Separator className="my-8" />
        <h2 className="mb-4 text-xl font-semibold">
          Reviews {destination.review_count > 0 && `(${destination.review_count})`}
        </h2>

        {currentUserId ? (
          <div className="mb-6">
            <ReviewForm
              destinationId={destination.id}
              destinationSlug={destination.slug}
              existingReview={myReview}
            />
          </div>
        ) : (
          <Card className="mb-6">
            <CardContent className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
              <p>Sign in to leave a review of your visit.</p>
              <Link
                href={`/auth/login?redirectTo=/destinations/${destination.slug}`}
                className="font-medium text-primary underline underline-offset-4"
              >
                Sign in
              </Link>
            </CardContent>
          </Card>
        )}

        {myReview && (
          <Card className="mb-4 border-primary/30 bg-primary/5">
            <CardContent className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Your review</span>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="size-3.5 fill-current text-amber-500" />
                  {myReview.rating}
                </div>
              </div>
              {myReview.body && (
                <p className="text-sm text-muted-foreground">{myReview.body}</p>
              )}
            </CardContent>
          </Card>
        )}

        {otherReviews.length > 0 ? (
          <div className="space-y-4">
            {otherReviews.map((r) => (
              <Card key={r.id}>
                <CardContent className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {r.profiles?.full_name ?? "Anonymous traveler"}
                    </span>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="size-3.5 fill-current text-amber-500" />
                      {r.rating}
                    </div>
                  </div>
                  {r.body && (
                    <p className="text-sm text-muted-foreground">{r.body}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          !myReview && (
            <p className="text-sm text-muted-foreground">
              No reviews yet — be the first to share your experience.
            </p>
          )
        )}

        <div className="mt-8">
          <Link
            href="/destinations"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            ← Back to all destinations
          </Link>
        </div>
      </div>
    </div>
  );
}
