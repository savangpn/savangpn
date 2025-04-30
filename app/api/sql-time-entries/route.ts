import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const userId = url.searchParams.get("userId")

  const supabase = createClient()

  // Execute direct SQL query to get time entries
  const { data: directSqlEntries, error: directSqlError } = await supabase.rpc("get_time_entries_for_user", {
    user_id_param: userId,
  })

  // Get time entries using the standard query builder
  const { data: queryBuilderEntries, error: queryBuilderError } = await supabase
    .from("time_entries")
    .select("*")
    .eq("user_id", userId || "")
    .order("clock_in_time", { ascending: false })

  return NextResponse.json({
    userId,
    directSql: {
      entries: directSqlEntries,
      error: directSqlError,
    },
    queryBuilder: {
      entries: queryBuilderEntries,
      error: queryBuilderError,
    },
  })
}
