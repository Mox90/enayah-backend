ALTER TABLE "employee_appraisals" ADD COLUMN "acknowledged_at" timestamp;--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "acknowledged_by" uuid;