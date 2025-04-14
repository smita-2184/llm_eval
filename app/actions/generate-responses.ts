"use server"

import { fetchApiKeys } from "@/lib/api-service"
import { callGeminiAPI } from "@/lib/gemini-api"
import { createServerOpenAIClient } from "@/lib/openai-client"
import { createGroqClient } from "@/lib/groq"
import { createMistralClient } from "@/lib/mistral"

// Define the response type
export type LlmResponse = {
  text: string
  timestamp: string
  error?: string
  loading?: boolean
}

export type LlmResponses = Record<string, LlmResponse>

// Helper function to safely create OpenAI client
async function safeCreateOpenAIClient(apiKey: string | undefined, baseURL?: string) {
  if (!apiKey || typeof apiKey !== "string" || apiKey.trim() === "") {
    throw new Error("Invalid or missing API key")
  }

  try {
    return await createServerOpenAIClient(apiKey.trim(), baseURL)
  } catch (error) {
    console.error("Error creating OpenAI client:", error)
    throw new Error(`Failed to initialize OpenAI client: ${error.message}`)
  }
}

export async function generateResponses(question: string): Promise<LlmResponses> {
  const responses: LlmResponses = {}
  const timestamp = new Date().toISOString()

  try {
    // Fetch API keys from Firebase
    const apiKeyStatus = await fetchApiKeys()
    const apiKeys = apiKeyStatus.keys

    // Create an array of promises for each LLM
    const llmPromises = [
      // OpenAI GPT-4 response
      (async () => {
        try {
          if (apiKeyStatus.validKeys.openai && apiKeys["openai-key"]) {
            const openaiKey = apiKeys["openai-key"]
            console.log(
              "Using OpenAI API key:",
              openaiKey && typeof openaiKey === "string" ? `${openaiKey.substring(0, 5)}...` : "Invalid key format",
            )

            // Create OpenAI client
            let openai
            try {
              // Ensure openaiKey is a valid string before passing to safeCreateOpenAIClient
              if (!openaiKey || typeof openaiKey !== "string") {
                throw new Error("Invalid OpenAI API key format")
              }
              openai = await safeCreateOpenAIClient(openaiKey)
            } catch (clientError) {
              throw new Error(`Failed to initialize OpenAI client: ${clientError.message}`)
            }

            // Validate question
            if (!question || typeof question !== "string") {
              throw new Error("Invalid question format")
            }

            const openaiResponse = await openai.chat.completions.create({
              model: "gpt-4",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a chemistry expert. Provide a detailed, scientifically accurate response to the question. Include relevant chemical concepts, reactions, and explanations.",
                },
                {
                  role: "user",
                  content: question,
                },
              ],
              temperature: 0.7,
              max_tokens: 1024,
              top_p: 0.95,
            })

            // Extract text from the updated response format
            let openaiText = ""
            if (
              openaiResponse &&
              openaiResponse.choices &&
              openaiResponse.choices[0] &&
              openaiResponse.choices[0].message &&
              typeof openaiResponse.choices[0].message.content === "string"
            ) {
              openaiText = openaiResponse.choices[0].message.content
            } else {
              throw new Error("Unexpected response format from OpenAI")
            }

            return {
              modelId: "gpt-4",
              response: {
                text: openaiText,
                timestamp,
              },
            }
          } else {
            return {
              modelId: "gpt-4",
              response: {
                text: "",
                timestamp,
                error: "OpenAI API key is missing or invalid",
              },
            }
          }
        } catch (error: any) {
          console.error("OpenAI API error:", error)
          return {
            modelId: "gpt-4",
            response: {
              text: "",
              timestamp,
              error: `Failed to generate response from OpenAI: ${error.message || "Unknown error"}`,
            },
          }
        }
      })(),

      // Google Gemini Pro response
      (async () => {
        try {
          if (apiKeyStatus.validKeys.gemini && apiKeys["google-key"]) {
            const geminiResponse = await callGeminiAPI(question, apiKeys["google-key"])

            // Format Gemini response with markdown
            const formattedResponse = `# Gemini Pro Response\n\n${geminiResponse}`

            return {
              modelId: "gemini-pro",
              response: {
                text: formattedResponse,
                timestamp,
              },
            }
          } else {
            return {
              modelId: "gemini-pro",
              response: {
                text: "",
                timestamp,
                error: "Google API key for Gemini is missing or invalid",
              },
            }
          }
        } catch (error: any) {
          console.error("Gemini API error:", error)
          return {
            modelId: "gemini-pro",
            response: {
              text: "",
              timestamp,
              error: `Failed to generate response from Gemini: ${error.message || "Unknown error"}`,
            },
          }
        }
      })(),

      // LLaMA response (using Groq API)
      (async () => {
        try {
          if (apiKeyStatus.validKeys.groq && apiKeys["groq-llama-key"]) {
            const llamaResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKeys["groq-llama-key"]}`,
              },
              body: JSON.stringify({
                model: "llama3-70b-8192",
                messages: [
                  {
                    role: "system",
                    content:
                      "You are a chemistry expert. Provide a detailed, scientifically accurate response to the question. Include relevant chemical concepts, reactions, and explanations.",
                  },
                  {
                    role: "user",
                    content: question,
                  },
                ],
                temperature: 0.7,
                max_tokens: 1024,
                top_p: 0.95,
              }),
            })

            if (!llamaResponse.ok) {
              const errorData = await llamaResponse.json()
              throw new Error(errorData.error?.message || "API request failed")
            }

            const llamaData = await llamaResponse.json()

            return {
              modelId: "llama",
              response: {
                text: llamaData.choices[0].message.content,
                timestamp,
              },
            }
          } else {
            return {
              modelId: "llama",
              response: {
                text: "",
                timestamp,
                error: "Groq API key for LLaMA is missing or invalid",
              },
            }
          }
        } catch (error: any) {
          console.error("LLaMA API error:", error)
          return {
            modelId: "llama",
            response: {
              text: "",
              timestamp,
              error: `Failed to generate response from LLaMA: ${error.message || "Unknown error"}`,
            },
          }
        }
      })(),

      // Mixtral response (using Groq API)
      (async () => {
        try {
          if (apiKeyStatus.validKeys.groq && apiKeys["groq-llama-key"]) {
            const mixtralResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKeys["groq-llama-key"]}`,
              },
              body: JSON.stringify({
                model: "mistral-saba-24b",
                messages: [
                  {
                    role: "system",
                    content:
                      "You are a chemistry expert. Provide a detailed, scientifically accurate response to the question. Include relevant chemical concepts, reactions, and explanations. Format your response in markdown with proper headings, bullet points, and code blocks where appropriate.",
                  },
                  {
                    role: "user",
                    content: question,
                  },
                ],
                temperature: 0.7,
                max_tokens: 1024,
                top_p: 0.95,
              }),
            })

            if (!mixtralResponse.ok) {
              const errorData = await mixtralResponse.json()
              throw new Error(errorData.error?.message || "API request failed")
            }

            const mixtralData = await mixtralResponse.json()

            // Format Mixtral response with markdown
            const formattedResponse = `# Mixtral Response\n\n${mixtralData.choices[0].message.content}`

            return {
              modelId: "mixtral",
              response: {
                text: formattedResponse,
                timestamp,
              },
            }
          } else {
            return {
              modelId: "mixtral",
              response: {
                text: "",
                timestamp,
                error: "Groq API key for Mixtral is missing or invalid",
              },
            }
          }
        } catch (error: any) {
          console.error("Mixtral API error:", error)
          return {
            modelId: "mixtral",
            response: {
              text: "",
              timestamp,
              error: `Failed to generate response from Mixtral: ${error.message || "Unknown error"}`,
            },
          }
        }
      })(),

      // DeepSeek response (using Groq API)
      (async () => {
        try {
          if (apiKeyStatus.validKeys.groq && apiKeys["groq-llama-key"]) {
            const deepseekResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKeys["groq-llama-key"]}`,
              },
              body: JSON.stringify({
                model: "deepseek-r1-distill-llama-70b",
                messages: [
                  {
                    role: "system",
                    content:
                      "You are a chemistry expert. Provide a detailed, scientifically accurate response to the question. Include relevant chemical concepts, reactions, and explanations. Format your response with a 'Thinking Process' section followed by a 'Final Answer' section.",
                  },
                  {
                    role: "user",
                    content: question,
                  },
                ],
                temperature: 0.7,
                max_tokens: 1024,
                top_p: 0.95,
              }),
            })

            if (!deepseekResponse.ok) {
              const errorData = await deepseekResponse.json()
              throw new Error(errorData.error?.message || "API request failed")
            }

            const deepseekData = await deepseekResponse.json()

            // Format DeepSeek response with thinking process and final answer sections
            const formattedResponse = `# DeepSeek Response\n\n## Thinking Process\n\n${deepseekData.choices[0].message.content.split("Final Answer:")[0]}\n\n## Final Answer\n\n${deepseekData.choices[0].message.content.split("Final Answer:")[1] || deepseekData.choices[0].message.content}`

            return {
              modelId: "deepseek",
              response: {
                text: formattedResponse,
                timestamp,
              },
            }
          } else {
            return {
              modelId: "deepseek",
              response: {
                text: "",
                timestamp,
                error: "Groq API key for DeepSeek is missing or invalid",
              },
            }
          }
        } catch (error: any) {
          console.error("DeepSeek API error:", error)
          return {
            modelId: "deepseek",
            response: {
              text: "",
              timestamp,
              error: `Failed to generate response from DeepSeek: ${error.message || "Unknown error"}`,
            },
          }
        }
      })(),
    ]

    // Execute all promises in parallel and handle results independently
    const results = await Promise.allSettled(llmPromises)

    // Process results and build the responses object
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const { modelId, response } = result.value
        responses[modelId] = response
      }
      // If a promise was rejected, it's already handled within each async function
    })

    return responses
  } catch (error: any) {
    // This catch block should only handle errors in the API key fetching process
    // or other setup errors, not individual LLM errors
    console.error("Error in setup process:", error)

    // Even if there's a setup error, return any responses we might have
    if (Object.keys(responses).length > 0) {
      return responses
    }

    // Only throw if we have no responses at all
    throw new Error(`Failed to set up response generation: ${error.message}`)
  }
}

