/**
 * Lightweight class-name merge utility.
 * Filters out falsy values and joins remaining classes with a space.
 */
export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(" ");
}
