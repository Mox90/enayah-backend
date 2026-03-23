CREATE TABLE "employee_competencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appraisal_id" uuid NOT NULL,
	"competency_id" uuid NOT NULL,
	"relative_weight" numeric NOT NULL,
	"fulfillment_rating" integer,
	"weighted_score" numeric,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid,
	"version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "competencies" RENAME TO "competency_library";--> statement-breakpoint
ALTER TABLE "competency_library" DROP CONSTRAINT "competencies_appraisal_id_employee_appraisals_id_fk";
--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "employee_number_snapshot" varchar(50);--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "employee_name_snapshot" varchar(255);--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "job_title_snapshot" varchar(255);--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "department_snapshot" varchar(255);--> statement-breakpoint
ALTER TABLE "employee_appraisals" ADD COLUMN "comments" text;--> statement-breakpoint
ALTER TABLE "competency_library" ADD COLUMN "description_en" text;--> statement-breakpoint
ALTER TABLE "competency_library" ADD COLUMN "description_ar" text;--> statement-breakpoint
ALTER TABLE "employee_competencies" ADD CONSTRAINT "employee_competencies_appraisal_id_employee_appraisals_id_fk" FOREIGN KEY ("appraisal_id") REFERENCES "public"."employee_appraisals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_competencies" ADD CONSTRAINT "employee_competencies_competency_id_competency_library_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competency_library"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "emp_comp_unique" ON "employee_competencies" USING btree ("appraisal_id","competency_id");--> statement-breakpoint
ALTER TABLE "competency_library" DROP COLUMN "appraisal_id";--> statement-breakpoint
ALTER TABLE "competency_library" DROP COLUMN "relative_weight";--> statement-breakpoint
ALTER TABLE "competency_library" DROP COLUMN "fulfillment_rating";--> statement-breakpoint
ALTER TABLE "competency_library" DROP COLUMN "weighted_score";