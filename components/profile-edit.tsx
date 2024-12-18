"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { SubmitButton } from "@/components/submit-button";
import { useTheme } from "next-themes";
import { FaPen } from "react-icons/fa";

const supabaseClient = createClient();

export default function ProfileEdit({ email }: { email: string }) {
  const { theme } = useTheme();
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [setsCount, setSetsCount] = useState(0);
  const [accountCreatedAt, setAccountCreatedAt] = useState<string | null>(null);

  const getSession = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabaseClient.auth.getSession();

      if (error) {
        console.error("Error fetching session:", error.message);
        return;
      }

      setIsAuthenticated(!!session?.user);

      if (session?.user) {''
        fetchUserSets(session.user.id);
        setAccountCreatedAt(session.user.created_at); 
      }
    } catch (error) {
      console.error("Error in getSession:", error);
    }
  };

  const fetchUserSets = async (userId: string) => {
    try {
      const { data, error } = await supabaseClient
        .from("flashcard_set")
        .select("id")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching flashcard sets:", error.message);
        return;
      }

      setSetsCount(data?.length || 0);
    } catch (error) {
      console.error("Error fetching flashcard sets:", error);
    }
  };

  useEffect(() => {
    getSession();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session?.user);
        if (session?.user) {
          fetchUserSets(session.user.id);
          setAccountCreatedAt(session.user.created_at);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleSavePasswordClick = async () => {
    if (!isAuthenticated) {
      console.error("User is not authenticated");
      return;
    }

    try {
      const { error } = await supabaseClient.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error("Error updating password:", error.message);
      } else {
        console.log("Password updated successfully");
        setIsEditingPassword(false);
      }
    } catch (error) {
      console.error("Error updating password:", error);
    }
  };

  const formattedAccountCreationDate = accountCreatedAt
    ? new Date(accountCreatedAt).toLocaleDateString()
    : "Loading...";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <p className="text-sm">Email: {email}</p>
      </div>

      <div className="flex items-center gap-2">
        <p className="text-sm">Password: ***** </p>
        {isEditingPassword ? (
          <div className="flex flex-col gap-2">
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="border p-1 rounded"
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border p-1 rounded"
            />
            <SubmitButton
              onClick={handleSavePasswordClick}
              className="text-white rounded px-3 py-1 hover:opacity-90"
              style={{ backgroundColor: '#EB6090' }}
            >
              Save password
            </SubmitButton>
          </div>
        ) : (
          <button
            onClick={() => setIsEditingPassword(true)}
            className="p-2 bg-transparent text-pink-500 rounded hover:bg-[#D4ABEF] focus:outline-none flex items-center"
          >
            <FaPen className="w-5 h-5" />
          </button>

        )}
      </div>

      <div className="flex items-center gap-2">
        <p className="text-sm">Flashcard sets: {setsCount}</p>
      </div>

      <div className="flex items-center gap-2">
        <p className="text-sm">Account created at: {formattedAccountCreationDate}</p>
      </div>

    </div>
  );
}
