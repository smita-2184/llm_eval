import { db } from "./firebase"
import { doc, getDoc } from "firebase/firestore"
import { isValidOpenAIKey, isValidGeminiKey, isValidGroqKey, isValidTogetherKey } from "./validate-keys"

export interface ApiKeys {
  "google-key"?: string
  "groq-llama-key"?: string
  "mixtral-key"?: string
  "openai-key"?: string
  updatedAt?: string
}

export interface ApiKeyStatus {
  keys: ApiKeys
  validKeys: {
    openai: boolean
    gemini: boolean
    groq: boolean
    together: boolean
  }
  hasAnyValidKey: boolean
}

// Ensure proper type checking in the fetchApiKeys function
export async function fetchApiKeys(): Promise<ApiKeyStatus> {
  try {
    const docRef = doc(db, "api_keys", "current")
    const docSnap = await getDoc(docRef)

    // Default empty keys object
    const defaultKeys: ApiKeys = {
      "google-key": "",
      "groq-llama-key": "",
      "mixtral-key": "",
      "openai-key": "",
      updatedAt: new Date().toISOString(),
    }

    let data: ApiKeys = defaultKeys

    if (docSnap.exists()) {
      // Merge with defaults to ensure all keys exist
      const fetchedData = docSnap.data() as ApiKeys
      data = {
        ...defaultKeys,
        ...fetchedData,
      }

      // Ensure all keys are strings
      Object.keys(data).forEach((key) => {
        if (typeof data[key as keyof ApiKeys] !== "string" && key !== "updatedAt") {
          data[key as keyof ApiKeys] = ""
        }
      })
    } else {
      console.warn("API keys document not found in Firestore")
    }

    // Check which keys are valid
    const validKeys = {
      openai: isValidOpenAIKey(data["openai-key"]),
      gemini: isValidGeminiKey(data["google-key"]),
      groq: isValidGroqKey(data["groq-llama-key"]),
      together: isValidTogetherKey(data["mixtral-key"]),
    }

    const hasAnyValidKey = Object.values(validKeys).some((valid) => valid)

    if (!hasAnyValidKey) {
      console.warn("No valid API keys found in Firestore")
    }

    return {
      keys: data,
      validKeys,
      hasAnyValidKey,
    }
  } catch (error) {
    console.error("Error fetching API keys:", error)
    throw error
  }
}

// Import the necessary Firestore functions
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

// Define the evaluation data interface
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
}

// Function to save evaluation data to Firestore
export async function saveEvaluation(data: EvaluationData) {
  try {
    // Add a new document to the llm_evaluation_ratings collection
    const docRef = await addDoc(collection(db, "llm_evaluation_ratings"), {
      ...data,
      timestamp: serverTimestamp(),
    })

    console.log("Evaluation saved with ID:", docRef.id)
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error saving evaluation:", error)
    throw error
  }
}

