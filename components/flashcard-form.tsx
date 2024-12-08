import React from 'react';

type Flashcard = {
  term: string;
  definition: string;
};

const FlashcardForm = ({
  title,
  setTitle,
  description,
  setDescription,
  cards,
  onCardChange,
  onAddCard,
  onDeleteCard,
  isPublic,
  setIsPublic,
  formTitle,
}: {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  cards: Flashcard[];
  onCardChange: (index: number, field: 'term' | 'definition', value: string) => void;
  onAddCard: () => void;
  onDeleteCard: (index: number) => void;
  isPublic: boolean;
  setIsPublic: (isPublic: boolean) => void;
  formTitle: string; 
}) => {
  return (
    <div>
      <h1 style={{ marginBottom: '30px', fontSize: '2.5em', fontWeight: 'bold' }}>{formTitle}</h1>
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="enter a title, like 'Math Test'"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={titleAndDescriptionStyle}  
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <textarea
          placeholder="add a description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={titleAndDescriptionStyle}  
        />
      </div>
      
      <h3 style={{ marginBottom: '20px', fontSize: '1.7em' }}>Flashcards</h3>
      {cards.map((card, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <textarea
            placeholder="enter term"
            value={card.term}
            onChange={(e) => onCardChange(index, 'term', e.target.value)}
            style={termAndDefinitionStyle}  
          />
          <textarea
            placeholder="enter definition"
            value={card.definition}
            onChange={(e) => onCardChange(index, 'definition', e.target.value)}
            style={termAndDefinitionStyle}  
          />
          <button
              type="button"
              onClick={() => onDeleteCard(index)}
              style={deleteCardButtonStyle}
            >
            &times;
            </button>
        </div>
      ))}
      <div style={{ marginBottom: '20px' }}>
      <button
        type="button"
        onClick={onAddCard}
        style={addCardButtonStyle}
        onMouseOver={(e) => (e.currentTarget.style.borderBottom = addCardButtonHoverStyle.borderBottom as string)}
        onMouseOut={(e) => (e.currentTarget.style.borderBottom = addCardButtonStyle.borderBottom as string)}
      >
        Add a Card
      </button>
    </div>

      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            style={{ marginRight: '10px' }}
          />
          Make this flashcard set public
        </label>
      </div>
    </div>
  );
};

const titleAndDescriptionStyle: React.CSSProperties = {
    border: '2px solid #ccc',
    padding: '8px',
    borderRadius: '4px',
    width: '820px', 
    marginBottom: '10px',
    boxSizing: 'border-box',
  };
  
  const termAndDefinitionStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    fontSize: '1.2em',
    minHeight: '40px', 
    maxHeight: '200px', 
    resize: 'none', 
    overflowY: 'auto',  
    boxSizing: 'border-box', 
    lineHeight: '1.4', 
    border: '2px solid #ccc', 
    borderRadius: '4px',
  };

const deleteCardButtonStyle: React.CSSProperties = {
    backgroundColor: '#ff0f7b', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '50%', 
    fontSize: '1.5em', 
    padding: '10px', 
    cursor: 'pointer', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    width: '30px', 
    height: '30px', 
    transition: 'background-color 0.3s ease', 
  };

const deleteCardButtonHoverStyle: React.CSSProperties = {
    backgroundColor: '#ff2d8f', 
};  

const addCardButtonStyle: React.CSSProperties = {
    fontSize: '1.3em', 
    padding: '10px 20px', 
    backgroundColor: 'transparent', 
    color: '#ff0f7b', 
    border: 'none', 
    borderBottom: '2px solid transparent', 
    cursor: 'pointer', 
    display: 'block', 
    marginLeft: '360px', 
    transition: 'border-color 0.3s ease', 
  };
  
const addCardButtonHoverStyle: React.CSSProperties = {
    borderBottom: '2px solid #ff0f7b', 
    color: '#ff0f7b', 
  };

export default FlashcardForm;

//muudetud