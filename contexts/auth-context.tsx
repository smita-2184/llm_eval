"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { collection, query, where, getDocs, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export type UserData = {
  id: string
  username: string
  role: string
  course: string
  major: string
  gender: string
  semester: number
  lastLogin: any
  createdAt: any
  password: string
}

type AuthContextType = {
  userData: UserData | null
  loading: boolean
  error: string | null
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check for existing session on load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const userId = localStorage.getItem("userId")

        if (userId) {
          // Fetch user data from Firestore
          const userDocRef = doc(db, "users", userId)
          const userDoc = await getDoc(userDocRef)

          if (userDoc.exists()) {
            setUserData({ ...userDoc.data(), id: userDoc.id } as UserData)
          } else {
            // User document doesn't exist, clear session
            localStorage.removeItem("userId")
          }
        }
      } catch (err) {
        console.error("Error checking session:", err)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const signIn = async (username: string, password: string) => {
    setError(null)
    setLoading(true)

    try {
      // Query Firestore to find the user document by username
      const usersRef = collection(db, "users")
      const q = query(usersRef, where("username", "==", username))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        throw new Error("User not found")
      }

      // Get the first matching user document
      const userDoc = querySnapshot.docs[0]
      const userDataFromFirestore = { ...userDoc.data(), id: userDoc.id } as UserData

      // Check if password matches
      if (userDataFromFirestore.password !== password) {
        throw new Error("Invalid password")
      }

      // Store the user ID for session management
      localStorage.setItem("userId", userDoc.id)

      // Update the lastLogin timestamp
      await updateDoc(doc(db, "users", userDoc.id), {
        lastLogin: serverTimestamp(),
      })

      setUserData(userDataFromFirestore)
    } catch (err: any) {
      console.error("Sign in error:", err)
      setError(err.message || "Failed to sign in")
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setError(null)
    try {
      // Clear user data and session
      setUserData(null)
      localStorage.removeItem("userId")
    } catch (err: any) {
      console.error("Sign out error:", err)
      setError(err.message || "Failed to sign out")
    }
  }

  return <AuthContext.Provider value={{ userData, loading, error, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

