// One-time seed: ports the static `services` and `hours` data from
// src/data/site.ts into the real database, so the app has real rows to
// query from day one instead of starting empty. Run with `npm run db:seed`
// after `npm run db:push` has created the tables.
//
// Safe to re-run: uses onConflictDoNothing so it won't duplicate rows.

import { db } from "./index";
import { services, clinicHours } from "./schema";
import { services as staticServices, hours as staticHours } from "../data/site";

const DAY_NAME_TO_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

function parseHourRange(time: string): { opensAt: string; closesAt: string } | null {
  if (time === "Closed") return null;
  // e.g. "9:00 AM – 7:00 PM" -> ["9:00 AM", "7:00 PM"]
  const [openRaw, closeRaw] = time.split("–").map((s) => s.trim());
  return { opensAt: to24Hour(openRaw), closesAt: to24Hour(closeRaw) };
}

function to24Hour(label: string): string {
  const [time, meridiem] = label.split(" ");
  const [hoursRaw, minutes] = time.split(":").map(Number);
  let hours = hoursRaw;
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}

async function seed() {
  await db
    .insert(services)
    .values(
      staticServices.map((s) => ({
        code: s.code,
        title: s.title,
        description: s.desc,
      })),
    )
    .onConflictDoNothing({ target: services.code });

  await db
    .insert(clinicHours)
    .values(
      staticHours.map((h) => {
        const range = parseHourRange(h.time);
        return {
          dayOfWeek: DAY_NAME_TO_INDEX[h.day],
          isClosed: range === null,
          opensAt: range?.opensAt ?? null,
          closesAt: range?.closesAt ?? null,
        };
      }),
    )
    .onConflictDoNothing({ target: clinicHours.dayOfWeek });

  console.log("Seed complete: services + clinic_hours populated.");
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
