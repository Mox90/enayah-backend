-- Custom SQL migration file, put your code below! --
-- backfill phase safely
UPDATE employee_appraisals
SET phase =
  CASE
    WHEN status IN ('draft', 'manager_review') THEN 'planning'
    WHEN status IN ('submitted', 'hr_review', 'closed') THEN 'evaluation'
    ELSE 'planning'
  END;

-- enforce constraint
ALTER TABLE employee_appraisals
ALTER COLUMN phase SET NOT NULL;

ALTER TABLE employee_appraisals
ADD CONSTRAINT phase_check
CHECK (phase IN ('planning', 'evaluation'));