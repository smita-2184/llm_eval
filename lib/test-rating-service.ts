import { db } from "./firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

export interface TestRatingData {
  userId: string
  username: string
  question: string
  answer: string
  scientificRating: number
  clarityRating: number
  helpfulnessRating: number
  wouldUseAgain: boolean
  modelId: string
  timestamp?: any
  comments?: string
  score?: number

  // Additional fields for detailed analysis
  strengths: string[]
  improvements: string[]
  annotatedAnswer: string
  detailedFeedback: string
}

export async function saveTestRating(data: TestRatingData) {
  try {
    // Add a new document to the test_ratings collection
    const docRef = await addDoc(collection(db, "test_ratings"), {
      ...data,
      timestamp: serverTimestamp(),
    })

    console.log("Test rating saved with ID:", docRef.id)
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error saving test rating:", error)
    throw error
  }
}

export async function fetchUserTestRatings(userId: string) {
  // This would be implemented to fetch user's test ratings from Firestore
  // For now, we'll just return a placeholder
  return []
}

