"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface User {
  id: string
  email: string
  name: string | null
}

interface DashboardHeaderProps {
  user: User
  isAdmin: boolean
}

export default function DashboardHeader({ user, isAdmin }: DashboardHeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    setIsLoggingOut(true)

    try {
      await supabase.auth.signOut()
      router.refresh()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto flex max-w-5xl items-center justify-between p-4">
        <div>
          <h1 className="text-xl font-bold">Student Time Clock</h1>
          <p className="text-sm text-gray-600">
            Welcome, {user.name || user.email} {isAdmin && "(Admin)"}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {isAdmin && (
            <button
              onClick={() => router.push("/admin")}
              className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Admin Dashboard
            </button>
          )}

          <button
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>
    </header>
  )
}
