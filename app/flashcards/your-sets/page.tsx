import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link";

export default async function YourSetsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/sign-in")
  }

  // Fetch the user's own flashcard sets
  const { data: flashcardSets, error } = await supabase
    .from("flashcard_set")
    .select("id, title, user_id")
    .eq("user_id", user.id)

  if (error) {
    console.error(error.message)
    return <div>Error fetching flashcard sets</div>
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Your Flashcard Sets</h2>

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
          <p>You haven't created any flashcard sets yet. Create one to get started.</p>
        )}
      </div>
    </div>
  )
}
