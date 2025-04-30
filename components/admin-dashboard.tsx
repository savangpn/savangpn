"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Profile, TimeEntry } from "@/lib/database.types"

interface User {
  id: string
  email: string
  name: string | null
}

interface StudentStat extends Profile {
  totalHours: number
  totalMinutes: number
  totalTimeFormatted: string
  entries: TimeEntry[]
}

interface AdminDashboardProps {
  user: User
  studentStats: StudentStat[]
}

export default function AdminDashboard({ user, studentStats }: AdminDashboardProps) {
  const [selectedUser, setSelectedUser] = useState<StudentStat | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  console.log("AdminDashboard rendering with", studentStats.length, "students")
  studentStats.forEach((student) => {
    console.log(`- ${student.full_name}: ${student.totalTimeFormatted} (${student.entries.length} entries)`)
  })

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.refresh()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleDeleteTimeEntry = async (entryId: number) => {
    if (!confirm("Are you sure you want to delete this time entry? This action cannot be undone.")) {
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Delete the time entry
      const { error: deleteError } = await supabase.from("time_entries").delete().eq("id", entryId)

      if (deleteError) throw deleteError

      setSuccess("Time entry deleted successfully")
      router.refresh()
    } catch (error: any) {
      setError(error.message || "Failed to delete time entry")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (e) {
      return dateString
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch (e) {
      return dateString
    }
  }

  const calculateDuration = (clockIn: string, clockOut: string | null) => {
    if (!clockOut) return "—"

    try {
      const start = new Date(clockIn).getTime()
      const end = new Date(clockOut).getTime()
      const durationMs = end - start

      const hours = Math.floor(durationMs / (1000 * 60 * 60))
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

      return `${hours} hr ${minutes} min`
    } catch (e) {
      return "Invalid"
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome, {user.name || user.email.split("@")[0]}</p>
        </div>

        <div className="mb-4 flex justify-end gap-2">
          <button
            onClick={handleSignOut}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>

        {error && <div className="mb-4 rounded-md bg-red-50 p-2 text-sm text-red-500">{error}</div>}
        {success && <div className="mb-4 rounded-md bg-green-50 p-2 text-sm text-green-500">{success}</div>}

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Student Management</h2>

          {studentStats.length === 0 ? (
            <p className="text-gray-500">No students found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Total Hours
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Updated At
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {studentStats.map((student) => (
                    <tr key={student.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{student.full_name}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-blue-600 font-medium">
                        {student.totalTimeFormatted}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {student.updated_at ? formatDate(student.updated_at) : "-"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <button
                          onClick={() => setSelectedUser(selectedUser?.id === student.id ? null : student)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {selectedUser?.id === student.id ? "Hide Entries" : "View Entries"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedUser && (
            <div className="mt-8">
              <h3 className="mb-4 text-lg font-medium">Time Entries for {selectedUser.full_name}</h3>
              <div className="mb-4 rounded-md bg-blue-50 p-4">
                <p className="text-blue-800">
                  <strong>Total Time:</strong> {selectedUser.totalTimeFormatted}
                </p>
              </div>

              {selectedUser.entries.length === 0 ? (
                <p className="text-gray-500">No time entries found for this user.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
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
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {selectedUser.entries.map((entry) => (
                        <tr key={entry.id}>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {formatDate(entry.clock_in_time)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {formatDateTime(entry.clock_in_time)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {entry.clock_out_time ? formatDateTime(entry.clock_out_time) : "Active"}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {calculateDuration(entry.clock_in_time, entry.clock_out_time)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                            <button
                              onClick={() => handleDeleteTimeEntry(entry.id)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
