"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/database.types"
import AdminUserTimeEntries from "./admin-user-time-entries"

interface AdminUserListProps {
  students: Profile[]
}

export default function AdminUserList({ students }: AdminUserListProps) {
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Delete user from profiles table
      const { error: deleteProfileError } = await supabase.from("profiles").delete().eq("id", userId)

      if (deleteProfileError) throw deleteProfileError

      // Delete user from auth
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId)

      if (deleteAuthError) throw deleteAuthError

      router.refresh()
    } catch (error: any) {
      setError(error.message || "Failed to delete user")
    } finally {
      setLoading(false)
    }
  }

  if (students.length === 0) {
    return <p className="text-gray-500">No students found.</p>
  }

  return (
    <div>
      {error && <div className="mb-4 rounded-md bg-red-50 p-2 text-sm text-red-500">{error}</div>}

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
            {students.map((student) => (
              <tr key={student.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{student.full_name}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {student.updated_at ? new Date(student.updated_at).toLocaleDateString() : "-"}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  <button
                    onClick={() => setSelectedUser(selectedUser?.id === student.id ? null : student)}
                    className="mr-2 text-indigo-600 hover:text-indigo-900"
                  >
                    {selectedUser?.id === student.id ? "Hide Entries" : "View Entries"}
                  </button>
                  <button
                    onClick={() => handleDeleteUser(student.id)}
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

      {selectedUser && (
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-medium">Time Entries for {selectedUser.full_name}</h3>
          <AdminUserTimeEntries userId={selectedUser.id} userName={selectedUser.full_name || undefined} />
        </div>
      )}
    </div>
  )
}
