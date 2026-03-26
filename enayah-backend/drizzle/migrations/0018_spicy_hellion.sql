-- Custom SQL migration file, put your code below! --
UPDATE employee_appraisals
SET phase =
UPDATE employee_appraisals
SET phase =
  CASE
    WHEN status IN ('draft', 'manager_review') THEN 'planning'
    WHEN status IN ('submitted', 'hr_review', 'calibrated', 'closed') THEN 'evaluation'
    ELSE 'planning'
  END;
  END;