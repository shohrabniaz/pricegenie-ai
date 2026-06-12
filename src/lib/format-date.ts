const DATE_FORMAT = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Australia/Sydney",
});

const RELATIVE_FORMAT = new Intl.RelativeTimeFormat("en-AU", { numeric: "auto" });

export function formatPriceDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return DATE_FORMAT.format(new Date(y, m - 1, d));
}

export function formatPriceAge(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const then = new Date(y, m - 1, d);
  const now = new Date();
  const diffDays = Math.round((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));

  if (Math.abs(diffDays) < 1) return "today";
  if (Math.abs(diffDays) === 1) return diffDays > 0 ? "yesterday" : "tomorrow";
  return RELATIVE_FORMAT.format(-diffDays, "day");
}
