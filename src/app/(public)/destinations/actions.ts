"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type ReviewActionResult = { error?: string; success?: boolean };

export async function submitReview(
  destinationId: string,
  destinationSlug: string,
  _prev: ReviewActionResult | undefined,
  formData: FormData
): Promise<ReviewActionResult> {
  const rating = Number(formData.get("rating"));
  const body = formData.get("body")?.toString().trim() || null;

  if (!rating || rating < 1 || rating > 5) {
    return { error: "Please select a rating between 1 and 5." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to leave a review." };
  }

  // One review per user per destination — upsert on the unique constraint.
  const { error } = await supabase.from("reviews").upsert(
    {
      destination_id: destinationId,
      user_id: user.id,
      rating,
      body,
    },
    { onConflict: "destination_id,user_id" }
  );

  if (error) return { error: error.message };

  revalidatePath(`/destinations/${destinationSlug}`);
  return { success: true };
}
