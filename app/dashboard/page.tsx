import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import StudentDashboard from "@/components/student-dashboard"

export default async function Dashboard() {
  const supabase = createClient()

  // Check if user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  // Get user profile with privilege
  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  // If no profile or error, redirect to login
  if (error || !profile) {
    redirect("/")
  }

  // If admin, redirect to admin dashboard
  if (profile.privilege === "admin") {
    redirect("/admin")
  }

  // Get all time entries for the student
  const { data: timeEntries } = await supabase
    .from("time_entries")
    .select("*")
    .eq("user_id", session.user.id)
    .order("clock_in_time", { ascending: false })

  // Get latest time entry to check if clocked in
  const latestEntry = timeEntries && timeEntries.length > 0 ? timeEntries[0] : null
  const isClockedIn = latestEntry && !latestEntry.clock_out_time

  return (
    <StudentDashboard
      user={{
        id: session.user.id,
        email: session.user.email || "",
        name: profile?.full_name || "",
      }}
      timeEntries={timeEntries || []}
      isClockedIn={isClockedIn}
      currentEntry={isClockedIn ? latestEntry : null}
    />
  )
}
