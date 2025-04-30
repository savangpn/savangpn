"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { TimeEntry } from "@/lib/database.types"

interface AdminUserTimeEntriesProps {
  userId: string
  userName?: string
}

export default function AdminUserTimeEntries({ userId, userName }: AdminUserTimeEntriesProps) {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchTimeEntries = async () => {
      setLoading(true)
      setError(null)

      try {
        console.log("Fetching time entries for user:", userId)

        // First, try the normal query
        const { data, error } = await supabase
          .from("time_entries")
          .select("*")
          .eq("user_id", userId)
          .order("clock_in_time", { ascending: false })

        if (error) {
          throw error
        }

        console.log(`Found ${data?.length || 0} entries for user ${userId}`)
        setEntries(data || [])

        // Store debug info
        setDebugInfo({
          userId,
          entriesFound: data?.length || 0,
          firstEntry: data && data.length > 0 ? data[0] : null,
          query: {
            table: "time_entries",
            filter: { user_id: userId },
            orderBy: { clock_in_time: "desc" },
          },
        })
      } catch (error: any) {
        console.error("Error fetching time entries:", error)
        setError(error.message || "Failed to fetch time entries")
        setDebugInfo({
          error: error.message || "Unknown error",
          userId,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTimeEntries()
  }, [userId, supabase])

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return "In progress"

    const startTime = new Date(start).getTime()
    const endTime = new Date(end).getTime()
    const durationMs = endTime - startTime

    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  // Calculate total time
  const totalTime = entries.reduce((total, entry) => {
    if (!entry.clock_out_time) return total

    const startTime = new Date(entry.clock_in_time).getTime()
    const endTime = new Date(entry.clock_out_time).getTime()
    return total + (endTime - startTime)
  }, 0)

  const totalHours = Math.floor(totalTime / (1000 * 60 * 60))
  const totalMinutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60))
  const totalTimeFormatted = `${totalHours}h ${totalMinutes}m`

  if (loading) {
    return <p className="text-gray-500">Loading time entries...</p>
  }

  if (error) {
    return (
      <div>
        <p className="text-red-500">Error: {error}</p>
        {debugInfo && (
          <div className="mt-4 rounded-md bg-gray-100 p-4">
            <h4 className="font-medium">Debug Information:</h4>
            <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div>
        <p className="text-gray-500">No time entries found for this student.</p>
        {debugInfo && (
          <div className="mt-4 rounded-md bg-gray-100 p-4">
            <h4 className="font-medium">Debug Information:</h4>
            <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 rounded-md bg-blue-50 p-4">
        <p className="text-blue-800">
          <strong>Total Time:</strong> {totalTimeFormatted}
        </p>
        <p className="text-blue-800">
          <strong>Total Entries:</strong> {entries.length}
        </p>
      </div>

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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {entries.map((entry) => (
              <tr key={entry.id}>
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
