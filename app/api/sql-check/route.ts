import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()

    // Direct SQL query for Sav's entries
    const { data, error } = await supabase
      .rpc("direct_sql_query", {
        sql_query: "SELECT * FROM time_entries WHERE user_id = 'fe4968c5-b08b-460c-89ea-3236d86c0e0a' LIMIT 5",
      })
      .catch((e) => ({ data: null, error: e }))

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*")

    return NextResponse.json({
      savEntries: {
        data,
        error: error ? error.message : null,
      },
      profiles: {
        data: profiles,
        error: profilesError ? profilesError.message : null,
      },
    })
  } catch (error) {
    console.error("SQL check endpoint error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
