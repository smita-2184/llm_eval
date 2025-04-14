import { db } from "./firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

export interface ScaleValidationData {
  ratings: {
    clarity: {
      agreement: number
      suggestions: string
      understanding: number
    }
    helpfulness: {
      agreement: number
      suggestions: string
      understanding: number
    }
    scientific: {
      agreement: number
      suggestions: string
      understanding: number
    }
  }
  type: string
  userId: string
  username: string
  timestamp?: any
}

export async function saveScaleValidation(data: ScaleValidationData) {
  try {
    // Add a new document to the scale_validations collection
    const docRef = await addDoc(collection(db, "scale_validations"), {
      ...data,
      timestamp: serverTimestamp(),
    })

    console.log("Scale validation saved with ID:", docRef.id)
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error saving scale validation:", error)
    throw error
  }
}

