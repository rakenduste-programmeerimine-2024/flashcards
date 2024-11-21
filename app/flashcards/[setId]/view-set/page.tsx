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
};

export default function ViewSetPage() {
  const params = useParams();
  const router = useRouter();
  const setId = params.setId as string;
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSetAndCards = async () => {
      // Fetch flashcard set details
      const { data: set, error: setError } = await supabase
        .from('flashcard_set')
        .select('id, title')
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
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {flashcardSet && (
        <div>
          <h1>{flashcardSet.title}</h1>
          <ul>
            {cards.map((card) => (
              <li key={card.id}>
                <strong>{card.term}:</strong> {card.definition}
              </li>
            ))}
          </ul>
          <button
            onClick={() => router.push(`/flashcards/${flashcardSet.id}/edit-set`)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}
