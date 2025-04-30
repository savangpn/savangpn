import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = createClient()

  // Get all time entries
  const { data: allTimeEntries } = await supabase
    .from("time_entries")
    .select("*")
    .order("clock_in_time", { ascending: false })

  // Group entries by month
  const entriesByMonth: Record<string, any[]> = {}
  allTimeEntries?.forEach((entry) => {
    const date = new Date(entry.clock_in_time)
    const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`

    if (!entriesByMonth[monthYear]) {
      entriesByMonth[monthYear] = []
    }

    entriesByMonth[monthYear].push(entry)
  })

  // Calculate total hours for each month
  const monthlyStats = Object.entries(entriesByMonth).map(([monthYear, entries]) => {
    let totalMilliseconds = 0
    entries.forEach((entry) => {
      if (entry.clock_out_time) {
        const clockIn = new Date(entry.clock_in_time).getTime()
        const clockOut = new Date(entry.clock_out_time).getTime()
        totalMilliseconds += clockOut - clockIn
      }
    })

    const totalHours = Math.floor(totalMilliseconds / (1000 * 60 * 60))
    const totalMinutes = Math.floor((totalMilliseconds % (1000 * 60 * 60)) / (1000 * 60))

    return {
      monthYear,
      entries: entries.length,
      totalHours,
      totalMinutes,
      totalTimeFormatted: `${totalHours} hr ${totalMinutes} min`,
    }
  })

  // Get all unique user_ids from time entries
  const userIds = [...new Set(allTimeEntries?.map((entry) => entry.user_id))]

  // Get profiles for these user_ids
  const { data: relatedProfiles } = await supabase.from("profiles").select("*").in("id", userIds)

  return NextResponse.json({
    totalEntries: allTimeEntries?.length || 0,
    entriesByMonth,
    monthlyStats,
    userIds,
    relatedProfiles,
    sampleEntries: {
      march: entriesByMonth["2025-3"]?.slice(0, 3) || [],
      april: entriesByMonth["2025-4"]?.slice(0, 3) || [],
    },
  })
}
