/**
 * Deterministically derives a pin color from a category slug/name, so new
 * categories automatically get a distinct, consistent color without any
 * manual mapping to maintain.
 */
export function categoryColor(seed: string | null | undefined): string {
  const input = seed || "default";
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 45%)`;
}
