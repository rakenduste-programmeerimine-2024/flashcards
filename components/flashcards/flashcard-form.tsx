type FlashcardFormProps = {
    title: string;
    description: string;
    cards: { term: string; definition: string }[];
    onTitleChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onCardChange: (index: number, field: 'term' | 'definition', value: string) => void;
    onAddCard: () => void;
    onDeleteCard: (index: number) => void;
    onSubmit: (e: React.FormEvent) => void;
  };
  
  const FlashcardForm: React.FC<FlashcardFormProps> = ({
    title,
    description,
    cards,
    onTitleChange,
    onDescriptionChange,
    onCardChange,
    onAddCard,
    onDeleteCard,
    onSubmit,
  }) => {
    return (
      <form onSubmit={onSubmit} className="flashcard-form">
        <div className="form-section">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </div>
  
        <div className="cards-section">
          {cards.map((card, index) => (
            <FlashcardInput
              key={index}
              index={index}
              card={card}
              onChange={onCardChange}
              onDelete={() => onDeleteCard(index)}
            />
          ))}
          <button type="button" onClick={onAddCard}>
            Add Card
          </button>
        </div>
  
        <button type="submit">Create Set</button>
      </form>
    );
  };
  