import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <Compass className="size-12 text-primary" />
      <h1 className="text-3xl font-bold tracking-tight">
        Looks like you&apos;ve wandered off the map
      </h1>
      <p className="max-w-md text-muted-foreground">
        We couldn&apos;t find the page you were looking for. It may have
        been moved, or the destination isn&apos;t published yet.
      </p>
      <Button asChild>
        <Link href="/">Back to the homepage</Link>
      </Button>
    </div>
  );
}
