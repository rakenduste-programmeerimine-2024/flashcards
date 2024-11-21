type FlashcardInputProps = {
    index: number;
    card: { term: string; definition: string };
    onChange: (index: number, field: 'term' | 'definition', value: string) => void;
    onDelete: () => void;
  };
  
  const FlashcardInput: React.FC<FlashcardInputProps> = ({ index, card, onChange, onDelete }) => {
    return (
      <div className="card-input">
        <input
          type="text"
          placeholder="Term"
          value={card.term}
          onChange={(e) => onChange(index, 'term', e.target.value)}
        />
        <input
          type="text"
          placeholder="Definition"
          value={card.definition}
          onChange={(e) => onChange(index, 'definition', e.target.value)}
        />
        <button type="button" onClick={onDelete}>
          Delete
        </button>
      </div>
    );
  };
  