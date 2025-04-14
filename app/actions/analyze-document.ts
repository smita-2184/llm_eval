"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import { remotePdfToPart } from "@/lib/remote-pdf-to-part"
import { fetchApiKeys } from "@/lib/api-service"

export type DocumentAnalysisResult = {
  text: string
  error?: string
}

export async function analyzeDocumentUrl(url: string, question: string): Promise<DocumentAnalysisResult> {
  try {
    // Fetch API keys from Firebase
    const apiKeyStatus = await fetchApiKeys()
    const apiKeys = apiKeyStatus.keys

    if (!apiKeyStatus.validKeys.gemini || !apiKeys["google-key"]) {
      throw new Error("Google Gemini API key is missing or invalid")
    }

    const apiKey = apiKeys["google-key"] || ""

    // Initialize the Gemini API
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Process the PDF from URL
    const pdfPart = await remotePdfToPart(url, apiKey)

    // Generate content with the PDF and question
    const result = await model.generateContent([pdfPart, question || "Summarize this document"])

    return {
      text: result.response.text(),
    }
  } catch (error: any) {
    console.error("Error analyzing document:", error)
    return {
      text: "",
      error: `Failed to analyze document: ${error.message || "Unknown error"}`,
    }
  }
}

export async function startDocumentChat(url: string): Promise<string> {
  try {
    // Fetch API keys from Firebase
    const apiKeyStatus = await fetchApiKeys()
    const apiKeys = apiKeyStatus.keys

    if (!apiKeyStatus.validKeys.gemini || !apiKeys["google-key"]) {
      throw new Error("Google Gemini API key is missing or invalid")
    }

    const apiKey = apiKeys["google-key"] || ""

    // Process the PDF from URL
    const pdfPart = await remotePdfToPart(url, apiKey)

    // Return the serialized part for client-side use
    return JSON.stringify(pdfPart)
  } catch (error: any) {
    console.error("Error starting document chat:", error)
    throw new Error(`Failed to start document chat: ${error.message || "Unknown error"}`)
  }
}

export async function continueDocumentChat(
  documentPart: string,
  messages: any[],
  question: string,
): Promise<DocumentAnalysisResult> {
  try {
    // Fetch API keys from Firebase
    const apiKeyStatus = await fetchApiKeys()
    const apiKeys = apiKeyStatus.keys

    if (!apiKeyStatus.validKeys.gemini || !apiKeys["google-key"]) {
      throw new Error("Google Gemini API key is missing or invalid")
    }

    const apiKey = apiKeys["google-key"] || ""

    // Initialize the Gemini API
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    })

    // Parse the document part
    const pdfPart = JSON.parse(documentPart)

    // For the first message or when there's only the initial assistant message,
    // we'll directly use the model.generateContent method with the PDF and question
    if (messages.length <= 1 || (messages.length === 1 && messages[0].role === "assistant")) {
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
      const result = await chat.sendMessage([pdfPart, question])

      return {
        text: result.response.text(),
      }
    }

    // For subsequent messages, we need to create a proper chat history
    // Filter out the initial assistant welcome message
    const userMessages = messages.filter((msg) => msg.role === "user")

    // Create a chat session with the model
    const chat = model.startChat({
      generationConfig: {
        temperature: 0.2,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
      history: userMessages.map((msg) => ({
        role: "user",
        parts: [{ text: msg.content }],
      })),
    })

    // Send the PDF data and the current question to the model
    const result = await chat.sendMessage([pdfPart, question])

    return {
      text: result.response.text(),
    }
  } catch (error: any) {
    console.error("Error continuing document chat:", error)
    return {
      text: "",
      error: `Failed to continue document chat: ${error.message || "Unknown error"}`,
    }
  }
}

export async function streamDocumentChat(documentPart: string, messages: any[], question: string): Promise<any> {
  try {
    // Fetch API keys from Firebase
    const apiKeyStatus = await fetchApiKeys()
    const apiKeys = apiKeyStatus.keys

    if (!apiKeyStatus.validKeys.gemini || !apiKeys["google-key"]) {
      throw new Error("Google Gemini API key is missing or invalid")
    }

    const apiKey = apiKeys["google-key"] || ""

    // Initialize the Gemini API
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    })

    // Parse the document part
    const pdfPart = JSON.parse(documentPart)

    // For the first message or when there's only the initial assistant message,
    // we'll directly use the model.generateContent method with the PDF and question
    if (messages.length <= 1 || (messages.length === 1 && messages[0].role === "assistant")) {
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
      const result = await chat.sendMessageStream([pdfPart, question])

      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of result.stream) {
              const text = chunk.text()
              if (text) {
                controller.enqueue(encoder.encode(text))
              }
            }
            controller.close()
          } catch (error) {
            controller.error(error)
          }
        },
      })

      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    }

    // For subsequent messages, we need to create a proper chat history
    // Filter out the initial assistant welcome message
    const userMessages = messages.filter((msg) => msg.role === "user")

    // Create a chat session with the model
    const chat = model.startChat({
      generationConfig: {
        temperature: 0.2,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
      history: userMessages.map((msg) => ({
        role: "user",
        parts: [{ text: msg.content }],
      })),
    })

    // Send the PDF data and the current question to the model
    const result = await chat.sendMessageStream([pdfPart, question])

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) {
              controller.enqueue(encoder.encode(text))
            }
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  } catch (error: any) {
    console.error("Error continuing document chat:", error)
    return new Response(
      JSON.stringify({ error: `Failed to continue document chat: ${error.message || "Unknown error"}` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

