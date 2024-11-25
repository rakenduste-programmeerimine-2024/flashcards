import { createClient } from "@/utils/supabase/server"
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

  const { data: flashcardSets, error } = await supabase
    .from("flashcard_set")
    .select("id, title")
    .eq("user_id", user.id)

  if (error) {
    console.error(error.message)
    return (
      <div>
        <p>Error fetching flashcard sets</p>
      </div>
    )
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">see on koduleht sisseloginud kasutajatele!</h2>
        <h3 className="text-2xl mb-4">sets</h3>

        {flashcardSets && flashcardSets.length > 0 ? (
          <div className="flex flex-col gap-4">
            {flashcardSets.map((set) => (
              <div key={set.id} className="flex justify-between items-center">
                <Link href={`/flashcards/${set.id}/view-set`} className="text-blue-500 hover:underline">
                  {set.title}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p>No flashcard sets found. Create one to get started.</p>
        )}

        <Link href="/create-flashcard-set">
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Create a New Flashcard Set
          </button>
        </Link>
      </div>
    </div>
  )
}
