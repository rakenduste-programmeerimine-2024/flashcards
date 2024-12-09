import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString()

  // Get the current origin for the request
  const origin = process.env.NODE_ENV === 'production'
    ? requestUrl.origin  // Use the Vercel URL in production
    : "https://flashcards-eight-beryl.vercel.app/"  // Use localhost during development

  if (code) {
    const supabase = await createClient() // Create the Supabase client with cookies

    // Exchange the auth code for the user's session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Error exchanging code for session:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  // Redirect the user to the provided URL or default to the homepage
  const redirectUrl = redirectTo || "/homepage"
  return NextResponse.redirect(`${origin}${redirectUrl}`)
}
