ALTER TABLE "users" ALTER COLUMN "is_active" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "countries" ADD CONSTRAINT "countries_alpha2_unique" UNIQUE("alpha2");