'use client';

import { useState } from 'react';
import { createClient } from '../../utils/supabase/client';

const supabase = createClient();

interface AddCardsProps {
  setId: string;
  onCardAddedSuccess: (message: string) => void;
  onCardAddedError: (message: string) => void;
}

export default function AddCards({
  setId,
  onCardAddedSuccess,
  onCardAddedError,
}: AddCardsProps) {
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');

  const handleAddCard = async () => {
    if (!term || !definition) {
      onCardAddedError('Both term and definition are required');
      return;
    }

    const { data, error } = await supabase.from('card').insert({
      set_id: setId,
      term,
      definition,
    });

    if (error) {
      onCardAddedError(error.message);
    } else {
      onCardAddedSuccess('Card added successfully');
      setTerm('');
      setDefinition('');
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Term"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      <input
        type="text"
        placeholder="Definition"
        value={definition}
        onChange={(e) => setDefinition(e.target.value)}
      />
      <button onClick={handleAddCard}>Add Card</button>
    </div>
  );
}
