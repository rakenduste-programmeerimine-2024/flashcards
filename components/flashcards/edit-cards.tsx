'use client';

import { useState } from 'react';

interface EditCardsProps {
  title: string;
  description: string;
  onSave: (title: string, description: string) => void;  // Function that takes both title and description
}

export default function EditCards({
  title,
  description,
  onSave,
}: EditCardsProps) {
    const [newTitle, setNewTitle] = useState(title);
    const [newDescription, setNewDescription] = useState(description);

    const handleSave = () => {
      onSave(newTitle, newDescription);  // Call onSave with both title and description
    };
  return (
    <div>
      <input
        type="text"
        placeholder="Set Title"
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
      />
      <textarea
        placeholder="Description"
        value={newDescription}
        onChange={(e) => setNewDescription(e.target.value)}
      />
      <button onClick={handleSave}>Save Changes</button>
    </div>
  );
}
