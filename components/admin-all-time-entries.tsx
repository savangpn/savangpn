"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { TimeEntry, Profile } from "@/lib/database.types"

export default function AdminAllTimeEntries() {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [students, setStudents] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch all time entries
        const { data: timeEntries, error: entriesError } = await supabase
          .from("time_entries")
          .select("*")
          .order("clock_in_time", { ascending: false })

        if (entriesError) throw entriesError
        setEntries(timeEntries || [])

        // Fetch all student profiles
        const { data: studentProfiles, error: studentsError } = await supabase
          .from("profiles")
          .select("*")
          .eq("privilege", "student")

        if (studentsError) throw studentsError
        setStudents(studentProfiles || [])
      } catch (error: any) {
        setError(error.message || "Failed to fetch data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return "In progress"

    const startTime = new Date(start).getTime()
    const endTime = new Date(end).getTime()
    const durationMs = endTime - startTime

    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  const getStudentName = (userId: string) => {
    const student = students.find((s) => s.id === userId)
    return student ? student.full_name : "Unknown"
  }

  if (loading) {
    return <p className="text-gray-500">Loading time entries...</p>
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>
  }

  if (entries.length === 0) {
    return <p className="text-gray-500">No time entries found in the system.</p>
  }

  return (
    <div>
      <h3 className="mb-4 text-lg font-medium">All Time Entries</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Student
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Clock In
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Clock Out
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Duration
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{getStudentName(entry.user_id)}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {new Date(entry.clock_in_time).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {new Date(entry.clock_in_time).toLocaleTimeString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {entry.clock_out_time ? new Date(entry.clock_out_time).toLocaleTimeString() : "In progress"}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {formatDuration(entry.clock_in_time, entry.clock_out_time)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
