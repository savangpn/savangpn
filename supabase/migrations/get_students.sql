CREATE OR REPLACE FUNCTION get_students()
RETURNS TABLE (
  id uuid,
  full_name text,
  privilege text,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.full_name, p.privilege, p.updated_at
  FROM profiles p
  WHERE p.privilege = 'student';
END;
$$ LANGUAGE plpgsql;
