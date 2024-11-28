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

export default function StudyPage() {
  const params = useParams();
  const router = useRouter();
  const setId = params.setId as string;
  const [cards, setCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [studyCompleted, setStudyCompleted] = useState(false);

  useEffect(() => {
    const fetchCards = async () => {
      // Fetch cards for the study set
      const { data: cardsData, error } = await supabase
        .from('card')
        .select('*')
        .eq('flashcard_set_id', setId);

      if (error) {
        console.error('Error fetching cards:', error.message);
        return;
      }
      setCards(cardsData || []);
    };

    if (setId) fetchCards();
  }, [setId]);

  const flipCard = () => setShowDefinition(!showDefinition);

  const nextCard = () => {
    if (currentCardIndex + 1 >= cards.length) {
        // All cards have been viewed
        setStudyCompleted(true);
      } else {
        setCurrentCardIndex((prevIndex) => prevIndex + 1);
        setShowDefinition(false); // Reset flip state
      }
  };

  const prevCard = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex - 1 + cards.length) % cards.length);
    setShowDefinition(false); // Reset flip state
  };

  const restartStudy = () => {
    setCurrentCardIndex(0);
    setShowDefinition(false);
    setStudyCompleted(false);
  };

  const goToLastCard = () => {
    setCurrentCardIndex(cards.length - 1);
    setShowDefinition(false);
    setStudyCompleted(false);
  };

  const goToViewSetPage = () => {
    router.push(`/flashcards/${setId}/view-set`);
  };

  return (
    <div>
      {studyCompleted ? (
        <div className="text-center p-4">
          <h2 className="text-xl font-bold">Congratulations!</h2>
          <p>You have finished studying all the cards in this set.</p>
          <div className="mt-4 flex justify-center gap-4">
          <button
              onClick={goToLastCard}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Go Back
            </button>
            <button
              onClick={restartStudy}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Start Over
            </button>
          </div>
        </div>
      ) : (
        <div>
        {cards.length > 0 && (
            <div>
            <div
                onClick={flipCard}
                className="card bg-gray-100 border p-4 text-center cursor-pointer"
                style={{ width: '300px', margin: '0 auto' }}
            >
                <h2>{showDefinition ? cards[currentCardIndex].definition : cards[currentCardIndex].term}</h2>
            </div>
            <p className="text-center mt-2 text-gray-600">
                {currentCardIndex + 1} / {cards.length}
            </p>

            {/* Navigation buttons */}
            <div className="mt-4 flex justify-between">
                <button
                onClick={prevCard}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                Prev
                </button>
                <button
                onClick={nextCard}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                Next
                </button>
            </div>
            <div className="mt-4 flex justify-center">
                <button
                  onClick={goToViewSetPage}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Back to Set
                </button>
              </div>
            </div>
        )}
        </div>
        )}
    </div>
  );
}
