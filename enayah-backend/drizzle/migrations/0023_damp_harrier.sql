-- 🧹 CLEANUP ORPHAN NOTIFICATIONS
UPDATE notifications
SET recipient_id = NULL
WHERE recipient_id IS NOT NULL
AND recipient_id NOT IN (SELECT id FROM users);

-- 🧹 CLEANUP ORPHAN ROLE COMPETENCIES
DELETE FROM role_competencies
WHERE competency_id NOT IN (SELECT id FROM competency_library);

-- 🧹 REMOVE DUPLICATE PIPS (KEEP LATEST)
DELETE FROM pips a
USING pips b
WHERE a.id < b.id
AND a.appraisal_id = b.appraisal_id
AND a.is_deleted = false
AND b.is_deleted = false;

-- 🧹 REMOVE DUPLICATE TRAINING ASSIGNMENTS
DELETE FROM training_assignments a
USING training_assignments b
WHERE a.id < b.id
AND a.employee_id = b.employee_id
AND a.training_id = b.training_id
AND a.is_deleted = false
AND b.is_deleted = false;

ALTER TABLE "training_assignments" ADD COLUMN "horizon" varchar(50);--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_competencies" ADD CONSTRAINT "role_competencies_competency_id_competency_library_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competency_library"("id") ON DELETE no action ON UPDATE no action;
-- 🟣 PIP uniqueness (soft delete safe)
CREATE UNIQUE INDEX pips_unique_appraisal
ON pips (appraisal_id)
WHERE is_deleted = false;

-- 🟣 Training assignment uniqueness (soft delete safe)
CREATE UNIQUE INDEX training_assignments_unique_active
ON training_assignments (employee_id, training_id)
WHERE is_deleted = false;