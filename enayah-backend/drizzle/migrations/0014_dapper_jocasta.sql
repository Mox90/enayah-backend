DO $$ BEGIN
  CREATE TYPE "public"."appraisal_rating" AS ENUM(
    'outstanding',
    'exceeds',
    'meets',
    'needs_improvement',
    'unsatisfactory'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
ALTER TABLE "employee_appraisals" ALTER COLUMN "overall_rating" SET DATA TYPE "public"."appraisal_rating" USING "overall_rating"::"public"."appraisal_rating";