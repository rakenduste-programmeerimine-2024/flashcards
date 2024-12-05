'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
  const [shakeTerm, setShakeTerm] = useState<string | null>(null);
  const [shakeDefinition, setShakeDefinition] = useState<string | null>(null); 

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
      if (clickedDefinition) {
        const isMatch = cards.some(
          (card) => card.term === item && card.definition === clickedDefinition
        );

        if (isMatch) {
          setMatchedPairs((prev) => new Set([...prev, item]));
          setTerms((prev) => prev.filter((term) => term !== item));
          setDefinitions((prev) => prev.filter((definition) => definition !== clickedDefinition));
        } else {
          setShakeTerm(item);
          setShakeDefinition(clickedDefinition);

          setTimeout(() => {
            setShakeTerm(null);
            setShakeDefinition(null);
          }, 500);
        }

        setTimeout(() => {
          setClickedTerm(null);
          setClickedDefinition(null);
        }, 500);
      } else {
        setClickedTerm(item);
      }
    } else {
      if (clickedTerm) {
        const isMatch = cards.some(
          (card) => card.term === clickedTerm && card.definition === item
        );

        if (isMatch) {
          setMatchedPairs((prev) => new Set([...prev, clickedTerm]));
          setTerms((prev) => prev.filter((term) => term !== clickedTerm));
          setDefinitions((prev) => prev.filter((definition) => definition !== item));
        } else {
          setShakeTerm(clickedTerm);
          setShakeDefinition(item);

          setTimeout(() => {
            setShakeTerm(null);
            setShakeDefinition(null);
          }, 500);
        }

        setTimeout(() => {
          setClickedTerm(null);
          setClickedDefinition(null);
        }, 500);
      } else {
        setClickedDefinition(item);
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  const allMatched = matchedPairs.size === cards.length;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Match Mode</h1>

      <div className="flex space-x-4">
        <div className="w-1/2">
          <h2 className="text-lg font-semibold">Terms</h2>
          {terms.map((term) => (
            <button
              key={term}
              className={`block mb-2 w-full px-4 py-2 rounded border-2 ${
                clickedTerm === term
                  ? 'bg-[#fe5d9f]'
                  : 'bg-white border-[#fe5d9f] dark:bg-black dark:border-pink-500 dark:text-white'
              } ${
                matchedPairs.has(term)
                  ? 'opacity-50 cursor-not-allowed'
                  : shakeTerm === term
                  ? 'shake'
                  : ''
              }`}
              onClick={() => handleClick(term, true)} 
              disabled={matchedPairs.has(term)}
            >
              {term}
            </button>
          ))}
        </div>

        <div className="w-1/2">
          <h2 className="text-lg font-semibold">Definitions</h2>
          {definitions.map((definition) => (
            <button
              key={definition}
              className={`block mb-2 w-full px-4 py-2 rounded border-2 ${
                clickedDefinition === definition
                  ? 'bg-[#f4bbd3]'
                  : 'bg-white border-[#f4bbd3] dark:bg-black dark:border-pink-500 dark:text-white'
              } ${shakeDefinition === definition ? 'shake' : ''}`}
              onClick={() => handleClick(definition, false)}
            >
              {definition}
            </button>
          ))}
        </div>
      </div>

      {allMatched && (
        <div className="mt-6 text-center text-xl font-bold text-green-600">
          You matched all the terms and definitions!
        </div>
      )}
    </div>
  );
}
