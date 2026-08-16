ALTER TYPE "public"."appointment_status" ADD VALUE 'completed' BEFORE 'cancelled';--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "charge_amount" integer;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "is_manual_entry" boolean DEFAULT false NOT NULL;