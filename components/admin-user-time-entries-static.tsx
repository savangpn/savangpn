import type { TimeEntry } from "@/lib/database.types"

interface AdminUserTimeEntriesStaticProps {
  entries: TimeEntry[]
}

export default function AdminUserTimeEntriesStatic({ entries }: AdminUserTimeEntriesStaticProps) {
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

  if (!entries || entries.length === 0) {
    return <p className="text-gray-500">No time entries found for this user.</p>
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
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{formatDate(entry.clock_in_time)}</td>
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
  )
}
