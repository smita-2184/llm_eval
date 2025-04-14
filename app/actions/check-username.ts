"use server"

import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

export async function checkUsernameExists(username: string): Promise<boolean> {
  try {
    if (!username.trim()) return false

    const usersRef = collection(db, "users")
    const q = query(usersRef, where("username", "==", username))
    const querySnapshot = await getDocs(q)

    return !querySnapshot.empty
  } catch (error) {
    console.error("Error checking username:", error)
    return false
  }
}

