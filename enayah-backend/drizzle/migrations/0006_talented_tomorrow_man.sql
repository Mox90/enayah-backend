CREATE TABLE "login_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"username" varchar(100),
	"success" boolean NOT NULL,
	"ip_address" varchar(100),
	"user_agent" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
