import { asc } from "drizzle-orm";
import { db } from "@/db";
import { blockedDates } from "@/db/schema";

export interface BlockedDateRow {
  id: string;
  date: string;
  reason: string | null;
}

/** Upcoming and past blocked dates, soonest first — the admin dashboard
 * only really needs to see what's coming, but keeping history visible
 * (rather than filtering to future-only) makes it easy to tell "did I
 * already block this date" versus a duplicate submission. */
export async function getBlockedDates(): Promise<BlockedDateRow[]> {
  return db
    .select({ id: blockedDates.id, date: blockedDates.date, reason: blockedDates.reason })
    .from(blockedDates)
    .orderBy(asc(blockedDates.date));
}
