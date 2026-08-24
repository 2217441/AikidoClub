/**
 * News expiry. An IIUM semester runs roughly four months, so an
 * announcement outlives its own semester but never survives into the next
 * one. Stale news is worse than no news: it makes an unmaintained club look
 * dead rather than quiet.
 */
export const NEWS_SHELF_LIFE_MONTHS = 4;

/** True if `date` is within the shelf life of `now`, or in the future. */
export function isFresh(
  date: Date,
  now: Date,
  shelfLifeMonths: number = NEWS_SHELF_LIFE_MONTHS,
): boolean {
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - shelfLifeMonths);
  return date.getTime() >= cutoff.getTime();
}

/** "October 2025". UTC, so the build is not affected by the runner's zone. */
export function formatNewsDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
