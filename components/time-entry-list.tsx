import type { TimeEntry } from "@/lib/database.types"

interface TimeEntryListProps {
  entries: TimeEntry[]
}

export default function TimeEntryList({ entries }: TimeEntryListProps) {
  if (entries.length === 0) {
    return <p className="text-gray-500">No time entries found.</p>
  }

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return "In progress"

    const startTime = new Date(start).getTime()
    const endTime = new Date(end).getTime()
    const durationMs = endTime - startTime

    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Clock In
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Clock Out
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
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
  )
}
