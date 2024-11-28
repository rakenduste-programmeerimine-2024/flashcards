'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '../../../../utils/supabase/client';

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
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSetAndCards = async () => {
      // Get logged-in user's ID
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        setError(userError?.message || 'You must be logged in to view this set.');
        return;
      }
      setUserId(userData.user.id);

      // Fetch flashcard set details
      const { data: set, error: setError } = await supabase
        .from('flashcard_set')
        .select('id, title, description, user_id') // Include user_id in the select
        .eq('id', setId)
        .single();

      if (setError) {
        setError(setError.message);
        return;
      }
      setFlashcardSet(set);

      // Fetch cards
      const { data: cardsData, error: cardsError } = await supabase
        .from('card')
        .select('*')
        .eq('flashcard_set_id', setId);

      if (cardsError) {
        setError(cardsError.message);
      } else {
        setCards(cardsData || []);
      }
    };

    if (setId) fetchSetAndCards();
  }, [setId]);

  return (
    <div className="container mx-auto p-4">
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Error Message */}

      {flashcardSet && (
        <div>
          <h1 className="text-2xl font-bold mb-4">{flashcardSet.title}</h1>
          <h2 className="text-lg text-gray-700 mb-6">{flashcardSet.description}</h2>

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
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Study
            </button>
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
