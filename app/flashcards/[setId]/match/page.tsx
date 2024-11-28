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

export default function MatchPage() {
  const params = useParams();
  const router = useRouter();
  const setId = params.setId as string;
  const [cards, setCards] = useState<Card[]>([]);
  const [terms, setTerms] = useState<string[]>([]);
  const [definitions, setDefinitions] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set()); // Track matched pairs
  const [loading, setLoading] = useState<boolean>(true); // Loading state to check if cards are loaded
  const [clickedTerm, setClickedTerm] = useState<string | null>(null); // Track clicked term
  const [clickedDefinition, setClickedDefinition] = useState<string | null>(null); // Track clicked definition
  const [clickedTermIndex, setClickedTermIndex] = useState<number | null>(null); // Track index of clicked term
  const [clickedDefinitionIndex, setClickedDefinitionIndex] = useState<number | null>(null); // Track index of clicked definition

  useEffect(() => {
    const fetchCards = async () => {
      // Fetch cards for this set
      const { data: cardsData, error } = await supabase
        .from('card')
        .select('*')
        .eq('flashcard_set_id', setId);

      if (error) {
        console.error(error);
        return;
      }

      const termsList = cardsData.map((card) => card.term);
      const definitionsList = cardsData.map((card) => card.definition);

      // Shuffle terms and definitions for matching game
      setCards(cardsData);
      setTerms(shuffleArray(termsList));
      setDefinitions(shuffleArray(definitionsList));
      setLoading(false); // Set loading to false when cards are loaded
    };

    if (setId) fetchCards();
  }, [setId]);

  // Function to shuffle an array (Fisher-Yates shuffle)
  const shuffleArray = (array: string[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Handle match click event
  const handleMatch = (term: string, definition: string, termIndex: number | null, definitionIndex: number | null) => {
    if (clickedTerm && clickedDefinition) {
      // Check if the term and definition match
      if (clickedTerm === term && clickedDefinition === definition) {
        // Mark the term and definition as matched
        setMatched((prev) => {
          const updated = new Set(prev);
          updated.add(`${term}:${definition}`);
          return updated;
        });

        // Remove the matched term and definition from the list
        setTerms((prevTerms) => prevTerms.filter((t) => t !== term));
        setDefinitions((prevDefinitions) => prevDefinitions.filter((d) => d !== definition));

        // Reset clicked term and definition after successful match
        setClickedTerm(null);
        setClickedDefinition(null);
        setClickedTermIndex(null);
        setClickedDefinitionIndex(null);
      } else {
        // Reset clicked term and definition after a short delay
        setTimeout(() => {
          setClickedTerm(null);
          setClickedDefinition(null);
          setClickedTermIndex(null);
          setClickedDefinitionIndex(null);
        }, 500); // Reset after 500ms for user feedback
      }
    } else {
      if (clickedTerm === null) {
        setClickedTerm(term); // Store the first clicked term
        setClickedTermIndex(termIndex); // Store the index of clicked term
      } else {
        setClickedDefinition(definition); // Store the second clicked definition
        setClickedDefinitionIndex(definitionIndex); // Store the index of clicked definition
      }
    }
  };

  // Don't show success message until loading is complete
  if (loading) {
    return <div>Loading...</div>;
  }

  // Check if all terms and definitions are matched
  const allMatched = matched.size === cards.length;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Match Mode</h1>
      <div className="flex space-x-4">
        <div className="w-1/2">
          <h2 className="text-lg font-semibold">Terms</h2>
          {terms.map((term, index) => (
            <button
              key={index}
              className={`block mb-2 w-full px-4 py-2 rounded ${
                clickedTermIndex === index ? 'bg-blue-700' : 'bg-blue-500'
              } ${matched.has(`${term}:${definitions[index]}`) ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleMatch(term, definitions[index], index, null)} // Pass `null` for definition index
              disabled={matched.has(`${term}:${definitions[index]}`)} // Disable if already matched
            >
              {term}
            </button>
          ))}
        </div>

        <div className="w-1/2">
          <h2 className="text-lg font-semibold">Definitions</h2>
          {definitions.map((definition, index) => (
            <button
              key={index}
              className={`block mb-2 w-full px-4 py-2 rounded ${
                clickedDefinitionIndex === index ? 'bg-green-700' : 'bg-green-500'
              } ${matched.has(`${terms[index]}:${definition}`) ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleMatch(terms[index], definition, null, index)} // Pass `null` for term index
              disabled={matched.has(`${terms[index]}:${definition}`)} // Disable if already matched
            >
              {definition}
            </button>
          ))}
        </div>
      </div>

      {/* Show success message when all terms and definitions are matched */}
      {allMatched && (
        <div className="mt-6 text-center text-xl font-bold text-green-600">
          You matched all the terms and definitions!
        </div>
      )}
    </div>
  );
}
