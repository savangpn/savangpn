"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { TimeEntry } from "@/lib/database.types"

interface User {
  id: string
  email: string
  name: string | null
}

interface StudentDashboardProps {
  user: User
  timeEntries: TimeEntry[]
  isClockedIn: boolean
  currentEntry: TimeEntry | null
}

export default function StudentDashboard({ user, timeEntries, isClockedIn, currentEntry }: StudentDashboardProps) {
  const [loading, setLoading] = useState(false)
  const [currentSessionTime, setCurrentSessionTime] = useState("0 hr 0 min")
  const router = useRouter()
  const supabase = createClient()

  // Calculate total time from all entries
  const totalTime = timeEntries.reduce((total, entry) => {
    if (!entry.clock_out_time) return total

    const start = new Date(entry.clock_in_time).getTime()
    const end = new Date(entry.clock_out_time).getTime()
    return total + (end - start)
  }, 0)

  const totalHours = Math.floor(totalTime / (1000 * 60 * 60))
  const totalMinutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60))
  const totalTimeFormatted = `${totalHours} hr ${totalMinutes} min`

  // Update current session timer
  useEffect(() => {
    if (!isClockedIn || !currentEntry) return

    const interval = setInterval(() => {
      const start = new Date(currentEntry.clock_in_time).getTime()
      const now = new Date().getTime()
      const diff = now - start

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      setCurrentSessionTime(`${hours} hr ${minutes} min`)
    }, 60000) // Update every minute

    // Initial calculation
    const start = new Date(currentEntry.clock_in_time).getTime()
    const now = new Date().getTime()
    const diff = now - start

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    setCurrentSessionTime(`${hours} hr ${minutes} min`)

    return () => clearInterval(interval)
  }, [isClockedIn, currentEntry])

  const handleClockIn = async () => {
    setLoading(true)

    try {
      await supabase.from("time_entries").insert({
        user_id: user.id,
        clock_in_time: new Date().toISOString(),
      })

      router.refresh()
    } catch (error) {
      console.error("Error clocking in:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClockOut = async () => {
    if (!currentEntry) return
    setLoading(true)

    try {
      await supabase
        .from("time_entries")
        .update({
          clock_out_time: new Date().toISOString(),
        })
        .eq("id", currentEntry.id)

      router.refresh()
    } catch (error) {
      console.error("Error clocking out:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.refresh()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return "—"

    const startTime = new Date(start).getTime()
    const endTime = new Date(end).getTime()
    const durationMs = endTime - startTime

    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

    if (hours === 0) {
      return `${minutes} min`
    }

    return `${hours} hr ${minutes} min`
  }

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr)
    return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}, ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
  }

  const formatDate = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr)
    return date.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" })
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Student Time Clock</h1>
          <p className="text-gray-600">Track your hours with ease</p>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Welcome, {user.name || user.email.split("@")[0]}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/profile")}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Profile
            </button>
            <button
              onClick={handleSignOut}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="mb-8 flex justify-center gap-4">
          {!isClockedIn ? (
            <button
              onClick={handleClockIn}
              disabled={loading}
              className="rounded-md bg-green-400 px-8 py-3 text-center text-white hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Clock In
            </button>
          ) : (
            <button
              onClick={handleClockOut}
              disabled={loading}
              className="rounded-md bg-red-500 px-8 py-3 text-center text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Clock Out
            </button>
          )}
        </div>

        {isClockedIn && (
          <div className="mb-8 text-center">
            <p className="text-gray-600">Current session:</p>
            <p className="text-2xl font-bold">{currentSessionTime}</p>
          </div>
        )}

        <div className="mt-10">
          <h2 className="mb-4 text-xl font-semibold">Your Time Entries</h2>

          <div className="mb-4 rounded-md bg-blue-50 p-4">
            <p className="text-blue-800">
              <strong>Total Time:</strong> {totalTimeFormatted}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {timeEntries.map((entry) => (
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
                      {formatDuration(entry.clock_in_time, entry.clock_out_time)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
