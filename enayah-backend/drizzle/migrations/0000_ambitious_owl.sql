CREATE TYPE "public"."appraisal_status" AS ENUM('draft', 'submitted', 'manager_review', 'hr_review', 'closed');--> statement-breakpoint
CREATE TYPE "public"."pip_status" AS ENUM('active', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'hr', 'manager', 'employee', 'director');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"table_name" varchar(100) NOT NULL,
	"record_id" uuid NOT NULL,
	"action" varchar(20) NOT NULL,
	"old_data" jsonb,
	"new_data" jsonb,
	"performed_by" uuid,
	"created_at" timestamp DEFAULT now()
);
