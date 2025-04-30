import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = createClient()

  // Get all profiles
  const { data: profiles } = await supabase.from("profiles").select("*")

  // Get all time entries
  const { data: allTimeEntries } = await supabase.from("time_entries").select("*")

  // Get student with ID fe4968c5-b08b-460c-89ea-3236d86c0e0a (Sav)
  const { data: sav } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", "fe4968c5-b08b-460c-89ea-3236d86c0e0a")
    .single()

  // Get time entries for Sav using the admin approach
  const { data: savEntriesAdmin } = await supabase
    .from("time_entries")
    .select("*")
    .eq("user_id", "fe4968c5-b08b-460c-89ea-3236d86c0e0a")

  // Try different approaches to find Sav's entries
  const { data: savEntriesLowercase } = await supabase
    .from("time_entries")
    .select("*")
    .eq("user_id", "fe4968c5-b08b-460c-89ea-3236d86c0e0a".toLowerCase())

  const { data: savEntriesNoDashes } = await supabase
    .from("time_entries")
    .select("*")
    .eq("user_id", "fe4968c5-b08b-460c-89ea-3236d86c0e0a".replace(/-/g, ""))

  // Check if any time entries have Sav's name
  const savEntriesByName = allTimeEntries?.filter((entry) => {
    // Check if any field contains Sav's name
    return Object.values(entry).some((value) => typeof value === "string" && value.includes("Sav"))
  })

  // Check if there are any time entries with user_id matching any admin ID
  const adminIds = profiles?.filter((p) => p.privilege === "admin").map((p) => p.id) || []
  const adminEntries = allTimeEntries?.filter((entry) => adminIds.includes(entry.user_id)) || []

  return NextResponse.json({
    profiles: {
      count: profiles?.length || 0,
      data: profiles,
    },
    allTimeEntries: {
      count: allTimeEntries?.length || 0,
      data: allTimeEntries,
    },
    sav,
    savEntriesAdmin: {
      count: savEntriesAdmin?.length || 0,
      data: savEntriesAdmin,
    },
    savEntriesLowercase: {
      count: savEntriesLowercase?.length || 0,
      data: savEntriesLowercase,
    },
    savEntriesNoDashes: {
      count: savEntriesNoDashes?.length || 0,
      data: savEntriesNoDashes,
    },
    savEntriesByName: {
      count: savEntriesByName?.length || 0,
      data: savEntriesByName,
    },
    adminEntries: {
      count: adminEntries.length,
      data: adminEntries,
    },
  })
}
