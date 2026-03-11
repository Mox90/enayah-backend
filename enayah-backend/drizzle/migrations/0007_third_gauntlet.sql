CREATE TABLE "anomaly_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"type" varchar(50) NOT NULL,
	"severity" varchar(10) NOT NULL,
	"status" varchar(10) DEFAULT 'OPEN',
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
