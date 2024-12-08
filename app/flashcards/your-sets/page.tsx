import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import SortingDropdown from "@/components/sorting-dropdown"

export default async function YourSetsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/sign-in")
  }

  const getTermCount = async (setId: number) => {
    const { data, error } = await supabase
      .from("card")
      .select("id")
      .eq("flashcard_set_id", setId)

    if (error) {
      console.error(`Error fetching terms for set ${setId}:`, error.message)
      return 0
    }
    return data.length
  }

  const { data: flashcardSets, error } = await supabase
    .from("flashcard_set")
    .select("id, title, user_id, created_date")
    .eq("user_id", user.id)

  if (error) {
    console.error(error.message)
    return <div>Error fetching flashcard sets</div>
  }

  const flashcardSetsWithTermCount = await Promise.all(
    flashcardSets.map(async (set) => {
      const termCount = await getTermCount(set.id)
      return { ...set, termCount }
    })
  )

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="flex items-center gap-4">
        {flashcardSetsWithTermCount && flashcardSetsWithTermCount.length > 0 ? (
          <SortingDropdown
            flashcardSets={flashcardSetsWithTermCount}
            pageTitle="Your Flashcard Sets"
          />
        ) : (
          <p>You haven't created any flashcard sets yet. Create one to get started.</p>
        )}
      </div>
    </div>
  )
}
