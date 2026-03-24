CREATE TABLE "appraisal_approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appraisal_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(50) NOT NULL,
	"action" varchar(50) NOT NULL,
	"remarks" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "employee_name_ar_snapshot" varchar(255);--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "job_title_ar_snapshot" varchar(255);--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "department_ar_snapshot" varchar(255);--> statement-breakpoint
ALTER TABLE "pips" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "appraisal_approvals" ADD CONSTRAINT "appraisal_approvals_appraisal_id_employee_appraisals_id_fk" FOREIGN KEY ("appraisal_id") REFERENCES "public"."employee_appraisals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competency_themes" ADD CONSTRAINT "competency_themes_competency_id_competency_library_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competency_library"("id") ON DELETE restrict ON UPDATE no action;