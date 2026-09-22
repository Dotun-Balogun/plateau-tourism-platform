import Link from "next/link";
import { ChevronRight, Plus, SquarePen } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { DestinationRowActions } from "@/components/admin/destination-row-actions";

type Row = {
  id: string;
  slug: string;
  name: string;
  region: string | null;
  is_published: boolean;
  avg_rating: number;
  review_count: number;
};

async function getAllDestinations(): Promise<Row[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("destinations")
    .select("id, slug, name, region, is_published, avg_rating, review_count")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export default async function AdminDestinationsPage() {
  const destinations = await getAllDestinations();

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Destinations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {destinations.length} total
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/destinations/new">
            <Plus className="size-4" />
            New destination
          </Link>
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {destinations.map((d) => (
          <Card key={d.id}>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                {/*
                  The whole name row is the tappable target, with an
                  always-visible edit icon + chevron — hover:underline alone
                  gives a mobile admin no signal that this navigates anywhere.
                */}
                <Link
                  href={`/admin/destinations/${d.id}`}
                  className="group -mx-2 flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent"
                >
                  <SquarePen className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate font-medium">{d.name}</span>
                  <Badge
                    variant={d.is_published ? "default" : "outline"}
                    className="shrink-0"
                  >
                    {d.is_published ? "Published" : "Draft"}
                  </Badge>
                  <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 sm:hidden" />
                </Link>
                <p className="mt-1 truncate px-2 text-xs text-muted-foreground sm:text-sm">
                  {d.region ?? "No region set"} · {d.review_count} reviews · {d.avg_rating.toFixed(1)}★
                </p>
              </div>

              <div className="flex justify-end sm:justify-start">
                <DestinationRowActions
                  destinationId={d.id}
                  isPublished={d.is_published}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {destinations.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center text-sm text-muted-foreground">
              No destinations yet. Create your first one.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}