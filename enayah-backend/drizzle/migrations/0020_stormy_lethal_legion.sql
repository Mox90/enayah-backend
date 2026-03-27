CREATE TYPE "public"."pip_level" AS ENUM('moderate', 'critical');--> statement-breakpoint
ALTER TABLE "pips" ADD COLUMN "action_plan" text;--> statement-breakpoint
ALTER TABLE "pips" ADD COLUMN "review_frequency" varchar(50);--> statement-breakpoint
ALTER TABLE "pips" ADD COLUMN "assigned_to" uuid;--> statement-breakpoint
ALTER TABLE "pips" ADD COLUMN "level" "pip_level" DEFAULT 'moderate';