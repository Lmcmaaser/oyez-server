CREATE TYPE diagnosis_type_category AS ENUM (
  'test',
  'doctor',
  'self'
);

ALTER TABLE reports
  ADD COLUMN
    diagnosis_type diagnosis_type_category;
