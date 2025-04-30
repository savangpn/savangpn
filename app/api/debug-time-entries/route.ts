import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const userId = url.searchParams.get("userId")

  const supabase = createClient()

  // Get all time entries
  const { data: allEntries, error: allEntriesError } = await supabase
    .from("time_entries")
    .select("*")
    .order("clock_in_time", { ascending: false })
    .limit(10)

  // Get specific user entries if userId is provided
  let userEntries = null
  let userEntriesError = null

  if (userId) {
    const { data, error } = await supabase
      .from("time_entries")
      .select("*")
      .eq("user_id", userId)
      .order("clock_in_time", { ascending: false })

    userEntries = data
    userEntriesError = error
  }

  // Get all profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .eq("privilege", "student")
    .limit(10)

  return NextResponse.json({
    allEntries: {
      count: allEntries?.length || 0,
      error: allEntriesError,
      sample: allEntries?.slice(0, 3),
      fields: allEntries && allEntries.length > 0 ? Object.keys(allEntries[0]) : [],
    },
    userEntries: userId
      ? {
          userId,
          count: userEntries?.length || 0,
          error: userEntriesError,
          sample: userEntries?.slice(0, 3),
        }
      : null,
    profiles: {
      count: profiles?.length || 0,
      error: profilesError,
      sample: profiles?.slice(0, 3),
    },
  })
}
