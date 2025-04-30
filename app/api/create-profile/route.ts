import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { userId, fullName } = await request.json()

    if (!userId || !fullName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createClient()

    // Check if profile already exists
    const { data: existingProfile } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (existingProfile) {
      return NextResponse.json({ success: true, message: "Profile already exists" })
    }

    // Create profile with service role (bypasses RLS)
    const { error } = await supabase.from("profiles").insert({
      id: userId,
      full_name: fullName,
      privilege: "student",
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error creating profile:", error)

      // If the error is due to a duplicate key, the profile was likely created already
      if (error.code === "23505") {
        // Unique violation
        return NextResponse.json({ success: true, message: "Profile already exists" })
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in create-profile API:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
