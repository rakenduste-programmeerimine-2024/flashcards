import { signUpAction } from "@/app/actions"
import { FormMessage, Message } from "@/components/form-message"
import { SubmitButton } from "@/components/submit-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default async function Signup(props: {
  searchParams: Promise<Message>
}) {
  const searchParams = await props.searchParams
  if ("message" in searchParams) {
    return (
      <div className="w-full h-screen flex items-center justify-center p-4">
        <FormMessage message={searchParams} />
      </div>
    )
  }

  return (
    <div className="w-full flex items-center justify-center p-4">
      <div className="flex flex-row items-center justify-center w-full max-w-4xl gap-20"> 

        <div className="flex-shrink-0">
          <img src="../images/logo.png" alt="Logo" className="h-34" />
        </div>

        <form className="flex flex-col w-full max-w-md">
          <h1 className="text-3xl font-medium mb-2">Sign up</h1>
          <p className="text-base text-foreground mb-4">
            Already have an account?{" "}
            <Link
              className="text-primary font-medium underline"
              href="/sign-in"
            >
              Sign in
            </Link>
          </p>

          <div className="flex flex-col gap-3 mt-4">
            <Label htmlFor="email" className="text-xl">Email</Label>
            <Input
              name="email"
              placeholder="you@example.com"
              required
              className="py-3 px-4 text-lg"
            />
            <Label htmlFor="password" className="text-xl">Password</Label>
            <Input
              type="password"
              name="password"
              placeholder="Your password"
              minLength={6}
              required
              className="py-3 px-4 text-lg"
            />
            <SubmitButton
              formAction={signUpAction}
              pendingText="Signing up..."
              className="py-3 text-xl"
            >
              Sign up
            </SubmitButton>
            <FormMessage message={searchParams} />
          </div>
        </form>
      </div>
    </div>
  )
}
