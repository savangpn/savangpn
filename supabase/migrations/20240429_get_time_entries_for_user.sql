-- Function to get time entries for a specific user
CREATE OR REPLACE FUNCTION get_time_entries_for_user(user_id_param UUID)
RETURNS TABLE (
  id INT8,
  user_id UUID,
  clock_in_time TIMESTAMPTZ,
  clock_out_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    te.id,
    te.user_id,
    te.clock_in_time,
    te.clock_out_time,
    te.created_at
  FROM 
    time_entries te
  WHERE 
    te.user_id = user_id_param
  ORDER BY 
    te.clock_in_time DESC;
END;
$$ LANGUAGE plpgsql;
