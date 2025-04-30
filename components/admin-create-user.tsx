"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AdminCreateUser() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Create user in auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirect: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) throw signUpError

      if (!data.user) {
        throw new Error("Failed to create user")
      }

      // Add user to profiles table with student privilege
      const { error: insertError } = await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: fullName,
        privilege: "student",
        updated_at: new Date().toISOString(),
      })

      if (insertError) throw insertError

      setSuccess(`Student ${fullName} (${email}) created successfully!`)
      setEmail("")
      setPassword("")
      setFullName("")
      router.refresh()
    } catch (error: any) {
      setError(error.message || "Failed to create user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleCreateUser} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
          />
        </div>
      </div>

      {error && <div className="rounded-md bg-red-50 p-2 text-sm text-red-500">{error}</div>}

      {success && <div className="rounded-md bg-green-50 p-2 text-sm text-green-500">{success}</div>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-black py-2 px-4 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Student"}
      </button>
    </form>
  )
}
