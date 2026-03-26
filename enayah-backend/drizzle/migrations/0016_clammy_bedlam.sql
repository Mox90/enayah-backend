ALTER TABLE "employee_appraisals" ADD COLUMN "phase" varchar(50) DEFAULT 'planning';--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "planning_submitted_at" timestamp;--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "planning_submitted_by" uuid;--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "planning_acknowledged_at" timestamp;--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "planning_acknowledged_by" uuid;--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "final_submitted_at" timestamp;--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "final_submitted_by" uuid;--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "final_acknowledged_at" timestamp;--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "final_acknowledged_by" uuid;--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "hr_approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "hr_approved_by" uuid;--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "is_rejected" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "calibrated_at" timestamp;--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "calibrated_by" uuid;--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "manager_signed_at" timestamp;--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "manager_signed_by" uuid;--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "employee_signed_at" timestamp;--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "employee_signed_by" uuid;