CREATE TYPE "public"."pip_outcome" AS ENUM('successful', 'failed');--> statement-breakpoint
CREATE TABLE "training_effectiveness" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"training_id" uuid NOT NULL,
	"before_score" numeric,
	"after_score" numeric,
	"improvement" numeric,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "pips" ADD COLUMN "outcome" text;--> statement-breakpoint
ALTER TABLE "pips" ADD COLUMN "closed_at" timestamp;--> statement-breakpoint
ALTER TABLE "training_effectiveness" ADD CONSTRAINT "training_effectiveness_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_effectiveness" ADD CONSTRAINT "training_effectiveness_training_id_trainings_id_fk" FOREIGN KEY ("training_id") REFERENCES "public"."trainings"("id") ON DELETE cascade ON UPDATE no action;