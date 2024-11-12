import FetchDataSteps from "@/components/tutorial/fetch-data-steps"
import { createClient } from "@/utils/supabase/server"
import { InfoIcon } from "lucide-react"
import { redirect } from "next/navigation"
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/sign-in")
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">see on koduleht sisseloginud kasutajatele!</h2>
        <h3 className="text-2xl mb-4">sets</h3>
        <Link href="/create-flashcard-set">
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Create a New Flashcard Set
          </button>
        </Link>
      </div>
    </div>
  )
}
