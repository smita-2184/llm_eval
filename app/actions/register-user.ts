"use server"

import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore"
import { v4 as uuidv4 } from "uuid"

type RegisterUserData = {
  username: string
  password: string
  gender: string
  course: string
  semester: string
  major: string
}

export async function registerUser(data: RegisterUserData) {
  try {
    // Check if username already exists
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("username", "==", data.username))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      return { success: false, message: "Username already exists" }
    }

    // Generate a unique ID for the user
    const userId = uuidv4()

    // Extract semester number from the semester string
    const semesterNumber = Number.parseInt(data.semester.replace("Semester ", ""), 10) || 1

    // Create the user document
    await addDoc(collection(db, "users"), {
      id: userId,
      username: data.username,
      password: data.password,
      gender: data.gender,
      course: data.course,
      semester: semesterNumber,
      major: data.major,
      role: "user",
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    })

    return { success: true, message: "Registration successful" }
  } catch (error: any) {
    console.error("Error registering user:", error)
    return { success: false, message: `Registration failed: ${error.message}` }
  }
}

