-- Update one candidate's email to the test email
UPDATE candidate_profiles
SET email = 'aibarerzhuman13@gmail.com'
WHERE id = (
  SELECT id FROM candidate_profiles 
  LIMIT 1
);
