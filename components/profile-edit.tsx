"use client"

import { useState, useEffect } from "react"
import { supabaseClient } from "@/utils/supabase/client" 
import { SubmitButton } from "@/components/submit-button"

export default function ProfileEdit({ email }: { email: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const [newEmail, setNewEmail] = useState(email)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const getSession = async () => {
    const { data: { session } } = await supabaseClient.auth.getSession()
    console.log("Session retrieved:", session)  
    if (session?.user) {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
    }
  }

  useEffect(() => {
    
    getSession()

    const { data: authListener } = supabaseClient.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, session) 
      if (session?.user) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  const handleEditClick = () => {
    setIsEditing((prev) => !prev)
  }

  const handleSaveClick = async () => {
    await getSession()
    console.log("Is authenticated before save:", isAuthenticated) 

    if (!isAuthenticated) {
      console.error("User is not authenticated")
      return
    }

    try {

      const { error } = await supabaseClient.auth.updateUser({
        email: newEmail,
      })

      if (error) {
        console.error("Error updating email:", error.message)
      } else {
        console.log("Email updated successfully")
        setIsEditing(false)
      }
    } catch (error) {
      console.error("Error updating email:", error)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <p className="text-sm">Email: {isEditing ? (
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="border p-1 rounded"
        />
      ) : (
        email
      )}</p>

      {isEditing ? (
        <SubmitButton onClick={handleSaveClick} className="text-blue-500 hover:underline text-sm">
          Save
        </SubmitButton>
      ) : (
        <SubmitButton onClick={handleEditClick} className="text-blue-500 hover:underline text-sm">
          Edit
        </SubmitButton>
      )}
    </div>
  )
}
