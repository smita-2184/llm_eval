import { db } from "./firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

export interface EvaluationData {
  metrics: {
    clarity: number
    helpfulness: number
    scientific: number
  }
  modelId: string
  question: string
  raterType: string
  response: string
  userId: string
  username: string
  willingness: string
  timestamp?: any
  feedback?: {
    isHelpful: boolean
    comment?: string
  }
}

export async function saveEvaluation(data: EvaluationData) {
  try {
    // Validate required fields
    if (!data.userId || !data.username || !data.modelId || !data.question || !data.response) {
      throw new Error("Missing required fields")
    }

    // Ensure metrics are valid numbers
    if (
      !data.metrics ||
      typeof data.metrics.clarity !== "number" ||
      typeof data.metrics.helpfulness !== "number" ||
      typeof data.metrics.scientific !== "number"
    ) {
      throw new Error("Invalid metrics data")
    }

    // Add a new document to the llm_evaluation_ratings collection
    const docRef = await addDoc(collection(db, "llm_evaluation_ratings"), {
      ...data,
      timestamp: serverTimestamp(),
    })

    console.log("Evaluation saved with ID:", docRef.id)
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error saving evaluation:", error)
    // Return a more detailed error message
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to save evaluation" 
    }
  }
}

export async function fetchEvaluations() {
  // This would be implemented to fetch evaluation results from Firestore
  // For now, we'll just return a placeholder
  return []
}

