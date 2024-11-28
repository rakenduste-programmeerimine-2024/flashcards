import { signOutAction } from "@/app/actions"
import { hasEnvVars } from "@/utils/supabase/check-env-vars"
import Link from "next/link"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { createClient } from "@/utils/supabase/server"

export default async function AuthButton() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!hasEnvVars) {
    return (
      <>
        <div className="flex gap-4 items-center">
          <div>
            <Badge
              variant={"default"}
              className="font-normal pointer-events-none"
            >
              Please update .env.local file with anon key and url
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              asChild
              size="lg"
              variant={"outline"}
              disabled
              className="opacity-75 cursor-none pointer-events-none"
            >
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant={"default"}
              disabled
              className="opacity-75 cursor-none pointer-events-none"
            >
              <Link href="/sign-up">Sign up</Link>
            </Button>
          </div>
        </div>
      </>
    )
  }
  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <form action={signOutAction}>
        <Button
          type="submit"
          variant={"outline"}
          className="px-6 py-3 text-lg"
        >
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-4">
      <Button
        asChild
        variant={"outline"}
        className="px-6 py-3 text-lg" 
      >
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button
        asChild
        variant={"default"}
        className="px-6 py-3 text-lg"
      >
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  )
}
