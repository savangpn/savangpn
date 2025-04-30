import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import LoginForm from "@/components/login-form"

export default async function Home() {
  const supabase = createClient()

  // Check if user is already logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If logged in, redirect to appropriate dashboard
  if (session) {
    // Get user profile with privilege
    const { data: profile } = await supabase.from("profiles").select("privilege").eq("id", session.user.id).single()

    if (profile) {
      console.log("User privilege:", profile.privilege)
      if (profile.privilege === "admin") {
        redirect("/admin")
      } else {
        redirect("/dashboard")
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Ivan's Barber Academy Student Time Clock</h1>
          <p className="text-sm text-gray-600">Track your hours with ease</p>
        </div>

        <LoginForm />

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <a href="/signup" className="font-medium text-black hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
