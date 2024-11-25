/*"use client"; 

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CreateFlashcardSet() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cards, setCards] = useState(
    Array.from({ length: 5 }, () => ({ term: "", definition: "" }))
  );

  const handleCardChange = (index: number, field: "term" | "definition", value: string) => {
    const newCards = [...cards];
    newCards[index][field] = value;
    setCards(newCards);
  };


  const addNewCard = () => {
    setCards([...cards, { term: "", definition: "" }]);
  };

  const deleteCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      // If there is an error or session is null (meaning the user is not authenticated)
      if (sessionError || !sessionData?.session?.user) {
        throw new Error("User is not authenticated.");
      }

      const user = sessionData.session.user;

      
      // Insert the flashcard set first
      const { data: flashcardSet, error: setError } = await supabase
        .from("flashcard_set")
        .insert([{ 
          title, 
          description,
          user_id: user.id,
          is_public: false,

          created_date: new Date().toISOString(), 

        }])
        .select()
        .single();

      if (setError) {
        throw setError;
      }

      const flashcardSetId = flashcardSet.id;

      // Insert each card associated with the flashcard set
      const { error: cardError } = await supabase
        .from("card")
        .insert(cards.map(card => ({ 
          ...card,
          flashcard_set_id: flashcardSetId 
        })));

      if (cardError) {
        throw cardError;
      }

      alert("Flashcard set and cards saved successfully!");
    } catch (error) {
      console.error("Error saving flashcard set:", error instanceof Error ? error.message : error);
      alert("An error occurred while saving the flashcard set.");
    }
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
        {cards.map((card, index) => (
          <div key={index} className="flex flex-col gap-2 p-2 border rounded">
            <textarea
              value={card.term}
              onChange={(e) => handleCardChange(index, "term", e.target.value)}
              placeholder={`Term ${index + 1}`}
              className="p-2 border rounded"
              required
            />
            <textarea
              value={card.definition}
              onChange={(e) => handleCardChange(index, "definition", e.target.value)}
              placeholder={`Definition ${index + 1}`}
              className="p-2 border rounded"
              required
            />
            <button
              type="button"
              onClick={() => deleteCard(index)}
              className="px-2 py-1 mt-2 bg-red-500 text-white rounded self-end"
            >
              Delete Card
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addNewCard}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Add New Card
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
          Save Flashcard Set
        </button>
      </form>
    </div>
  );
}
*/