import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch both the user's flashcard sets and public flashcard sets
  const { data: flashcardSets, error } = await supabase
    .from("flashcard_set")
    .select("id, title, user_id, is_public")
    .or(`user_id.eq.${user.id},is_public.eq.true`); // Fetch sets where the user is the owner OR the set is public

  if (error) {
    console.error(error.message);
    return (
      <div>
        <p>Error fetching flashcard sets</p>
      </div>
    );
  }

  const yourSets = flashcardSets.filter((set) => set.user_id === user.id);
  const publicSets = flashcardSets.filter((set) => set.is_public && set.user_id !== user.id);

  // Fetch user's favorited sets
  const { data: favoriteSets, error: favoriteError } = await supabase
    .from("favorites")
    .select("flashcard_set_id")
    .eq("user_id", user.id);

  if (favoriteError) {
    console.error(favoriteError.message);
  }

  // Fetch the flashcard set details for the favorited sets
  const favoriteSetDetails = await Promise.all(
    favoriteSets.map(async (favorite) => {
      const { data: flashcardSet } = await supabase
        .from("flashcard_set")
        .select("*")
        .eq("id", favorite.flashcard_set_id)
        .single();
      return flashcardSet;
    })
  );

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Welcome to your flashcards!</h2>

        {/* Your Sets Section */}
        <Link href="/flashcards/your-sets">
          <h3 className="text-2xl mb-4">Your Sets</h3>
        </Link>
        {yourSets.length > 0 ? (
          <div className="flex flex-col gap-4">
            {yourSets.map((set) => (
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

        {/* Discover Section */}
        <Link href="/flashcards/discover">
          <h3 className="text-2xl mb-4">Discover</h3>
        </Link>
        {publicSets.length > 0 ? (
          <div className="flex flex-col gap-4">
            {publicSets.map((set) => (
              <div key={set.id} className="flex justify-between items-center">
                <Link href={`/flashcards/${set.id}/view-set`} className="text-blue-500 hover:underline">
                  {set.title} <span className="text-gray-500">(Public)</span>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p>No public flashcard sets found. Explore and discover more!</p>
        )}

        {/* Favorites Section */}
        <Link href="/flashcards/favorites">
          <h3 className="text-2xl mb-4">Favorites</h3>
        </Link>
        {favoriteSetDetails.length > 0 ? (
          <div className="flex flex-col gap-4">
            {favoriteSetDetails.map((set) => (
              <div key={set.id} className="flex justify-between items-center">
                <Link href={`/flashcards/${set.id}/view-set`} className="text-blue-500 hover:underline">
                  {set.title}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p>No favorited flashcard sets found. Explore and discover more!</p>
        )}

        {/* Create a New Flashcard Set Button */}
        <Link href="/flashcards/create-set">
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Create a New Flashcard Set
          </button>
        </Link>
      </div>
    </div>
  );
}
