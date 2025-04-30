import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ProfileForm from "@/components/profile-form"

export default async function ProfilePage() {
  const supabase = createClient()

  // Check if user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  // Get user profile with privilege
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  if (!profile) {
    redirect("/")
  }

  const isAdmin = profile.privilege === "admin"

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">{isAdmin ? "Admin" : "Student"} Profile</h1>
        <ProfileForm
          user={{
            id: session.user.id,
            email: session.user.email || "",
            name: profile.full_name || "",
          }}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  )
}
