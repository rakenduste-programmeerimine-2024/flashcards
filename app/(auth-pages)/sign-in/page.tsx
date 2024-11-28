import { signInAction } from "@/app/actions"
import { FormMessage, Message } from "@/components/form-message"
import { SubmitButton } from "@/components/submit-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams

  return (
    <div className="w-full flex items-center justify-center p-4">
      <div className="flex flex-row items-center justify-center w-full max-w-4xl gap-20"> 

        {/* Logo Section */}
        <div className="flex-shrink-0">
          <img src="../images/logo.png" alt="Logo" className="h-34" />
        </div>

        {/* Sign-in Form */}
        <form className="flex flex-col w-full max-w-md">
          <h1 className="text-3xl font-medium mb-2">Sign in</h1>
          <p className="text-base text-foreground mb-4">
            Don’t have an account?{" "}
            <Link
              className="text-primary font-medium underline"
              href="/sign-up"
            >
              Sign up
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
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-xl">Password</Label>
              <Link
                className="text-xs text-primary underline"
                href="/forgot-password"
              >
                Forgot Password?
              </Link>
            </div>
            <Input
              type="password"
              name="password"
              placeholder="Your password"
              required
              className="py-3 px-4 text-lg"
            />
            <SubmitButton
              formAction={signInAction}
              pendingText="Signing In..."
              className="py-3 text-xl"
            >
              Sign in
            </SubmitButton>
            <FormMessage message={searchParams} />
          </div>
        </form>
      </div>
    </div>
  )
}
