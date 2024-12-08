'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '../../../../utils/supabase/client';
import FlashcardForm from '../../../../components/flashcard-form';


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
  const [error, updateError] = useState('');
  const [success, setSuccess] = useState('');
  const [newCards, setNewCards] = useState<Card[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkOwnership = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        updateError('You must be logged in to edit this set.');
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
        updateError(setError.message);
        return;
      }

      if (set?.user_id !== currentUserId) {
        updateError('You are not authorized to edit this set.');
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
        updateError(error.message);
      } else {
        setCards(data || []);
      }
    };

    if (setId) checkOwnership();
  }, [setId, router]);

  const handleSave = async () => {
    try {
      const { error: setError } = await supabase
        .from('flashcard_set')
        .update({
          title: flashcardSet.title,
          description: flashcardSet.description,
          is_public: flashcardSet.is_public,
        })
        .eq('id', setId);
  
      if (setError) {
        updateError(setError.message);
        return;
      }
  
      const validNewCards = newCards.filter((card) => card.term && card.definition);
      if (validNewCards.length > 0) {
        const { error: cardsError } = await supabase.from('card').insert(
          validNewCards.map((card) => ({
            term: card.term,
            definition: card.definition,
            flashcard_set_id: setId,
          }))
        );
  
        if (cardsError) {
          updateError(cardsError.message);
          return;
        }
      }
  
      for (const card of cards) {
        const { error: cardUpdateError } = await supabase
          .from('card')
          .update({
            term: card.term,
            definition: card.definition,
          })
          .eq('id', card.id);
  
        if (cardUpdateError) {
          updateError(cardUpdateError.message);
          return;
        }
      }
  
      const { data: updatedCards, error: fetchError } = await supabase
        .from('card')
        .select('*')
        .eq('flashcard_set_id', setId)
        .order('created_at', { ascending: true });
  
      if (fetchError) {
        updateError(fetchError.message);
        return;
      }
  
      setCards(updatedCards || []);
      setNewCards([]); 
      setSuccess('Flashcard set and cards saved successfully!');
    } catch (err) {
      updateError('An unexpected error occurred.');
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

  const handleDeleteCard = async (cardId: string) => {
    const { error } = await supabase.from('card').delete().eq('id', cardId);
    if (error) {
      updateError(error.message);
    } else {
      setCards(cards.filter((card) => card.id !== cardId));
    }
  };

  const handleDeleteSet = async () => {
    const confirmation = window.confirm('Are you sure you want to delete this flashcard set? This action cannot be undone.');
    if (!confirmation) return;

    const { error: deleteCardsError } = await supabase
      .from('card')
      .delete()
      .eq('flashcard_set_id', setId);

    if (deleteCardsError) {
      updateError(deleteCardsError.message);
      return;
    }

    const { error: deleteSetError } = await supabase
      .from('flashcard_set')
      .delete()
      .eq('id', setId);

    if (deleteSetError) {
      updateError(deleteSetError.message);
    } else {
      setSuccess('Flashcard set deleted successfully!');
      router.push('/flashcards/your-sets'); 
    }
  };


  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      <div>
      <FlashcardForm
          formTitle="Edit Flashcard Set"
          title={flashcardSet.title}
          setTitle={(title) => setFlashcardSet((prev) => ({ ...prev, title: title }))}
          description={flashcardSet.description}
          setDescription={(description) =>
            setFlashcardSet((prev) => ({ ...prev, description }))
          }
          cards={cards.concat(newCards)}
          onCardChange={(index, field, value) => {
            if (index < cards.length) {
              const updatedCards = [...cards];
              updatedCards[index][field] = value;
              setCards(updatedCards);
            } else {
              handleNewCardChange(index - cards.length, field, value);
            }
          }}
          onAddCard={handleAddEmptyCard}
          onDeleteCard={(index) => {
            if (index < cards.length) {
              handleDeleteCard(cards[index].id);
            } else {
              handleDeleteNewCard(index - cards.length);
            }
          }}
          isPublic={flashcardSet.is_public}
          setIsPublic={(isPublic) => setFlashcardSet((prev) => ({ ...prev, is_public: isPublic }))}
        />


        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '20px' }}>
          <button
            onClick={handleDeleteSet}
            style={{
              backgroundColor: 'red',
              color: 'white',
              padding: '6px 12px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px',
              width: 'auto',
              alignSelf: 'flex-start',
            }}
          >
            Delete Flashcard Set
          </button>
        </div>
      </div>

      {success && <p style={{ color: 'green' }}>{success}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button
        onClick={handleSave}
        style={saveButtonStyle}
      >
        Save
      </button>
    </div>
  );
}

const saveButtonStyle: React.CSSProperties = {
  fontSize: '1.3em', 
  padding: '10px 20px', 
  backgroundColor: '#ff0f7b', 
  color: '#fff', 
  border: 'none', 
  borderRadius: '4px', 
  cursor: 'pointer', 
  display: 'block', 
  width: '100%', 
  marginTop: '20px', 
  transition: 'background-color 0.3s ease', 
};

const saveButtonHoverStyle: React.CSSProperties = {
  backgroundColor: '#ff2d8f',
};

//muudetud