CREATE TABLE "consent_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"employee_id" uuid,
	"consent_type" varchar(100) NOT NULL,
	"version" varchar(20),
	"given" boolean NOT NULL,
	"ip_address" varchar(50),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
