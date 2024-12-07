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

export default function StudyPage() {
  const params = useParams();
  const router = useRouter();
  const setId = params.setId as string;
  const [cards, setCards] = useState<Card[]>([]);
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [studyCompleted, setStudyCompleted] = useState(false);
  const [showTermFirst, setShowTermFirst] = useState(true);
  const [progressTracking, setProgressTracking] = useState(false);
  const [knownCards, setKnownCards] = useState(0);
  const [studyAgainCards, setStudyAgainCards] = useState(0);

  useEffect(() => {
    const fetchFlashcardSet = async () => {
      const { data: flashcardSetData, error } = await supabase
        .from('flashcard_set')
        .select('id, title')
        .eq('id', setId)
        .single();

      if (error) {
        console.error('Error fetching flashcard set:', error.message);
        return;
      }
      setFlashcardSet(flashcardSetData || null);
    };

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

    if (setId) {
      fetchFlashcardSet();
      fetchCards();
    }
  }, [setId]);

  const flipCard = () => setShowDefinition(!showDefinition);

  const nextCard = () => {
    if (currentCardIndex + 1 >= cards.length) {

        setStudyCompleted(true);
      } else {
        setCurrentCardIndex((prevIndex) => prevIndex + 1);
        setShowDefinition(false);
      }
  };

  const prevCard = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex - 1 + cards.length) % cards.length);
    setShowDefinition(false); 
  };

  const handleCheck = () => {
    setKnownCards((prev) => prev + 1);
    moveToNextCard();
  };

  const handleStudyAgain = () => {
    setStudyAgainCards((prev) => prev + 1);
    moveToNextCard();
  };

  const moveToNextCard = () => {
    if (currentCardIndex + 1 >= cards.length) {
      setStudyCompleted(true);
    } else {
      setCurrentCardIndex((prevIndex) => prevIndex + 1);
      setShowDefinition(false);
    }
  };

  const saveProgressToDatabase = async () => {
    try {
      const { data: userData, error: authError } = await supabase.auth.getUser();
  
      if (authError || !userData || !userData.user) {
        console.error('Authentication error:', authError?.message);
        alert('You must be logged in to save progress.');
        return;
      }
  
      const userId = userData.user.id;
  
      const { error: insertError } = await supabase.from('progress').insert({
        flashcard_set_id: parseInt(setId, 10), 
        user_id: userId,
        cards_studied: knownCards + studyAgainCards,
        cards_correct: knownCards,
        last_studied: new Date().toISOString(),
        completion_percentage: parseFloat(
          (((knownCards + studyAgainCards) / cards.length) * 100).toFixed(2)
        ),
      });
  
      if (insertError) {
        console.error('Error inserting progress:', insertError.message);
        alert('Failed to save progress. Please try again.');
      } else {
        console.log('Progress saved successfully.');
      }
    } catch (error) {
      console.error('Unexpected error saving progress:', error);
    }
  };
  

  const completeStudySession = async () => {
    if (progressTracking) {
      await saveProgressToDatabase();
    }
    setStudyCompleted(true);
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

  useEffect(() => {
    if (studyCompleted && progressTracking) {
      completeStudySession();
    }
  }, [studyCompleted, progressTracking]);

  return (
    <div>
      {studyCompleted ? (
        <div className="text-center p-4">
          <h2 className="text-xl font-bold mb-4">Congratulations!</h2>
          <p className="mb-4">You have finished studying all the cards in this set.</p>
          {progressTracking && (
            <div className="mb-4">
              <p className="mt-2">
                <strong>Known Cards:</strong> {knownCards}
              </p>
              <p>
                <strong>Need to Study Again:</strong> {studyAgainCards}
              </p>
            </div>
          )}
          <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={goToLastCard}
            className="px-4 py-2 bg-[#EB6090] text-white rounded hover:bg-[#D1486B]"
          >
            Go Back
          </button>
          <button
            onClick={restartStudy}
            className="px-4 py-2 bg-[#390099] text-white rounded hover:bg-[#2F0077]"
          >
            Start Over
          </button>
          <button
            onClick={goToViewSetPage} 
            className="px-4 py-2 bg-[#BDB2FF] text-white rounded hover:bg-[#9E93FF]"
          >
            Back to Set
          </button>

          </div>
        </div>
      ) : (
        <div>
          {flashcardSet && (
            <h1 className="text-3xl text-center font-bold my-4">{flashcardSet.title}</h1>
          )}
          {cards.length > 0 && (
            <div>

              <div className="flex justify-center mb-4">
                <label className="flex items-center gap-2">
                  <span>Show Term First</span>
                  <div
                    onClick={() => setShowTermFirst(!showTermFirst)}
                    className={`relative inline-block w-10 h-6 cursor-pointer ${
                      showTermFirst ? 'bg-pink-300' : 'bg-purple-300'
                    } rounded-full`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        showTermFirst ? 'transform translate-x-4' : ''
                      }`}
                    ></span>
                  </div>
                </label>
              </div>

              <div className="flex justify-center mb-8">
                <label className="flex items-center gap-2">
                  <span>Progress Tracking</span>
                  <div
                    onClick={() => setProgressTracking(!progressTracking)}
                    className={`relative inline-block w-10 h-6 cursor-pointer ${
                      progressTracking ? 'bg-pink-300' : 'bg-purple-300'
                    } rounded-full`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        progressTracking ? 'transform translate-x-4' : ''
                      }`}
                    ></span>
                  </div>
                </label>
              </div>

              <div
                onClick={flipCard}
                className="card bg-gray-100 border p-4 text-center cursor-pointer"
                style={{
                  width: '800px',
                  height: '250px',
                  margin: '0 auto',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'center',  
                  alignItems: 'center',
                  backgroundColor: 'white', 
                  boxShadow: '0 4px 12px rgba(255, 105, 180, 0.5)',
                  borderRadius: '8px',
                  marginBottom: '40px',      
                }}
                >
                <h2>
                  {showDefinition === showTermFirst
                    ? cards[currentCardIndex].definition
                    : cards[currentCardIndex].term}
                </h2>
              </div>

              <p className="text-center mt-2 text-gray-600">
                {currentCardIndex + 1} / {cards.length}
              </p>

              <div className="mt-4 flex justify-between">
              {progressTracking ? (
                  <>
                    <button
                      onClick={handleStudyAgain}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      X
                    </button>
                    <button
                      onClick={handleCheck}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Know
                    </button>
                  </>
                ) : (
                  <>
                  <button
                  onClick={prevCard}
                  className="px-4 py-2 bg-[#EB6090] text-white rounded hover:bg-[#D1486B]"
                  >
                  Prev
                  </button>
                  <button
                  onClick={nextCard}
                  className="px-4 py-2 bg-[#EB6090] text-white rounded hover:bg-gray-600"
                  >
                  Next
                  </button>
                  </>
                )}
              </div>
              <div className="mt-4 flex justify-center">
                  <button
                    onClick={goToViewSetPage}
                    className="px-4 py-2 bg-[#BDB2FF] text-white rounded hover:bg-[#9E93FF]"
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
