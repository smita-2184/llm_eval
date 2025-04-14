"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"

// Ensure proper type checking before using string methods
export async function callGeminiAPI(prompt: string, apiKey: string) {
  try {
    // Validate the API key is a non-empty string
    if (!apiKey || typeof apiKey !== "string" || apiKey.trim() === "") {
      throw new Error("Invalid or missing Gemini API key")
    }

    // Initialize the Google Generative AI with the API key
    const genAI = new GoogleGenerativeAI(apiKey.trim())

    // Get the generative model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro", // Using a stable model
      systemInstruction:
        "You are a chemistry expert. Provide a detailed, scientifically accurate response to the question. Include relevant chemical concepts, reactions, and explanations.",
    })

    // Set generation config
    const generationConfig = {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 1024,
      responseMimeType: "text/plain",
    }

    // Start a chat session
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    })

    // Send the message and get the response
    const result = await chatSession.sendMessage(prompt)

    // Extract and return the text response
    return result.response.text()
  } catch (error: any) {
    console.error("Error calling Gemini API:", error)
    throw error
  }
}

