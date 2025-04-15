import { db } from "./firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

export interface QuizQuestion {
  category: string
  difficulty: string
  model: string
  questionType: string
  topic: string
  userId: string
  username: string
  generated: {
    correctAnswer: string
    explanation: string
    question: string
    type: string
    incorrectOptions: string[]
  }
  ratings?: {
    scientific?: number
    clarity?: number
    helpfulness?: number
    wouldUse?: boolean
  }
}

export async function saveQuizQuestion(data: QuizQuestion) {
  try {
    // Add a new document to the quizzes collection
    const docRef = await addDoc(collection(db, "quizzes"), {
      ...data,
      createdAt: serverTimestamp(),
    })

    console.log("Quiz question saved with ID:", docRef.id)
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error saving quiz question:", error)
    throw error
  }
}

export async function fetchQuizzes() {
  // This would be implemented to fetch quizzes from Firestore
  // For now, we'll just return a placeholder
  return []
}

