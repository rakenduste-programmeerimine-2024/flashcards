"use client"; 

import { useState } from "react";

export default function CreateFlashcardSet() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    // Add logic to save the new flashcard set to Supabase here
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-4">Create a New Flashcard Set</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="p-2 border rounded"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="p-2 border rounded"
          required
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
          Save Flashcard Set
        </button>
      </form>
    </div>
  );
}
