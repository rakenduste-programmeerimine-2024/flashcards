import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  // The `/auth/callback` route handles the authentication callback.
  // It exchanges an auth code for the user's session.
  
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const origin = requestUrl.origin
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString()

  if (code) {
    const supabase = await createClient() // Create the Supabase client with cookies

    // Exchange the auth code for the user's session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Error exchanging code for session:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  // If `redirect_to` is provided, redirect the user there after successful auth
  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`)
  }

  // Default redirect to the homepage if no specific redirect URL is provided
  return NextResponse.redirect(`${origin}/homepage`)
}
