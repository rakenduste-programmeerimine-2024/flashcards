'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '../../../../utils/supabase/client';
import { FaStar, FaRegStar } from 'react-icons/fa'; // Import react-icons

const supabase = createClient();

type Card = {
  id: string;
  term: string;
  definition: string;
  flashcard_set_id: string;
};

type FlashcardSet = {
  id: string;
  title: string;
  description: string;
  user_id: string;
};

export default function ViewSetPage() {
  const params = useParams();
  const router = useRouter();
  const setId = params.setId as string;
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [lastStudied, setLastStudied] = useState<string | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState<number | null>(null);
  const [cardsStudied, setCardsStudied] = useState<number | null>(null);
  const [cardsCorrect, setCardsCorrect] = useState<number | null>(null);  const [loading, setLoading] = useState(false); // New loading state
  const [addedToFavorites, setAddedToFavorites] = useState(false); // To track if added to favorites

  useEffect(() => {
    const fetchSetAndCards = async () => {
      // Get logged-in user's ID
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        return; // Skip if the user is not logged in
      }
      setUserId(userData.user.id);

      // Fetch flashcard set details
      const { data: set, error: setError } = await supabase
        .from('flashcard_set')
        .select('id, title, description, user_id') // Include user_id in the select
        .eq('id', setId)
        .single();

      if (setError) {
        return; // Skip if an error occurs when fetching the set
      }
      setFlashcardSet(set);

      // Fetch cards
      const { data: cardsData, error: cardsError } = await supabase
        .from('card')
        .select('*')
        .eq('flashcard_set_id', setId);

      if (cardsError) {
        return; // Skip if an error occurs when fetching the cards
      } else {
        setCards(cardsData || []);
      }

      // Fetch progress
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select('last_studied, completion_percentage, cards_studied, cards_correct')
        .eq('user_id', userData.user.id)
        .eq('flashcard_set_id', setId)
        .order('last_studied', { ascending: false }) // Sort by the latest `last_studied`
        .limit(1) // Fetch the most recent row
        .single();

      if (!progressError && progressData) {
        setLastStudied(progressData.last_studied);
        setCompletionPercentage(progressData.completion_percentage);
        setCardsStudied(progressData.cards_studied);
        setCardsCorrect(progressData.cards_correct);
      }

      // Check if this set is already favorited
      const { data: favoriteData, error: favoriteError } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('flashcard_set_id', setId)
        .single();

      if (favoriteError && favoriteError.code !== 'PGRST116') {
        return; // Skip if an error occurs while checking favorites
      }

      // Set the favorite status based on the query result
      if (favoriteData) {
        setAddedToFavorites(true); // This set is favorited
      }
    };

    if (setId) fetchSetAndCards();
  }, [setId]);

  const handleAddRemoveFromFavorites = async () => {
    if (!userId || !flashcardSet) return;

    setLoading(true); // Set loading to true when the request is being processed

    // If already in favorites, remove it
    if (addedToFavorites) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('flashcard_set_id', flashcardSet.id);

      if (!error) {
        setAddedToFavorites(false); // Update state to reflect the removal
      }
    } else {
      // If not in favorites, add it
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: userId, flashcard_set_id: flashcardSet.id });

      if (!error) {
        setAddedToFavorites(true); // Update state to reflect the addition
      }
    }

    setLoading(false); // Reset loading state
  };

  return (
    <div className="container mx-auto p-4">
      {flashcardSet && (
        <div>
          <h1 className="text-2xl font-bold mb-4">{flashcardSet.title}</h1>
          <h2 className="text-lg text-gray-700 mb-6">{flashcardSet.description}</h2>
          {/* Display progress values */}
          <p className="text-sm text-gray-600 mb-2">
            Last Studied: {lastStudied ? new Date(lastStudied).toLocaleString() : 'N/A'}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            Completion Percentage: {completionPercentage !== null ? `${completionPercentage}%` : 'N/A'}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            Cards Studied: {cardsStudied !== null ? cardsStudied : 'N/A'}
          </p>
          <p className="text-sm text-gray-600 mb-6">
            Cards Correct: {cardsCorrect !== null ? cardsCorrect : 'N/A'}
          </p>

          {/* Buttons */}
          <div className="mb-6">
            {userId === flashcardSet.user_id && (
              <button
                onClick={() => router.push(`/flashcards/${flashcardSet.id}/edit-set`)}
                className="mr-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit
              </button>
            )}
            <button
              onClick={() => router.push(`/flashcards/${flashcardSet.id}/study`)}
              className="mr-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Study
            </button>
            <button
              onClick={() => router.push(`/flashcards/${flashcardSet.id}/match`)}
              className="mr-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-yellow-600"
            >
              Match
            </button>

            {/* Add/Remove to Favorites Icon without button or box */}
            <div
              onClick={handleAddRemoveFromFavorites}
              className={`cursor-pointer ${addedToFavorites ? 'text-yellow-500' : 'text-yellow-500'} text-3xl`}
            >
              {addedToFavorites ? <FaStar /> : <FaRegStar />} {/* Only the star icon */}
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className="flex justify-between items-center border p-4 rounded shadow-sm bg-white"
              >
                <span className="font-semibold text-gray-900">{card.term}</span>
                <span className="text-gray-600">{card.definition}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
