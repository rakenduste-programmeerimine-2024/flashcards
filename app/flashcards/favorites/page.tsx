import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import SortingDropdown from "@/components/sorting-dropdown";

export default async function FavoritesPage() {
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

  const { data: favoriteSets, error } = await supabase
    .from("favorites")
    .select("flashcard_set_id")
    .eq("user_id", user.id);

  if (error) {
    console.error(error.message);
    return <div>Error fetching favorite flashcard sets</div>;
  }

  const favoriteSetDetailsWithTermCount = await Promise.all(
    favoriteSets.map(async (favorite) => {
      const { data: flashcardSet, error } = await supabase
        .from("flashcard_set")
        .select("*")
        .eq("id", favorite.flashcard_set_id)
        .single();

      if (error) {
        console.error(`Error fetching flashcard set with ID ${favorite.flashcard_set_id}:`, error.message);
        return null;
      }

      const termCount = await getTermCount(flashcardSet.id);

      return { ...flashcardSet, termCount };
    })
  );

  const validFavoriteSets = favoriteSetDetailsWithTermCount.filter((set) => set !== null);

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="flex flex-col gap-2 items-start">
        {validFavoriteSets && validFavoriteSets.length > 0 ? (
          <div className="w-full flex flex-col gap-4">
            <SortingDropdown
              flashcardSets={validFavoriteSets}
              pageTitle="Your Favorite Flashcard Sets"
            />
          </div>
        ) : (
          <p>You haven't favorited any flashcard sets yet. Explore and discover more!</p>
        )}
      </div>
    </div>
  );
}
