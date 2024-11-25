'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '../../../utils/supabase/client';

const supabase = createClient();

type FlashcardSet = {
  title: string;
  description: string;
  user_id: string;
};

type Flashcard = {
  term: string;
  definition: string;
  flashcard_set_id: number;  // Update to match your `flashcard_set` table structure
};

export default function CreateSetPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  const [cards, setCards] = useState<{ term: string; definition: string }[]>([
    { term: '', definition: '' },
  ]);

  useEffect(() => {
    const getUser = async () => {
      const { data, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setError(userError.message);
      } else if (data?.user) {
        setUserId(data.user.id);  // Store the user's ID
      } else {
        setError('You must be logged in to create a flashcard set.');
      }
    };

    getUser();
  }, []);

  const handleCreateSet = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    setError('');  // Reset error and success messages
    setSuccess('');

    if (!title) {
      setError('Title is required');
      return;
    }

    if (!userId) {
      setError('User is not logged in');
      return;
    }

    // Insert the flashcard set
    const { data: setData, error: setErrorFromDB } = await supabase
      .from('flashcard_set')
      .insert({
        title,
        description,
        user_id: userId,
        created_date: new Date().toISOString(), // Ensure a timestamp is passed
      })
      .select('id'); // Get the flashcard set ID

    if (setErrorFromDB) {
      setError(setErrorFromDB.message);  // Using the state setter for error handling
      return;
    }

    const flashcardSetId = setData?.[0]?.id;

    if (!flashcardSetId) {
      setError('Failed to create flashcard set.');
      return;
    }

    // Insert the cards associated with the new set
    const flashcardsToInsert: Flashcard[] = cards.map((card) => ({
      term: card.term,
      definition: card.definition,
      flashcard_set_id: flashcardSetId,  // Use the flashcard set ID for the foreign key
    }));

    const { error: cardError } = await supabase
      .from('card')  // Ensure this is the correct table name (`card` not `flashcards`)
      .insert(flashcardsToInsert);

    if (cardError) {
      setError(cardError.message);  // Using the state setter for error handling
    } else {
      setSuccess('Flashcard set created successfully with cards!');
      setTitle('');
      setDescription('');
      setCards([{ term: '', definition: '' }]); // Reset the cards
    }
  };

  const handleCardChange = (index: number, field: 'term' | 'definition', value: string) => {
    const updatedCards = [...cards];
    updatedCards[index][field] = value;
    setCards(updatedCards);
  };

  const handleAddCard = () => {
    setCards([...cards, { term: '', definition: '' }]);
  };

  // Handle card deletion
  const handleDeleteCard = (index: number) => {
    const updatedCards = cards.filter((_, i) => i !== index); // Remove the card at the specified index
    setCards(updatedCards);
  };

  return (
    <div>
      <h1>Create Flashcard Set</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleCreateSet}>
        <div>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        {/* Cards input */}
        {cards.map((card, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Term"
              value={card.term}
              onChange={(e) => handleCardChange(index, 'term', e.target.value)}
            />
            <input
              type="text"
              placeholder="Definition"
              value={card.definition}
              onChange={(e) => handleCardChange(index, 'definition', e.target.value)}
            />
            {/* Delete button */}
            <button type="button" onClick={() => handleDeleteCard(index)}>Delete Card</button>
          </div>
        ))}

        <button type="button" onClick={handleAddCard}>Add Card</button>
        <button type="submit">Create Set</button>
      </form>
    </div>
  );
}
