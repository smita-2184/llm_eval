import { db } from "./firebase"
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore"

export interface UserActivity {
  completedModels: string[]
  completedScaleValidation: boolean
  completedTestModels: string[]
  completedQuizModels: string[]
  totalActivities: number
  completedActivities: number
  completionPercentage: number
}

// Define the LLM models we want to track
export const llmModels = [
  { id: "gpt-4", name: "GPT-4" },
  { id: "gemini-pro", name: "Gemini Pro" },
  { id: "llama", name: "LLaMA" },
  { id: "mixtral", name: "Mixtral" },
  { id: "deepseek", name: "DeepSeek" },
]

// One-time fetch function
export async function fetchUserActivities(userId: string): Promise<UserActivity> {
  try {
    // Initialize default activity state
    const activity: UserActivity = {
      completedModels: [],
      completedScaleValidation: false,
      completedTestModels: [],
      completedQuizModels: [],
      totalActivities: llmModels.length * 3 + 1, // LLMs * 3 categories + scale validation
      completedActivities: 0,
      completionPercentage: 0,
    }

    // Check which models the user has rated
    const ratingsRef = collection(db, "llm_evaluation_ratings")
    const ratingsQuery = query(ratingsRef, where("userId", "==", userId))
    const ratingsSnapshot = await getDocs(ratingsQuery)

    // Create a Set to track unique model IDs the user has rated
    const ratedModels = new Set<string>()

    ratingsSnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.modelId) {
        ratedModels.add(data.modelId)
      }
    })

    activity.completedModels = Array.from(ratedModels)

    // Check if user has completed scale validation
    const validationsRef = collection(db, "scale_validations")
    const validationsQuery = query(validationsRef, where("userId", "==", userId))
    const validationsSnapshot = await getDocs(validationsQuery)

    activity.completedScaleValidation = !validationsSnapshot.empty

    // Check which models the user has completed tests for
    const testRatingsRef = collection(db, "test_ratings")
    const testRatingsQuery = query(testRatingsRef, where("userId", "==", userId))
    const testRatingsSnapshot = await getDocs(testRatingsQuery)

    // Create a Set to track unique model IDs the user has tested
    const testedModels = new Set<string>()

    testRatingsSnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.modelId) {
        testedModels.add(data.modelId)
      }
    })

    activity.completedTestModels = Array.from(testedModels)

    // Check which models the user has created quizzes for
    const quizzesRef = collection(db, "quizzes")
    const quizzesQuery = query(quizzesRef, where("userId", "==", userId))
    const quizzesSnapshot = await getDocs(quizzesQuery)

    // Create a Set to track unique model IDs the user has created quizzes for
    const quizModels = new Set<string>()

    quizzesSnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.model) {
        quizModels.add(data.model)
      }
    })

    activity.completedQuizModels = Array.from(quizModels)

    // Calculate completion metrics
    activity.completedActivities =
      activity.completedModels.length +
      activity.completedTestModels.length +
      activity.completedQuizModels.length +
      (activity.completedScaleValidation ? 1 : 0)

    activity.completionPercentage = Math.round((activity.completedActivities / activity.totalActivities) * 100)

    return activity
  } catch (error) {
    console.error("Error fetching user activities:", error)
    // Return default empty activity data on error
    return {
      completedModels: [],
      completedScaleValidation: false,
      completedTestModels: [],
      completedQuizModels: [],
      totalActivities: llmModels.length * 3 + 1,
      completedActivities: 0,
      completionPercentage: 0,
    }
  }
}

// Real-time listener function
export function subscribeToUserActivities(
  userId: string,
  onUpdate: (activity: UserActivity) => void,
  onError: (error: Error) => void,
): () => void {
  // Initialize unsubscribe functions array
  const unsubscribeFunctions: (() => void)[] = []

  try {
    // Initialize default activity state
    const activity: UserActivity = {
      completedModels: [],
      completedScaleValidation: false,
      completedTestModels: [],
      completedQuizModels: [],
      totalActivities: llmModels.length * 3 + 1, // LLMs * 3 categories + scale validation
      completedActivities: 0,
      completionPercentage: 0,
    }

    // Function to recalculate completion metrics
    const updateCompletionMetrics = () => {
      activity.completedActivities =
        activity.completedModels.length +
        activity.completedTestModels.length +
        activity.completedQuizModels.length +
        (activity.completedScaleValidation ? 1 : 0)

      activity.completionPercentage = Math.round((activity.completedActivities / activity.totalActivities) * 100)

      // Notify caller with updated activity
      onUpdate({ ...activity })
    }

    // Listen for LLM evaluation ratings
    const ratingsRef = collection(db, "llm_evaluation_ratings")
    const ratingsQuery = query(ratingsRef, where("userId", "==", userId))

    const unsubscribeRatings = onSnapshot(
      ratingsQuery,
      (snapshot) => {
        // Create a Set to track unique model IDs the user has rated
        const ratedModels = new Set<string>()

        snapshot.forEach((doc) => {
          const data = doc.data()
          if (data.modelId) {
            ratedModels.add(data.modelId)
          }
        })

        activity.completedModels = Array.from(ratedModels)
        updateCompletionMetrics()
      },
      onError,
    )

    unsubscribeFunctions.push(unsubscribeRatings)

    // Listen for scale validations
    const validationsRef = collection(db, "scale_validations")
    const validationsQuery = query(validationsRef, where("userId", "==", userId))

    const unsubscribeValidations = onSnapshot(
      validationsQuery,
      (snapshot) => {
        activity.completedScaleValidation = !snapshot.empty
        updateCompletionMetrics()
      },
      onError,
    )

    unsubscribeFunctions.push(unsubscribeValidations)

    // Listen for test ratings
    const testRatingsRef = collection(db, "test_ratings")
    const testRatingsQuery = query(testRatingsRef, where("userId", "==", userId))

    const unsubscribeTestRatings = onSnapshot(
      testRatingsQuery,
      (snapshot) => {
        // Create a Set to track unique model IDs the user has tested
        const testedModels = new Set<string>()

        snapshot.forEach((doc) => {
          const data = doc.data()
          if (data.modelId) {
            testedModels.add(data.modelId)
          }
        })

        activity.completedTestModels = Array.from(testedModels)
        updateCompletionMetrics()
      },
      onError,
    )

    unsubscribeFunctions.push(unsubscribeTestRatings)

    // Listen for quizzes
    const quizzesRef = collection(db, "quizzes")
    const quizzesQuery = query(quizzesRef, where("userId", "==", userId))

    const unsubscribeQuizzes = onSnapshot(
      quizzesQuery,
      (snapshot) => {
        // Create a Set to track unique model IDs the user has created quizzes for
        const quizModels = new Set<string>()

        snapshot.forEach((doc) => {
          const data = doc.data()
          if (data.model) {
            quizModels.add(data.model)
          }
        })

        activity.completedQuizModels = Array.from(quizModels)
        updateCompletionMetrics()
      },
      onError,
    )

    unsubscribeFunctions.push(unsubscribeQuizzes)

    // Return a function to unsubscribe from all listeners
    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe())
    }
  } catch (error) {
    console.error("Error setting up activity listeners:", error)
    onError(error as Error)

    // Return a no-op function
    return () => {}
  }
}

