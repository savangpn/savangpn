import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const supabase = createClient()

    // Simple query to get time entries
    const { data, error } = await supabase
      .from("time_entries")
      .select("*")
      .eq("user_id", userId)
      .order("clock_in_time", { ascending: false })

    return NextResponse.json({
      userId,
      entriesFound: data?.length || 0,
      error: error ? error.message : null,
      entries: data || [],
    })
  } catch (error) {
    console.error("Simple debug endpoint error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
