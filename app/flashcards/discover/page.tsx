import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import SortingDropdown from "@/components/sorting-dropdown"; 

export default async function DiscoverPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const getTermCount = async (setId: number) => {
    const { data, error } = await supabase
      .from("card")
      .select("id")
      .eq("flashcard_set_id", setId);

    if (error) {
      console.error(`Error fetching terms for set ${setId}:`, error.message);
      return 0;
    }
    return data.length;
  };

  const { data: flashcardSets, error } = await supabase
    .from("flashcard_set")
    .select("id, title, user_id, is_public, created_date")
    .eq("is_public", true)
    .neq("user_id", user.id);

  if (error) {
    console.error(error.message);
    return <div>Error fetching public flashcard sets</div>;
  }

  const flashcardSetsWithTermCount = await Promise.all(
    flashcardSets.map(async (set) => {
      const termCount = await getTermCount(set.id);
      return { ...set, termCount };
    })
  );

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="lex items-center gap-4">
        {flashcardSetsWithTermCount && flashcardSetsWithTermCount.length > 0 ? (
            <SortingDropdown
              flashcardSets={flashcardSetsWithTermCount}
              pageTitle="Discover Flashcard Sets"
            />
        ) : (
          <p>No public flashcard sets found. Explore and discover more!</p>
        )}
      </div>
    </div>
  );
}
