/** Money is stored in kobo (integer, lowest NGN unit) — this is the one place it becomes a display string. */
export function formatNaira(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;
}
