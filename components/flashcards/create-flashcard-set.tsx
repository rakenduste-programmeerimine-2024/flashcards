'use client';

interface CreateFlashcardSetProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  onCreateSet: (title: string, description: string) => void;
}

export default function CreateFlashcardSet({
  title,
  setTitle,
  description,
  setDescription,
  onCreateSet,
}: CreateFlashcardSetProps) {
  return (
    <div>
      <input
        type="text"
        placeholder="Set Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button onClick={() => onCreateSet(title, description)}>Create Set</button>
    </div>
  );
}
