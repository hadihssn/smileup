import { asc } from "drizzle-orm";
import { db } from "@/db";
import { services } from "@/db/schema";

export interface ServiceOption {
  id: string;
  title: string;
}

/** Used by the admin appointment form's service dropdown. */
export async function getServices(): Promise<ServiceOption[]> {
  return db
    .select({ id: services.id, title: services.title })
    .from(services)
    .orderBy(asc(services.title));
}
