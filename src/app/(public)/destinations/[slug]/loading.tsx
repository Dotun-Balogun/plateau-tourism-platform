export default function Loading() {
  return (
    <div>
      <div className="aspect-21/9 w-full animate-pulse bg-muted" />
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-10">
        <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
        <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-20 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
