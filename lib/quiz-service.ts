import { db } from "./firebase"
import { collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore"

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

export async function saveQuizFeedback(feedback: {
  userId: string
  username: string
  quizId: string
  questionId: string
  feedback: string
  rating: number
}): Promise<{ success: boolean; error?: string }> {
  try {
    const feedbackRef = doc(collection(db, "quiz_feedback"))
    await setDoc(feedbackRef, {
      ...feedback,
      timestamp: serverTimestamp(),
    })
    return { success: true }
  } catch (error) {
    console.error("Error saving quiz feedback:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save quiz feedback",
    }
  }
}

