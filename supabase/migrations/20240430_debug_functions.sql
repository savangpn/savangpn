-- Function to get RLS policies
CREATE OR REPLACE FUNCTION get_rls_policies()
RETURNS TABLE (
  table_name text,
  policy_name text,
  roles text[],
  cmd text,
  qual text,
  with_check text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.tablename::text,
    p.policyname::text,
    p.roles::text[],
    p.cmd::text,
    p.qual::text,
    p.with_check::text
  FROM
    pg_policies p
  WHERE
    p.schemaname = 'public'
  ORDER BY
    p.tablename, p.policyname;
END;
$$ LANGUAGE plpgsql;

-- Function to execute SQL directly
CREATE OR REPLACE FUNCTION execute_sql(query text)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE 'SELECT json_agg(t) FROM (' || query || ') t' INTO result;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql;
