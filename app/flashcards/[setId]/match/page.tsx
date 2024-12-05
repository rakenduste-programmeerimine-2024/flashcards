'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '../../../../utils/supabase/client';
import '../../../globals.css';

const supabase = createClient();

type Card = {
  term: string;
  definition: string;
};

export default function MatchPage() {
  const params = useParams();
  const setId = params.setId as string;
  const [cards, setCards] = useState<Card[]>([]);
  const [terms, setTerms] = useState<string[]>([]);
  const [definitions, setDefinitions] = useState<string[]>([]);
  const [clickedTerm, setClickedTerm] = useState<string | null>(null);
  const [clickedDefinition, setClickedDefinition] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [tempMatch, setTempMatch] = useState<{ term: string; definition: string } | null>(null);
  const [shakeTerm, setShakeTerm] = useState<string | null>(null);
  const [shakeDefinition, setShakeDefinition] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCards = async () => {
      const { data: cardsData, error } = await supabase
        .from('card')
        .select('term, definition')
        .eq('flashcard_set_id', setId);

      if (error) {
        console.error(error);
        return;
      }

      const termsList = cardsData.map((card) => card.term);
      const definitionsList = cardsData.map((card) => card.definition);

      setCards(cardsData);
      setTerms(shuffleArray(termsList));
      setDefinitions(shuffleArray(definitionsList));
      setLoading(false);
    };

    if (setId) fetchCards();
  }, [setId]);

  const shuffleArray = (array: string[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleClick = (item: string, isTerm: boolean) => {
    if (isTerm) {
      if (clickedTerm === item) {
        setClickedTerm(null);
      } else {
        if (clickedDefinition) {
          const isMatch = cards.some(
            (card) => card.term === item && card.definition === clickedDefinition
          );

          if (isMatch) {
            setTempMatch({ term: item, definition: clickedDefinition });
            setTimeout(() => {
              setMatchedPairs((prev) => new Set([...prev, item]));
              setTerms((prev) => prev.filter((term) => term !== item));
              setDefinitions((prev) => prev.filter((definition) => definition !== clickedDefinition));
              setTempMatch(null);
            }, 500);
          } else {
            setShakeTerm(item);
            setShakeDefinition(clickedDefinition);
            setTimeout(() => {
              setShakeTerm(null);
              setShakeDefinition(null);
            }, 500);
          }

          setClickedTerm(null);
          setClickedDefinition(null);
        } else {
          setClickedTerm(item);
        }
      }
    } else {
      if (clickedDefinition === item) {
        setClickedDefinition(null);
      } else {
        if (clickedTerm) {
          const isMatch = cards.some(
            (card) => card.term === clickedTerm && card.definition === item
          );

          if (isMatch) {
            setTempMatch({ term: clickedTerm, definition: item });
            setTimeout(() => {
              setMatchedPairs((prev) => new Set([...prev, clickedTerm]));
              setTerms((prev) => prev.filter((term) => term !== clickedTerm));
              setDefinitions((prev) => prev.filter((definition) => definition !== item));
              setTempMatch(null);
            }, 500);
          } else {
            setShakeTerm(clickedTerm);
            setShakeDefinition(item);
            setTimeout(() => {
              setShakeTerm(null);
              setShakeDefinition(null);
            }, 500);
          }

          setClickedTerm(null);
          setClickedDefinition(null);
        } else {
          setClickedDefinition(item);
        }
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  const allMatched = matchedPairs.size === cards.length;

  const handleRetry = () => {
    setMatchedPairs(new Set());
    setTerms(shuffleArray(cards.map(card => card.term)));
    setDefinitions(shuffleArray(cards.map(card => card.definition)));
  };

  const handleGoBack = () => {
    router.push(`/flashcards/${setId}/view-set`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-[2.5em] font-bold mb-4 text-center">Match Mode</h1>
  
      <div className="flex space-x-4">
        {!allMatched && (
          <>
            <div className="w-1/2">
              <h2 className="text-3xl font-bold mb-6 text-center">Terms</h2>
              {terms.map((term) => (
                <button
                  key={term}
                  className={`block mb-6 w-full px-8 py-4 text-2xl font-bold rounded border-4 ${
                    tempMatch?.term === term || matchedPairs.has(term)
                      ? 'bg-[#fe5d9f] text-[#390099]'
                      : clickedTerm === term
                      ? 'bg-pink-300 text-[#390099]'
                      : 'bg-white border-[#fe5d9f] text-[#390099] dark:bg-black dark:border-pink-500 dark:text-white'
                  } ${
                    shakeTerm === term ? 'shake' : ''
                  } ${matchedPairs.has(term) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => handleClick(term, true)}
                  disabled={matchedPairs.has(term)}
                >
                  {term}
                </button>
              ))}
            </div>
  
            <div className="w-1/2">
              <h2 className="text-3xl font-bold mb-6 text-center">Definitions</h2>
              {definitions.map((definition) => (
                <button
                  key={definition}
                  className={`block mb-6 w-full px-8 py-4 text-2xl font-bold rounded border-4 ${
                    tempMatch?.definition === definition
                      ? 'bg-[#f4bbd3] text-[#390099]'
                      : clickedDefinition === definition
                      ? 'bg-pink-300 text-[#390099]'
                      : 'bg-white border-[#f4bbd3] text-[#390099] dark:bg-black dark:border-pink-500 dark:text-white'
                  } ${
                    shakeDefinition === definition ? 'shake' : ''
                  }`}
                  onClick={() => handleClick(definition, false)}
                >
                  {definition}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
  
      {allMatched && (
        <div className="mt-8 text-center text-3xl font-bold text-[#FF66A1]">
          You matched all the terms and definitions!
        </div>
      )}
  
      {allMatched && (
        <div className="mt-6 flex justify-center space-x-4">
        <button
          onClick={handleGoBack}
          style={{ backgroundColor: '#BDB2FF', color: 'white' }}
          className="px-8 py-4 text-xl font-bold rounded hover:bg-[#BDB2FF] hover:opacity-80"
        >
          Go Back to Set
        </button>
        <button
          onClick={handleRetry}
          style={{ backgroundColor: '#EB6090', color: 'white' }}
          className="px-8 py-4 text-xl font-bold rounded hover:bg-[#EB6090] hover:opacity-80"
        >
          Try Again
        </button>
      </div>
      
      )}
    </div>
  );
}
