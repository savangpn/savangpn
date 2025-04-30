import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId") || "fe4968c5-b08b-460c-89ea-3236d86c0e0a"

    // Create a direct server-side client
    const supabase = createClient()

    // 1. Standard query
    const { data: standardQuery, error: standardError } = await supabase
      .from("time_entries")
      .select("*")
      .eq("user_id", userId)
      .order("clock_in_time", { ascending: false })

    // 2. Try with different case
    const { data: lowerCaseQuery, error: lowerCaseError } = await supabase
      .from("time_entries")
      .select("*")
      .eq("user_id", userId.toLowerCase())
      .order("clock_in_time", { ascending: false })

    // 3. Try with different table name variations
    const { data: timeEntriesQuery, error: timeEntriesError } = await supabase.from("time_entries").select("*").limit(1)

    // 4. Get auth status
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    return NextResponse.json({
      userId,
      standardQuery: {
        count: standardQuery?.length || 0,
        error: standardError ? standardError.message : null,
        sample: standardQuery?.slice(0, 2) || [],
      },
      lowerCaseQuery: {
        count: lowerCaseQuery?.length || 0,
        error: lowerCaseError ? lowerCaseError.message : null,
        sample: lowerCaseQuery?.slice(0, 2) || [],
      },
      timeEntriesQuery: {
        count: timeEntriesQuery?.length || 0,
        error: timeEntriesError ? timeEntriesError.message : null,
        sample: timeEntriesQuery?.slice(0, 2) || [],
      },
      authStatus: {
        isAuthenticated: !!session,
        userId: session?.user?.id || null,
        error: authError ? authError.message : null,
      },
      cookiesPresent: !!cookies().getAll().length,
    })
  } catch (error) {
    console.error("Debug endpoint error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
