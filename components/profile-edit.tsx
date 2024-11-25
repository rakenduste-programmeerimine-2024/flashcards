"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { SubmitButton } from "@/components/submit-button";
import { useTheme } from "next-themes";

const supabaseClient = createClient();

export default function ProfileEdit({ email }: { email: string }) {
  const { theme } = useTheme();
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
    } catch (error) {
      console.error("Error in getSession:", error);
    }
  };

  useEffect(() => {
    getSession();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session?.user);
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

  const buttonTextColor = theme === "dark" ? "text-white" : "text-black";

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
              className={`hover:underline text-sm`}
            >
              Save Password
            </SubmitButton>
          </div>
        ) : (
          <SubmitButton
            onClick={() => setIsEditingPassword(true)}
            className={`hover:underline text-sm`}
          >
            Change Password
          </SubmitButton>
        )}
      </div>
    </div>
  );
}
