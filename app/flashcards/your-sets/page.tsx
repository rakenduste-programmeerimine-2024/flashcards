import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import SortingDropdown from "@/components/sorting-dropdown" // Make sure the path is correct

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
    .select("id, title, user_id, created_date")
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
          <SortingDropdown flashcardSets={flashcardSets} />
        ) : (
          <p>You haven't created any flashcard sets yet. Create one to get started.</p>
        )}
      </div>
    </div>
  )
}
