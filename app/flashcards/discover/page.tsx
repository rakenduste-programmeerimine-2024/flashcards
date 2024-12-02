import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import SortingDropdown from "@/components/sorting-dropdown" // Import the SortingDropdown component

export default async function DiscoverPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/sign-in")
  }

  // Fetch public flashcard sets created by other users
  const { data: flashcardSets, error } = await supabase
    .from("flashcard_set")
    .select("id, title, user_id, is_public, created_date")
    .eq("is_public", true)
    .neq("user_id", user.id)

  if (error) {
    console.error(error.message)
    return <div>Error fetching public flashcard sets</div>
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Discover Flashcard Sets</h2>

        {flashcardSets && flashcardSets.length > 0 ? (
          <div className="w-full flex flex-col gap-4">
            {/* Pass flashcardSets to the SortingDropdown component */}
            <SortingDropdown flashcardSets={flashcardSets} />
          </div>
        ) : (
          <p>No public flashcard sets found. Explore and discover more!</p>
        )}
      </div>
    </div>
  )
}
