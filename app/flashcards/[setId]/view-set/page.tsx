'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '../../../../utils/supabase/client';
import { FaStar, FaRegStar, FaPen } from 'react-icons/fa';

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
  const [cardsCorrect, setCardsCorrect] = useState<number | null>(null);
  const [loading, setLoading] = useState(false); 
  const [addedToFavorites, setAddedToFavorites] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false); 

  useEffect(() => {
    const fetchSetAndCards = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        return; 
      }
      setUserId(userData.user.id);

      const { data: set, error: setError } = await supabase
        .from('flashcard_set')
        .select('id, title, description, user_id') 
        .eq('id', setId)
        .single();

      if (setError) {
        return; 
      }
      setFlashcardSet(set);

      const { data: cardsData, error: cardsError } = await supabase
        .from('card')
        .select('*')
        .eq('flashcard_set_id', setId);

      if (cardsError) {
        return;
      } else {
        setCards(cardsData || []);
      }

      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select('last_studied, completion_percentage, cards_studied, cards_correct')
        .eq('user_id', userData.user.id)
        .eq('flashcard_set_id', setId)
        .order('last_studied', { ascending: false })
        .limit(1)
        .single();

      if (!progressError && progressData) {
        setLastStudied(progressData.last_studied);
        setCompletionPercentage(progressData.completion_percentage);
        setCardsStudied(progressData.cards_studied);
        setCardsCorrect(progressData.cards_correct);
      }

      const { data: favoriteData, error: favoriteError } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('flashcard_set_id', setId)
        .single();

      if (favoriteError && favoriteError.code !== 'PGRST116') {
        return;
      }

      if (favoriteData) {
        setAddedToFavorites(true);
      }
    };

    if (setId) fetchSetAndCards();
  }, [setId]);

  const handleAddRemoveFromFavorites = async () => {
    if (!userId || !flashcardSet) return;

    setLoading(true); 

    if (addedToFavorites) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('flashcard_set_id', flashcardSet.id);

      if (!error) {
        setAddedToFavorites(false);
      }
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: userId, flashcard_set_id: flashcardSet.id });

      if (!error) {
        setAddedToFavorites(true); 
      }
    }

    setLoading(false); 
  };

  return (
    <div className="container mx-auto p-4">
      {flashcardSet && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-[2.5em] font-bold mr-8">{flashcardSet.title}</h1>
            <div className="flex space-x-1">
          <div
            onClick={handleAddRemoveFromFavorites}
            className={`cursor-pointer ${addedToFavorites ? 'text-yellow-500' : 'text-yellow-500'} text-3xl`}
          >
            {addedToFavorites ? <FaStar /> : <FaRegStar />}
          </div>
              {userId === flashcardSet.user_id && (
                <button
                  onClick={() => router.push(`/flashcards/${flashcardSet.id}/edit-set`)}
                  className="p-2 bg-transparent text-pink-500 rounded hover:bg-[#D4ABEF] focus:outline-none flex items-center"
                >
                  <FaPen className="w-5 h-5" />
                </button>
              )}
            </div>


          </div>
          <h2 className="text-lg text-gray-700 mb-6">{flashcardSet.description}</h2>

          <div
            onClick={() => setStatsOpen(!statsOpen)}
            className="cursor-pointer text-pink-500 hover:text-pink-800 text-sm mb-4"
          >
            {statsOpen ? 'Hide Stats' : 'Show Stats'}
          </div>

          {statsOpen && (
            <div className="p-4 bg-[#F9C5D1] rounded-md shadow-md mb-6">
              <p className="text-sm text-gray-600 mb-2">
              <span className="font-bold">Last Studied:</span> {lastStudied ? new Date(lastStudied).toLocaleString() : "You haven't studied yet"}
              </p>
              <p className="text-sm text-gray-600 mb-2">
              <span className="font-bold">Completion Percentage:</span> {completionPercentage !== null ? `${completionPercentage}%` : "You haven't studied yet"}
              </p>
              <p className="text-sm text-gray-600 mb-2">
              <span className="font-bold">Cards Studied:</span> {cardsStudied !== null ? cardsStudied : "You haven't studied yet"}
              </p>
              <p className="text-sm text-gray-600 mb-2">
              <span className="font-bold">Cards Correct:</span> {cardsCorrect !== null ? cardsCorrect : "You haven't studied yet"}
              </p>
            </div>
          )}

          <div className="mb-6">
            <button
              onClick={() => router.push(`/flashcards/${flashcardSet.id}/study`)}
              className="mr-4 px-8 py-4 bg-[#EB6090] text-white rounded hover:bg-[#D13C77] text-xl" 
            >
              Study
            </button>
            <button
              onClick={() => router.push(`/flashcards/${flashcardSet.id}/match`)}
              className="mr-4 px-8 py-4 bg-[#BDB2FF] text-white rounded hover:bg-[#9A90FF] text-xl"
            >
              Match
            </button>
          </div>


          <div className="space-y-4">
  {cards.map((card) => (
    <div
      key={card.id}
      className="p-4 border rounded shadow-md flex justify-between items-center bg-white transition-all duration-300 ease-in-out hover:bg-[#F3D9E0] hover:shadow-lg"
    >
      <h2 className="text-xl font-semibold text-gray-800 mr-4">{card.term}</h2> 
      <p className="text-sm text-gray-700">{card.definition}</p>
    </div>
  ))}
</div>



        </div>
      )}
    </div>
  );
}
