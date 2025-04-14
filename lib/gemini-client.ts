import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize the Gemini API client
export function createGeminiClient(apiKey: string) {
  if (!apiKey || typeof apiKey !== "string" || apiKey.trim() === "") {
    throw new Error("Invalid or missing Gemini API key")
  }

  const genAI = new GoogleGenerativeAI(apiKey.trim())
  return genAI
}

// Function to analyze PDF content with Gemini
export async function analyzePdfWithGemini(apiKey: string, fileData: any, question: string) {
  try {
    const genAI = createGeminiClient(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Create a chat session with the model
    const chat = model.startChat({
      generationConfig: {
        temperature: 0.2,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
    })

    // Send the PDF data and question to the model
    const result = await chat.sendMessage([fileData, question])

    return {
      text: result.response.text(),
      error: null,
    }
  } catch (error: any) {
    console.error("Error analyzing PDF with Gemini:", error)
    return {
      text: "",
      error: `Failed to analyze PDF: ${error.message || "Unknown error"}`,
    }
  }
}

