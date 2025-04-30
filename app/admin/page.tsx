import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AdminDashboard from "@/components/admin-dashboard"

export default async function AdminPage() {
  const supabase = createClient()

  // Check if user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  if (!profile || profile.privilege !== "admin") {
    redirect("/dashboard")
  }

  // Get all student profiles
  const { data: students } = await supabase
    .from("profiles")
    .select("*")
    .eq("privilege", "student")
    .order("full_name", { ascending: true })

  // Process each student to get their time entries and stats
  const studentStats = []

  if (students) {
    for (const student of students) {
      // Get time entries for this student
      const { data: entries } = await supabase
        .from("time_entries")
        .select("*")
        .eq("user_id", student.id)
        .order("clock_in_time", { ascending: false })

      // Calculate total time
      let totalMilliseconds = 0
      if (entries) {
        entries.forEach((entry) => {
          if (entry.clock_out_time) {
            const clockIn = new Date(entry.clock_in_time).getTime()
            const clockOut = new Date(entry.clock_out_time).getTime()
            totalMilliseconds += clockOut - clockIn
          }
        })
      }

      const totalHours = Math.floor(totalMilliseconds / (1000 * 60 * 60))
      const totalMinutes = Math.floor((totalMilliseconds % (1000 * 60 * 60)) / (1000 * 60))

      studentStats.push({
        ...student,
        totalHours,
        totalMinutes,
        totalTimeFormatted: `${totalHours} hr ${totalMinutes} min`,
        entries: entries || [],
      })
    }
  }

  return (
    <AdminDashboard
      user={{
        id: session.user.id,
        email: session.user.email || "",
        name: profile.full_name || "",
      }}
      studentStats={studentStats}
    />
  )
}
