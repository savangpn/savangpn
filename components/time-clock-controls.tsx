"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { TimeEntry } from "@/lib/database.types"

interface TimeClockControlsProps {
  userId: string
  isClockedIn: boolean
  currentEntry: TimeEntry | null
}

export default function TimeClockControls({ userId, isClockedIn, currentEntry }: TimeClockControlsProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleClockIn = async () => {
    setLoading(true)

    try {
      await supabase.from("time_entries").insert({
        user_id: userId,
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-medium">
            Status:{" "}
            <span className={isClockedIn ? "text-green-600" : "text-red-600"}>
              {isClockedIn ? "Clocked In" : "Clocked Out"}
            </span>
          </p>
          {isClockedIn && currentEntry && (
            <p className="text-sm text-gray-600">
              Clocked in at: {new Date(currentEntry.clock_in_time).toLocaleString()}
            </p>
          )}
        </div>

        <div>
          {isClockedIn ? (
            <button
              onClick={handleClockOut}
              disabled={loading}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Clock Out"}
            </button>
          ) : (
            <button
              onClick={handleClockIn}
              disabled={loading}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Clock In"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
