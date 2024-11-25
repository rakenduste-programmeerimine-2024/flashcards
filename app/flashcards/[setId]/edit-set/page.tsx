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
  title: string;
  description: string;
  is_public: boolean;
};

export default function EditSetPage() {
  const params = useParams();
  const router = useRouter();
  const setId = params.setId as string;
  const [cards, setCards] = useState<Card[]>([]);
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet>({ title: '', description: '', is_public: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newCards, setNewCards] = useState<Card[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkOwnership = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        setError('You must be logged in to edit this set.');
        router.push('/login');
        return;
      }

      const currentUserId = userData.user.id;
      setUserId(currentUserId);

      const { data: set, error: setError } = await supabase
        .from('flashcard_set')
        .select('user_id, title, description, is_public')
        .eq('id', setId)
        .single();

      if (setError) {
        setError(setError.message);
        return;
      }

      if (set?.user_id !== currentUserId) {
        setError('You are not authorized to edit this set.');
        router.push('/403');
        return;
      }

      setFlashcardSet({ title: set.title, description: set.description, is_public: set.is_public || false });
      fetchCards();
    };

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

    if (setId) checkOwnership();
  }, [setId, router]);

  const handleSaveSet = async () => {
    const { data, error } = await supabase
      .from('flashcard_set')
      .update({
        title: flashcardSet.title,
        description: flashcardSet.description,
        is_public: flashcardSet.is_public,
      })
      .eq('id', setId);

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Flashcard set updated successfully!');
    }
  };

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
      setNewCards([]);
      setSuccess('New cards saved successfully!');
    }
  };

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      <h1>Edit Flashcard Set</h1>
      {success && <p style={{ color: 'green' }}>{success}</p>}
      
      {/* Title and Description Fields */}
      <div>
        <label>Title</label>
        <input
          type="text"
          placeholder="Enter Title"
          value={flashcardSet.title}
          onChange={(e) => setFlashcardSet({ ...flashcardSet, title: e.target.value })}
        />
        <label>Description</label>
        <textarea
          placeholder="Enter Description"
          value={flashcardSet.description}
          onChange={(e) => setFlashcardSet({ ...flashcardSet, description: e.target.value })}
        />
        <div>
          <label>Privacy</label>
          <input
            type="checkbox"
            checked={flashcardSet.is_public}
            onChange={(e) => setFlashcardSet({ ...flashcardSet, is_public: e.target.checked })}
          />
          <span>{flashcardSet.is_public ? 'Public' : 'Private'}</span>
        </div>
        <button onClick={handleSaveSet}>Save Set</button>
      </div>

      <ul>
        {cards.map((card, index) => (
          <li key={card.id}>
            <strong>Card {index + 1}</strong>
            <p>Term: {card.term}</p>
            <p>Definition: {card.definition}</p>
            <button onClick={() => handleDeleteCard(card.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <div>
        <h2>Add New Cards</h2>
        {newCards.map((card, index) => (
          <div key={index}>
            <label>Card {index + 1}</label>
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
