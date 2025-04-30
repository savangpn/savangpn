import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = createClient()

  // Get all profiles
  const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*")

  // Get all time entries
  const { data: timeEntries, error: entriesError } = await supabase.from("time_entries").select("*")

  // Get students
  const { data: students, error: studentsError } = await supabase
    .from("profiles")
    .select("*")
    .eq("privilege", "student")

  // Process each student
  const studentStats = []
  if (students) {
    for (const student of students) {
      // Filter time entries for this student
      const studentEntries = timeEntries?.filter((entry) => entry.user_id === student.id) || []

      // Calculate total hours
      let totalMilliseconds = 0
      studentEntries.forEach((entry) => {
        if (entry.clock_out_time) {
          const clockIn = new Date(entry.clock_in_time).getTime()
          const clockOut = new Date(entry.clock_out_time).getTime()
          totalMilliseconds += clockOut - clockIn
        }
      })

      const totalHours = Math.floor(totalMilliseconds / (1000 * 60 * 60))
      const totalMinutes = Math.floor((totalMilliseconds % (1000 * 60 * 60)) / (1000 * 60))

      // Add to student stats
      studentStats.push({
        ...student,
        totalHours,
        totalMinutes,
        totalTimeFormatted: `${totalHours} hr ${totalMinutes} min`,
        entryCount: studentEntries.length,
        sampleEntries: studentEntries.slice(0, 2),
      })
    }
  }

  return NextResponse.json({
    profiles: {
      count: profiles?.length || 0,
      error: profilesError,
      data: profiles,
    },
    timeEntries: {
      count: timeEntries?.length || 0,
      error: entriesError,
      data: timeEntries,
    },
    students: {
      count: students?.length || 0,
      error: studentsError,
      data: students,
    },
    studentStats,
  })
}
