ALTER TABLE students ADD COLUMN IF NOT EXISTS gender text;

UPDATE students SET gender = 'male'   WHERE first_name = 'Borna';
UPDATE students SET gender = 'male'   WHERE first_name = 'Leo';
UPDATE students SET gender = 'female' WHERE first_name = 'India';
