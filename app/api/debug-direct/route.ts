import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = createClient()

  // Get all profiles
  const { data: profiles } = await supabase.from("profiles").select("*")

  // Get all time entries
  const { data: timeEntries } = await supabase.from("time_entries").select("*")

  // Get students
  const { data: students } = await supabase.from("profiles").select("*").eq("privilege", "student")

  // Direct analysis of the relationship
  const analysis = {
    profileIds: profiles?.map((p) => p.id) || [],
    timeEntryUserIds: timeEntries?.map((t) => t.user_id) || [],
    matches: [],
  }

  // Find direct matches between profile IDs and time entry user_ids
  if (profiles && timeEntries) {
    for (const profile of profiles) {
      const matchingEntries = timeEntries.filter((entry) => entry.user_id === profile.id)
      if (matchingEntries.length > 0) {
        analysis.matches.push({
          profileId: profile.id,
          profileName: profile.full_name,
          privilege: profile.privilege,
          matchingEntryCount: matchingEntries.length,
          sampleEntry: matchingEntries[0],
        })
      }
    }
  }

  // Check for student entries specifically
  const studentEntryAnalysis = []
  if (students && timeEntries) {
    for (const student of students) {
      const exactMatches = timeEntries.filter((entry) => entry.user_id === student.id)
      const caseInsensitiveMatches = timeEntries.filter(
        (entry) => entry.user_id.toLowerCase() === student.id.toLowerCase(),
      )
      const noDashMatches = timeEntries.filter(
        (entry) => entry.user_id.replace(/-/g, "") === student.id.replace(/-/g, ""),
      )

      studentEntryAnalysis.push({
        studentId: student.id,
        studentName: student.full_name,
        exactMatchCount: exactMatches.length,
        caseInsensitiveMatchCount: caseInsensitiveMatches.length,
        noDashMatchCount: noDashMatches.length,
        sampleExactMatch: exactMatches[0] || null,
        sampleCaseInsensitiveMatch: caseInsensitiveMatches[0] || null,
        sampleNoDashMatch: noDashMatches[0] || null,
      })
    }
  }

  return NextResponse.json({
    profileCount: profiles?.length || 0,
    timeEntryCount: timeEntries?.length || 0,
    studentCount: students?.length || 0,
    analysis,
    studentEntryAnalysis,
  })
}
