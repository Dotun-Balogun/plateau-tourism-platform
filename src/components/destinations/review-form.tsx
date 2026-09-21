"use client";

import * as React from "react";
import { useActionState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { submitReview } from "@/app/(public)/destinations/actions";

export function ReviewForm({
  destinationId,
  destinationSlug,
  existingReview,
}: {
  destinationId: string;
  destinationSlug: string;
  existingReview?: { rating: number; body: string | null } | null;
}) {
  const action = submitReview.bind(null, destinationId, destinationSlug);
  const [state, formAction, isPending] = useActionState(action, undefined);
  const [rating, setRating] = React.useState(existingReview?.rating ?? 0);
  const [hoverRating, setHoverRating] = React.useState(0);

  React.useEffect(() => {
    if (state?.error) toast.error(state.error);
    if (state?.success) toast.success(existingReview ? "Review updated" : "Review posted");
  }, [state, existingReview]);

  return (
    <form action={formAction} className="space-y-3 rounded-lg border p-4">
      <p className="text-sm font-medium">
        {existingReview ? "Edit your review" : "Leave a review"}
      </p>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-0.5"
          >
            <Star
              className={`size-6 ${
                star <= (hoverRating || rating)
                  ? "fill-current text-amber-500"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
        <input type="hidden" name="rating" value={rating} />
      </div>

      <textarea
        name="body"
        rows={3}
        defaultValue={existingReview?.body ?? ""}
        placeholder="Share what stood out about your visit..."
        className="border-input dark:bg-input/30 flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
      />

      <Button type="submit" size="sm" disabled={isPending || rating === 0}>
        {isPending ? "Saving..." : existingReview ? "Update review" : "Post review"}
      </Button>
    </form>
  );
}
