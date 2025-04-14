"use server"

import { db } from "./firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"

export async function createTestUser(
  username: string,
  password: string,
  id: string,
  course = "Ph.D",
  major = "Organic Chemistry",
  gender = "male",
  semester = 1,
  role = "user",
) {
  try {
    // Create a new user document in the users collection
    await setDoc(doc(db, "users", id), {
      username,
      password,
      id,
      course,
      major,
      gender,
      semester,
      role,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    })

    return { success: true, message: `User ${username} created successfully` }
  } catch (error) {
    console.error("Error creating test user:", error)
    return { success: false, message: `Failed to create user: ${error.message}` }
  }
}

