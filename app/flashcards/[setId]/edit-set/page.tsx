'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '../../../../utils/supabase/client';

const supabase = createClient();

type Card = {
  id: string;
  term: string;
  definition: string;
  flashcard_set_id: string;
};

export default function EditSetPage() {
  const params = useParams();
  const setId = params.setId as string;
  const [cards, setCards] = useState<Card[]>([]);
  const [error, setError] = useState('');
  const [newCards, setNewCards] = useState<Card[]>([]);

  useEffect(() => {
    const fetchCards = async () => {
      const { data, error } = await supabase
        .from('card')
        .select('*')
        .eq('flashcard_set_id', setId);

      if (error) {
        setError(error.message);
      } else {
        setCards(data || []);
      }
    };

    if (setId) fetchCards();
  }, [setId]);

  const handleDeleteCard = async (cardId: string) => {
    const { error } = await supabase.from('card').delete().eq('id', cardId);
    if (error) {
      setError(error.message);
    } else {
      setCards(cards.filter((card) => card.id !== cardId));
    }
  };

  const handleAddEmptyCard = () => {
    setNewCards([...newCards, { id: '', term: '', definition: '', flashcard_set_id: setId }]);
  };

  const handleNewCardChange = (index: number, field: keyof Card, value: string) => {
    const updatedNewCards = [...newCards];
    updatedNewCards[index][field] = value;
    setNewCards(updatedNewCards);
  };

  const handleDeleteNewCard = (index: number) => {
    const updatedNewCards = newCards.filter((_, i) => i !== index);
    setNewCards(updatedNewCards);
  };

  const handleSaveNewCards = async () => {
    const validNewCards = newCards.filter((card) => card.term && card.definition);
    const { data, error } = await supabase.from('card').insert(
      validNewCards.map((card) => ({
        term: card.term,
        definition: card.definition,
        flashcard_set_id: setId,
      }))
    );

    if (error) {
      setError(error.message);
    } else if (data) {
      setCards([...cards, ...data]);
      setNewCards([]); // Clear new cards after saving
    }
  };

  return (
    <div>
      <h1>Edit Flashcard Set</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {cards.map((card) => (
          <li key={card.id}>
            {card.term}: {card.definition}
            <button onClick={() => handleDeleteCard(card.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <div>
        <h2>Add New Cards</h2>
        {newCards.map((card, index) => (
          <div key={index}>
            <input
              type="text"
              placeholder="Term"
              value={card.term}
              onChange={(e) => handleNewCardChange(index, 'term', e.target.value)}
            />
            <input
              type="text"
              placeholder="Definition"
              value={card.definition}
              onChange={(e) => handleNewCardChange(index, 'definition', e.target.value)}
            />
            <button onClick={() => handleDeleteNewCard(index)}>Delete</button>
          </div>
        ))}
        <button onClick={handleAddEmptyCard}>Add Another Card</button>
        {newCards.length > 0 && <button onClick={handleSaveNewCards}>Save All</button>}
      </div>
    </div>
  );
}
